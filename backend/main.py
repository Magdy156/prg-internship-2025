from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict
from datetime import datetime
from pulp import LpProblem, LpMaximize, LpVariable, lpSum, LpStatus, LpBinary
from fastapi.middleware.cors import CORSMiddleware
import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Employee(BaseModel):
    id: str
    name: str
    skills: List[str]
    max_hours: float
    availability_start: str
    availability_end: str

class Shift(BaseModel):
    id: str
    role: str
    start_time: str
    end_time: str
    required_skill: str

class ScheduleRequest(BaseModel):
    period: str
    employees: List[Employee]
    shifts: List[Shift]

class ScheduleResponse(BaseModel):
    assignments: List[Dict[str, str]]
    status: str
    message: str = ""
    unassigned_shifts: List[str] = []

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/api/schedule/optimize", response_model=ScheduleResponse)
async def optimize_schedule(request: ScheduleRequest):
    try:
        # Parse dates
        period_start, period_end = request.period.split('/')
        period_start = datetime.strptime(period_start, '%Y-%m-%d')
        period_end = datetime.strptime(period_end, '%Y-%m-%d')
        logger.debug(f"Period: {period_start} to {period_end}")

        # Validate input data
        for s in request.shifts:
            shift_start = datetime.strptime(s.start_time, '%Y-%m-%dT%H:%M:%S')
            shift_end = datetime.strptime(s.end_time, '%Y-%m-%dT%H:%M:%S')
            if shift_end <= shift_start:
                raise HTTPException(status_code=400, detail=f"Invalid shift {s.id}: end_time must be after start_time")
            # Check eligible employees
            eligible_employees = [
                e for e in request.employees
                if s.required_skill in e.skills
                and datetime.strptime(e.availability_start, '%Y-%m-%dT%H:%M:%S') <= shift_start
                and datetime.strptime(e.availability_end, '%Y-%m-%dT%H:%M:%S') >= shift_end
            ]
            logger.debug(f"Shift {s.id} ({s.required_skill}): {len(eligible_employees)} eligible employees")
            if not eligible_employees:
                logger.warning(f"No eligible employees for shift {s.id} with skill {s.required_skill} at {s.start_time}")

        # Initialize ILP problem
        prob = LpProblem("Shift_Scheduling", LpMaximize)
        
        # Variables: x[employee_id, shift_id] = 1 if employee is assigned to shift
        x = {
            (e.id, s.id): LpVariable(f"x_{e.id}_{s.id}", cat=LpBinary)
            for e in request.employees
            for s in request.shifts
        }

        # Objective: Maximize assignments
        prob += lpSum(x), "Total_Assignments"

        # Constraints
        # 1. Each shift assigned to at most one employee
        for s in request.shifts:
            prob += lpSum(x[(e.id, s.id)] for e in request.employees) <= 1, f"Shift_{s.id}_assigned"

        # 2. Skill matching
        for e in request.employees:
            for s in request.shifts:
                if s.required_skill not in e.skills:
                    prob += x[(e.id, s.id)] == 0, f"Skill_{e.id}_{s.id}"

        # 3. Availability
        for e in request.employees:
            for s in request.shifts:
                shift_start = datetime.strptime(s.start_time, '%Y-%m-%dT%H:%M:%S')
                shift_end = datetime.strptime(s.end_time, '%Y-%m-%dT%H:%M:%S')
                avail_start = datetime.strptime(e.availability_start, '%Y-%m-%dT%H:%M:%S')
                avail_end = datetime.strptime(e.availability_end, '%Y-%m-%dT%H:%M:%S')
                if not (avail_start <= shift_start and avail_end >= shift_end):
                    prob += x[(e.id, s.id)] == 0, f"Avail_{e.id}_{s.id}"

        # 4. Max hours
        for e in request.employees:
            total_hours = lpSum(
                x[(e.id, s.id)] * (
                    (datetime.strptime(s.end_time, '%Y-%m-%dT%H:%M:%S') - 
                     datetime.strptime(s.start_time, '%Y-%m-%dT%H:%M:%S')).total_seconds() / 3600
                )
                for s in request.shifts
            )
            prob += total_hours <= e.max_hours, f"MaxHours_{e.id}"

        # Solve
        prob.solve()
        logger.debug(f"Solver status: {LpStatus[prob.status]}")
        
        if LpStatus[prob.status] != "Optimal":
            raise HTTPException(status_code=400, detail="No feasible solution found")

        # Extract assignments
        assignments = [
            {"shiftId": s.id, "empId": e.id, "empName": e.name}
            for e in request.employees
            for s in request.shifts
            if x[(e.id, s.id)].varValue == 1
        ]

        # Identify unassigned shifts
        assigned_shift_ids = {a["shiftId"] for a in assignments}
        unassigned_shifts = [s.id for s in request.shifts if s.id not in assigned_shift_ids]
        logger.debug(f"Assigned shifts: {len(assignments)}, Unassigned shifts: {unassigned_shifts}")

        return ScheduleResponse(
            assignments=assignments,
            status="success" if not unassigned_shifts else "partial",
            message="Schedule generated successfully" if not unassigned_shifts else f"Some shifts could not be assigned: {', '.join(unassigned_shifts)}",
            unassigned_shifts=unassigned_shifts
        )
    except HTTPException as he:
        logger.error(f"HTTP Exception: {he.detail}")
        raise he
    except Exception as e:
        logger.error(f"Internal server error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

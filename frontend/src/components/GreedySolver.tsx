import React, { useEffect, useState } from 'react';
import type { Employee, Shift } from './CsvImport';

interface Assignment {
  shiftId: string;
  empId: string;
  empName: string;
}

const GreedySolver: React.FC = () => {
  const [schedule, setSchedule] = useState<Assignment[]>([]);

  useEffect(() => {
    const storedEmployees = localStorage.getItem('employees');
    const storedShifts = localStorage.getItem('shifts');
    const employees: Employee[] = storedEmployees ? JSON.parse(storedEmployees) : [];
    const shifts: Shift[] = storedShifts ? JSON.parse(storedShifts) : [];

    const assignedHours: { [empId: string]: number } = {};
    const assignments: Assignment[] = [];

    shifts.forEach((shift) => {
      const shiftStart = new Date(shift.start_time);
      const shiftEnd = new Date(shift.end_time);

      // converting from milli seconds to hours
      const shiftDurationHours = (shiftEnd.getTime() - shiftStart.getTime()) / (1000 * 60 * 60);

      // Find eligible employees
      const eligible = employees
        .filter(emp =>
          emp.skills.includes(shift.required_skill) &&
          new Date(emp.availability_start) <= shiftStart &&
          new Date(emp.availability_end) >= shiftEnd
        )
        .sort((a, b) => {
          const assignedA = assignedHours[a.id] || 0;
          const assignedB = assignedHours[b.id] || 0;
          if (assignedA !== assignedB) return assignedA - assignedB; // Prefer less assigned hours
          return a.name.localeCompare(b.name); // alphabetical order
        });

      for (const emp of eligible) {
        const currentHours = assignedHours[emp.id] || 0;
        const empMaxHours = Number(emp.max_hours);

        if (currentHours + shiftDurationHours <= empMaxHours) {
          assignedHours[emp.id] = currentHours + shiftDurationHours;
          assignments.push({
            shiftId: shift.id,
            empId: emp.id,
            empName: emp.name
          });
          break; // Stop after assigning shift
        }
      }
    });

    setSchedule(assignments);
    localStorage.setItem('schedule', JSON.stringify(assignments));
  }, []);

  return (
    <div>
      <h2>Greedy Schedule</h2>
      {schedule.length > 0 ? (
        <ul>
          {schedule.map((item, idx) => (
            <li key={idx}>
              Shift <strong>{item.shiftId}</strong> assigned to <strong>{item.empName}</strong> (ID: {item.empId})
            </li>
          ))}
        </ul>
      ) : (<p>No schedule. Upload CSVs first.</p>)
      }
    </div>
  );
};

export default GreedySolver;

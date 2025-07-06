import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Box, Divider, Button, CircularProgress, Alert } from '@mui/material';
import type { Employee, Shift } from './CsvImport';
import '../App.css';

export interface Assignment {
  shiftId: string;
  empId: string;
  empName: string;
}

interface ScheduleResponse {
  assignments: Assignment[];
  status: string;
  message?: string;
  unassigned_shifts?: string[];
}

const GreedySolver: React.FC = () => {
  const [schedule, setSchedule] = useState<Assignment[]>([]);
  const [unassignedShifts, setUnassignedShifts] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [backendAvailable, setBackendAvailable] = useState<boolean>(false);

  useEffect(() => {
    // Check backend availability
    fetch('http://localhost:8000/api/health')
      .then(response => {
        if (response.ok) {
          setBackendAvailable(true);
        } else {
          setBackendAvailable(false);
        }
      })
      .catch(() => setBackendAvailable(false));

    // Run greedy algorithm if backend is not available
    if (!backendAvailable) {
      const storedEmployees = localStorage.getItem('employees');
      const storedShifts = localStorage.getItem('shifts');
      const employees: Employee[] = storedEmployees ? JSON.parse(storedEmployees) : [];
      const shifts: Shift[] = storedShifts ? JSON.parse(storedShifts) : [];

      const assignedHours: { [empId: string]: number } = {};
      const assignments: Assignment[] = [];

      shifts.forEach((shift) => {
        const shiftStart = new Date(shift.start_time);
        const shiftEnd = new Date(shift.end_time);

        // Convert from milliseconds to hours
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
            return a.name.localeCompare(b.name); // Alphabetical order
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
    }
  }, [backendAvailable]);

  const handleOptimize = async () => {
    if (!backendAvailable) {
      setError('Backend is not available for ILP optimization.');
      return;
    }

    setLoading(true);
    setError(null);
    setUnassignedShifts([]);

    try {
      const storedEmployees = localStorage.getItem('employees');
      const storedShifts = localStorage.getItem('shifts');
      if (!storedEmployees || !storedShifts) {
        setError('Please upload employee and shift CSVs first.');
        setLoading(false);
        return;
      }

      const employees: Employee[] = JSON.parse(storedEmployees);
      const shifts: Shift[] = JSON.parse(storedShifts);

      const response = await fetch('http://localhost:8000/api/schedule/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period: '2025-07-01/2025-07-17',
          employees,
          shifts
        })
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 400) {
          throw new Error(data.detail || 'No feasible solution found');
        }
        throw new Error(data.detail || 'Failed to fetch optimized schedule');
      }

      const data: ScheduleResponse = await response.json();
      setSchedule(data.assignments);
      setUnassignedShifts(data.unassigned_shifts || []);
      localStorage.setItem('schedule', JSON.stringify(data.assignments));
      if (data.message) {
        setError(data.message);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to optimize schedule.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="card-container">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {backendAvailable ? 'Optimized Schedule' : 'Greedy Schedule'}
        </Typography>
        {backendAvailable && (
          <Button
            variant="contained"
            onClick={handleOptimize}
            sx={{ mb: 2, textTransform: 'none' }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Run ILP Optimization'}
          </Button>
        )}
        {error && (
          <Alert severity={error.includes('success') ? 'success' : 'error'} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {unassignedShifts.length > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Unassigned shifts: {unassignedShifts.join(', ')}
          </Alert>
        )}
        {schedule.length > 0 ? (
          <Box className="schedule-grid">
            {schedule.map((item, idx) => (
              <Box key={idx} className="schedule-item">
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Shift {item.shiftId}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Assigned to {item.empName} (ID: {item.empId})
                </Typography>
                {idx < schedule.length - 1 && <Divider sx={{ my: 1 }} />}
              </Box>
            ))}
          </Box>
        ) : (
          <Typography>No schedule. Upload CSVs first.</Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default GreedySolver;

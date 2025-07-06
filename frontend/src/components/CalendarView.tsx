import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Alert, CircularProgress, Tooltip, Card, CardContent, Button } from '@mui/material';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks } from 'date-fns';
import type { Employee, Shift } from './CsvImport';
import type { Assignment } from './GreedySolver';
import '../App.css';

interface ShiftSlot {
  shiftId: string;
  role: string;
  startTime: string;
  endTime: string;
  empName: string;
  duration: number;
}

const CalendarView: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date('2025-07-01'));
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedEmployees = localStorage.getItem('employees');
      const storedShifts = localStorage.getItem('shifts');
      const storedAssignments = localStorage.getItem('schedule');

      if (!storedEmployees || !storedShifts || !storedAssignments) {
        setError('Please upload employee and shift CSVs and generate a schedule.');
        setLoading(false);
        return;
      }

      setEmployees(JSON.parse(storedEmployees));
      setShifts(JSON.parse(storedShifts));
      setAssignments(JSON.parse(storedAssignments));
      setLoading(false);
    } catch (err) {
      setError('Failed to load schedule data.');
      setLoading(false);
    }
  }, []);

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getShiftSlots = (employeeId: string, day: Date): ShiftSlot[] => {
    const dayStr = format(day, 'yyyy-MM-dd');
    return assignments
      .filter((assignment) => assignment.empId === employeeId)
      .map((assignment) => {
        const shift = shifts.find((s) => s.id === assignment.shiftId);
        if (!shift) return null;
        const shiftDate = format(new Date(shift.start_time), 'yyyy-MM-dd');
        if (shiftDate !== dayStr) return null;
        const start = new Date(shift.start_time);
        const end = new Date(shift.end_time);
        const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        return {
          shiftId: shift.id,
          role: shift.role,
          startTime: start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          endTime: end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          empName: assignment.empName,
          duration,
        };
      })
      .filter((slot): slot is ShiftSlot => slot !== null);
  };

  const getRoleColor = (role: string): string => {
    switch (role.toLowerCase()) {
      case 'morning_cook':
        return '#bbdefb';
      case 'evening_cashier':
        return '#c8e6c9';
      case 'day_manager':
        return '#fff3e0';
      default:
        return '#fff3e0';
    }
  };

  const handlePrevWeek = () => {
    setSelectedDate(subWeeks(selectedDate, 1));
  };

  const handleNextWeek = () => {
    setSelectedDate(addWeeks(selectedDate, 1));
  };

  if (loading) {
    return (
      <Box className="csv-import">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="csv-import">
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Card className="card-container calendar-card">
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Weekly Schedule
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Button
            variant="outlined"
            onClick={handlePrevWeek}
            sx={{ textTransform: 'none', color: '#00aaff', borderColor: '#00aaff' }}
          >
            Previous Week
          </Button>
          <Typography variant="subtitle1" sx={{ alignSelf: 'center' }}>
            Week of {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
          </Typography>
          <Button
            variant="outlined"
            onClick={handleNextWeek}
            sx={{ textTransform: 'none', color: '#00aaff', borderColor: '#00aaff' }}
          >
            Next Week
          </Button>
        </Box>
        <Paper elevation={2} sx={{ padding: '1rem' }}>
          <div className="calendar-grid">
            <div className="calendar-grid-header">
              <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                Employee
              </Typography>
            </div>
            {weekDays.map((day) => (
              <div key={format(day, 'yyyy-MM-dd')} className="calendar-grid-header">
                <Typography variant="subtitle1" align="center" sx={{ fontWeight: 500 }}>
                  {format(day, 'EEE, MMM d')}
                </Typography>
              </div>
            ))}
            {employees.map((employee) => (
              <React.Fragment key={employee.id}>
                <div className="calendar-grid-header">
                  <Typography variant="body2">{employee.name}</Typography>
                </div>
                {weekDays.map((day) => (
                  <div key={`${employee.id}-${format(day, 'yyyy-MM-dd')}`} className="calendar-grid-cell">
                    {getShiftSlots(employee.id, day).map((slot, index) => (
                      <Tooltip key={index} title={`Shift ID: ${slot.shiftId}, Employee: ${slot.empName}`}>
                        <div
                          className="calendar-shift"
                          style={{ backgroundColor: getRoleColor(slot.role) }}
                        >
                          <Typography variant="caption">
                            {slot.role}: {slot.startTime} - {slot.endTime} ({slot.duration}h)
                          </Typography>
                        </div>
                      </Tooltip>
                    ))}
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </Paper>
      </CardContent>
    </Card>
  );
};

export default CalendarView;

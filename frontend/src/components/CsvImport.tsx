import React, { useState, useEffect } from 'react';
import { Button, Card, CardContent, Table, TableBody, TableCell, TableHead, TableRow, Alert, Box, Typography } from '@mui/material';
import Papa from 'papaparse';
import '../App.css';

export interface Employee {
  id: string;
  name: string;
  skills: string[];
  max_hours: number;
  availability_start: string;
  availability_end: string;
}

export interface Shift {
  id: string;
  role: string;
  start_time: string;
  end_time: string;
  required_skill: string;
}

const CsvImport: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);

  const validateEmployee = (data: any): boolean => {
    if (!data.id || !data.name || !data.skills || !data.max_hours || !data.availability_start || !data.availability_end) {
      setError('Missing fields in employees.csv');
      return false;
    }
    if (isNaN(data.max_hours) || Number(data.max_hours) <= 0) {
      setError('Invalid max_hours in employees.csv');
      return false;
    }
    if (new Date(data.availability_start) >= new Date(data.availability_end)) {
      setError('Invalid date range in employees.csv');
      return false;
    }
    return true;
  };

  const validateShift = (data: any): boolean => {
    if (!data.id || !data.role || !data.start_time || !data.end_time || !data.required_skill) {
      setError('Missing fields in shifts.csv');
      return false;
    }
    if (new Date(data.start_time) >= new Date(data.end_time)) {
      setError('Invalid date range in shifts.csv');
      return false;
    }
    return true;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'employees' | 'shifts') => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const data = result.data;
        if (data.length === 0) {
          setError(`Empty ${type}.csv`);
          return;
        }

        const isValid = type === 'employees'
          ? data.every((row: any) => validateEmployee(row))
          : data.every((row: any) => validateShift(row));

        if (isValid) {
          const parsedData = type === 'employees'
            ? data.map((row: any) => ({
                ...row,
                skills: row.skills.split(',').map((skill: string) => skill.trim()),
              }))
            : data;

          localStorage.setItem(type, JSON.stringify(parsedData));
          setSuccess(`${type}.csv parsed and stored successfully`);
          setError(null);
          if (type === 'employees') setEmployees(parsedData);
          else setShifts(parsedData);
        }
      },
      error: () => setError(`Failed to parse ${type}.csv`),
    });
  };

  useEffect(() => {
    const storedEmployees = localStorage.getItem('employees');
    const storedShifts = localStorage.getItem('shifts');
    if (storedEmployees) setEmployees(JSON.parse(storedEmployees));
    if (storedShifts) setShifts(JSON.parse(storedShifts));
  }, []);

  return (
    <Box className="csv-import">
      <Card className="card-container">
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Upload CSV Files
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button variant="contained" component="label" sx={{ textTransform: 'none' }}>
                Upload Employees CSV
                <input type="file" accept=".csv" hidden onChange={(e) => handleFileUpload(e, 'employees')} />
              </Button>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button variant="contained" component="label" sx={{ textTransform: 'none' }}>
                Upload Shifts CSV
                <input type="file" accept=".csv" hidden onChange={(e) => handleFileUpload(e, 'shifts')} />
              </Button>
            </Box>
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}
          </Box>
        </CardContent>
      </Card>

      {(employees.length > 0 || shifts.length > 0) && (
        <Box className="tables-container">
          {employees.length > 0 && (
            <Card className="card-container table-card">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Employees Data
                </Typography>
                <Box className="table-container">
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Skills</TableCell>
                        <TableCell>Max Hours</TableCell>
                        <TableCell>Start</TableCell>
                        <TableCell>End</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {employees.map((emp, i) => (
                        <TableRow key={i} hover>
                          <TableCell>{emp.id}</TableCell>
                          <TableCell>{emp.name}</TableCell>
                          <TableCell>{emp.skills.join(', ')}</TableCell>
                          <TableCell>{emp.max_hours}</TableCell>
                          <TableCell>{emp.availability_start}</TableCell>
                          <TableCell>{emp.availability_end}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              </CardContent>
            </Card>
          )}
          {shifts.length > 0 && (
            <Card className="card-container table-card">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Shifts Data
                </Typography>
                <Box className="table-container">
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Role</TableCell>
                        <TableCell>Start Time</TableCell>
                        <TableCell>End Time</TableCell>
                        <TableCell>Required Skill</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {shifts.map((shift, i) => (
                        <TableRow key={i} hover>
                          <TableCell>{shift.id}</TableCell>
                          <TableCell>{shift.role}</TableCell>
                          <TableCell>{shift.start_time}</TableCell>
                          <TableCell>{shift.end_time}</TableCell>
                          <TableCell>{shift.required_skill}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              </CardContent>
            </Card>
          )}
        </Box>
      )}
    </Box>
  );
};

export default CsvImport;

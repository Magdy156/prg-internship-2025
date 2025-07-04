import React, { useState, useEffect } from 'react';
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
    <div className="csv-import">
      <h2>Upload CSV Files</h2>
      <div>
        <label>Employees CSV: </label>
        <input type="file" accept=".csv" onChange={(e) => handleFileUpload(e, 'employees')} />
      </div>
      <div>
        <label>Shifts CSV: </label>
        <input type="file" accept=".csv" onChange={(e) => handleFileUpload(e, 'shifts')} />
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      {employees.length > 0 && (
        <div>
          <h3>Employees Data</h3>
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Name</th><th>Skills</th><th>Max Hours</th><th>Start</th><th>End</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp, i) => (
                <tr key={i}>
                  <td>{emp.id}</td><td>{emp.name}</td><td>{emp.skills.join(', ')}</td><td>{emp.max_hours}</td>
                  <td>{emp.availability_start}</td><td>{emp.availability_end}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {shifts.length > 0 && (
        <div>
          <h3>Shifts Data</h3>
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Role</th><th>Start Time</th><th>End Time</th><th>Required Skill</th>
              </tr>
            </thead>
            <tbody>
              {shifts.map((shift, i) => (
                <tr key={i}>
                  <td>{shift.id}</td><td>{shift.role}</td><td>{shift.start_time}</td><td>{shift.end_time}</td>
                  <td>{shift.required_skill}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CsvImport;

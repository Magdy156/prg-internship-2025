## prg-internship-2025 Task
### Shift Scheduler

A robust shift scheduling application that optimizes employee shift assignments using a greedy algorithm (offline) and Integer Linear Programming (ILP) via a backend API. The application supports CSV-based data import, constraint enforcement (skills, availability, max hours), and a responsive calendar visualization, with seamless Dockerized deployment.

#### Features

- CSV Import: Upload employee and shift data via CSVs with validation for missing/invalid fields (e.g., date formats, max hours).

- Offline Greedy Solver: Generates schedules locally using a first-fit algorithm, respecting skills, availability, and max hours constraints.

- Online ILP Optimization: Leverages a FastAPI backend with PuLP to optimize schedules when available, maximizing assignments.

- Calendar Visualization: Displays schedules in a weekly view with employee swim-lanes, role-based color coding, and navigation.

- Constraint Management: Ensures skill-matching, availability, and max hours constraints for both offline and online modes.

#### Project Structure
```
project_root/
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── src/
│   │   ├── components/
│   │   │   ├── CsvImport.tsx
│   │   │   ├── GreedySolver.tsx
│   │   │   ├── CalendarView.tsx
│   │   │   ├── NavBar.tsx
│   │   ├── themes/
│   │   │   ├── theme.tsx
│   │   ├── App.tsx
│   │   ├── App.css
│   ├── samples/
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── main.py
├── docker-compose.yml
├── README.md
```

#### Setup Instructions
##### Prerequisites
Docker 28.2.2
Docker Compose
Node.js 22.16.0 (for local development, optional)
Python 3.10.6 (for local backend development, optional)

##### Installation
###### 1- Clone The Repo
```
git clone <repository-url>
cd project_root
```
###### 2- Build and run the application with Docker:
```
docker compose up --build
```
###### 3- To stop the application:
```
docker compose down
```

#### Local Development (Optional)
##### Frontend:
```
cd frontend
npm install
npm run dev
```
##### Backend:
```
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

#### Architecture

##### Frontend:

- Tech Stack: React 19.1.0, TypeScript, Vite 7.0.0, Material-UI (MUI) 7.2.0, PapaParse 5.5.3.

- Design: Modular components (CsvImport, GreedySolver, CalendarView, NavBar) in src/components/ for maintainability. Custom theme in src/themes/theme.tsx for consistent styling. Uses localStorage for offline data persistence.

- Rationale: Vite for fast development/builds, TypeScript for type safety, MUI for responsive UI, PapaParse for efficient CSV parsing.

##### Backend:
- Tech Stack: FastAPI 0.115.4, PuLP 2.9.0, Uvicorn 0.32.0, Python 3.10.6.

- Design: RESTful API with /api/health and /api/schedule/optimize endpoints, using Pydantic for validation and PuLP for ILP optimization.

- Rationale: FastAPI for high-performance APIs, PuLP for robust ILP solving, Uvicorn for reliable server runtime.



##### Deployment:
- Dockerized with Node.js 22.16.0 (frontend) and Python 3.10.6 (backend), orchestrated via Docker Compose for consistent environments.

#### Usage
1- Access the Application: Open http://localhost:3000 in a browser.

2- Upload CSVs:
- Navigate to the "Import" section.
- Upload employees_small.csv and shifts_small.csv (or employees_large.csv and shifts_large.csv) from frontend/      samples/ or any directory.
- Validation errors (e.g., missing fields, invalid dates) are displayed if present.

3- Generate Schedule:
- Click "Solve" to run the offline greedy solver (if backend is unavailable) or the online ILP solver (if backend is at http://localhost:8000).
- View results in the calendar, showing assigned shifts per employee.

4- View Calendar:
- Use navigation to switch weeks.
- Hover over shifts for details (role, time, employee).

5- Test Cases:
- Small Dataset: 10 employees, 20 shifts. Expected: All shifts assigned (zero conflicts).
- Large Dataset: 50 employees, 200 shifts. Expected: Most shifts assigned, unassigned shifts reported due to tight constraints.

#### Testing
1- Health Check:
```
curl http://localhost:8000/api/health
```
Expected: {"status": "healthy"}.

2- CSV Import:
- Upload sample CSVs and verify data tables in the UI.

3- Greedy Solver:
- Run with backend off (e.g., stop backend container: docker stop <backend_container_id>).
- Expected: Schedule generated for small dataset with no conflicts.

4- ILP Solver:
- Run with backend on, using large dataset.
- Expected: Optimized schedule, with unassigned shifts (if any) listed.

5- Edge cases:
- Upload invalid CSV (e.g., missing required_skill).
- Test backend downtime to confirm greedy solver fallback.

#### Assumptions and Notes

- CSVs follow the schema: employees.csv (id, name, skills, max_hours, availability_start, availability_end) and shifts.csv (id, role, start_time, end_time, required_skill).
- Dates use ISO 8601 format (e.g., 2025-07-01T09:00:00).
- CORS is configured for http://localhost:3000 to enable frontend-backend communication.
- Docker volumes ensure code changes reflect without rebuilding during development.

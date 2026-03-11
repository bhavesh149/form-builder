# Safety Engine — Dynamic Form Builder

A full-stack **Dynamic Safety Form Engine** that allows administrators to define safety checklists with custom fields, logic rules, and data sources — and allows users to submit data against those definitions.

Built as a production-ready proof-of-concept with a modern drag-and-drop form builder, a logic engine for inter-field relations, server-side validation, and a polished responsive UI.

---

## Tech Stack

| Layer      | Technology                                                                 |
| ---------- | -------------------------------------------------------------------------- |
| Frontend   | React 19, TypeScript, Vite, Tailwind CSS v4, Zustand, TanStack React Query |
| Backend    | FastAPI (Python), SQLAlchemy 2, Pydantic v2, Alembic                       |
| Database   | PostgreSQL 16 (JSONB for dynamic schemas)                                  |
| Auth       | JWT (python-jose), bcrypt                                                  |
| Uploads    | Cloudinary                                                                 |
| Infra      | Docker Compose (Postgres), Gunicorn/Uvicorn                                |

---

## Features

- **Form Builder** — Drag-and-drop field palette, live canvas, inline field configuration, JSON import/export
- **Field Types** — Text, Number, Select (static & dynamic), Radio, Checkbox Group, Video Upload, File Upload
- **Dynamic Data Sources** — Attach API endpoints (e.g. `/metadata/branches`) to populate dropdowns dynamically
- **Logic Engine** — Conditional visibility, dynamic required/optional, field highlighting based on inter-field rules
- **Form Versioning** — Schema changes create new versions; submissions are tied to the version they were submitted against
- **Server-Side Validation** — Submitted data is validated against the stored field schema (types, required, options)
- **Respondent Identity** — Optional collection of respondent name/email per form
- **Branch Management** — Seeded branches with admin CRUD
- **Submissions** — Server-side paginated list with CSV export, detail view with resolved field labels
- **Landing Page** — Animated, modern landing page with parallax effects
- **Responsive** — Fully responsive across mobile, tablet, and desktop
- **Authentication** — JWT-based auth with admin/user roles

---

## Project Structure

```
humanity-forms/
├── backend/              # FastAPI backend (Python)
├── frontend/             # React frontend (TypeScript)
├── docker-compose.yml    # PostgreSQL dev database
├── requirement.md        # Assignment specification
└── README.md             # This file
```

See [backend/README.md](./backend/README.md) and [frontend/README.md](./frontend/README.md) for details on each.

---

## Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- Python 3.11+
- Docker & Docker Compose (for PostgreSQL)

### 1. Start the database

```bash
docker compose up -d
```

### 2. Start the backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API is available at `http://localhost:8000` with docs at `/docs`.

### 3. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

The app is available at `http://localhost:5173`.

---

## Environment Variables

Create a `.env` file in `backend/` with:

```env
DATABASE_URL=postgresql://humanity_user:humanity_pass@localhost:5432/humanity_forms
JWT_SECRET_KEY=your-secret-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
FRONTEND_URL=http://localhost:5173
```

---

## API Endpoints (Key)

| Method | Path                                | Description                |
| ------ | ----------------------------------- | -------------------------- |
| GET    | `/api/metadata/branches`            | List branches              |
| POST   | `/api/metadata/branches`            | Create branch (admin)      |
| POST   | `/api/forms`                        | Create form definition     |
| GET    | `/api/forms`                        | List forms (paginated)     |
| GET    | `/api/forms/{id}`                   | Get form with latest version |
| PUT    | `/api/forms/{id}`                   | Update form                |
| POST   | `/api/forms/{id}/submissions`       | Submit form data           |
| GET    | `/api/forms/{id}/submissions`       | List submissions (paginated) |
| POST   | `/api/auth/register`                | Register user              |
| POST   | `/api/auth/login`                   | Login                      |

---

## License

This project is for demonstration/assessment purposes.

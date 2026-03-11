# Backend — FastAPI

The backend is a **FastAPI** application that provides the REST API for the Dynamic Safety Form Engine. It handles form definitions, submissions, branch metadata, file uploads, authentication, and server-side validation.

---

## Tech Stack

| Technology         | Purpose                                      |
| ------------------ | -------------------------------------------- |
| FastAPI            | Web framework (async-ready, auto OpenAPI docs) |
| SQLAlchemy 2       | ORM with JSONB support for dynamic schemas   |
| Alembic            | Database migrations                          |
| Pydantic v2        | Request/response validation & serialization  |
| PostgreSQL 16      | Primary database                             |
| python-jose        | JWT token generation & verification          |
| bcrypt             | Password hashing                             |
| Cloudinary         | Video/file upload storage                    |
| Loguru             | Structured logging                           |
| Gunicorn + Uvicorn | Production ASGI server                       |

---

## Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI app factory, startup events, router registration
│   ├── config.py            # Pydantic Settings (env-based configuration)
│   │
│   ├── api/                 # Route handlers
│   │   ├── auth.py          # POST /register, /login, GET /me
│   │   ├── forms.py         # CRUD for form definitions (paginated list)
│   │   ├── metadata.py      # GET/POST branches
│   │   ├── submissions.py   # Create & list submissions (paginated)
│   │   └── uploads.py       # File/video upload to Cloudinary
│   │
│   ├── auth/                # Authentication utilities
│   │   ├── deps.py          # Dependency injection (get_current_user, require_admin)
│   │   └── utils.py         # JWT creation, password hashing/verification
│   │
│   ├── db/                  # Database setup
│   │   ├── base.py          # SQLAlchemy declarative Base
│   │   └── database.py      # Engine, SessionLocal, get_db dependency
│   │
│   ├── models/              # SQLAlchemy ORM models
│   │   ├── user.py          # User (id, email, password_hash, role)
│   │   ├── branch.py        # Branch (id, name, location)
│   │   ├── form.py          # Form (title, status, version counter, collect_respondent_info)
│   │   ├── form_version.py  # FormVersion (fields_schema JSONB, logic_rules JSONB)
│   │   └── submission.py    # FormSubmission (submission_data JSONB, respondent info)
│   │
│   ├── schemas/             # Pydantic models (request/response)
│   │   ├── auth.py
│   │   ├── branch.py
│   │   ├── form.py          # Includes PaginatedFormListResponse
│   │   └── submission.py    # Includes PaginatedSubmissionListResponse
│   │
│   └── services/            # Business logic
│       ├── form_service.py         # Form CRUD with versioning
│       ├── submission_service.py   # Submission creation with schema validation
│       └── upload_service.py       # Cloudinary upload wrapper
│
├── alembic/                 # Alembic migration scripts
│   └── versions/
├── alembic.ini
├── requirements.txt
└── README.md
```

---

## Key Design Decisions

- **JSONB for dynamic schemas** — `fields_schema` and `logic_rules` are stored as JSONB columns, allowing flexible form definitions without schema migrations for each new field type.
- **Form versioning** — Each schema change creates a new `FormVersion` row. Submissions reference the version they were submitted against, ensuring historical integrity.
- **Server-side validation** — `submission_service.validate_submission_data()` checks submitted data against the stored field schema: required fields, data types, valid options, and branch existence.
- **Paginated responses** — List endpoints return `{ items, total, skip, limit }` for efficient server-side pagination.

---

## Setup

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Start dev server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API docs are at `http://localhost:8000/docs` (Swagger) and `/redoc` (ReDoc).

---

## Environment Variables

| Variable                | Default                              | Description          |
| ----------------------- | ------------------------------------ | -------------------- |
| `DATABASE_URL`          | `postgresql://...localhost/humanity_forms` | PostgreSQL connection |
| `JWT_SECRET_KEY`        | (change in production)               | JWT signing key      |
| `JWT_ALGORITHM`         | `HS256`                              | JWT algorithm        |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30`                           | Access token TTL     |
| `REFRESH_TOKEN_EXPIRE_DAYS`   | `7`                            | Refresh token TTL    |
| `CLOUDINARY_CLOUD_NAME` | —                                   | Cloudinary config    |
| `CLOUDINARY_API_KEY`    | —                                    | Cloudinary config    |
| `CLOUDINARY_API_SECRET` | —                                    | Cloudinary config    |
| `FRONTEND_URL`          | `http://localhost:5173`              | CORS allowed origin  |

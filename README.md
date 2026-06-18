# Automatic Google Review Generator

A full-stack app for creating QR-code review pages for businesses. The frontend lets a business generate a QR code. Customers scan it, choose their real experience, generate review suggestions, edit one, copy it, and post it manually on Google.

## Project Structure

```text
Automatic google review generator/
  backend/                 FastAPI backend
    app/
      main.py              API app entrypoint
      config.py            Environment settings
      database.py          SQLAlchemy database connection
      models.py            Database models
      schemas.py           Request/response validation
      routers/             API routes
      services/            QR and AI review services
      static/qrcodes/      Generated QR code images
    .env                   Local backend configuration
    requirements.txt       Python dependencies

  frontend/                React + Vite frontend
    src/
    package.json
    package-lock.json

  README.md
```

## Requirements

- Python 3.11 or newer
- Node.js 20 or newer
- PostgreSQL, if using the default `DATABASE_URL` from `backend/.env`

## Backend Setup

Open a terminal in the project root:

```powershell
cd backend
python -m pip install -r requirements.txt
```

Check `backend/.env`:

```env
DATABASE_URL=postgresql+psycopg://postgres:YOUR_PASSWORD@localhost:5432/review_qr
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8000
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
MAX_GENERATIONS_PER_SESSION=3
```

Create the PostgreSQL database if it does not already exist:

```powershell
createdb review_qr
```

Then run the backend:

```powershell
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Backend health check:

```text
http://127.0.0.1:8000/health
```

Expected response:

```json
{"status":"ok"}
```

## Frontend Setup

Open another terminal in the project root:

```powershell
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

Open the app:

```text
http://127.0.0.1:5173
```

## Build For Production

Frontend:

```powershell
cd frontend
npm run build
```

The production build is created in:

```text
frontend/dist
```

## API Overview

Main backend endpoints:

```text
GET    /health
POST   /api/businesses
GET    /api/businesses/{slug}
POST   /api/review-sessions
POST   /api/review-sessions/{session_token}/generate-reviews
PATCH  /api/review-sessions/{session_token}/selected-review
GET    /api/dashboard/{business_id}
```

## How The App Works

1. A business enters its name, Google review URL, category, and preferred review tone.
2. The backend creates a business record and generates a QR code.
3. The QR code opens `/review/{business_slug}` in the frontend.
4. A customer starts a review session, selects their real experience, and chooses keywords.
5. The backend generates 10 review suggestions.
6. The customer selects or edits a review, copies it, and opens Google to submit manually.
7. The dashboard shows scan/session metrics and recently selected reviews.

## Notes

- Generated QR images are saved in `backend/app/static/qrcodes/`.
- If `GEMINI_API_KEY` is missing or Gemini fails, the backend uses local fallback review templates so the app can still work.
- The backend creates database tables automatically on startup with SQLAlchemy.
- Do not commit `backend/.env`; it can contain secrets.

## Troubleshooting

### Backend says database connection failed

Make sure PostgreSQL is running and `DATABASE_URL` in `backend/.env` has the correct username, password, host, port, and database name.

### Frontend cannot reach backend

Make sure the backend is running on:

```text
http://127.0.0.1:8000
```

Also confirm `VITE_API_BASE_URL` is not pointing somewhere else. By default, the frontend uses:

```text
http://localhost:8000
```

### `vite` is not recognized

Install frontend dependencies:

```powershell
cd frontend
npm install
```

Then run:

```powershell
npm run dev
```

### QR image does not load

Make sure the backend is running and `BACKEND_URL` in `backend/.env` matches the backend URL.

## Useful Commands

Run backend:

```powershell
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Run frontend:

```powershell
cd frontend
npm run dev -- --host 127.0.0.1 --port 5173
```

Build frontend:

```powershell
cd frontend
npm run build
```

Check Python files compile:

```powershell
python -m compileall backend\app
```

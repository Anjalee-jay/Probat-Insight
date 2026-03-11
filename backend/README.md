# ProBat Insight FastAPI Backend

## 1) Setup

```bash
cd backend
python -m venv .venv
.venv\\Scripts\\activate
pip install -r requirements.txt
copy .env.example .env
```

Update `.env` with your MongoDB Atlas connection string.

## 2) Run

```bash
uvicorn app.main:app --reload --port 8000
```

## 3) Seed admin user

```bash
python seed_admin.py
```

Default admin credentials:
- `admin@probat.com`
- `admin123`

## 4) Endpoints

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`

Swagger docs:
- `http://localhost:8000/docs`

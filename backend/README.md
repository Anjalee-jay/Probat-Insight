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

Example:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/probat_insight?retryWrites=true&w=majority
MONGODB_DB=probat_insight
```

For Atlas, ensure your current IP is allowed in Network Access and the DB user has read/write permissions.

## 2) Run

Preferred (from repo root on Windows):

```powershell
npm run backend
```

Or directly from `backend/`:

```bash
uvicorn app.main:app --reload --port 8000
```

## 3) Seed admin user

```bash
python seed_admin.py
```

Default admin credentials:
- `admin@gmail.com`
- `Admin123#@$`

## 4) Endpoints

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`

Health response includes:
- `db_connected`: true when MongoDB is reachable
- `db_error`: present when MongoDB connection fails

Swagger docs:
- `http://localhost:8000/docs`

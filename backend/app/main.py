import os
import sys
from pathlib import Path

# Add the backend directory to Python path for imports
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi import Response
from fastapi.middleware.cors import CORSMiddleware

from app.database import check_db_connection
from app.routers.auth     import router as auth_router
from app.routers.contact import router as contact_router
from app.routers.feedback import router as feedback_router
from app.routers.users   import router as users_router

analysis_router = None
analysis_import_error = None
try:
    from app.routers.analysis import router as analysis_router
except Exception as exc:
    analysis_import_error = str(exc)

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

app = FastAPI(title="ProBat Insight API", version="1.0.0")

default_origins = ["http://localhost:3000", "http://127.0.0.1:3000"]
origins = [origin.strip() for origin in os.getenv("CORS_ORIGINS", ",".join(default_origins)).split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router,     prefix="/api")
app.include_router(contact_router,  prefix="/api")
app.include_router(feedback_router, prefix="/api")
app.include_router(users_router,    prefix="/api")
if analysis_router is not None:
    app.include_router(analysis_router, prefix="/api")


@app.get("/")
def root():
    return {
        "message": "ProBat Insight API is running",
        "health": "/api/health",
        "docs": "/docs",
        "analysis_enabled": analysis_router is not None,
    }


@app.get("/favicon.ico", include_in_schema=False)
def favicon():
    return Response(status_code=204)


@app.get("/api/health")
def health_check():
    response = {"status": "ok"}
    db_connected, db_error = check_db_connection()
    response["db_connected"] = db_connected
    if db_error:
        response["db_error"] = db_error

    if analysis_import_error:
        response["analysis_enabled"] = False
        response["analysis_error"] = analysis_import_error
    else:
        response["analysis_enabled"] = True
    return response

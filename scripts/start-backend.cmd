@echo off
setlocal

set "REPO_ROOT=%~dp0.."
set "PYTHON_EXE=%REPO_ROOT%\.venv313\Scripts\python.exe"
set "BACKEND_DIR=%REPO_ROOT%\backend"
set "REQ_FILE=%BACKEND_DIR%\requirements.txt"

if not exist "%PYTHON_EXE%" (
  echo [backend] ERROR: Python 3.13 environment not found at "%PYTHON_EXE%".
  echo [backend] Create or restore .venv313 first.
  exit /b 1
)

if not exist "%REQ_FILE%" (
  echo [backend] WARNING: requirements.txt not found at "%REQ_FILE%".
)

echo [backend] Checking for existing process on port 8000...
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":8000 " ^| findstr LISTENING') do (
  echo [backend] Killing existing process %%a on port 8000...
  taskkill /PID %%a /T /F >nul 2>&1
)

echo [backend] Starting FastAPI on http://127.0.0.1:8000 ...
"%PYTHON_EXE%" -m uvicorn app.main:app --app-dir "%BACKEND_DIR%" --reload --host 127.0.0.1 --port 8000

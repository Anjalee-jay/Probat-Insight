@echo off
setlocal

set "BACKEND_DIR=%~dp0backend"
set "VENV_DIR=%~dp0.venv313"

if not exist "%VENV_DIR%\Scripts\activate.bat" (
  echo Error: Virtual environment not found at %VENV_DIR%
  echo Please ensure .venv313 is set up correctly.
  exit /b 1
)

cd "%BACKEND_DIR%"
call "%VENV_DIR%\Scripts\activate.bat"
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

endlocal
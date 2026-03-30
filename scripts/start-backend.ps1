$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$pythonExe = Join-Path $repoRoot '.venv313\Scripts\python.exe'
$backendDir = Join-Path $repoRoot 'backend'
$requirementsPath = Join-Path $backendDir 'requirements.txt'

if (-not (Test-Path $pythonExe)) {
  Write-Error "Python 3.13 environment not found at '$pythonExe'. Create it first (expected: .venv313)."
}

if (-not (Test-Path $requirementsPath)) {
  Write-Error "Could not find backend requirements at '$requirementsPath'."
}

Write-Host '[backend] Installing backend dependencies in .venv313...' -ForegroundColor Cyan
& $pythonExe -m pip install -r $requirementsPath

Write-Host '[backend] Starting FastAPI on http://127.0.0.1:8000 ...' -ForegroundColor Green
& $pythonExe -m uvicorn app.main:app --app-dir $backendDir --reload --host 127.0.0.1 --port 8000

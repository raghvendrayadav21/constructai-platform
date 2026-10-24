@echo off
echo.
echo ============================================================
echo   ConstructAI — Backend Setup and Launch
echo ============================================================
echo.

cd /d "%~dp0backend"

echo [1/3] Creating Python virtual environment...
python -m venv venv
if errorlevel 1 (echo ERROR: Python not found. Install Python 3.8+. & pause & exit /b 1)

echo [2/3] Installing dependencies...
call venv\Scripts\activate.bat
pip install -r requirements.txt --quiet

echo [3/3] Starting FastAPI backend on http://localhost:8000
echo       API Docs: http://localhost:8000/docs
echo.
echo IMPORTANT: Add your GEMINI_API_KEY to backend\.env before using AI features!
echo.
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
pause

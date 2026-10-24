@echo off
echo.
echo ============================================================
echo   ConstructAI — Frontend Launch
echo ============================================================
echo.
cd /d "%~dp0frontend"
echo Starting React frontend on http://localhost:5173
npm run dev
pause

@echo off
REM Content Intelligence Platform - Windows Startup Script
REM Run this to start everything!

echo Starting Content Intelligence Platform...
echo.

REM Check if .env exists
if not exist ".env" (
    echo Error: .env file not found!
    echo Run: copy .env.example .env
    echo Then add your GITHUB_TOKEN
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing backend dependencies...
    call npm install
)

REM Check if frontend/node_modules exists
if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
)

echo.
echo Starting backend on http://localhost:3001
echo Starting frontend on http://localhost:3000
echo.
echo Press Ctrl+C to stop both servers
echo.

REM Start backend in new window
start "Backend Server" cmd /k npm run dev

REM Wait a bit for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend in new window
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers started!
echo Close the terminal windows to stop the servers.
pause

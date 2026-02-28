@echo off
REM Setup Script

echo.
echo Setup - Content Intelligence Platform
echo.

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js not found. Install from nodejs.org
    pause
    exit /b 1
)

for /f %%i in ('node --version') do set NODE_VERSION=%%i
echo Node.js %NODE_VERSION%
echo.

REM Install backend
echo Installing backend dependencies...
call npm install
echo.

REM Install frontend
echo Installing frontend dependencies...
cd frontend
call npm install
cd ..
echo.

REM Create .env
if not exist ".env" (
    echo Creating .env file...
    (
        echo # AWS Configuration
        echo AWS_REGION=us-east-1
        echo AWS_ACCESS_KEY_ID=your_access_key_here
        echo AWS_SECRET_ACCESS_KEY=your_secret_key_here
        echo.
        echo # Bedrock Configuration
        echo BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20241022-v2:0
        echo.
        echo # Application Configuration
        echo NODE_ENV=development
        echo PORT=3001
    ) > .env
    echo Update AWS credentials in .env
) else (
    echo .env exists
)

echo.
echo Setup complete!
echo.
echo To start: scripts\start.bat
echo.
pause

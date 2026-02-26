@echo off
REM 🚀 Content Intelligence Platform - Setup Script (Windows)
REM Usage: setup.bat [shubh|nidhi|srushti|lakshmi]

setlocal enabledelayedexpansion

REM Banner
echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║   🚀 CONTENT INTELLIGENCE PLATFORM - SETUP               ║
echo ║   AI for Bharat Hackathon 2026                           ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

REM Check if name provided
if "%1"=="" (
    echo ❌ Error: Please provide your name
    echo Usage: setup.bat [shubh^|nidhi^|srushti^|lakshmi]
    exit /b 1
)

set DEVELOPER_NAME=%1
echo 👋 Welcome, %DEVELOPER_NAME%!
echo.

REM Check Python
echo 🔍 Checking Python version...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python not found. Please install Python 3.11+ from python.org
    echo Make sure to check "Add to PATH" during installation
    pause
    exit /b 1
)

for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i
echo ✅ Found Python %PYTHON_VERSION%
echo.

REM Check Node.js
echo 🔍 Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Node.js not found (optional for frontend)
) else (
    for /f %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✅ Found Node.js !NODE_VERSION!
)
echo.

REM Create virtual environment
echo 📦 Creating virtual environment...
if not exist ".venv" (
    python -m venv .venv
    echo ✅ Virtual environment created
) else (
    echo ℹ️  Virtual environment already exists
)
echo.

REM Activate virtual environment
echo 🔌 Activating virtual environment...
call .venv\Scripts\activate.bat
echo ✅ Virtual environment activated
echo.

REM Upgrade pip
echo ⬆️  Upgrading pip...
python -m pip install --upgrade pip >nul 2>&1
echo ✅ pip upgraded
echo.

REM Install dependencies
echo 📚 Installing dependencies...
if exist "package.json" (
    echo Installing Node.js dependencies...
    call npm install
)

if exist "requirements.txt" (
    echo Installing Python dependencies...
    pip install -r requirements.txt
)
echo ✅ Dependencies installed
echo.

REM Create .env file
echo ⚙️  Setting up environment variables...
if not exist ".env" (
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
        echo PORT=3000
        echo API_PORT=8000
        echo.
        echo # Developer
        echo DEVELOPER_NAME=%DEVELOPER_NAME%
    ) > .env
    echo ✅ .env file created
    echo ⚠️  Please update AWS credentials in .env file
) else (
    echo ℹ️  .env file already exists
)
echo.

REM Create developer profile
echo 👤 Creating developer profile for %DEVELOPER_NAME%...
if not exist ".dev-profiles" mkdir .dev-profiles

REM Set role based on developer
if /i "%DEVELOPER_NAME%"=="shubh" set ROLE=Backend Architect + AWS Lead
if /i "%DEVELOPER_NAME%"=="soham" set ROLE=Backend Architect + AWS Lead
if /i "%DEVELOPER_NAME%"=="nidhi" set ROLE=AI Intelligence Lead
if /i "%DEVELOPER_NAME%"=="srushti" set ROLE=Frontend + UX Lead
if /i "%DEVELOPER_NAME%"=="lakshmi" set ROLE=Testing + DevOps + Demo Lead

(
    echo {
    echo   "name": "%DEVELOPER_NAME%",
    echo   "role": "%ROLE%",
    echo   "setupDate": "%DATE%"
    echo }
) > .dev-profiles\%DEVELOPER_NAME%.json
echo ✅ Developer profile created
echo.

REM Show next steps
echo ╔═══════════════════════════════════════════════════════════╗
echo ║   🎯 YOUR NEXT STEPS (%DEVELOPER_NAME%)
echo ╚═══════════════════════════════════════════════════════════╝
echo.

if /i "%DEVELOPER_NAME%"=="shubh" goto :shubh
if /i "%DEVELOPER_NAME%"=="soham" goto :shubh
if /i "%DEVELOPER_NAME%"=="nidhi" goto :nidhi
if /i "%DEVELOPER_NAME%"=="srushti" goto :srushti
if /i "%DEVELOPER_NAME%"=="lakshmi" goto :lakshmi
goto :general

:shubh
echo 📋 Your Role: Backend Architect + AWS Lead
echo.
echo Day 1 Tasks:
echo   1. Set up AWS infrastructure (CDK)
echo   2. Configure Bedrock, Transcribe, Rekognition
echo   3. Build AI Service Manager
echo   4. Create Content Processor core
echo.
echo To start development:
echo   .venv\Scripts\activate.bat
echo   cd src\services
echo   # Start coding AIServiceManager.ts
goto :end

:nidhi
echo 📋 Your Role: AI Intelligence Lead
echo.
echo Day 1 Tasks:
echo   1. Build domain detection engine
echo   2. Create domain adapters (Education, Food, Travel, Reviews)
echo   3. Implement domain-specific analysis patterns
echo.
echo To start development:
echo   .venv\Scripts\activate.bat
echo   cd src\services
echo   # Start coding DomainAdapter.ts
goto :end

:srushti
echo 📋 Your Role: Frontend + UX Lead
echo.
echo Day 1 Tasks:
echo   1. Create landing page + upload interface
echo   2. Build drag-drop file upload with preview
echo   3. Design results dashboard wireframe
echo.
echo To start development:
echo   .venv\Scripts\activate.bat
echo   cd frontend
echo   npm run dev
goto :end

:lakshmi
echo 📋 Your Role: Testing + DevOps + Demo Lead
echo.
echo Day 1 Tasks:
echo   1. Set up CI/CD pipeline (GitHub Actions)
echo   2. Configure testing framework (Jest)
echo   3. Set up CloudWatch monitoring
echo.
echo To start development:
echo   .venv\Scripts\activate.bat
echo   cd tests
echo   npm test
goto :end

:general
echo 📋 Your Role: Developer
echo.
echo Check HACKATHON_BATTLE_PLAN.md for your tasks
goto :end

:end
echo.
echo 📚 Reference Documents:
echo   • HACKATHON_BATTLE_PLAN.md - Complete 6-day plan
echo   • PERSONA_GUIDE.md - Expert perspectives
echo   • QUICK_REFERENCE.md - Quick lookup
echo.
echo 💬 Daily Standups:
echo   • 9:00 AM - Morning sync (15 min)
echo   • 6:00 PM - Evening sync (15 min)
echo.
echo ✅ Setup complete! Ready to build something INSANE! 🚀
echo ⏰ Deadline: March 4, 2026 - LET'S WIN THIS! 🔥
echo.
pause

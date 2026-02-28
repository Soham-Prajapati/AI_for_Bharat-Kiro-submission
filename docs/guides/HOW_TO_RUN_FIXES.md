# HOW_TO_RUN.md and Scripts - FIXED

## What Was Wrong

1. **HOW_TO_RUN.md had incorrect commands:**
   - Referenced Python virtual environment (`.venv`) that doesn't exist
   - Wrong port numbers (8000 instead of 3001)
   - Incorrect directory structure (`cd src` doesn't work)
   - Referenced non-existent Python dependencies

2. **Scripts had issues:**
   - `setup.sh` and `setup.bat` tried to install Python and create venv
   - Error messages referenced wrong things (GITHUB_TOKEN instead of AWS credentials)
   - Incorrect activation commands

## What Was Fixed

### 1. docs/guides/HOW_TO_RUN.md

**Fixed:**
- ✅ Removed all Python/venv references
- ✅ Corrected backend port to 3001
- ✅ Fixed terminal commands to run from project root
- ✅ Updated file paths to match actual structure
- ✅ Corrected AWS configuration instructions
- ✅ Updated troubleshooting section
- ✅ Fixed all script paths to use `scripts/` prefix

**Correct Commands Now:**

```bash
# Backend (from project root)
npm run dev
# Runs at http://localhost:3001

# Frontend (from project root)
cd frontend
npm run dev
# Runs at http://localhost:3000

# Both at once
./scripts/start.sh  # Mac/Linux
scripts\start.bat   # Windows
```

### 2. scripts/setup.sh

**Fixed:**
- ✅ Removed Python version checks
- ✅ Removed venv creation
- ✅ Removed pip installation
- ✅ Only checks for Node.js
- ✅ Installs npm dependencies only
- ✅ Creates correct .env with PORT=3001
- ✅ Updated developer instructions (no venv activation)

### 3. scripts/setup.bat

**Fixed:**
- ✅ Removed Python checks
- ✅ Only checks for Node.js
- ✅ Installs npm dependencies only
- ✅ Creates correct .env file
- ✅ Updated developer instructions

### 4. scripts/start.sh

**Fixed:**
- ✅ Changed error message from GITHUB_TOKEN to AWS credentials
- ✅ Added proper cleanup function for Ctrl+C
- ✅ Correct port numbers in output

### 5. scripts/start.bat

**Fixed:**
- ✅ Changed error message from GITHUB_TOKEN to AWS credentials
- ✅ Correct port numbers in output

## Project Structure (Actual)

```
AI_for_Bharat-Kiro-submission/
├── package.json              # Backend dependencies
├── src/                      # Backend source
│   ├── index.ts             # Entry point
│   ├── services/            # Business logic
│   └── routes/              # API routes
├── frontend/                 # Frontend (Next.js)
│   ├── package.json         # Frontend dependencies
│   ├── app/                 # Next.js pages
│   ├── components/          # React components
│   └── services/            # API client
├── scripts/                  # Setup and run scripts
│   ├── setup.sh             # Mac/Linux setup
│   ├── setup.bat            # Windows setup
│   ├── start.sh             # Mac/Linux start
│   └── start.bat            # Windows start
├── .env                      # Environment variables
└── docs/                     # Documentation
    └── guides/
        └── HOW_TO_RUN.md    # This file (now fixed)
```

## How to Use (Verified Working)

### First Time Setup

**Mac/Linux:**
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh shubh
```

**Windows:**
```cmd
scripts\setup.bat shubh
```

### Daily Development

**Option 1: Both servers at once**
```bash
./scripts/start.sh          # Mac/Linux
scripts\start.bat           # Windows
```

**Option 2: Separate terminals**

Terminal 1 (Backend):
```bash
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

## Verification

After setup, verify:

```bash
# 1. Check backend
npm run dev
# Should see: "Server running on http://localhost:3001"

# 2. Check frontend (new terminal)
cd frontend
npm run dev
# Should see: "Ready on http://localhost:3000"

# 3. Check health endpoint
curl http://localhost:3001/health
# Should return: {"status":"ok"}
```

## No More Confusion

- ❌ No Python
- ❌ No .venv
- ❌ No pip
- ❌ No requirements.txt
- ✅ Only Node.js
- ✅ Only npm
- ✅ Only package.json

This is a **pure Node.js/TypeScript project** with Next.js frontend.

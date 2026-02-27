# 📜 Scripts Documentation

This directory contains utility scripts for setup, development, testing, deployment, and orchestration of the Content Intelligence Platform.

---

## 📑 Table of Contents

- [Setup Scripts](#setup-scripts)
- [Development Scripts](#development-scripts)
- [Build & Deployment Scripts](#build--deployment-scripts)
- [Testing Scripts](#testing-scripts)
- [Orchestration Scripts](#orchestration-scripts)
- [Emergency Scripts](#emergency-scripts)

---

## 🛠️ Setup Scripts

### `setup.sh` (Mac/Linux)

**Purpose:** Initial project setup for team members

**Usage:**
```bash
./scripts/setup.sh [shubh|nidhi|srushti|lakshmi]
```

**What it does:**
- Checks Python 3.11+ installation
- Checks Node.js installation (optional)
- Validates environment setup
- Displays personalized welcome message
- Verifies all prerequisites

**Example:**
```bash
./scripts/setup.sh shubh
```

**Requirements:**
- Python 3.11+
- Node.js 18+ (optional, for frontend)

---

### `setup.bat` (Windows)

**Purpose:** Initial project setup for Windows users

**Usage:**
```cmd
scripts\setup.bat [shubh|nidhi|srushti|lakshmi]
```

**What it does:**
- Same as `setup.sh` but for Windows
- Checks Python and Node.js
- Validates environment
- Sets up development environment

**Example:**
```cmd
scripts\setup.bat shubh
```

---

## 🚀 Development Scripts

### `start.sh` (Mac/Linux)

**Purpose:** Start both backend and frontend development servers

**Usage:**
```bash
./scripts/start.sh
```

**What it does:**
1. Checks for `.env` file (exits if missing)
2. Installs backend dependencies if needed
3. Installs frontend dependencies if needed
4. Starts backend on `http://localhost:3001`
5. Starts frontend on `http://localhost:3000`
6. Runs both in parallel

**Ports:**
- Backend: `3001`
- Frontend: `3000`

**Stop servers:**
Press `Ctrl+C` to stop both servers

**Prerequisites:**
- `.env` file must exist (copy from `.env.example`)
- `GITHUB_TOKEN` must be set in `.env`

---

### `start.bat` (Windows)

**Purpose:** Start both servers on Windows

**Usage:**
```cmd
scripts\start.bat
```

**What it does:**
- Same as `start.sh` but for Windows
- Starts backend and frontend in parallel

---

## 🏗️ Build & Deployment Scripts

### `build.sh`

**Purpose:** Build production-ready Docker image

**Usage:**
```bash
./scripts/build.sh
```

**What it does:**
1. Builds backend with `npm run build`
2. Creates Docker image: `content-intelligence-backend`
3. Tags image for deployment

**Output:**
- Docker image: `content-intelligence-backend:latest`

**Test locally:**
```bash
docker run -p 3000:3000 --env-file .env content-intelligence-backend
```

**Requirements:**
- Docker installed
- `.env` file configured

---

### `deploy.sh`

**Purpose:** Deploy Docker image to AWS EC2

**Usage:**
```bash
export EC2_HOST="ec2-user@your-instance.compute.amazonaws.com"
./scripts/deploy.sh
```

**What it does:**
1. Runs `build.sh` to create Docker image
2. Saves Docker image as `.tar.gz`
3. Uploads to EC2 via SCP
4. Loads image on EC2
5. Stops old container
6. Starts new container on port 3000

**Environment Variables:**
- `EC2_HOST`: SSH connection string (default: `ec2-user@your-instance.compute.amazonaws.com`)

**Prerequisites:**
- SSH access to EC2 instance
- Docker installed on EC2
- `.env` file on EC2 at `/home/ec2-user/.env`

**Example:**
```bash
export EC2_HOST="ec2-user@3.110.123.45"
./scripts/deploy.sh
```

---

## 🧪 Testing Scripts

### `test-dna-api.sh`

**Purpose:** Test Creator DNA Analysis API endpoint

**Usage:**
```bash
./scripts/test-dna-api.sh
```

**What it tests:**
1. ✅ Valid request with userId and videoIds
2. ❌ Missing userId (should return 400)
3. ❌ Empty videoIds array (should return 400)
4. ❌ Invalid videoIds type (should return 400)

**Endpoint:** `POST /api/dna/analyze`

**Expected responses:**
- Valid: 200 with DNA analysis
- Invalid: 400 with error message

**Prerequisites:**
- Backend running on `http://localhost:3000`

---

### `test-analytics-api.sh`

**Purpose:** Test Analytics API endpoint and caching

**Usage:**
```bash
./scripts/test-analytics-api.sh
```

**What it tests:**
1. First call (fetches fresh data)
2. Second call (returns cached data - should be faster)
3. Invalid userId (should return 404)

**Endpoint:** `GET /api/analytics/:userId`

**Validates:**
- Response time comparison (cache effectiveness)
- Status codes
- Error handling

**Prerequisites:**
- Backend running on `http://localhost:3000`

---

### `test-viral-api.sh`

**Purpose:** Test Viral Score Predictor API endpoint

**Usage:**
```bash
./scripts/test-viral-api.sh
```

**What it tests:**
1. ✅ High viral potential content
2. ✅ Low viral potential content
3. ❌ Missing transcript (should return 400)
4. ❌ Empty transcript (should return 400)

**Endpoint:** `POST /api/viral/predict`

**Expected responses:**
- Valid: 200 with viral score (0-100)
- Invalid: 400 with error message

**Prerequisites:**
- Backend running on `http://localhost:3000`

---

## 🤖 Orchestration Scripts

### `multi-agent-orchestrator.js`

**Purpose:** Spawn 10 AI agents to work in parallel on tasks

**Usage:**
```bash
node scripts/multi-agent-orchestrator.js <task-file.json>
```

**What it does:**
1. Loads tasks from JSON file
2. Spawns 10 specialized agents:
   - Backend-API (API endpoints)
   - Backend-AWS (AWS integration)
   - AI-Domain (Domain detection)
   - AI-Generation (Content generation)
   - Frontend-UI (UI components)
   - Frontend-State (State management)
   - Testing-Unit (Unit tests)
   - Testing-Integration (Integration tests)
   - DevOps-CI (CI/CD pipeline)
   - DevOps-Deploy (Deployment)
3. Executes tasks in parallel
4. Saves results to `.agent-results.json`
5. Prints summary with timing

**Task file format:**
```json
[
  {
    "description": "Build user authentication API",
    "priority": "high",
    "assignedTo": "Backend-API"
  },
  {
    "description": "Create S3 upload service",
    "priority": "medium",
    "assignedTo": "Backend-AWS"
  }
]
```

**Example:**
```bash
node scripts/multi-agent-orchestrator.js tasks/phase2-tasks.json
```

**Output:**
- Console: Real-time agent progress (color-coded)
- File: `.agent-results.json` (detailed results)

---

## 🚨 Emergency Scripts

### `emergency-stop.sh`

**Purpose:** Emergency stop for all running agents with progress save

**Usage:**
```bash
./scripts/emergency-stop.sh
```

**What it does:**
1. Stops all agent processes (`multi-agent-orchestrator`, `agent-worker`)
2. Saves current progress to checkpoint file
3. Checks AWS costs for the last 24 hours
4. Creates timestamped checkpoint: `.agent-checkpoint-YYYYMMDD_HHMMSS.json`

**When to use:**
- AWS costs exceeding budget
- System overload
- Need to pause work
- Emergency situation

**Resume work:**
```bash
./scripts/resume-agents.sh  # (if implemented)
```

**Output:**
- Checkpoint file: `.agent-checkpoint-20260227_233000.json`
- AWS cost summary (if AWS CLI configured)

**Prerequisites:**
- AWS CLI installed (optional, for cost check)
- AWS credentials configured

---

## 🔧 Common Issues & Solutions

### Issue: "Permission denied" when running scripts

**Solution:**
```bash
chmod +x scripts/*.sh
```

---

### Issue: `.env file not found`

**Solution:**
```bash
cp .env.example .env
# Edit .env and add your GITHUB_TOKEN
```

---

### Issue: "Port 3000 already in use"

**Solution:**
```bash
# Find process using port 3000
lsof -ti:3000

# Kill the process
kill -9 $(lsof -ti:3000)
```

---

### Issue: Docker build fails

**Solution:**
```bash
# Clean Docker cache
docker system prune -a

# Rebuild
./scripts/build.sh
```

---

### Issue: EC2 deployment fails (SSH timeout)

**Solution:**
```bash
# Test SSH connection
ssh ec2-user@your-instance.compute.amazonaws.com

# Check security group allows SSH (port 22)
# Check EC2 instance is running
```

---

## 📊 Script Execution Order

### First Time Setup:
```bash
1. ./scripts/setup.sh shubh
2. cp .env.example .env
3. # Edit .env with your credentials
4. ./scripts/start.sh
```

### Development Workflow:
```bash
1. ./scripts/start.sh                    # Start dev servers
2. # Make changes
3. ./scripts/test-dna-api.sh            # Test your changes
4. ./scripts/test-analytics-api.sh
5. ./scripts/test-viral-api.sh
```

### Production Deployment:
```bash
1. ./scripts/build.sh                    # Build Docker image
2. export EC2_HOST="ec2-user@3.110.123.45"
3. ./scripts/deploy.sh                   # Deploy to EC2
```

### Parallel Development (Multi-Agent):
```bash
1. # Create task file: tasks/my-tasks.json
2. node scripts/multi-agent-orchestrator.js tasks/my-tasks.json
3. # Monitor progress in real-time
4. # If needed: ./scripts/emergency-stop.sh
```

---

## 🎯 Quick Reference

| Script | Purpose | When to Use |
|--------|---------|-------------|
| `setup.sh` | Initial setup | First time only |
| `start.sh` | Start dev servers | Every dev session |
| `build.sh` | Build Docker image | Before deployment |
| `deploy.sh` | Deploy to EC2 | Production release |
| `test-dna-api.sh` | Test DNA API | After DNA changes |
| `test-analytics-api.sh` | Test Analytics API | After analytics changes |
| `test-viral-api.sh` | Test Viral API | After viral score changes |
| `multi-agent-orchestrator.js` | Parallel AI work | Complex multi-task work |
| `emergency-stop.sh` | Stop all agents | Emergency/budget limit |

---

## 💡 Tips

1. **Always run setup first:** `./scripts/setup.sh <your-name>`
2. **Check .env before starting:** Ensure all credentials are set
3. **Test locally before deploying:** Run test scripts
4. **Monitor AWS costs:** Use `emergency-stop.sh` if costs spike
5. **Use orchestrator for big tasks:** Parallel work saves time

---

## 🤝 Team Assignments

| Person | Primary Scripts |
|--------|----------------|
| **Shubh** | `deploy.sh`, `build.sh`, `emergency-stop.sh` |
| **Nidhi** | `multi-agent-orchestrator.js`, test scripts |
| **Srushti** | `start.sh`, frontend-related |
| **Lakshmi** | All test scripts, `emergency-stop.sh` |

---

## 📞 Support

If scripts fail:
1. Check prerequisites (Python, Node.js, Docker)
2. Verify `.env` file exists and is configured
3. Check ports 3000/3001 are available
4. Review error messages carefully
5. Check `docs/ERROR_HANDLING_GUIDE.md`

---

**Last Updated:** February 27, 2026  
**Maintained By:** Shubh (Backend Lead)

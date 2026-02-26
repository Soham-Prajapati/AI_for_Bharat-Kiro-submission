# 🚀 How to Run — Content Intelligence Platform

## 🧠 How Does This App Work?

This app has **separate services** that work together:

```
┌──────────────────────┐        HTTP        ┌──────────────────────┐
│   FRONTEND (React)    │  ───────────────►  │   BACKEND (Node.js)  │
│   localhost:3000      │  ◄───────────────  │   localhost:8000     │
│                       │    JSON/REST       │                      │
│  • Upload Interface   │                    │  • Content Processor │
│  • Analysis Dashboard │                    │  • Domain Adapter    │
│  • Generation Studio  │                    │  • AI Service Mgr    │
│  • Approval Workflow  │                    │  • Generation Engine │
└──────────────────────┘                     └──────────────────────┘
                                                      │
                                                      │ AWS SDK
                                                      ▼
                                             ┌──────────────────────┐
                                             │   AWS AI SERVICES    │
                                             │  • Bedrock Claude    │
                                             │  • Transcribe        │
                                             │  • Rekognition       │
                                             └──────────────────────┘
```

---

## 🎯 Quick Start

### Mac / Linux

```bash
# 1. Clone & setup
git clone <your-repo-url>
cd AI_for_Bharat-Kiro-submission
chmod +x setup.sh
./setup.sh shubh    # Replace with: shubh/nidhi/srushti/lakshmi
```

### Windows

```cmd
git clone <your-repo-url>
cd AI_for_Bharat-Kiro-submission
setup.bat shubh     # Replace with: shubh/nidhi/srushti/lakshmi
```

> ⚠️ **Requirements:**
> - Python 3.11+ (for backend utilities)
> - Node.js 18+ (for TypeScript/React)
> - AWS CLI configured with credentials

---

## 🏃 Running the App (Day-to-Day)

### Option 1: One-Command Startup (Recommended)

**Mac/Linux:**
```bash
chmod +x start.sh
./start.sh
```

**Windows:**
```cmd
start.bat
```

This starts both backend and frontend automatically.

---

### Option 2: Manual Startup (2 Terminals)

#### Terminal 1 — Backend API

**Mac/Linux:**
```bash
source .venv/bin/activate
cd src
npm run dev
# API runs at http://localhost:8000
```

**Windows:**
```cmd
.venv\Scripts\activate.bat
cd src
npm run dev
```

#### Terminal 2 — Frontend

**Mac/Linux:**
```bash
source .venv/bin/activate
cd frontend
npm run dev
# Frontend at http://localhost:3000
```

**Windows:**
```cmd
.venv\Scripts\activate.bat
cd frontend
npm run dev
```

---

## 📂 Who Runs What

| Person | Primary Focus | What to Run | Terminal Commands |
|--------|--------------|-------------|-------------------|
| **Shubh/Soham** | Backend + AWS | Backend API | `cd src && npm run dev` |
| **Nidhi** | AI Services | Backend API | `cd src && npm run dev` |
| **Srushti** | Frontend | Frontend | `cd frontend && npm run dev` |
| **Lakshmi** | Testing + Demo | Both (for testing) | `./start.sh` |

---

## 🔧 Development Workflow

### Backend Development (Shubh/Soham, Nidhi)

```bash
# Activate environment
source .venv/bin/activate  # Mac/Linux
# .venv\Scripts\activate.bat  # Windows

# Run backend with hot reload
cd src
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

**Key Files:**
- `src/services/AIServiceManager.ts` - AWS integration
- `src/services/ContentProcessor.ts` - Content handling
- `src/services/DomainAdapter.ts` - Domain intelligence
- `src/services/AnalysisEngine.ts` - Content analysis
- `src/services/GenerationEngine.ts` - Content generation

---

### Frontend Development (Srushti)

```bash
# Activate environment
source .venv/bin/activate  # Mac/Linux
# .venv\Scripts\activate.bat  # Windows

# Run frontend with hot reload
cd frontend
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

**Key Files:**
- `frontend/src/pages/Upload.tsx` - Upload interface
- `frontend/src/pages/Analysis.tsx` - Analysis dashboard
- `frontend/src/pages/Generation.tsx` - Generation studio
- `frontend/src/components/` - Reusable components

---

### Testing (Lakshmi)

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- ContentProcessor

# Run with coverage
npm test -- --coverage

# Run property tests
npm run test:property
```

---

## ☁️ AWS Configuration

### 1. Set up AWS Credentials

**Option A: AWS CLI (Recommended)**
```bash
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Default region: us-east-1
```

**Option B: Environment Variables**
```bash
export AWS_ACCESS_KEY_ID=your_key_here
export AWS_SECRET_ACCESS_KEY=your_secret_here
export AWS_REGION=us-east-1
```

**Option C: .env File**
```bash
# Already created by setup script
# Edit .env and add your credentials
AWS_ACCESS_KEY_ID=your_key_here
AWS_SECRET_ACCESS_KEY=your_secret_here
```

### 2. Enable AWS Services

Make sure these services are enabled in your AWS account:
- ✅ Amazon Bedrock (Claude 3.5 Sonnet)
- ✅ Amazon Transcribe
- ✅ Amazon Rekognition
- ✅ S3 (for content storage)
- ✅ DynamoDB (for metadata)

### 3. Request Bedrock Access

If you haven't used Bedrock before:
1. Go to AWS Console → Bedrock
2. Click "Model access"
3. Request access to "Claude 3.5 Sonnet"
4. Wait for approval (~5 minutes)

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| `python3` not found (Mac) | `brew install python@3.11` |
| `python` not found (Windows) | Install from python.org, check "Add to PATH" |
| `node` not found | Install from nodejs.org (v18+) |
| Port 3000 already in use | `npm run dev -- --port 3001` |
| Port 8000 already in use | Change `API_PORT` in .env |
| AWS credentials error | Run `aws configure` or check .env |
| Bedrock access denied | Request model access in AWS Console |
| `setup.sh` permission denied | `chmod +x setup.sh` |
| Dependencies fail to install | Delete `node_modules` and `.venv`, run setup again |

---

## 📊 Monitoring & Logs

### View Backend Logs
```bash
# Terminal running backend will show logs
# Or check CloudWatch in AWS Console
```

### View Frontend Logs
```bash
# Browser console (F12)
# Or terminal running frontend
```

### Check AWS Costs
```bash
# AWS Console → Billing Dashboard
# Or use AWS CLI
aws ce get-cost-and-usage --time-period Start=2026-02-26,End=2026-03-04 --granularity DAILY --metrics BlendedCost
```

---

## 🚀 Demo Mode

For hackathon demo, use pre-loaded content:

```bash
# Start in demo mode
DEMO_MODE=true npm run dev

# This will:
# - Use cached demo videos
# - Skip actual AWS calls (use mock data)
# - Ensure fast, reliable demo
```

---

## 📚 Additional Resources

- **HACKATHON_BATTLE_PLAN.md** - Complete 6-day execution plan
- **PERSONA_GUIDE.md** - Expert perspectives for questions
- **QUICK_REFERENCE.md** - Quick lookup guide
- **requirements.md** - Full requirements
- **design.md** - System architecture

---

## 💬 Daily Standups

**Time:** 9:00 AM & 6:00 PM (15 minutes each)

**Format:**
1. What did you complete?
2. What are you working on next?
3. Any blockers?
4. Quick demo of progress

---

## 🎯 Current Sprint (Day 1)

### Shubh/Soham
- [ ] AWS infrastructure setup
- [ ] AI Service Manager implementation
- [ ] Content Processor core

### Nidhi
- [ ] Domain detection engine
- [ ] Domain adapters (4 domains)
- [ ] Domain-specific patterns

### Srushti
- [ ] Landing page
- [ ] Upload interface with drag-drop
- [ ] Results dashboard wireframe

### Lakshmi
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Testing framework setup
- [ ] CloudWatch monitoring

---

## ✅ End of Day 1 Checkpoint

By end of today, we should have:
- ✅ Can upload video → get transcript
- ✅ Domain detection works
- ✅ Basic UI deployed
- ✅ AWS infrastructure live

---

**Questions? Check PERSONA_GUIDE.md and ask specific experts!**

**LET'S BUILD SOMETHING INSANE! 🚀🔥**

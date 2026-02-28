# 🚀 How to Run — Content Intelligence Platform

## 🧠 How Does This App Work?

This app has **separate services** that work together:

```
┌──────────────────────┐        HTTP        ┌──────────────────────┐
│   FRONTEND (Next.js)  │  ───────────────►  │   BACKEND (Node.js)  │
│   localhost:3000      │  ◄───────────────  │   localhost:3001     │
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
chmod +x scripts/setup.sh
./scripts/setup.sh shubh    # Replace with: shubh/nidhi/srushti/lakshmi
```

### Windows

```cmd
git clone <your-repo-url>
cd AI_for_Bharat-Kiro-submission
scripts\setup.bat shubh     # Replace with: shubh/nidhi/srushti/lakshmi
```

> ⚠️ **Requirements:**
> - Node.js 18+ (for TypeScript/React)
> - npm or yarn
> - AWS CLI configured with credentials

---

## 🏃 Running the App (Day-to-Day)

### Option 1: One-Command Startup (Recommended)

**Mac/Linux:**
```bash
chmod +x scripts/start.sh
./scripts/start.sh
```

**Windows:**
```cmd
scripts\start.bat
```

This starts both backend and frontend automatically.

---

### Option 2: Manual Startup (2 Terminals)

#### Terminal 1 — Backend API

```bash
# From project root
npm install
npm run dev
# API runs at http://localhost:3001
```

#### Terminal 2 — Frontend

```bash
# From project root
cd frontend
npm install
npm run dev
# Frontend at http://localhost:3000
```

---

## 📂 Who Runs What

| Person | Primary Focus | What to Run | Terminal Commands |
|--------|--------------|-------------|-------------------|
| **Shubh** | Backend + AWS | Backend API | `npm run dev` (from root) |
| **Nidhi** | AI Services | Backend API | `npm run dev` (from root) |
| **Srushti** | Frontend | Frontend | `cd frontend && npm run dev` |
| **Lakshmi** | Testing + Demo | Both (for testing) | `./scripts/start.sh` |

---

## 🔧 Development Workflow

### Backend Development (Shubh, Nidhi)

```bash
# From project root
npm install

# Run backend with hot reload
npm run dev
# Backend runs at http://localhost:3001

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
# From project root
cd frontend
npm install

# Run frontend with hot reload
npm run dev
# Frontend runs at http://localhost:3000

# Run tests
npm test

# Build for production
npm run build
```

**Key Files:**
- `frontend/app/` - Next.js pages
- `frontend/components/` - Reusable components
- `frontend/services/` - API client
- `frontend/hooks/` - Custom React hooks
- `frontend/context/` - State management

---

### Testing (Lakshmi)

```bash
# From project root
npm test

# Run specific test suite
npm test -- ContentProcessor

# Run with coverage
npm test -- --coverage

# Run frontend tests
cd frontend
npm test
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
# Copy example file
cp .env.example .env

# Edit .env and add your credentials
AWS_ACCESS_KEY_ID=your_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1
BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20241022-v2:0
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
| `node` not found | Install from nodejs.org (v18+) |
| Port 3000 already in use | `cd frontend && npm run dev -- --port 3001` |
| Port 3001 already in use | Change `PORT` in .env to 3002 |
| AWS credentials error | Run `aws configure` or check .env |
| Bedrock access denied | Request model access in AWS Console |
| `scripts/setup.sh` permission denied | `chmod +x scripts/setup.sh` |
| `scripts/start.sh` permission denied | `chmod +x scripts/start.sh` |
| Dependencies fail to install | Delete `node_modules`, run `npm install` again |
| Backend won't start | Check if .env exists, run `npm install` |
| Frontend won't start | `cd frontend && npm install` |

---

## 📊 Monitoring & Logs

### View Backend Logs
```bash
# Terminal running backend will show logs
# Backend runs with ts-node and shows console output
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
aws ce get-cost-and-usage \
  --time-period Start=2026-02-26,End=2026-03-04 \
  --granularity DAILY \
  --metrics BlendedCost
```

---

## 🚀 Demo Mode

For hackathon demo, use pre-loaded content:

```bash
# Start backend in demo mode
DEMO_MODE=true npm run dev

# This will:
# - Use cached demo videos
# - Skip actual AWS calls (use mock data)
# - Ensure fast, reliable demo
```

---

## 📚 Additional Resources

- **START_HERE.md** - Complete onboarding guide
- **docs/TODO.md** - All tasks and progress
- **docs/PROJECT_PLAN.md** - Full architecture
- **docs/FEATURES_MASTER.md** - All 28 features explained
- **docs/BACKEND_COMPLETE.md** - Backend API guide
- **frontend/README.md** - Frontend setup guide

---

## 💬 Daily Standups

**Time:** 9:00 AM & 6:00 PM (15 minutes each)

**Format:**
1. What did you complete?
2. What are you working on next?
3. Any blockers?
4. Quick demo of progress

---

## 🎯 Current Sprint

### Shubh
- [ ] AWS infrastructure setup
- [ ] AI Service Manager implementation
- [ ] Content Processor core
- [ ] API endpoints

### Nidhi
- [ ] Domain detection engine
- [ ] Domain adapters (4 domains)
- [ ] Domain-specific patterns
- [ ] Generation prompts

### Srushti
- [ ] Landing page
- [ ] Upload interface with drag-drop
- [ ] Results dashboard
- [ ] Generation studio UI

### Lakshmi
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Testing framework setup
- [ ] CloudWatch monitoring
- [ ] Demo preparation

---

## ✅ Quick Verification

After setup, verify everything works:

```bash
# 1. Check backend
npm run dev
# Should see: "Server running on http://localhost:3001"

# 2. Check frontend (new terminal)
cd frontend
npm run dev
# Should see: "Ready on http://localhost:3000"

# 3. Check AWS connection
curl http://localhost:3001/health
# Should return: {"status":"ok"}
```

---

**Questions? Check START_HERE.md for complete onboarding!**

**LET'S BUILD SOMETHING INSANE! 🚀🔥**

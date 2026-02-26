# Getting Started Guide

**Welcome to the Content Intelligence Platform team!**

This guide will get you from zero to productive in 30 minutes.

---

## Prerequisites

### Required Software
- **Node.js:** 20.x or higher
- **npm:** 10.x or higher
- **Git:** Latest version
- **Code Editor:** VS Code (recommended) or your choice

### Required Accounts
- **AWS Account:** With $80 credits
- **GitHub Account:** For version control
- **Ollama:** For local AI testing (free)

### System Requirements
- **OS:** macOS, Linux, or Windows
- **RAM:** 8GB minimum (16GB recommended for Ollama)
- **Disk:** 10GB free space (for Ollama models)
- **Internet:** Stable connection for AWS services

---

## Step 1: Clone the Repository

```bash
# Clone the repo
git clone https://github.com/your-org/AI_for_Bharat-Kiro-submission.git

# Navigate to project
cd AI_for_Bharat-Kiro-submission

# Check you're on main branch
git branch
```

---

## Step 2: Run Setup Script

### Mac / Linux

```bash
# Make script executable (if not already)
chmod +x scripts/setup.sh

# Run setup with your name
./scripts/setup.sh shubh

# This will:
# - Install dependencies (npm install)
# - Create .env files
# - Set up git hooks
# - Configure AWS credentials
```

### Windows

```cmd
# Run setup with your name
scripts\setup.bat shubh

# This will:
# - Install dependencies (npm install)
# - Create .env files
# - Configure AWS credentials
```

---

## Step 3: Configure Environment Variables

The setup script creates `.env` files. You need to fill in your AWS credentials.

### Backend (.env in root)

```bash
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here

# AWS Service Configuration
S3_BUCKET_NAME=content-intelligence-uploads
DYNAMODB_TABLE_NAME=content-intelligence-cache

# Bedrock Configuration
BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20241022-v2:0
BEDROCK_MAX_TOKENS=4096

# Server Configuration
PORT=3001
NODE_ENV=development

# Cache Configuration
CACHE_TTL_HOURS=24

# Cost Tracking
AWS_BUDGET_ALERT_EMAIL=your-email@example.com
```

### Frontend (.env in frontend/)

```bash
# API Configuration
REACT_APP_API_URL=http://localhost:3001

# Feature Flags
REACT_APP_ENABLE_STREAMING=true
REACT_APP_ENABLE_MULTI_LANGUAGE=true
REACT_APP_ENABLE_SEO=true
```

---

## Step 4: Install Ollama (Free Local AI)

Ollama allows you to test AI features locally without using AWS credits.

### Mac / Linux

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull primary testing model (4.7GB)
ollama pull llama3.1:8b

# Pull faster model (4.1GB)
ollama pull mistral:7b

# Pull lightweight model (2.3GB)
ollama pull phi3:mini

# Verify installation
ollama list
```

### Windows

1. Download from: https://ollama.com/download
2. Run installer
3. Open PowerShell and run:

```powershell
ollama pull llama3.1:8b
ollama pull mistral:7b
ollama pull phi3:mini
ollama list
```

### Test Ollama

```bash
# Start Ollama server (runs automatically on install)
ollama serve

# Test in another terminal
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.1:8b",
  "prompt": "Hello, world!",
  "stream": false
}'
```

---

## Step 5: Set Up AWS

### Configure AWS CLI

```bash
# Install AWS CLI (if not installed)
# Mac
brew install awscli

# Linux
sudo apt-get install awscli

# Windows
# Download from: https://aws.amazon.com/cli/

# Configure credentials
aws configure
# Enter:
# - AWS Access Key ID
# - AWS Secret Access Key
# - Default region: us-east-1
# - Default output format: json
```

### Create S3 Bucket

```bash
# Create bucket for uploads
aws s3 mb s3://content-intelligence-uploads --region us-east-1

# Enable CORS
aws s3api put-bucket-cors --bucket content-intelligence-uploads --cors-configuration file://config/s3-cors.json
```

### Create DynamoDB Table

```bash
# Create cache table
aws dynamodb create-table \
  --table-name content-intelligence-cache \
  --attribute-definitions \
    AttributeName=contentHash,AttributeType=S \
  --key-schema \
    AttributeName=contentHash,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

### Set Up Billing Alerts

```bash
# Create SNS topic for alerts
aws sns create-topic --name aws-budget-alerts --region us-east-1

# Subscribe your email
aws sns subscribe \
  --topic-arn arn:aws:sns:us-east-1:YOUR_ACCOUNT_ID:aws-budget-alerts \
  --protocol email \
  --notification-endpoint your-email@example.com

# Create budget alerts (via AWS Console)
# Go to: AWS Console → Billing → Budgets → Create Budget
# Set alerts at: $50, $70, $80
```

---

## Step 6: Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

---

## Step 7: Run the Application

### Option A: Quick Start (Both Services)

```bash
# Run both backend and frontend
./scripts/start.sh
```

This starts:
- Backend: http://localhost:3001
- Frontend: http://localhost:3000

### Option B: Manual Start (Separate Terminals)

**Terminal 1 - Backend:**
```bash
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

---

## Step 8: Verify Everything Works

### Test Backend

```bash
# Health check
curl http://localhost:3001/health

# Expected response:
# {"status":"ok","timestamp":"2026-02-26T12:00:00.000Z"}
```

### Test Frontend

1. Open browser: http://localhost:3000
2. You should see the landing page
3. Try uploading a test video

### Test Ollama Integration

```bash
# Test local AI endpoint
curl http://localhost:3001/api/test/ollama

# Expected response:
# {"status":"ok","model":"llama3.1:8b","response":"..."}
```

---

## Step 9: Read Your Agent Prompt

1. Open `AGENT_PROMPTS.md`
2. Find your role section:
   - **Shubh/Soham:** Backend Architect + AWS Lead
   - **Nidhi:** AI Intelligence Lead
   - **Srushti:** Frontend + UX Lead
   - **Lakshmi:** Testing + DevOps + Demo Lead
3. Copy the entire prompt (including backticks)
4. Paste into your AI agent (Cursor/Copilot/Claude/ChatGPT/Kiro)

---

## Step 10: Start Your Day 1 Tasks

Open `planning/HACKATHON_BATTLE_PLAN.md` and find your Day 1 tasks.

### Shubh/Soham (Backend)
- [ ] Video upload endpoint
- [ ] S3 integration
- [ ] Transcription service
- [ ] Basic API structure

### Nidhi (AI)
- [ ] Domain detection engine
- [ ] Prompt templates
- [ ] Ollama integration
- [ ] Test with sample videos

### Srushti (Frontend)
- [ ] Landing page
- [ ] Upload UI
- [ ] Dashboard layout
- [ ] Basic styling

### Lakshmi (Testing/DevOps)
- [ ] CI/CD pipeline
- [ ] AWS billing alerts
- [ ] Testing framework
- [ ] Mock setup

---

## Common Issues & Solutions

### Issue: "npm install" fails

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Issue: "Ollama not found"

**Solution:**
```bash
# Check if Ollama is running
ps aux | grep ollama

# Start Ollama manually
ollama serve

# Check port 11434 is open
lsof -i :11434
```

### Issue: "AWS credentials not configured"

**Solution:**
```bash
# Reconfigure AWS CLI
aws configure

# Verify credentials
aws sts get-caller-identity

# Check .env file has correct values
cat .env | grep AWS
```

### Issue: "Port 3001 already in use"

**Solution:**
```bash
# Find process using port 3001
lsof -i :3001

# Kill the process
kill -9 <PID>

# Or use different port in .env
PORT=3002
```

### Issue: "Frontend can't connect to backend"

**Solution:**
```bash
# Check backend is running
curl http://localhost:3001/health

# Check REACT_APP_API_URL in frontend/.env
cat frontend/.env | grep API_URL

# Should be: REACT_APP_API_URL=http://localhost:3001
```

---

## Development Workflow

### Daily Routine

**Morning (9:00 AM):**
1. Pull latest changes: `git pull origin main`
2. Check your tasks in battle plan
3. Morning standup (15 min)
4. Start coding

**During Day:**
1. Work on your assigned tasks
2. Commit frequently: `git commit -m "feat: description"`
3. Push to your branch: `git push origin feature/your-name/feature-name`
4. Ask for help in team chat if blocked

**Evening (6:00 PM):**
1. Push your work
2. Evening standup (15 min)
3. Report AWS costs (Lakshmi)
4. Plan tomorrow's tasks

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/shubh/video-upload

# Make changes and commit
git add .
git commit -m "feat: add video upload endpoint"

# Push to remote
git push origin feature/shubh/video-upload

# Create PR on GitHub
# Get review from team
# Merge after approval
```

### Testing Workflow

```bash
# Run unit tests
npm test

# Run specific test file
npm test -- src/services/__tests__/transcription.test.ts

# Run with coverage
npm test -- --coverage

# Run integration tests
npm run test:integration
```

---

## Useful Commands

### Backend

```bash
# Development mode (auto-reload)
npm run dev

# Production build
npm run build

# Run production
npm start

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

### Frontend

```bash
# Development mode
npm start

# Production build
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

### AWS

```bash
# Check S3 buckets
aws s3 ls

# Check DynamoDB tables
aws dynamodb list-tables

# Check current costs
aws ce get-cost-and-usage \
  --time-period Start=2026-02-26,End=2026-02-27 \
  --granularity DAILY \
  --metrics BlendedCost
```

### Ollama

```bash
# List models
ollama list

# Run model interactively
ollama run llama3.1:8b

# Delete model
ollama rm mistral:7b

# Check Ollama status
ollama ps
```

---

## Next Steps

1. ✅ Complete this setup guide
2. ✅ Verify everything works
3. ✅ Read your agent prompt
4. ✅ Start Day 1 tasks
5. ✅ Attend morning standup

---

## Getting Help

### Documentation
- **Project Overview:** docs/guides/PROJECT_OVERVIEW.md
- **Architecture:** docs/architecture/SYSTEM_ARCHITECTURE.md
- **API Reference:** docs/api/API_REFERENCE.md
- **Personas:** planning/PERSONA_GUIDE.md

### Team
- **Technical Questions:** Ask in team chat
- **Blocked:** Mention in standup
- **AWS Issues:** Ask Shubh/Soham
- **Frontend Issues:** Ask Srushti
- **Testing Issues:** Ask Lakshmi

### External Resources
- **AWS Bedrock Docs:** https://docs.aws.amazon.com/bedrock/
- **Ollama Docs:** https://ollama.com/docs
- **React Docs:** https://react.dev/
- **TypeScript Docs:** https://www.typescriptlang.org/docs/

---

**You're all set! Let's build something amazing! 🚀**

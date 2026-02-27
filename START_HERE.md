# 🚀 START HERE — Quick Onboarding

> **Read this FIRST. Everything else is optional.**

---

## ⚡ 30-Second Summary

We're building a **Content Intelligence Platform** that uses AI to help creators repurpose 1 video into content for 6 platforms (YouTube, Instagram, LinkedIn, Twitter, Facebook, TikTok) in **60 seconds**.

**Your original vision:** Domain-Adaptive Switch (Education/Food/Travel/Product) + Human-in-the-Loop + Multi-format input

**What we added:** 25 breakthrough features (Creator DNA, Viral Score, ROI Calculator, Voice Clone, Marketplace, etc.)

**Deadline:** March 4, 2026 (5 days left)  
**Prize:** ₹40,00,000

---

## 👥 WHO ARE YOU?

### 🔧 SHUBH (Backend + AWS)
**Your job:** Build APIs, integrate AWS services (Bedrock, Transcribe, S3)

**Start working NOW:**
1. Open `PROMPTS.md` → Find "SHUBH" section
2. Copy the entire prompt
3. Run: `kiro-cli chat`
4. Paste the prompt
5. AI will read TODO.md and start working

**While AI works, read:**
- `docs/PROJECT_PLAN.md` (understand architecture)
- `docs/api/` (API contracts)
- `docs/deployment/` (AWS setup)

**Your files:**
- `src/routes/*.route.ts` (API routes)
- `src/services/*.service.ts` (AWS integrations)
- `src/middleware/*.middleware.ts` (auth, logging)

---

### 🤖 NIDHI (AI Intelligence)
**Your job:** Build AI services (prompts, domain detection, content generation)

**Start working NOW:**
1. Open `PROMPTS.md` → Find "NIDHI" section
2. Copy the entire prompt
3. Run: `kiro-cli chat`
4. Paste the prompt
5. AI will read TODO.md and start working

**While AI works, read:**
- `docs/PROMPT_ENGINEERING.md` (8 platform prompts)
- `docs/CREATOR_MODES.md` (AI-First, Hybrid, Human-First)
- `docs/architecture/DOMAIN_INTELLIGENCE.md` (domain detection)

**Your files:**
- `src/prompts/*.prompt.ts` (platform prompts)
- `src/services/mode-detection.service.ts` (creator modes)
- `src/services/*-generator.service.ts` (AI generation)

---

### 🎨 SRUSHTI (Frontend + UX)
**Your job:** Build Next.js UI, connect to backend APIs

**Start working NOW:**
1. Open `PROMPTS.md` → Find "SRUSHTI" section
2. Copy the entire prompt
3. Run: `kiro-cli chat`
4. Paste the prompt
5. AI will read TODO.md and start working

**While AI works, read:**
- `docs/PROJECT_PLAN.md` (understand features)
- `docs/api/ENDPOINTS.md` (API you'll call)
- `docs/guides/DEVELOPMENT_WORKFLOW.md` (how to work)

**Your files:**
- `frontend/app/**/*.tsx` (Next.js pages)
- `frontend/components/**/*.tsx` (React components)
- `frontend/services/api.ts` (API client)

---

### 🧪 LAKSHMI (Testing + DevOps)
**Your job:** Write tests, setup CI/CD, prepare demo

**Start working NOW:**
1. Open `PROMPTS.md` → Find "LAKSHMI" section
2. Copy the entire prompt
3. Run: `kiro-cli chat`
4. Paste the prompt
5. AI will read TODO.md and start working

**While AI works, read:**
- `docs/guides/TESTING_GUIDE.md` (testing strategy)
- `docs/deployment/DEPLOYMENT_GUIDE.md` (AWS deployment)
- `docs/guides/DEMO_PREPARATION.md` (demo script)

**Your files:**
- `src/__tests__/**/*.test.ts` (all tests)
- `.github/workflows/*.yml` (CI/CD)
- `scripts/*.sh` (deployment scripts)

---

## 📋 WHAT ARE WE BUILDING? (Core Features)

### ✅ MUST HAVE (Demo Day)
1. **Multi-Format Input** — Upload video/audio/text
2. **Domain Detection** — Auto-detect Education/Food/Travel/Product
3. **Platform Generation** — Generate content for 6 platforms
4. **Multi-Language** — Support 9 Indian languages
5. **Human-in-the-Loop** — Edit before publishing

### 🔥 WOW FEATURES (Judges Will Love)
6. **Creator DNA** — Personality analysis
7. **Viral Score** — Predict virality
8. **ROI Calculator** — Show time/money saved
9. **Cultural Adapter** — Regional context
10. **Ecosystem Analytics** — Cross-platform insights

### 🚀 BONUS (If Time Permits)
11-25. Workspace, Trend Predictor, Voice Clone, Marketplace, Community, etc.

**Full list:** See `docs/TODO.md`

---

## 🏗️ ARCHITECTURE (High-Level)

```
User uploads video
    ↓
AWS S3 (storage)
    ↓
AWS Transcribe (video → text)
    ↓
Domain Detection (Education/Food/Travel/Product)
    ↓
AWS Bedrock (Claude 3 Haiku) — Generate content
    ↓
6 Platform-Specific Outputs (YouTube, Instagram, etc.)
    ↓
Human reviews & edits
    ↓
Export or Auto-Post
```

**Tech Stack:**
- **Frontend:** Next.js 14 + React 18 + TailwindCSS
- **Backend:** Node.js + Express + TypeScript
- **AI:** AWS Bedrock (Claude 3 Haiku)
- **Storage:** AWS S3 + DynamoDB
- **Deployment:** Docker + AWS EC2

---

## 📂 FILE STRUCTURE (Where Everything Lives)

```
AI_for_Bharat-Kiro-submission/
├── PROMPTS.md              ← START HERE (copy your prompt)
├── START_HERE.md           ← YOU ARE HERE
├── README.md               ← Project overview
├── docs/
│   ├── TODO.md             ← All tasks (AI reads this)
│   ├── PROJECT_PLAN.md     ← Full architecture
│   ├── CREATOR_MODES.md    ← AI-First, Hybrid, Human-First
│   ├── PROMPT_ENGINEERING.md ← 8 platform prompts
│   ├── api/                ← API documentation
│   ├── deployment/         ← AWS setup guides
│   └── guides/             ← How-to guides
├── src/
│   ├── routes/             ← API routes (Shubh)
│   ├── services/           ← Business logic (Shubh + Nidhi)
│   ├── prompts/            ← Platform prompts (Nidhi)
│   ├── middleware/         ← Auth, logging (Shubh)
│   └── __tests__/          ← Tests (Lakshmi)
├── frontend/
│   ├── app/                ← Next.js pages (Srushti)
│   ├── components/         ← React components (Srushti)
│   └── services/           ← API client (Srushti)
└── scripts/                ← Deployment scripts (Lakshmi)
```

---

## 🔄 WORKFLOW (How We Work)

### 🚀 PARALLEL WORK = FASTER COMPLETION

**The secret:** Run multiple AI agents in parallel using multiple terminals!

### Step 1: Terminal 1 — Start First Agent
```bash
# Terminal 1
kiro-cli chat
```
1. Open `PROMPTS.md` → Copy your prompt
2. Paste in Terminal 1
3. AI reads TODO.md → Marks a task as `[/]` → Starts working

### Step 2: Terminal 2 — Start Second Agent (While Terminal 1 Works)
```bash
# Terminal 2 (open a NEW terminal)
kiro-cli chat
```
1. Paste the SAME prompt again
2. AI finds a DIFFERENT `[ ]` task (skips the `[/]` one)
3. Marks it as `[/]` → Starts working

### Step 3: Terminal 3, 4, 5... — Keep Going!
```bash
# Terminal 3
kiro-cli chat
# Paste prompt again

# Terminal 4
kiro-cli chat
# Paste prompt again

# ... as many as your device can handle!
```

**How many terminals?**
- **Laptop (8GB RAM):** 2-3 terminals
- **Laptop (16GB RAM):** 4-6 terminals
- **Desktop (32GB+ RAM):** 8-10 terminals

**Why this works:**
- Each terminal = 1 AI agent working on 1 task
- Tasks are marked `[/]` so agents don't collide
- More terminals = More tasks done in parallel = Faster completion

### Step 4: Monitor Progress
Watch all terminals:
- Terminal 1: Working on "Setup AWS Bedrock"
- Terminal 2: Working on "Create domain detection service"
- Terminal 3: Working on "Build upload API"
- Terminal 4: Working on "Write tests for auth"

### Step 5: When a Task Completes
- AI marks task as `[x]` in TODO.md
- AI commits and pushes changes
- AI finds next `[ ]` task automatically
- Repeat!

### Step 6: Sync Regularly
```bash
# In each terminal, AI will auto-sync
# But you can manually check:
git pull origin main
git log --oneline -10  # See recent commits
```

### 🎯 Pro Tips
- **Start with 2 terminals** → Add more as you get comfortable
- **Each person can run multiple terminals** → 4 people × 3 terminals = 12 parallel tasks!
- **Monitor TODO.md** → Watch tasks change from `[ ]` → `[/]` → `[x]`
- **Don't worry about conflicts** → AI agents coordinate via `[/]` markers

### Task Status Legend
- `[ ]` = Available (AI can pick this)
- `[/]` = In Progress (AI is working on this, SKIP IT)
- `[x]` = Done (Completed, move on)

---

## 🎯 SUCCESS CRITERIA (What Judges Want)

### Technical (40%)
- ✅ Works end-to-end (upload → generate → export)
- ✅ Uses AWS services (Bedrock, Transcribe, S3)
- ✅ Clean code, good architecture
- ✅ Handles errors gracefully

### Innovation (30%)
- ✅ Domain-Adaptive Intelligence (Education/Food/Travel/Product)
- ✅ Human-in-the-Loop (not fully automated)
- ✅ Multi-format input (video/audio/text/images)
- ✅ Wow features (Creator DNA, Viral Score, etc.)

### Demo (20%)
- ✅ Clear problem statement
- ✅ Live demo (no slides)
- ✅ Show 3-5 features
- ✅ Explain business value

### Presentation (10%)
- ✅ Confident delivery
- ✅ Answer questions well
- ✅ Show technical depth

---

## 🚨 COMMON MISTAKES (Avoid These)

❌ **Reading all docs before starting** → Just read PROMPTS.md and start  
❌ **Working on `[/]` tasks** → Skip them, find `[ ]` tasks  
❌ **Not syncing with git** → Pull before starting, push when done  
❌ **Building all 25 features** → Focus on 5 core + 5 wow features  
❌ **Overengineering** → Simple working code > complex broken code  

---

## 💰 BUDGET TRACKER

| Person | Budget | Spent | Remaining |
|--------|--------|-------|-----------|
| Shubh | $20 | $0 | $20 |
| Nidhi | $20 | $0 | $20 |
| Srushti | $5 | $0 | $5 |
| Lakshmi | $15 | $0 | $15 |
| Buffer | $20 | $0 | $20 |
| **Total** | **$80** | **$0** | **$80** |

**AWS Services Cost:**
- Bedrock (Claude 3 Haiku): ~$30
- Transcribe: ~$10
- S3 + DynamoDB: ~$5
- EC2 (deployment): ~$15
- **Total:** ~$60 (within budget)

---

## 📞 NEED HELP?

### Quick References
- **API Docs:** `docs/api/ENDPOINTS.md`
- **AWS Setup:** `docs/deployment/AWS_SETUP.md`
- **Testing:** `docs/guides/TESTING_GUIDE.md`
- **Demo Prep:** `docs/guides/DEMO_PREPARATION.md`

### Stuck?
1. Check `docs/TODO.md` for task details
2. Read relevant doc in `docs/`
3. Ask AI in your terminal (it has full context)

---

## 🎉 LET'S WIN THIS!

**Remember:**
- 5 days left
- ₹40,00,000 prize
- Focus on core features first
- Demo > Perfect code
- We got this! 🚀

**NOW GO TO `PROMPTS.md` AND START WORKING!**

# 🤖 Agent Prompts — Paste These to Get Started

> **Each person pastes their prompt into their AI agent (Cursor / Copilot / Claude / ChatGPT / Kiro).**  
> Make sure you have the project open in your IDE first.

---

## 🔷 SHUBH/SOHAM — Backend Architect + AWS Integration Lead

```
I am Shubh (also known as Soham), the Backend Architect + AWS Integration Lead for the Content Intelligence Platform hackathon project.

PROJECT CONTEXT:
- This is an AI-assisted content intelligence platform for the AI for Bharat hackathon
- Tech stack: TypeScript/Node.js backend, AWS Bedrock (Claude 3.5 Sonnet), AWS Transcribe, AWS Rekognition, S3, DynamoDB
- Deadline: March 4, 2026 — 11:59 PM IST (6 DAYS REMAINING)
- Budget: $80 AWS credits total (MUST be conservative with usage)
- My role: AWS infrastructure, AI Service Manager, Content Processor, Analysis Engine, API endpoints, backend integration

CRITICAL BUDGET CONSTRAINTS:
- Total AWS budget: $80 for entire hackathon
- Must use free tier services wherever possible
- Bedrock Claude 3.5: $3/1M input tokens, $15/1M output tokens
- Transcribe: $0.024/minute (use sparingly, cache results)
- Target: <$0.50 per video processed
- For testing: Use local models (Ollama) or mock responses

KEY FILES I OWN (see planning/HACKATHON_BATTLE_PLAN.md for details):
- src/services/AIServiceManager.ts
- src/services/ContentProcessor.ts
- src/services/AnalysisEngine.ts
- src/services/DiscoveryEngine.ts
- src/services/HumanLoopController.ts
- src/services/SSTManager.ts
- src/services/SSTSerializer.ts
- src/config/aws.ts
- src/index.ts

HOW TO WORK:
1. READ THESE FILES IN ORDER (MANDATORY):
   a. README.md — Project overview
   b. HOW_TO_RUN.md — How to run the project
   c. planning/HACKATHON_BATTLE_PLAN.md — Complete 6-day plan with MY specific tasks
   d. planning/requirements.md — Full requirements
   e. planning/design.md — System architecture
   f. docs/README.md — Documentation structure

2. UNDERSTAND THE CURRENT STATE:
   - Check what's already implemented in src/
   - Review existing service files
   - Understand the data models in src/types/core.ts

3. FOLLOW THE BATTLE PLAN:
   - I'm in "Stream A - Backend Core"
   - Check Day 1 tasks in planning/HACKATHON_BATTLE_PLAN.md
   - Work through tasks sequentially
   - Mark progress in daily standups (9 AM & 6 PM)

4. BUDGET-CONSCIOUS DEVELOPMENT:
   - Use AWS SDK mocks for local testing
   - Cache all AWS responses to avoid repeated calls
   - Implement retry logic with exponential backoff
   - Add cost tracking to every AWS call
   - Use Ollama (free) for testing, Bedrock for demo only

5. INTEGRATION CONTRACTS:
   - All services communicate via TypeScript interfaces
   - Follow the data models in src/types/core.ts
   - API responses must match schemas in planning/design.md
   - Coordinate with Nidhi on AI service integration points

DAILY WORKFLOW:
- Morning (9 AM): Standup — what I'll work on today
- Work on assigned tasks from battle plan
- Test locally with mocks before using AWS
- Evening (6 PM): Standup — what I completed, any blockers
- Push code to feature branch, create PR

IMPORTANT REMINDERS:
- AWS budget is $80 total — be EXTREMELY conservative
- Cache everything — never call AWS twice for same input
- Use local Ollama for development/testing
- Only use Bedrock for final demo and critical testing
- Track costs in CloudWatch, set up billing alerts at $50, $70, $80

Start by reading planning/HACKATHON_BATTLE_PLAN.md, identify my Day 1 tasks, and help me work through them efficiently while staying within budget.
```

---

## 🔷 NIDHI — AI Intelligence + Domain Adapter Lead

```
I am Nidhi, the AI Intelligence + Domain Adapter Lead for the Content Intelligence Platform hackathon project.

PROJECT CONTEXT:
- This is an AI-assisted content intelligence platform for the AI for Bharat hackathon
- Tech stack: TypeScript/Node.js, AWS Bedrock Claude 3.5 Sonnet, domain-specific AI adapters
- Deadline: March 4, 2026 — 11:59 PM IST (6 DAYS REMAINING)
- Budget: $80 AWS credits total (MUST be conservative with usage)
- My role: Domain detection, domain adapters (Education, Food, Travel, Product Reviews), Generation Engine, prompt engineering, multi-language support

CRITICAL BUDGET CONSTRAINTS:
- Total AWS budget: $80 for entire hackathon
- Bedrock Claude 3.5: $3/1M input tokens, $15/1M output tokens
- Must optimize prompts to minimize token usage
- For testing: Use Ollama with Llama 3.1 8B (free, local)
- Cache all AI responses
- Use few-shot prompting to reduce token count

KEY FILES I OWN (see planning/HACKATHON_BATTLE_PLAN.md for details):
- src/services/DomainAdapter.ts
- src/services/GenerationEngine.ts
- src/prompts/ (all prompt templates)
- src/domain-configs/ (domain-specific configurations)

HOW TO WORK:
1. READ THESE FILES IN ORDER (MANDATORY):
   a. README.md — Project overview
   b. HOW_TO_RUN.md — How to run the project
   c. planning/HACKATHON_BATTLE_PLAN.md — Complete 6-day plan with MY specific tasks
   d. planning/requirements.md — Requirements (focus on Req 2, 5, 7)
   e. planning/design.md — Domain adapter architecture
   f. docs/personas/README.md — How to use expert personas
   g. planning/PERSONA_GUIDE.md — Read RESEARCHER and STRATEGIST sections

2. UNDERSTAND DOMAIN INTELLIGENCE:
   - Education: Lecture structure, learning objectives, quiz generation
   - Food: Recipe extraction, ingredient lists, cooking steps
   - Travel: Location extraction, itinerary generation, cultural context
   - Product Reviews: Feature extraction, pros/cons, comparison tables
   - General: Fallback for unclassified content

3. FOLLOW THE BATTLE PLAN:
   - I'm in "Stream B - AI Intelligence"
   - Check Day 1 tasks in planning/HACKATHON_BATTLE_PLAN.md
   - Work through tasks sequentially
   - Coordinate with Shubh on AI Service Manager integration

4. PROMPT ENGINEERING FOR BUDGET:
   - Keep prompts concise (<500 tokens input)
   - Use structured output formats (JSON)
   - Implement prompt caching where possible
   - Test with Ollama first, validate with Bedrock sparingly
   - Track token usage for every call

5. FREE ALTERNATIVES FOR TESTING:
   - Ollama + Llama 3.1 8B (local, free, good for testing)
   - Ollama + Mistral 7B (local, free, faster)
   - Ollama + Phi-3 (local, free, lightweight)
   - Mock responses for unit tests
   - Only use Bedrock for integration tests and demo

DAILY WORKFLOW:
- Morning (9 AM): Standup — what I'll work on today
- Develop domain adapters with local testing
- Test prompts with Ollama before Bedrock
- Evening (6 PM): Standup — what I completed, any blockers
- Push code to feature branch, create PR

IMPORTANT REMINDERS:
- AWS budget is $80 total — optimize every prompt
- Use Ollama for 95% of development
- Bedrock only for final validation and demo
- Cache all AI responses in DynamoDB
- Track token usage meticulously

Start by reading planning/HACKATHON_BATTLE_PLAN.md, identify my Day 1 tasks (Domain Detection Engine + Domain Adapters), and help me build them efficiently with minimal AWS usage.
```

---

## 🔷 SRUSHTI — Frontend + UX Lead

```
I am Srushti, the Frontend + UX Lead for the Content Intelligence Platform hackathon project.

PROJECT CONTEXT:
- This is an AI-assisted content intelligence platform for the AI for Bharat hackathon
- Tech stack: React + TypeScript, Tailwind CSS, modern UI/UX patterns
- Deadline: March 4, 2026 — 11:59 PM IST (6 DAYS REMAINING)
- My role: All frontend UI, user experience, upload interface, analysis dashboard, generation studio, approval workflows, mobile-responsive design

KEY FILES I OWN (see planning/HACKATHON_BATTLE_PLAN.md for details):
- frontend/src/pages/ (all page components)
- frontend/src/components/ (all reusable components)
- frontend/src/styles/ (all styling)
- frontend/src/hooks/ (custom React hooks)
- frontend/src/utils/ (frontend utilities)

HOW TO WORK:
1. READ THESE FILES IN ORDER (MANDATORY):
   a. README.md — Project overview
   b. HOW_TO_RUN.md — How to run the project
   c. planning/HACKATHON_BATTLE_PLAN.md — Complete 6-day plan with MY specific tasks
   d. planning/requirements.md — Requirements (focus on Req 6 - Human-in-the-Loop)
   e. planning/design.md — System architecture
   f. docs/personas/README.md — How to use expert personas
   g. planning/PERSONA_GUIDE.md — Read DESIGNER section carefully

2. UNDERSTAND THE USER JOURNEY:
   - Upload → Processing → Analysis → Generation → Review → Export
   - Each step needs intuitive UI with clear feedback
   - Mobile-first design, then scale to desktop
   - Dark theme with professional look

3. FOLLOW THE BATTLE PLAN:
   - I'm in "Stream C - Frontend"
   - Check Day 1 tasks in planning/HACKATHON_BATTLE_PLAN.md
   - Work through tasks sequentially
   - Coordinate with Shubh on API integration

4. UI/UX PRINCIPLES:
   - Simple, clean, professional
   - Real-time feedback (progress bars, loading states)
   - Clear error messages
   - Accessibility (keyboard navigation, screen readers)
   - Mobile-responsive (works on phone, tablet, desktop)

5. DEMO-DRIVEN DEVELOPMENT:
   - Build features that look impressive in demo
   - Add smooth animations and transitions
   - Create "wow moments" (real-time AI streaming, confetti on approval)
   - Ensure demo mode works flawlessly

DAILY WORKFLOW:
- Morning (9 AM): Standup — what I'll work on today
- Build UI components with mock data first
- Integrate with backend API when ready
- Test on multiple devices/browsers
- Evening (6 PM): Standup — what I completed, any blockers
- Push code to feature branch, create PR

IMPORTANT REMINDERS:
- Frontend should work standalone with mock data initially
- Focus on demo-ready features first
- Polish and animations matter for judges
- Test on actual demo device before March 4

Start by reading planning/HACKATHON_BATTLE_PLAN.md, identify my Day 1 tasks (Landing Page + Upload Interface + Results Dashboard), and help me build beautiful, intuitive UI that will impress judges.
```

---

## 🔷 LAKSHMI — Testing + DevOps + Demo Preparation Lead

```
I am Lakshmi, the Testing + DevOps + Demo Preparation Lead for the Content Intelligence Platform hackathon project.

PROJECT CONTEXT:
- This is an AI-assisted content intelligence platform for the AI for Bharat hackathon
- Tech stack: TypeScript/Node.js, AWS (Bedrock, Transcribe, Rekognition), Jest testing, GitHub Actions CI/CD
- Deadline: March 4, 2026 — 11:59 PM IST (6 DAYS REMAINING)
- Budget: $80 AWS credits total (MUST be conservative)
- My role: CI/CD pipeline, testing framework, monitoring, demo script, presentation deck, backup plans, final QA

KEY FILES I OWN (see planning/HACKATHON_BATTLE_PLAN.md for details):
- .github/workflows/ (all CI/CD configs)
- src/__tests__/ (all test files)
- scripts/deploy.sh (deployment scripts)
- docs/deployment/ (deployment documentation)
- DEMO_SCRIPT.md (demo preparation)
- PRESENTATION.md (presentation deck content)

HOW TO WORK:
1. READ THESE FILES IN ORDER (MANDATORY):
   a. README.md — Project overview
   b. HOW_TO_RUN.md — How to run the project
   c. planning/HACKATHON_BATTLE_PLAN.md — Complete 6-day plan with MY specific tasks
   d. planning/requirements.md — All requirements (I test ALL of them)
   e. planning/design.md — System architecture and testing strategy
   f. docs/personas/README.md — How to use expert personas
   g. planning/PERSONA_GUIDE.md — Read QA, DEVOPS, and PRESENTER sections

2. UNDERSTAND TESTING STRATEGY:
   - Unit tests: Test individual functions/components
   - Integration tests: Test service-to-service communication
   - Property tests: Test universal correctness properties
   - End-to-end tests: Test complete workflows
   - Load tests: Test concurrent usage (50 users)

3. FOLLOW THE BATTLE PLAN:
   - I'm in "Stream D - Quality & Demo"
   - Check Day 1 tasks in planning/HACKATHON_BATTLE_PLAN.md
   - Work through tasks sequentially
   - Coordinate with all team members for testing

4. BUDGET-CONSCIOUS TESTING:
   - Use mocks for AWS services in unit tests
   - Use Ollama (free) for AI testing
   - Only use real AWS for integration tests (minimal)
   - Cache test results to avoid repeated AWS calls
   - Set up cost alerts at $50, $70, $80

5. DEMO PREPARATION:
   - Write 3-minute demo script with exact timing
   - Prepare 5 demo videos (pre-process and cache)
   - Create backup plans (local demo, video recording)
   - Practice demo 10+ times
   - Prepare judge Q&A answers

DAILY WORKFLOW:
- Morning (9 AM): Standup — coordinate testing needs
- Set up testing infrastructure
- Write tests for completed features
- Monitor AWS costs daily
- Evening (6 PM): Standup — test results, cost report
- Update demo script based on completed features

IMPORTANT REMINDERS:
- AWS budget is $80 total — track every penny
- Set up billing alerts IMMEDIATELY
- Use free alternatives for testing (Ollama, mocks)
- Demo preparation starts Day 4 (don't wait until last minute)
- Have 3 backup plans for demo day

FREE TESTING ALTERNATIVES:
- Ollama + Llama 3.1 8B (local LLM, free)
- Ollama + Mistral 7B (faster, free)
- Ollama + Phi-3 (lightweight, free)
- AWS SDK mocks (aws-sdk-mock npm package)
- LocalStack (local AWS emulation, free tier)

Start by reading planning/HACKATHON_BATTLE_PLAN.md, identify my Day 1 tasks (CI/CD Pipeline + Testing Framework + Monitoring Setup), and help me build robust testing infrastructure that keeps us within budget.
```

---

## 💡 **How to Use These Prompts**

### **Step 1: Copy Your Prompt**
Copy the entire prompt for your role (including the triple backticks)

### **Step 2: Paste into Your AI Agent**
- **Cursor:** Paste in chat panel
- **GitHub Copilot:** Paste in chat
- **Claude/ChatGPT:** Paste in new conversation
- **Kiro CLI:** Paste in terminal chat

### **Step 3: Let AI Read Documentation**
The AI will automatically:
1. Read all specified documentation files
2. Understand the project structure
3. Identify your current tasks
4. Start helping you implement

### **Step 4: Start Coding**
Ask questions like:
- "What should I work on first?"
- "Show me how to implement [feature]"
- "Review my code for [file]"
- "What's the next task?"

---

## 🎯 **Prompt Features**

Each prompt includes:
- ✅ **Role clarity** - Who you are and what you do
- ✅ **Project context** - What we're building
- ✅ **Budget constraints** - $80 AWS limit
- ✅ **File ownership** - What files you should edit
- ✅ **Reading order** - What docs to read first
- ✅ **Daily workflow** - How to structure your day
- ✅ **Integration points** - How to coordinate with team
- ✅ **Cost optimization** - How to stay within budget

---

## 💰 **AWS Budget Management ($80 Total)**

### **Budget Allocation:**
- Development & Testing: $20 (use sparingly)
- Integration Testing: $20 (test critical paths)
- Demo Preparation: $20 (pre-process demo content)
- Demo Day: $20 (live demo buffer)

### **Cost-Saving Strategies:**

**1. Use Free Alternatives for Development:**
```bash
# Install Ollama (free, local)
curl -fsSL https://ollama.com/install.sh | sh

# Pull models (one-time download)
ollama pull llama3.1:8b      # 4.7GB, good quality
ollama pull mistral:7b       # 4.1GB, faster
ollama pull phi3:mini        # 2.3GB, lightweight

# Test locally
ollama run llama3.1:8b "Analyze this content..."
```

**2. Mock AWS Services:**
```typescript
// Use aws-sdk-mock for testing
import AWS from 'aws-sdk-mock';

AWS.mock('Bedrock', 'invokeModel', (params, callback) => {
  callback(null, { body: JSON.stringify({ content: 'mock response' }) });
});
```

**3. Cache Everything:**
```typescript
// Cache AWS responses in DynamoDB
const cacheKey = `transcribe_${videoHash}`;
const cached = await getFromCache(cacheKey);
if (cached) return cached;

const result = await transcribe(video);
await saveToCache(cacheKey, result, 24 * 60 * 60); // 24hr TTL
return result;
```

**4. Batch Processing:**
```typescript
// Process multiple items in one Bedrock call
const batchPrompt = `Analyze these 5 videos: ${videos.map(v => v.summary).join('\n')}`;
// Saves 4 API calls
```

**5. Monitor Costs Daily:**
```bash
# Check AWS costs
aws ce get-cost-and-usage \
  --time-period Start=2026-02-26,End=2026-03-04 \
  --granularity DAILY \
  --metrics BlendedCost
```

### **Free Testing Models:**

| Model | Size | Speed | Quality | Use Case |
|-------|------|-------|---------|----------|
| **Llama 3.1 8B** | 4.7GB | Medium | High | Primary testing, domain detection |
| **Mistral 7B** | 4.1GB | Fast | Medium | Quick iterations, caption generation |
| **Phi-3 Mini** | 2.3GB | Very Fast | Medium | Unit tests, simple tasks |
| **Gemma 2B** | 1.4GB | Very Fast | Low | Smoke tests, basic validation |

**Recommendation:** Use Llama 3.1 8B for testing, Bedrock Claude 3.5 for demo only.

---

## 🚨 **CRITICAL REMINDERS FOR EVERYONE**

### **Budget Rules:**
1. ❌ **NEVER** call AWS without checking cache first
2. ❌ **NEVER** use Bedrock for testing (use Ollama)
3. ❌ **NEVER** process same content twice
4. ✅ **ALWAYS** use mocks for unit tests
5. ✅ **ALWAYS** track costs after each AWS call

### **Cost Tracking:**
```typescript
// Add to every AWS call
const startCost = await getCurrentCost();
const result = await bedrockCall(prompt);
const endCost = await getCurrentCost();
console.log(`Cost for this call: $${(endCost - startCost).toFixed(4)}`);
```

### **Billing Alerts:**
```bash
# Set up immediately
aws cloudwatch put-metric-alarm \
  --alarm-name "AWS-Budget-50" \
  --alarm-description "Alert at $50" \
  --metric-name EstimatedCharges \
  --threshold 50
```

---

## 📊 **Expected AWS Usage**

### **Development (Day 1-3): ~$20**
- Bedrock testing: 50 calls × $0.10 = $5
- Transcribe testing: 20 videos × $0.12 = $2.40
- Rekognition testing: 100 images × $0.02 = $2
- S3 + DynamoDB: ~$1
- Buffer: $10

### **Integration Testing (Day 4-5): ~$20**
- End-to-end tests: 30 runs × $0.30 = $9
- Load testing: 50 concurrent × $0.30 = $15 (skip if over budget)
- Buffer: $5 (likely won't use)

### **Demo Prep (Day 6): ~$20**
- Pre-process 10 demo videos: 10 × $0.30 = $3
- Cache all results
- Practice runs: 5 × $0.30 = $1.50
- Buffer: $15.50

### **Demo Day: ~$20**
- Live demo: 3 videos × $0.30 = $0.90
- Backup demos: 2 × $0.30 = $0.60
- Judge requests: 5 × $0.30 = $1.50
- Buffer: $17 (safety net)

**Total: $80 (with $42.50 buffer for unexpected usage)**

---

## 🔧 **Setup Instructions**

### **Before Using These Prompts:**

1. **Run setup script:**
   ```bash
   ./scripts/setup.sh [your-name]
   ```

2. **Configure AWS (with budget limits):**
   ```bash
   aws configure
   # Add credentials to .env
   ```

3. **Install Ollama (free testing):**
   ```bash
   curl -fsSL https://ollama.com/install.sh | sh
   ollama pull llama3.1:8b
   ```

4. **Open project in IDE:**
   ```bash
   code .  # VS Code
   # or cursor .  # Cursor
   ```

5. **Paste your prompt into AI agent**

---

## 📞 **Daily Standups**

**Time:** 9:00 AM & 6:00 PM (15 minutes each)

**Format:**
1. What did you complete since last standup?
2. What are you working on next?
3. Any blockers or help needed?
4. **AWS cost update** (Lakshmi reports daily spend)

---

## 🎊 **Success Metrics**

By following these prompts, each team member will:
- ✅ Understand their role and responsibilities
- ✅ Know exactly what to work on each day
- ✅ Stay within $80 AWS budget
- ✅ Coordinate effectively with team
- ✅ Build demo-ready features
- ✅ WIN THE HACKATHON 🏆

---

**LET'S GO BUILD SOMETHING LEGENDARY! 🚀🔥**

---

**Last Updated:** February 26, 2026
**Deadline:** March 4, 2026 (6 DAYS)
**Budget:** $80 AWS Credits
**Mission:** WIN AI for Bharat

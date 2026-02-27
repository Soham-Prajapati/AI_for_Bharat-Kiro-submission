# 🔄 Development Workflow

**How to work efficiently with 40 AI agents and 4 developers**

---

## Daily Workflow

### Morning (9:00 AM)

**1. Daily Standup (15 min)**
- What did you complete yesterday?
- What will you work on today?
- Any blockers?

**2. Check Agent Status**
```bash
# See what agents completed overnight
ls -la logs/agents/
cat logs/agents/summary.txt
```

**3. Pull Latest Code**
```bash
git pull origin main
npm install  # if dependencies changed
```

---

## Development Cycle

### Step 1: Pick a Task

**From tasks.json:**
```bash
node scripts/show-tasks.js --available
```

**Assign to yourself:**
```bash
node scripts/assign-task.js --task=5 --assignee=shubh
```

### Step 2: Create Branch

```bash
git checkout -b feature/task-5-video-upload
```

### Step 3: Launch Agents

**Open 4 terminals:**
```bash
# Terminal 1-4
kiro-cli chat
```

**Paste your agent prompts** from `team-launchers/YOUR_KIRO_LAUNCHER.md`

### Step 4: Develop with GitHub Copilot (FREE)

**Use local AI:**
```bash
# Use GitHub Copilot
# Mock AI - no setup needed

# Use in code
curl http://mock-ai-endpoint/api/generate -d '{
  "model": "llama3.1:8b",
  "prompt": "Analyze this video transcript..."
}'
```

**NO AWS during development!**

### Step 5: Test Locally

```bash
# Run tests
npm test

# Run locally
npm run dev

# Test with LocalStack (fake AWS)
localstack start
AWS_ENDPOINT=http://localhost:4566 npm run dev
```

### Step 6: Commit & Push

```bash
git add .
git commit -m "feat: add video upload with GitHub Copilot processing"
git push origin feature/task-5-video-upload
```

### Step 7: Create PR

```bash
gh pr create --title "Video upload feature" --body "Implements task #5"
```

---

## Evening (6:00 PM)

**1. Evening Standup (15 min)**
- Demo what you built
- Discuss blockers
- Plan tomorrow

**2. Update Task Status**
```bash
node scripts/update-task.js --task=5 --status=completed
```

**3. Push Code**
```bash
git push origin your-branch
```

---

## Git Workflow

### Branch Strategy

```
main                    ← Production-ready code
├── dev                 ← Integration branch
│   ├── shubh/backend   ← Shubh's work
│   ├── nidhi/ai        ← Nidhi's work
│   ├── srushti/frontend← Srushti's work
│   └── lakshmi/testing ← Lakshmi's work
```

### Merge Strategy

**Daily Integration:**
```bash
# End of day: merge your branch to dev
git checkout dev
git merge shubh/backend
git push origin dev
```

**Weekly Release:**
```bash
# End of week: merge dev to main
git checkout main
git merge dev
git push origin main
```

---

## Agent Workflow

### Parallel Agent Pattern

**Terminal 1: Agents 1-3 (Backend)**
```
Agent 1: API design
Agent 2: Database schema
Agent 3: Business logic
```

**Terminal 2: Agents 4-6 (Testing)**
```
Agent 4: Unit tests
Agent 5: Integration tests
Agent 6: E2E tests
```

**Terminal 3: Agents 7-9 (Docs)**
```
Agent 7: API docs
Agent 8: User guide
Agent 9: Code comments
```

**Terminal 4: Agent 10 (Review)**
```
Agent 10: Code review + optimization
```

### Agent Communication

**Agents DON'T talk to each other directly.**

**You coordinate:**
1. Agent 1 designs API → You save to `docs/api/`
2. Agent 4 reads API docs → Writes tests
3. Agent 7 reads API docs → Writes documentation

---

## Tools & Commands

### Useful Scripts

```bash
# Show available tasks
npm run tasks:available

# Assign task to yourself
npm run tasks:assign -- --task=5 --assignee=shubh

# Update task status
npm run tasks:update -- --task=5 --status=in-progress

# Generate daily report
npm run report:daily

# Check budget usage
npm run budget:check
```

### GitHub Copilot Commands

```bash
# List models
mockAI list

# Pull new model
# Mock AI - no models needed mistral:7b

# Run model
mockAI run llama3.1:8b "Summarize this text..."
```

### LocalStack Commands

```bash
# Start LocalStack
localstack start

# Create S3 bucket (local)
aws --endpoint-url=http://localhost:4566 s3 mb s3://my-bucket

# Upload file (local)
aws --endpoint-url=http://localhost:4566 s3 cp file.txt s3://my-bucket/
```

---

## Best Practices

### DO ✅

- Use GitHub Copilot for ALL development
- Test with LocalStack (fake AWS)
- Commit small, frequent changes
- Write tests for everything
- Document as you code
- Review others' PRs daily

### DON'T ❌

- Use AWS during development (costs money!)
- Commit directly to main
- Push broken code
- Skip tests
- Leave TODOs without issues
- Work in isolation (sync daily!)

---

## Emergency Procedures

### Agent Stuck?

```bash
# Kill all Kiro processes
pkill -f "kiro-cli"

# Restart
kiro-cli chat
```

### LocalStack Issues?

```bash
# Reset LocalStack
localstack stop
rm -rf ~/.localstack
localstack start
```

### Merge Conflicts?

```bash
# Abort merge
git merge --abort

# Coordinate with team
# Resolve manually
git mergetool
```

---

## Daily Checklist

**Morning:**
- [ ] Pull latest code
- [ ] Check agent logs
- [ ] Attend standup
- [ ] Pick task from tasks.json

**During Day:**
- [ ] Develop with GitHub Copilot (FREE)
- [ ] Test with LocalStack
- [ ] Commit frequently
- [ ] Update task status

**Evening:**
- [ ] Push code
- [ ] Create/update PR
- [ ] Attend standup
- [ ] Plan tomorrow

---

**Remember: Development = $0 cost. Use only FREE tools!**

# 🤖 LAKSHMI'S KIRO AGENT LAUNCHER

**Your Role:** Testing + DevOps + Demo Lead  
**Your Agents:** 10 Quality & Operations specialists  
**Tool:** Kiro CLI (4 terminals)  
**Deadline:** March 4, 2026 - **6 DAYS LEFT**

---

## 🚀 LAUNCH ALL 10 AGENTS (3 minutes)

### **Terminal 1: Testing (Agents 1-3)**

```bash
# Terminal 1
cd ~/Developer/AI_for_Bharat-Kiro-submission
kiro-cli chat
```

**Paste this:**

```
You are Agent 1-3: Testing Team for Lakshmi.

PROJECT: Content Intelligence Platform
DEADLINE: March 4, 2026 (6 days)

YOUR MISSION: Ensure ZERO bugs in demo.

AGENT 1: Unit Tests
- Create src/__tests__/services/domain-detection.test.ts
- Test domain detection accuracy
- Test all generators
- Test caching
- Coverage target: >80%

AGENT 2: Integration Tests
- Create src/__tests__/integration/api.test.ts
- Test upload → process → generate flow
- Test AWS services integration
- Test error handling
- Use mocks for AWS

AGENT 3: E2E Tests
- Create src/__tests__/e2e/user-flow.test.ts
- Test complete user journey
- Upload video → see results → export
- Use Playwright or Cypress

FILE OWNERSHIP:
- src/__tests__/**/*.test.ts (YOU OWN)
- src/mocks/*.mock.ts (YOU OWN)

TESTING STACK:
- Jest for unit/integration
- Playwright for E2E
- aws-sdk-mock for AWS mocking

START NOW: Create domain-detection.test.ts
```

---

### **Terminal 2: DevOps (Agents 4-6)**

```bash
# Terminal 2
kiro-cli chat
```

**Paste this:**

```
You are Agent 4-6: DevOps Team for Lakshmi.

AGENT 4: CI/CD Pipeline
- Create .github/workflows/ci.yml
- Run tests on every PR
- Build and deploy on merge
- Fail if tests fail or coverage <80%

AGENT 5: AWS Deployment
- Create scripts/deploy.sh
- Deploy backend to AWS (EC2 or ECS)
- Deploy frontend to S3 + CloudFront
- Set up environment variables
- SSL certificate

AGENT 6: Monitoring & Alerts
- Set up CloudWatch dashboards
- Create billing alerts ($50, $75, $90, $80)
- Set up error alerts
- Performance monitoring
- Cost tracking

FILE OWNERSHIP:
- .github/workflows/*.yml (YOU OWN)
- scripts/deploy.sh (YOU OWN)
- scripts/monitoring.sh (YOU OWN)

START NOW: Create ci.yml
```

---

### **Terminal 3: Demo Preparation (Agents 7-9)**

```bash
# Terminal 3
kiro-cli chat
```

**Paste this:**

```
You are Agent 7-9: Demo Preparation Team for Lakshmi.

AGENT 7: Demo Script
- Create DEMO_SCRIPT.md
- 3-minute demo flow
- What to say at each step
- Backup plans if something fails
- Practice checklist

AGENT 8: Demo Videos
- Pre-process 5 demo videos
- Cache all results
- Test each video works
- Prepare backup recordings
- Upload to S3

AGENT 9: Documentation
- Update README.md
- Create HOW_TO_DEPLOY.md
- Record demo video
- Create project summary
- Problem statement doc

FILE OWNERSHIP:
- DEMO_SCRIPT.md (YOU OWN)
- HOW_TO_DEPLOY.md (YOU OWN)
- Demo videos (YOU OWN)

START NOW: Create DEMO_SCRIPT.md with 3-minute flow
```

---

### **Terminal 4: Quality Assurance (Agent 10)**

```bash
# Terminal 4
kiro-cli chat
```

**Paste this:**

```
You are Agent 10: Quality Assurance Lead for Lakshmi.

YOUR MISSION: Find and fix ALL bugs before demo.

DAILY TASKS:
1. Run full test suite
2. Manual testing of all features
3. Check for edge cases
4. Performance testing
5. Security audit
6. Accessibility check

TESTING CHECKLIST:
- [ ] Upload works (all video formats)
- [ ] Processing <60s
- [ ] Domain detection >90% accurate
- [ ] All generators working
- [ ] Export works
- [ ] Mobile responsive
- [ ] No console errors
- [ ] API response <2s
- [ ] Cost tracking working
- [ ] Demo videos cached

BUG REPORT FORMAT:
```markdown
## Bug: [Title]
**Severity:** P0/P1/P2
**Steps to Reproduce:**
1. ...
2. ...
**Expected:** ...
**Actual:** ...
**Fix:** ...
```

START NOW: Run full test suite and create bug report template.
```

---

## 📊 YOUR PROGRESS TRACKER

### **Day 1 Checklist:**
- [ ] Unit tests written (>80% coverage)
- [ ] Integration tests passing
- [ ] E2E tests working
- [ ] CI/CD pipeline running
- [ ] AWS billing alerts set
- [ ] Monitoring dashboard created
- [ ] Demo script written
- [ ] 5 demo videos prepared
- [ ] Documentation updated
- [ ] Zero P0/P1 bugs

---

## 🧪 TESTING COMMANDS

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test
npm test -- domain-detection.test.ts

# Run E2E tests
npm run test:e2e

# Check coverage
npm run coverage
```

---

## 🚀 DEPLOYMENT COMMANDS

```bash
# Deploy backend
./scripts/deploy.sh backend

# Deploy frontend
./scripts/deploy.sh frontend

# Deploy everything
./scripts/deploy.sh all

# Check deployment status
./scripts/check-deployment.sh
```

---

## 💰 COST MONITORING

```bash
# Check today's cost
./scripts/check-costs.sh

# Set up alerts
./scripts/setup-alerts.sh

# Emergency stop
./scripts/emergency-stop.sh
```

---

## 🎯 SUCCESS CRITERIA

**By End of Day 1:**
- ✅ All tests passing
- ✅ CI/CD working
- ✅ Billing alerts set
- ✅ Demo script ready
- ✅ Zero critical bugs

**By March 4:**
- ✅ 100% test coverage
- ✅ Zero bugs
- ✅ Demo perfected
- ✅ Documentation complete
- ✅ Deployed and live

---

## 🎬 DEMO DAY CHECKLIST

**Morning of Demo:**
- [ ] Run full test suite
- [ ] Check all demo videos work
- [ ] Verify deployment is live
- [ ] Test internet connection
- [ ] Charge laptop fully
- [ ] Have backup hotspot
- [ ] Practice demo 3x
- [ ] Prepare backup video recording

---

## 🔥 LET'S WIN THIS!

**START NOW! Open 4 terminals and launch your agents!** 🚀

# 🚀 Content Intelligence Platform

**AI-assisted content understanding and generation for creators**

**Hackathon:** AI for Bharat 2026  
**Deadline:** March 4, 2026 (6 DAYS)  
**Team:** Shubh/Soham, Nidhi, Srushti, Lakshmi  
**Budget:** $80 AWS Credits

---

## ⚡ Quick Start

### Mac / Linux
```bash
./scripts/setup.sh shubh    # Replace with your name
./scripts/start.sh          # Start services
```

### Windows
```cmd
scripts\setup.bat shubh     # Replace with your name
scripts\start.bat           # Start services
```

---

## 📁 Project Structure

```
AI_for_Bharat-Kiro-submission/
├── README.md                    ← You are here
├── HOW_TO_RUN.md               ← Complete running guide
├── AGENT_PROMPTS.md            ← AI agent prompts for team
│
├── src/                        ← Source code
│   ├── services/               ← Core services
│   ├── types/                  ← TypeScript types
│   ├── config/                 ← Configuration
│   └── __tests__/              ← Tests
│
├── frontend/                   ← React frontend
│   ├── src/pages/              ← Page components
│   ├── src/components/         ← Reusable components
│   └── src/styles/             ← Styling
│
├── docs/                       ← Documentation
│   ├── README.md               ← Documentation index
│   ├── personas/               ← Expert AI perspectives
│   ├── guides/                 ← Step-by-step guides
│   ├── architecture/           ← System design docs
│   ├── api/                    ← API documentation
│   ├── deployment/             ← Deployment guides
│   └── user-guides/            ← End-user docs
│
├── planning/                   ← Project planning
│   ├── HACKATHON_BATTLE_PLAN.md  ← 6-day execution plan
│   ├── PERSONA_GUIDE.md          ← All expert perspectives
│   ├── QUICK_REFERENCE.md        ← Quick lookup
│   ├── requirements.md           ← Full requirements
│   ├── design.md                 ← System architecture
│   └── tasks.md                  ← Task breakdown
│
└── scripts/                    ← Setup & utility scripts
    ├── setup.sh / setup.bat    ← First-time setup
    └── start.sh / start.bat    ← Quick start
```

---

## 📚 Essential Documentation

| Document | Purpose | Read When |
|----------|---------|-----------|
| **[HOW_TO_RUN.md](./HOW_TO_RUN.md)** | Setup and running guide | First time setup |
| **[AGENT_PROMPTS.md](./AGENT_PROMPTS.md)** | AI agent prompts for team | Before starting work |
| **[planning/HACKATHON_BATTLE_PLAN.md](./planning/HACKATHON_BATTLE_PLAN.md)** | 6-day execution plan | Daily reference |
| **[planning/PERSONA_GUIDE.md](./planning/PERSONA_GUIDE.md)** | Expert perspectives | When you have questions |
| **[planning/QUICK_REFERENCE.md](./planning/QUICK_REFERENCE.md)** | Quick lookup | Quick reference |
| **[docs/README.md](./docs/README.md)** | Documentation index | Understanding docs structure |

---

## 🎯 What We're Building

**The Problem:** Content creators spend 80% of their time repurposing content across platforms.

**Our Solution:** AI that understands context and generates platform-optimized content in 60 seconds.

**Key Features:**
- 🎥 **Multi-format processing** - Video, text, image, structured data
- 🧠 **Domain intelligence** - Education, Food, Travel, Product Reviews
- ⚡ **Real-time generation** - 8+ outputs in 60 seconds
- 🌍 **Multi-language** - Translate with cultural adaptation
- 🎨 **Smart thumbnails** - AI-powered visual recommendations
- 🔍 **SEO optimization** - Keywords, meta descriptions, titles
- ✅ **Human-in-the-loop** - Approve/edit/reject all AI outputs
- 💡 **Explainable AI** - Show reasoning for every suggestion

---

## 👥 Team Structure

| Name | Role | Focus | Work Stream |
|------|------|-------|-------------|
| **Shubh/Soham** | Backend Architect + AWS Lead | Infrastructure, AI services, APIs | Stream A |
| **Nidhi** | AI Intelligence Lead | Domain detection, generation, prompts | Stream B |
| **Srushti** | Frontend + UX Lead | UI, dashboards, user experience | Stream C |
| **Lakshmi** | Testing + DevOps + Demo Lead | CI/CD, testing, demo prep | Stream D |

---

## 📅 Sprint Timeline

| Day | Date | Goal | Checkpoint |
|-----|------|------|------------|
| **Day 1** | Feb 26 | Foundation | Video → Transcript working |
| **Day 2** | Feb 27 | Intelligence | Analysis + Generation working |
| **Day 3** | Feb 28 | Advanced | Multi-language + Discovery |
| **Day 4** | Mar 1 | Killer Features | Real-time + Thumbnails + SEO |
| **Day 5** | Mar 2 | Polish | Zero bugs, beautiful UI |
| **Day 6** | Mar 3 | Demo Prep | Perfect demo, ready to win |

---

## 💰 AWS Budget ($80 Total)

### **Budget Allocation:**
- Development & Testing: $20
- Integration Testing: $20
- Demo Preparation: $20
- Demo Day Buffer: $20

### **Cost-Saving Strategies:**
- ✅ Use **Ollama** (free) for development/testing
- ✅ **Cache** all AWS responses (24hr TTL)
- ✅ Use **mocks** for unit tests
- ✅ **Batch** processing where possible
- ✅ **Monitor** costs daily

### **Free Testing Alternatives:**
- **Ollama + Llama 3.1 8B** - Primary testing model
- **Ollama + Mistral 7B** - Faster iterations
- **Ollama + Phi-3 Mini** - Lightweight testing
- **AWS SDK Mocks** - Unit testing
- **LocalStack** - Local AWS emulation

---

## 🏗️ Architecture

```
Frontend (React) → Backend (Node.js/TypeScript) → AWS AI Services
                                                   ├─ Bedrock Claude 3.5
                                                   ├─ Transcribe
                                                   ├─ Rekognition
                                                   └─ S3 + DynamoDB
```

**Tech Stack:**
- Backend: TypeScript + Node.js
- Frontend: React + Tailwind CSS
- AI: AWS Bedrock Claude 3.5 (demo), Ollama (testing)
- Storage: S3 + DynamoDB
- Infrastructure: AWS CDK

---

## 🎬 Demo Script (3 Minutes)

1. **Hook** (15s): "80% time on repurposing → 60 seconds with AI"
2. **Problem** (20s): Fragmented tools, no context understanding
3. **LIVE DEMO** (90s): Upload video → 8 outputs in 60 seconds
4. **Architecture** (20s): AWS Bedrock + Domain Intelligence
5. **Impact** (20s): $0.30/video, 10x faster, 90% approval
6. **Vision** (15s): AI co-pilot for creators

---

## 💡 Killer Features

1. **Real-Time Content Explosion** - 1 video → 8+ outputs in 60s
2. **Domain Intelligence** - Understands Education vs Food vs Travel
3. **Multi-Language** - Translate + culturally adapt
4. **Smart Thumbnails** - AI-powered visual recommendations
5. **SEO Optimization** - Keywords, meta descriptions, titles
6. **Human-in-the-Loop** - Approve/edit/reject all AI outputs
7. **Explainable AI** - Show reasoning for every suggestion
8. **Live Streaming** - Watch AI "think" in real-time

---

## 🚀 Getting Started

### **For Team Members:**

1. **Read your agent prompt:**
   - Open [AGENT_PROMPTS.md](./AGENT_PROMPTS.md)
   - Find your role (Shubh/Nidhi/Srushti/Lakshmi)
   - Copy the entire prompt

2. **Paste into your AI agent:**
   - Cursor / Copilot / Claude / ChatGPT / Kiro
   - Let it read all documentation
   - Start asking questions and coding

3. **Follow the battle plan:**
   - Check [planning/HACKATHON_BATTLE_PLAN.md](./planning/HACKATHON_BATTLE_PLAN.md)
   - Find your Day 1 tasks
   - Work through them sequentially

4. **Daily standups:**
   - 9:00 AM - Morning sync
   - 6:00 PM - Evening sync + cost report

---

## 🔥 Critical Success Factors

### **Technical:**
- [ ] Video processing <60 seconds (5-min video)
- [ ] API response time <2 seconds
- [ ] Domain detection accuracy >90%
- [ ] Cost per video <$0.50
- [ ] Stay within $80 AWS budget

### **Demo:**
- [ ] Live demo works flawlessly
- [ ] 3-minute timing perfect
- [ ] 3+ "wow" moments
- [ ] All judge questions answered
- [ ] Backup plans ready

---

## 🎯 Success Metrics

**Technical Metrics:**
- ✅ Video processing: <60 seconds for 5-min video
- ✅ API response: <2 seconds
- ✅ Concurrent users: 50+
- ✅ Domain detection: >90% accuracy
- ✅ AWS cost: <$80 total

**Demo Metrics:**
- ✅ Demo completion: <3 minutes
- ✅ Wow moments: 3+
- ✅ Judge questions: 100% answered
- ✅ Backup plans: 3 ready

---

## 🏆 Why We'll Win

1. **Technical Excellence** - Multi-modal AI, domain intelligence, real-time processing
2. **Innovation** - First platform with domain-specific content intelligence
3. **Execution** - Working demo, professional UI, comprehensive testing
4. **Presentation** - Clear problem, compelling solution, impressive demo
5. **Team** - 4 developers, clear roles, excellent coordination
6. **Budget Management** - Efficient AWS usage, smart cost optimization

---

## 📞 Getting Help

### **For Technical Questions:**
- Check [planning/PERSONA_GUIDE.md](./planning/PERSONA_GUIDE.md)
- Ask in daily standup
- Reference [docs/](./docs/) for detailed guides

### **For Process Questions:**
- Check [planning/HACKATHON_BATTLE_PLAN.md](./planning/HACKATHON_BATTLE_PLAN.md)
- Ask team lead (Shubh/Soham)

### **For Demo/Presentation:**
- Check PRESENTER persona in [planning/PERSONA_GUIDE.md](./planning/PERSONA_GUIDE.md)
- Practice with team

---

## 🚨 Important Reminders

- **AWS Budget:** $80 total - track every penny
- **Use Ollama:** Free local testing, save Bedrock for demo
- **Cache Everything:** Never call AWS twice for same input
- **Daily Standups:** 9 AM & 6 PM, 15 minutes
- **Demo Practice:** Start Day 4, practice 10+ times
- **Backup Plans:** Local demo, video recording, slides

---

## 🎊 Let's Win This!

**Time Remaining:** 6 days  
**Mission:** Build something INSANE  
**Goal:** WIN AI for Bharat

**LET'S F*CKING GO! 🔥💪🚀**

---

**Last Updated:** February 26, 2026  
**Team:** Content Intelligence Platform  
**Status:** READY TO DOMINATE

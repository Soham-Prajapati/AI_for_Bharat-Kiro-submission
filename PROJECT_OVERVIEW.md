# 🧠 Project Overview — Content Intelligence Platform (ContentAI)

> **Purpose of this file:** This is the single-source-of-truth document for any AI agent, team member, or collaborator to understand the complete project at a glance. Read this file first before doing any work.

---

## 🎯 What We're Building

**ContentAI** is a **Content Intelligence Platform** — an AI-powered tool that helps content creators repurpose **1 video into optimized content for 6 platforms** (YouTube, Instagram, LinkedIn, Twitter, Facebook, TikTok) in **under 60 seconds**.

### The Problem
Content creators spend **4–6 hours** manually adapting a single video for different social media platforms. Each platform has unique requirements (length, tone, hashtags, format, SEO keywords), making cross-platform content distribution time-consuming, expensive, and inconsistent.

### The Solution
An AI-powered pipeline that:
1. **Ingests** any content format (video, audio, text)
2. **Understands** the content's domain (Education, Food, Travel, Product Review, + 4 more)
3. **Generates** platform-specific content tailored to each channel's audience and format
4. **Translates** into 9 Indian languages with cultural adaptation
5. **Predicts** viral potential before publishing
6. **Keeps humans in control** — every AI output requires creator approval before publishing

---

## 🏗️ Architecture

```
User uploads video/audio/text
         ↓
   AWS S3 (storage)
         ↓
   AWS Transcribe (media → text)
         ↓
   Domain Detection (8 domains via AWS Bedrock)
         ↓
   Platform-Specific Generation (Claude 3 Haiku)
         ↓
   6 Platform Outputs + 9 Language Variants
         ↓
   Human Review & Edit (Human-in-the-Loop)
         ↓
   Export / Publish
```

### Tech Stack
| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, React 18, TailwindCSS |
| **Backend** | Node.js, Express, TypeScript |
| **AI Engine** | AWS Bedrock (Claude 3 Haiku / Sonnet) |
| **Transcription** | AWS Transcribe |
| **Storage** | AWS S3, DynamoDB |
| **Real-time** | WebSockets (collaborative editing), SSE (progress streaming) |
| **Deployment** | Docker, AWS EC2 |

---

## 📦 Feature Set (25 Features across 6 Phases)

### Phase 1 — Core (✅ Complete)
| # | Feature | Description |
|---|---------|-------------|
| 1 | **Multi-Format Input** | Upload video, audio, or text |
| 2 | **Domain Intelligence** | Auto-detect 8 content domains |
| 3 | **Platform Generation** | Optimized content for 6 platforms |
| 4 | **Multi-Language** | 9 Indian languages (Hindi, Tamil, Telugu, etc.) |
| 5 | **SEO Optimization** | Keywords, titles, hashtags, meta descriptions |
| 6 | **Smart Thumbnails** | AI-selected thumbnail candidates |
| 7 | **Real-Time Streaming** | SSE progress updates during processing |
| 8 | **Export & Batch** | PDF, JSON, CSV export formats |

### Phase 2 — MVP Differentiators (API Complete, Services Pending)
| # | Feature | Description |
|---|---------|-------------|
| 9 | **Creator DNA** 🧬 | Personality profiling from past content |
| 10 | **Ecosystem Analytics** 📊 | Cross-platform performance dashboard |
| 11 | **Viral Score Predictor** 🚀 | Predict content virality (0–100) |
| 12 | **ROI Calculator** 💰 | Time/money saved quantification |
| 13 | **Cultural Adapter** 🌏 | Regional cultural context adaptation |

### Phase 3 — Breakthrough Features
| # | Feature | Description |
|---|---------|-------------|
| 14 | **Workspace** | Real-time collaborative editing (WebSocket + OT) |
| 15 | **Trend Predictor** | Predict upcoming trends before they peak |
| 16 | **Voice Clone** | Creator voice cloning for AI narration |
| 17 | **Dopamine Optimizer** | Content pacing for max engagement |
| 18 | **Watermark** | Visible/invisible brand protection |
| 19 | **Content Multiplier** | 1 video → 50+ content pieces |

### Phase 4 — Platform Features
| # | Feature | Description |
|---|---------|-------------|
| 20 | **Marketplace** | Buy/sell templates and scripts |
| 21 | **Knowledge Graph** | Content-topic-creator relationship mapping |
| 22 | **Community Hub** | Social network, groups, forums (15 endpoints ✅) |
| 23 | **Membership** | Subscription tiers (Free/Pro/$299 Enterprise) |
| 24 | **Automation Engine** | Scheduled posting, auto-repurposing |
| 25 | **Analytics Dashboard** | Deep insights and performance metrics |

### Phase 5 — Empowerment Features
| # | Feature | Description |
|---|---------|-------------|
| 26 | **ADHD Navigator** 🧠 | Pomodoro + gamification for focus (8 endpoints ✅) |
| 27 | **Creative Director AI** | AI feedback on content quality |
| 28 | **Viral Analyzer** | Reverse engineer viral content success |

---

## 📁 Project Structure

```
AI_for_Bharat-Kiro-submission/
├── frontend/                  # Next.js 14 application
│   ├── app/                   # Pages (14 routes)
│   ├── components/            # React components
│   ├── services/              # API client
│   ├── context/               # AppContext (state management)
│   └── types/                 # TypeScript definitions
├── src/                       # Backend (Express + TypeScript)
│   ├── routes/                # API routes (100+ endpoints)
│   ├── services/              # Business logic (30+ services)
│   ├── prompts/               # Platform-specific AI prompts
│   ├── middleware/             # Auth, logging, rate limiting
│   └── __tests__/             # Test suites (50+)
├── docs/                      # Documentation
│   ├── api/                   # API reference (12 docs)
│   ├── deployment/            # AWS setup guides
│   ├── guides/                # How-to guides
│   ├── personas/              # AI advisor personas (10)
│   └── architecture/          # System design docs
├── .kiro/                     # Kiro specs and BMAD/SOUPZ steering
│   ├── specs/                 # Feature specifications
│   └── steering/              # BMAD agent personas (129 files)
└── scripts/                   # Deployment and utility scripts
```

---

## 👥 Team & Responsibilities

| Person | Role | Owns |
|--------|------|------|
| **Shubh** | Backend + AWS | Routes, Services, Middleware, Infrastructure |
| **Nidhi** | AI Intelligence | Prompts, Domain Detection, Content Generation |
| **Srushti** | Frontend + UX | Pages, Components, API Integration |
| **Lakshmi** | Testing + DevOps | Tests, CI/CD, Deployment Scripts |

---

## 🎨 Current Design System

| Token | Value |
|-------|-------|
| **Primary Color** | Indigo `#4F46E5` |
| **Background** | Dark `#0F0F0F` |
| **Cards** | `#1A1A1A` with `#262626` border |
| **Text Primary** | `#FAFAFA` |
| **Text Secondary** | `#A3A3A3` |
| **Font** | Inter (body), JetBrains Mono (code) |
| **Grid** | 8px spacing system |
| **Border Radius** | 8–12px |

### User Flow
```
Landing → Onboarding → Upload → Processing → Review → Dashboard
                                                    ↓
                                        Analytics / Marketplace / Community
```

---

## 🌍 Target Market

- **Primary:** Indian content creators (50M+ in 2026)
- **Market Size:** $12.28B in 2025, projected $49.83B by 2032 (22.2% CAGR)
- **Pain Point:** 90% of creators cannot effectively monetize; cross-platform content adaptation is their #1 bottleneck
- **Languages:** English + 8 Indian languages

---

## 🏆 Competition Context

| Competitor | Strength | Our Edge |
|-----------|----------|----------|
| Opus Clip | Short clip generation, virality score | Full multi-platform generation + domain intelligence |
| Descript | Text-based editing, voice clone | Cultural adaptation + India-first language support |
| Repurpose.io | Multi-platform distribution | AI-powered content generation, not just distribution |
| Vidyo.ai | Auto-captions, B-roll | Creator DNA + 25 integrated features |

---

## 🔑 Key Files for Context

| File | What It Contains |
|------|-----------------|
| `START_HERE.md` | Team onboarding guide |
| `requirements.md` | Formal requirements (10 requirement areas) |
| `design.md` | Technical architecture and data models |
| `DESIGN_SYSTEM.md` | Color palette, typography, component patterns |
| `docs/FEATURES_MASTER.md` | Complete spec for all 25+ features |
| `docs/TODO.md` | Task tracker (AI-readable) |
| `docs/PROJECT_PLAN.md` | Full architecture plan |
| `docs/api/` | API documentation (12 reference docs) |
| `BACKEND_COMPLETE_SUMMARY.md` | Backend completion status |
| `FRONTEND_STATUS.md` | Frontend status (14 pages, 0% API integration) |

---

## ⚙️ Current Status

| Area | Status |
|------|--------|
| **Backend** | ✅ Complete — 100+ endpoints, 30+ services, all tested |
| **Frontend** | 🔶 14 pages built — all using mock data, 0% backend integration |
| **AI Services** | 🔶 Core prompts done — full service integration pending |
| **Deployment** | ⏳ Docker configured, AWS deployment pending |
| **Design** | 🔴 Needs complete design cycle (this is current work) |

---

## 🚀 Hackathon Context

- **Event:** AI for Bharat 2026
- **Prize:** ₹40,00,000 (~$48,000 USD)
- **Deadline:** March 4, 2026
- **Judging:** Technical (40%), Innovation (30%), Demo (20%), Presentation (10%)
- **Key Demo Moments:** Upload → 60-second processing → 6-platform output → Viral Score → Creator DNA

---

> **For AI Agents:** This file gives you complete context. Use `docs/FEATURES_MASTER.md` for detailed feature specs, `docs/api/` for API contracts, and `DESIGN_SYSTEM.md` for current design tokens. Ask clarifying questions before making assumptions.

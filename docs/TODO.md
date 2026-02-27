# 🚀 Content Intelligence Platform — DETAILED TODO

> **Hackathon:** AI for Bharat 2026 (AWS)  
> **Deadline:** March 4, 2026 — 11:59 PM IST  
> **Team:** Shubh (Backend), Nidhi (AI), Srushti (Frontend), Lakshmi (Testing)  
> **Legend:** `[ ]` Todo · `[/]` In Progress · `[x]` Done

---

## 📚 REQUIRED READING BEFORE STARTING

**Everyone must read these files to understand the system:**

1. **`docs/PROJECT_PLAN.md`** — Full architecture, tech stack, features (25 total)
2. **`docs/CREATOR_MODES.md`** — 3 creator modes (AI-First, Hybrid, Human-First)
3. **`docs/PROMPT_ENGINEERING.md`** — 8 polished prompts for platforms
4. **`docs/QUICKSTART.md`** — How to run the project

**Before starting ANY task:**
- Read the relevant section in PROJECT_PLAN.md
- Understand the feature's purpose and user flow
- Check integration contracts below

---

## 👥 Team Roles & File Ownership

### SHUBH — Backend + AWS Lead
**Owns:**
- `src/routes/*.route.ts` — All API routes
- `src/services/s3.service.ts` — S3 file uploads
- `src/services/transcription.service.ts` — AWS Transcribe
- `src/services/bedrock.service.ts` — AWS Bedrock (Claude)
- `src/services/cache.service.ts` — DynamoDB caching
- `src/middleware/*.middleware.ts` — Auth, logging, error handling
- `src/index.ts` — Express server
- `Dockerfile`, `scripts/deploy.sh` — Deployment

### NIDHI — AI Intelligence Lead
**Owns:**
- `src/prompts/*.prompt.ts` — 8 platform prompts (YouTube, Instagram, etc.)
- `src/services/mode-detection.service.ts` — Detect creator mode
- `src/services/human-content-processor.service.ts` — Process human-shot videos
- `src/services/ai-content-generator.service.ts` — Generate AI content
- `src/services/platform-content-generator.service.ts` — Platform-specific generation
- `src/services/seo-translation.service.ts` — SEO + translation
- `src/services/quality-validator.service.ts` — Validate output quality
- `src/services/ollama.service.ts` — Local Ollama integration

### SRUSHTI — Frontend + UX Lead
**Owns:**
- `frontend/app/**/*.tsx` — All Next.js pages
- `frontend/components/**/*.tsx` — All React components
- `frontend/context/AppContext.tsx` — Global state
- `frontend/services/api.ts` — API client
- `frontend/hooks/*.ts` — Custom hooks
- `frontend/styles/**/*.css` — Styling

### LAKSHMI — Testing + DevOps Lead
**Owns:**
- `src/__tests__/**/*.test.ts` — All tests
- `.github/workflows/*.yml` — CI/CD pipelines
- `scripts/*.sh` — Deployment scripts
- `DEMO_SCRIPT.md` — Demo preparation

---

## 🔗 Integration Contracts (JSON APIs)

### Contract 1: Upload → Process
**Shubh → Nidhi**

```typescript
// POST /api/upload response
{
  fileId: string;
  fileName: string;
  mimeType: string;
  size: number;
  s3Url: string;
  uploadedAt: string;
}

// POST /api/process request
{
  fileId: string;
  contentType: 'video' | 'audio' | 'text';
}

// POST /api/process response
{
  jobId: string;
  status: 'processing' | 'completed' | 'failed';
  transcript?: string;
  metadata?: {
    duration: number;
    language: string;
    confidence: number;
  };
}
```

### Contract 2: Generate Content
**Nidhi → Shubh**

```typescript
// POST /api/generate request
{
  jobId: string;
  platforms: ['youtube', 'instagram', 'linkedin', 'twitter', 'tiktok', 'facebook'];
  language: 'en' | 'hi' | 'bn' | 'ta' | 'te' | 'mr' | 'gu' | 'kn' | 'ml';
  creatorMode: 'ai-first' | 'hybrid' | 'human-first';
}

// POST /api/generate response
{
  generationId: string;
  results: {
    youtube: {
      title: string;
      description: string;
      tags: string[];
      thumbnail: string;
    };
    instagram: {
      caption: string;
      hashtags: string[];
    };
    // ... other platforms
  };
  qualityScore: {
    completeness: number;
    engagement: number;
    seo: number;
  };
}
```

### Contract 3: Frontend → Backend
**Srushti → Shubh**

```typescript
// API Client (frontend/services/api.ts)
export const api = {
  upload: (file: File) => POST('/api/upload', formData),
  process: (fileId: string) => POST('/api/process', { fileId }),
  generate: (params: GenerateParams) => POST('/api/generate', params),
  getStatus: (jobId: string) => GET(`/api/process/${jobId}`),
};
```

---

## 📋 PHASE 1: Core Infrastructure (Day 1) — COMPLETED ✅

### Day 1.1: Prompts & Creator Modes
- [ ] **1.1a: Create 8 polished prompts (Nidhi)**
  - **What:** Create TypeScript files for each platform prompt
  - **Where:** `src/prompts/youtube.prompt.ts`, `instagram.prompt.ts`, etc.
  - **How:** Read `docs/PROMPT_ENGINEERING.md` for format
  - **Output:** Each file exports a function that takes transcript + metadata, returns platform-specific content
  - **Test:** Run with sample transcript, verify output quality

- [ ] **1.1b: Create 3 creator mode services (Nidhi)**
  - **What:** Implement AI-First, Hybrid, Human-First modes
  - **Where:** `src/services/mode-detection.service.ts`
  - **How:** Read `docs/CREATOR_MODES.md` for logic
  - **Output:** Service that detects mode from video metadata (has human face? has voiceover?)
  - **Test:** Feed 3 sample videos, verify correct mode detection

- [ ] **1.1c: Create mode detection service (Nidhi)**
  - **What:** Auto-detect which mode to use
  - **Where:** `src/services/mode-detection.service.ts`
  - **How:** Analyze video: check for human presence (AWS Rekognition), voiceover, editing style
  - **Output:** Returns `{ mode: 'hybrid', confidence: 0.85, reasons: [...] }`
  - **Test:** 10 sample videos, verify >80% accuracy

### Day 1.2-1.3: Backend & AWS — COMPLETED ✅
- [x] All API routes created
- [x] All AWS services integrated

### Day 1.4: Frontend Pages
- [ ] **1.4a: Create landing page (Srushti)**
  - **What:** Hero section + features + pricing
  - **Where:** `frontend/app/page.tsx`
  - **How:** Read `docs/PROJECT_PLAN.md` → "Problem Summary" section
  - **Design:** Dark mode, gradient backgrounds, animated stats
  - **Components:** Hero, FeatureGrid, PricingCards, Footer
  - **Test:** Responsive on mobile, tablet, desktop

- [ ] **1.4b: Create upload page (Srushti)**
  - **What:** Drag-drop file upload + progress bar
  - **Where:** `frontend/app/upload/page.tsx`
  - **How:** Use `react-dropzone` for file upload
  - **Flow:** Upload → Show progress → Redirect to processing page
  - **Components:** FileUploader, ProgressBar, FilePreview
  - **Test:** Upload 100MB video, verify progress updates

- [ ] **1.4c: Create dashboard (Srushti)**
  - **What:** Show all generated content, analytics
  - **Where:** `frontend/app/dashboard/page.tsx`
  - **How:** Fetch from `/api/generate/:id`, display in cards
  - **Components:** ContentCard, AnalyticsChart, ExportButton
  - **Test:** Mock data with 10 items, verify smooth scrolling

- [ ] **1.4d: Create mode selection UI (Srushti)**
  - **What:** Let user choose AI-First/Hybrid/Human-First
  - **Where:** `frontend/components/ModeSelector.tsx`
  - **How:** 3 cards with icons, descriptions, "Select" button
  - **Design:** Highlight selected mode, show benefits
  - **Test:** Click each mode, verify state updates

### Day 1.5: Testing Setup
- [ ] **1.5a: Setup Jest + test structure (Lakshmi)**
  - **What:** Configure Jest for TypeScript
  - **Where:** `jest.config.js`, `src/__tests__/setup.ts`
  - **How:** Install `@types/jest`, `ts-jest`
  - **Output:** `npm test` runs successfully
  - **Test:** Create sample test, verify it passes

- [ ] **1.5b: Create unit tests for prompts (Lakshmi)**
  - **What:** Test each prompt function
  - **Where:** `src/__tests__/prompts/*.test.ts`
  - **How:** Mock transcript input, verify output structure
  - **Coverage:** All 8 prompts, >80% code coverage
  - **Test:** `npm test -- prompts`

- [ ] **1.5c: Create integration tests (Lakshmi)**
  - **What:** Test full upload → process → generate flow
  - **Where:** `src/__tests__/integration/e2e.test.ts`
  - **How:** Use `supertest` to call API endpoints
  - **Test:** Upload file → verify S3 → verify Transcribe → verify Bedrock
  - **Duration:** Should complete in <30 seconds

- [ ] **1.5d: Setup CI/CD pipeline (Lakshmi)**
  - **What:** GitHub Actions for auto-deploy
  - **Where:** `.github/workflows/deploy.yml`
  - **How:** On push to `main`, run tests → build → deploy to AWS
  - **Test:** Push dummy commit, verify pipeline runs

---

## 📋 PHASE 2: MVP Features (Day 2) — 5 KILLER FEATURES

### Day 2.1: Creator DNA (Feature #1) 🧬
**Read:** `docs/PROJECT_PLAN.md` → Search for "Creator DNA"

- [ ] **2.1a: Create DNA analysis service (Nidhi)**
  - **What:** Analyze creator's past content to build personality profile
  - **Where:** `src/services/dna-analysis.service.ts`
  - **How:** 
    - Input: Array of past videos (transcripts + metadata)
    - Analyze: Tone (casual/formal), topics, vocabulary, pacing
    - Output: `{ personality: 'energetic', topics: ['tech', 'gaming'], tone: 'casual', vocabulary_level: 'intermediate' }`
  - **Algorithm:** Use Bedrock to analyze patterns across 5+ videos
  - **Test:** Feed 5 tech YouTuber videos, verify consistent profile

- [ ] **2.1b: Build personality detection algorithm (Nidhi)**
  - **What:** Classify creator into archetypes (Educator, Entertainer, Reviewer, etc.)
  - **Where:** Same file as 2.1a
  - **How:** Use clustering on tone + topics + pacing
  - **Output:** `{ archetype: 'educator', confidence: 0.92, traits: ['clear', 'structured', 'patient'] }`
  - **Test:** 10 different creators, verify distinct archetypes

- [ ] **2.1c: Create DNA visualization component (Srushti)**
  - **What:** Radar chart showing personality dimensions
  - **Where:** `frontend/components/DNAChart.tsx`
  - **How:** Use `recharts` or `chart.js`
  - **Dimensions:** Energy, Formality, Humor, Technical Depth, Storytelling
  - **Design:** Animated, interactive, color-coded
  - **Test:** Mock data with 5 dimensions, verify smooth animation

- [x] **2.1d: Add DNA API route (Shubh)**
  - **What:** `POST /api/dna/analyze`
  - **Where:** `src/routes/dna.route.ts`
  - **Input:** `{ userId: string, videoIds: string[] }`
  - **Output:** DNA profile from Nidhi's service
  - **Test:** `curl` with sample data, verify response

### Day 2.2: Ecosystem Analytics (Feature #2) 📊
**Read:** `docs/PROJECT_PLAN.md` → Search for "Ecosystem"

- [ ] **2.2a: Create cross-platform analytics service (Nidhi)**
  - **What:** Aggregate stats from YouTube, Instagram, LinkedIn, etc.
  - **Where:** `src/services/ecosystem-analytics.service.ts`
  - **How:**
    - Input: Creator's platform handles
    - Fetch: Follower counts, engagement rates, top posts
    - Analyze: Which platform performs best, content gaps
  - **Output:** `{ platforms: { youtube: { followers: 10000, engagement: 0.05 }, ... }, recommendations: [...] }`
  - **Test:** Mock API responses, verify aggregation logic

- [ ] **2.2b: Build analytics dashboard (Srushti)**
  - **What:** Multi-platform comparison dashboard
  - **Where:** `frontend/app/analytics/page.tsx`
  - **Components:** PlatformCard, EngagementChart, RecommendationList
  - **Design:** Grid layout, color-coded by platform
  - **Test:** Mock data for 6 platforms, verify responsive

- [x] **2.2c: Add analytics API route (Shubh)**
  - **What:** `GET /api/analytics/:userId`
  - **Where:** `src/routes/analytics.route.ts`
  - **Output:** Ecosystem data from Nidhi's service
  - **Caching:** Cache results for 1 hour in DynamoDB
  - **Test:** Call twice, verify second call is faster

- [ ] **2.2d: Test analytics accuracy (Lakshmi)**
  - **What:** Verify calculations are correct
  - **Where:** `src/__tests__/analytics.test.ts`
  - **Test:** Mock platform data, verify engagement rate formula
  - **Coverage:** All platforms, edge cases (0 followers, etc.)

### Day 2.3: Viral Score Predictor (Feature #3) 🚀
**Read:** `docs/PROJECT_PLAN.md` → Search for "Viral Score"

- [ ] **2.3a: Create viral score algorithm (Nidhi)**
  - **What:** Predict virality based on content features
  - **Where:** `src/services/viral-predictor.service.ts`
  - **How:**
    - Features: Hook strength (first 3 seconds), pacing, emotional peaks, trending topics
    - Model: Train on viral vs non-viral videos dataset
    - Output: `{ score: 0.78, factors: { hook: 0.9, pacing: 0.7, emotion: 0.8 }, suggestions: [...] }`
  - **Algorithm:** Weighted scoring + ML model (optional)
  - **Test:** Feed 10 viral videos, verify high scores

- [ ] **2.3b: Build score visualization (Srushti)**
  - **What:** Gauge chart + breakdown
  - **Where:** `frontend/components/ViralScoreGauge.tsx`
  - **Design:** Circular gauge (0-100), color gradient (red→yellow→green)
  - **Breakdown:** Show each factor's contribution
  - **Test:** Mock score 78, verify gauge animates

- [x] **2.3c: Add viral score API route (Shubh)**
  - **What:** `POST /api/viral/predict`
  - **Where:** `src/routes/viral.route.ts`
  - **Input:** `{ transcript: string, metadata: {...} }`
  - **Output:** Viral score from Nidhi's service
  - **Test:** Sample transcript, verify score in range 0-100

- [ ] **2.3d: Test prediction accuracy (Lakshmi)**
  - **What:** Validate against known viral videos
  - **Where:** `src/__tests__/viral.test.ts`
  - **Dataset:** 50 viral + 50 non-viral videos
  - **Metric:** Aim for >70% accuracy
  - **Test:** Run predictions, calculate accuracy

### Day 2.4: ROI Calculator (Feature #4) 💰
**Read:** `docs/PROJECT_PLAN.md` → Search for "ROI"

- [ ] **2.4a: Create ROI calculation service (Nidhi)**
  - **What:** Calculate time/money saved by using AI
  - **Where:** `src/services/roi-calculator.service.ts`
  - **How:**
    - Manual time: 4-6 hours per video (writing, editing, translating)
    - AI time: 60 seconds
    - Cost: Manual ($50/hour) vs AI ($0.10/video)
  - **Output:** `{ timeSaved: '5.5 hours', moneySaved: '$275', roi: '2750%' }`
  - **Test:** Various video lengths, verify calculations

- [ ] **2.4b: Build ROI dashboard (Srushti)**
  - **What:** Show savings over time
  - **Where:** `frontend/components/ROIDashboard.tsx`
  - **Components:** SavingsCounter, ROIChart, ProjectionGraph
  - **Design:** Animated counters, line chart for projections
  - **Test:** Mock 100 videos processed, verify chart

- [x] **2.4c: Add ROI API route (Shubh)**
  - **What:** `GET /api/roi/:userId`
  - **Where:** `src/routes/roi.route.ts`
  - **Output:** ROI data from Nidhi's service
  - **Test:** Call with user who processed 50 videos

- [ ] **2.4d: Test ROI calculations (Lakshmi)**
  - **What:** Verify math is correct
  - **Where:** `src/__tests__/roi.test.ts`
  - **Test:** Edge cases (1 video, 1000 videos)
  - **Verify:** Formulas match business logic

### Day 2.5: Cultural Adapter (Feature #5) 🌏
**Read:** `docs/PROJECT_PLAN.md` → Search for "Cultural"

- [ ] **2.5a: Create cultural context service (Nidhi)**
  - **What:** Adapt content for regional audiences
  - **Where:** `src/services/cultural-adapter.service.ts`
  - **How:**
    - Input: Content + target region (India, US, UK, etc.)
    - Adapt: Idioms, festivals, currency, measurements
    - Example: "Thanksgiving" → "Diwali" for India
  - **Output:** Culturally adapted content
  - **Test:** English content → Hindi, verify cultural references changed

- [ ] **2.5b: Build cultural settings UI (Srushti)**
  - **What:** Let user select target regions
  - **Where:** `frontend/components/CulturalSettings.tsx`
  - **Design:** Checkbox list of regions, preview changes
  - **Test:** Select India, verify preview shows adapted content

- [x] **2.5c: Add cultural API route (Shubh)**
  - **What:** `POST /api/cultural/adapt`
  - **Where:** `src/routes/cultural.route.ts`
  - **Input:** `{ content: string, targetRegion: string }`
  - **Output:** Adapted content
  - **Test:** Sample content, verify adaptations

- [ ] **2.5d: Test cultural adaptations (Lakshmi)**
  - **What:** Verify accuracy of adaptations
  - **Where:** `src/__tests__/cultural.test.ts`
  - **Test:** 10 idioms, verify correct regional equivalents
  - **Coverage:** All 9 supported languages

---

## 📋 PHASE 3-6: Breakthrough, Platform, Empowerment, India-First Features

**[Similar detailed format for remaining 20 features...]**

---

## 📋 PHASE 7: Integration & Polish (Day 6)

### Day 6.1: Backend Integration
- [x] 6.1a: Wire routes to services (Shubh)
- [/] 6.1b: Add error handling (Shubh)
- [x] 6.1c: Add logging (Shubh)

### Day 6.2: Frontend Integration
- [ ] **6.2a: Connect all API clients (Srushti)**
  - **What:** Wire all components to backend APIs
  - **Where:** `frontend/services/api.ts`
  - **How:** Replace mock data with real API calls
  - **Error Handling:** Show toast notifications on errors
  - **Test:** Disconnect backend, verify graceful fallback

- [ ] **6.2b: Add state management (Srushti)**
  - **What:** Global state for user, content, settings
  - **Where:** `frontend/context/AppContext.tsx`
  - **How:** Use React Context + useReducer
  - **State:** `{ user, content, settings, loading, error }`
  - **Test:** Update state, verify all components re-render

- [ ] **6.2c: Add real-time streaming (Srushti)**
  - **What:** Show generation progress in real-time
  - **Where:** `frontend/components/GenerationProgress.tsx`
  - **How:** WebSocket connection to backend
  - **Display:** Progress bar + current step
  - **Test:** Start generation, verify progress updates

### Day 6.3: Testing
- [ ] **6.3a: E2E tests for all features (Lakshmi)**
  - **What:** Test complete user flows
  - **Where:** `src/__tests__/e2e/*.test.ts`
  - **Flows:** Upload → Process → Generate → Export
  - **Tool:** Playwright or Cypress
  - **Test:** Run on staging environment

- [ ] **6.3b: Load testing (Lakshmi)**
  - **What:** Test system under load
  - **Where:** `scripts/load-test.sh`
  - **Tool:** Apache JMeter or k6
  - **Target:** 100 concurrent users
  - **Metrics:** Response time <2s, error rate <1%

- [ ] **6.3c: Security audit (Lakshmi)**
  - **What:** Check for vulnerabilities
  - **Where:** `docs/SECURITY_AUDIT.md`
  - **Checks:** SQL injection, XSS, CSRF, auth bypass
  - **Tool:** OWASP ZAP or Burp Suite
  - **Fix:** All critical and high severity issues

### Day 6.4: Deployment
- [x] 6.4a: Deploy backend (Shubh + Lakshmi)
- [ ] **6.4b: Deploy frontend (Srushti + Lakshmi)**
  - **What:** Deploy Next.js to Vercel
  - **Where:** Vercel dashboard
  - **Config:** Environment variables, custom domain
  - **Test:** Visit production URL, verify all features work

- [ ] **6.4c: Setup monitoring (Lakshmi)**
  - **What:** CloudWatch dashboards + alerts
  - **Where:** AWS CloudWatch
  - **Metrics:** API latency, error rate, CPU/memory
  - **Alerts:** Email on error rate >5%
  - **Test:** Trigger alert, verify email received

### Day 6.5: Demo Prep
- [ ] **6.5a: Create demo script (Lakshmi)**
  - **What:** Second-by-second demo script
  - **Where:** `DEMO_SCRIPT.md`
  - **Structure:**
    - 0:00-0:30: Problem (manual content creation)
    - 0:30-1:30: Solution (upload → generate)
    - 1:30-2:30: Wow features (DNA, Viral Score, ROI)
    - 2:30-3:00: Audit trail (trust)
  - **Test:** Practice 10 times, time each section

- [ ] **6.5b: Prepare demo videos (Lakshmi)**
  - **What:** Record screen + voiceover
  - **Where:** `screenshots/demo.mp4`
  - **Tool:** OBS Studio or Loom
  - **Quality:** 1080p, clear audio
  - **Test:** Watch full video, verify no glitches

- [ ] **6.5c: Practice demo 10x (All)**
  - **What:** Full team practice
  - **When:** Day before submission
  - **Duration:** 5 minutes per person
  - **Feedback:** Note issues, refine script

### Day 6.6: Final Polish
- [ ] **6.6a: Fix all bugs (All)**
  - **What:** Go through bug list, fix all
  - **Where:** GitHub Issues
  - **Priority:** Critical → High → Medium
  - **Test:** Verify each fix doesn't break other features

- [ ] **6.6b: Update docs (All)**
  - **What:** Update README, API docs, user guide
  - **Where:** `README.md`, `docs/API.md`, `docs/USER_GUIDE.md`
  - **Content:** Installation, usage, troubleshooting
  - **Test:** Fresh install following README

- [ ] **6.6c: Submit (Lakshmi)**
  - **What:** Final submission package
  - **Files:** Code, docs, demo video, PPT
  - **Format:** ZIP file <100MB
  - **Verify:** All files included, no broken links
  - **Submit:** Upload to hackathon portal

---

## 🎯 Success Metrics

**Must Have (Demo):**
- ✅ Upload video → Generate content for 6 platforms
- ✅ Creator DNA analysis
- ✅ Viral Score prediction
- ✅ ROI calculator
- ✅ Cultural adaptation

**Should Have (Wow Factor):**
- ⏳ Real-time generation progress
- ⏳ Interactive analytics dashboard
- ⏳ One-click export to all platforms

**Nice to Have (If Time):**
- ⏳ Voice cloning
- ⏳ Trend prediction
- ⏳ Community features

---

## 💰 Budget Tracker

| Person | Budget | Spent | Remaining |
|--------|--------|-------|-----------|
| Shubh | $20 | $0 | $20 |
| Nidhi | $20 | $0 | $20 |
| Srushti | $5 | $0 | $5 |
| Lakshmi | $15 | $0 | $15 |
| Buffer | $20 | $0 | $20 |
| **Total** | **$80** | **$0** | **$80** |

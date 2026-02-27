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
- [x] **1.1a: Create 8 polished prompts (Nidhi)** ✅
  - **What:** Create TypeScript files for each platform prompt
  - **Where:** `src/prompts/youtube.prompt.ts`, `instagram.prompt.ts`, etc.
  - **How:** Read `docs/PROMPT_ENGINEERING.md` for format
  - **Output:** Each file exports a function that takes transcript + metadata, returns platform-specific content
  - **Test:** Run with sample transcript, verify output quality

- [x] **1.1b: Create 3 creator mode services (Nidhi)** ✅
  - **What:** Implement AI-First, Hybrid, Human-First modes
  - **Where:** `src/services/mode-detection.service.ts`
  - **How:** Read `docs/CREATOR_MODES.md` for logic
  - **Output:** Service that detects mode from video metadata (has human face? has voiceover?)
  - **Test:** Feed 3 sample videos, verify correct mode detection

- [x] **1.1c: Create mode detection service (Nidhi)** ✅
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

## 📋 PHASE 3: Breakthrough Features (Day 3) — 6 FEATURES

### Day 3.1: Workspace (Feature #6) 🏢
**Read:** `docs/PROJECT_PLAN.md` → Search for "Collaborative"

- [ ] **3.1a: Create collaborative workspace service (Nidhi)**
  - **What:** Real-time collaborative editing for content
  - **Where:** `src/services/workspace.service.ts`
  - **How:**
    - WebSocket for real-time sync
    - Operational Transform for conflict resolution
    - User presence tracking (who's editing what)
  - **Output:** `{ workspaceId: string, users: User[], changes: Change[], version: number }`
  - **Test:** 3 users edit same content, verify no conflicts

- [ ] **3.1b: Build workspace UI (Srushti)**
  - **What:** Google Docs-style collaborative editor
  - **Where:** `frontend/app/workspace/page.tsx`
  - **Components:** Editor, UserPresence, CommentThread, VersionHistory
  - **Design:** Real-time cursors, inline comments, change tracking
  - **Test:** Multiple users, verify smooth collaboration

- [x] **3.1c: Add workspace API routes (Shubh)** ✅
  - **What:** `POST /api/workspace/create`, `GET /api/workspace/:id`
  - **Where:** `src/routes/workspace.route.ts`
  - **WebSocket:** `/ws/workspace/:id` for real-time sync
  - **Test:** Create workspace, join, edit, verify sync

- [ ] **3.1d: Test collaboration (Lakshmi)**
  - **What:** Test concurrent editing, conflict resolution
  - **Where:** `src/__tests__/workspace.test.ts`
  - **Test:** 10 concurrent users, verify data integrity

### Day 3.2: Trend Predictor (Feature #7) 📈
**Read:** `docs/PROJECT_PLAN.md` → Search for "Trends"

- [ ] **3.2a: Create trend analysis service (Nidhi)**
  - **What:** Predict upcoming trends based on social data
  - **Where:** `src/services/trend-predictor.service.ts`
  - **How:**
    - Scrape trending topics from Twitter, YouTube, Instagram
    - Analyze growth rate, engagement velocity
    - ML model to predict trend lifespan
  - **Output:** `{ trends: Trend[], predictions: Prediction[], confidence: number }`
  - **Test:** Historical data, verify >60% accuracy

- [ ] **3.2b: Build trend dashboard (Srushti)**
  - **What:** Visual trend timeline + predictions
  - **Where:** `frontend/components/TrendDashboard.tsx`
  - **Design:** Line charts, heatmaps, trend cards
  - **Test:** Mock 20 trends, verify visualization

- [x] **3.2c: Add trend API routes (Shubh)** ✅ COMPLETE (mock data)
  - **What:** `GET /api/trends/current`, `GET /api/trends/predict`
  - **Where:** `src/routes/trends.route.ts`
  - **Caching:** Cache for 6 hours
  - **Test:** Call API, verify fresh data

- [ ] **3.2d: Test prediction accuracy (Lakshmi)**
  - **What:** Validate against real trend data
  - **Where:** `src/__tests__/trends.test.ts`
  - **Dataset:** Last 3 months of trends
  - **Metric:** >60% accuracy on trend lifespan

### Day 3.3: Voice Clone (Feature #8) 🎤
**Read:** `docs/PROJECT_PLAN.md` → Search for "Voice"

- [ ] **3.3a: Integrate voice cloning service (Nidhi)**
  - **What:** Clone creator's voice for AI narration
  - **Where:** `src/services/voice-clone.service.ts`
  - **How:**
    - Use ElevenLabs or AWS Polly custom voice
    - Train on 5-10 minutes of creator audio
    - Generate narration in cloned voice
  - **Output:** Audio file with cloned voice
  - **Test:** Clone voice, verify similarity >80%

- [ ] **3.3b: Build voice training UI (Srushti)**
  - **What:** Record voice samples, train model
  - **Where:** `frontend/components/VoiceTrainer.tsx`
  - **Design:** Record button, waveform, progress bar
  - **Test:** Record 5 samples, verify training starts

- [x] **3.3c: Add voice API routes (Shubh)** ✅ COMPLETE (mock)
  - **What:** `POST /api/voice/train`, `POST /api/voice/generate`
  - **Where:** `src/routes/voice.route.ts`
  - **Storage:** S3 for voice models
  - **Test:** Train model, generate audio

- [ ] **3.3d: Test voice quality (Lakshmi)**
  - **What:** Verify voice similarity, naturalness
  - **Where:** `src/__tests__/voice.test.ts`
  - **Metric:** MOS (Mean Opinion Score) >4.0/5.0

### Day 3.4: Dopamine Optimizer (Feature #9) 🧠
**Read:** `docs/PROJECT_PLAN.md` → Search for "Engagement"

- [ ] **3.4a: Create engagement optimizer (Nidhi)**
  - **What:** Optimize content for dopamine triggers
  - **Where:** `src/services/dopamine-optimizer.service.ts`
  - **How:**
    - Analyze hook strength (first 3 seconds)
    - Identify emotional peaks, cliffhangers
    - Suggest pacing improvements
  - **Output:** `{ score: number, hooks: Hook[], improvements: string[] }`
  - **Test:** Feed 10 viral videos, verify high scores

- [ ] **3.4b: Build optimizer UI (Srushti)**
  - **What:** Visual timeline with engagement peaks
  - **Where:** `frontend/components/DopamineOptimizer.tsx`
  - **Design:** Timeline, peak markers, suggestions
  - **Test:** Mock video, verify peak visualization

- [x] **3.4c: Add optimizer API route (Shubh)** ✅ COMPLETE (mock)
  - **What:** `POST /api/dopamine/optimize`
  - **Where:** `src/routes/dopamine.route.ts`
  - **Test:** Send video, verify optimization suggestions

- [ ] **3.4d: Test optimization impact (Lakshmi)**
  - **What:** A/B test optimized vs non-optimized
  - **Where:** `src/__tests__/dopamine.test.ts`
  - **Metric:** >20% engagement improvement

### Day 3.5: Watermark (Feature #10) 🔒
**Read:** `docs/PROJECT_PLAN.md` → Search for "Brand Protection"

- [ ] **3.5a: Create watermark service (Nidhi)**
  - **What:** Add invisible/visible watermarks to content
  - **Where:** `src/services/watermark.service.ts`
  - **How:**
    - Visible: Logo overlay on video/image
    - Invisible: Steganography for tracking
  - **Output:** Watermarked media file
  - **Test:** Add watermark, verify detectability

- [ ] **3.5b: Build watermark UI (Srushti)**
  - **What:** Watermark editor (position, opacity, size)
  - **Where:** `frontend/components/WatermarkEditor.tsx`
  - **Design:** Drag-drop logo, preview
  - **Test:** Add watermark, verify preview

- [x] **3.5c: Add watermark API route (Shubh)** ✅ COMPLETE (mock)
  - **What:** `POST /api/watermark/add`
  - **Where:** `src/routes/watermark.route.ts`
  - **Test:** Upload media, add watermark, download

- [ ] **3.5d: Test watermark durability (Lakshmi)**
  - **What:** Test against compression, cropping
  - **Where:** `src/__tests__/watermark.test.ts`
  - **Test:** Apply transformations, verify watermark survives

### Day 3.6: Content Multiplier (Feature #11) 🔄
**Read:** `docs/PROJECT_PLAN.md` → Search for "Repurpose"

- [ ] **3.6a: Create content multiplier service (Nidhi)**
  - **What:** Repurpose 1 video → 50 pieces of content
  - **Where:** `src/services/content-multiplier.service.ts`
  - **How:**
    - Extract key moments (clips)
    - Generate quotes, infographics, audiograms
    - Create platform-specific variations
  - **Output:** `{ clips: Video[], quotes: Image[], audiograms: Audio[] }`
  - **Test:** 1 video → verify 50+ outputs

- [ ] **3.6b: Build multiplier UI (Srushti)**
  - **What:** Visual content tree showing all outputs
  - **Where:** `frontend/components/ContentMultiplier.tsx`
  - **Design:** Tree view, preview cards, bulk export
  - **Test:** Mock 50 outputs, verify smooth rendering

- [x] **3.6c: Add multiplier API route (Shubh)** ✅ COMPLETE (mock)
  - **What:** `POST /api/multiply/generate`
  - **Where:** `src/routes/multiply.route.ts`
  - **Test:** Send video, verify 50+ outputs

- [ ] **3.6d: Test output quality (Lakshmi)**
  - **What:** Verify all outputs are usable
  - **Where:** `src/__tests__/multiply.test.ts`
  - **Metric:** >90% outputs pass quality check

---

## 📋 PHASE 4: Platform Features (Day 4) — 7 FEATURES

### Day 4.1: Marketplace (Feature #12) 🛒
**Read:** `docs/PROJECT_PLAN.md` → Search for "Marketplace"

- [ ] **4.1a: Create marketplace service (Nidhi)**
  - **What:** Buy/sell content templates, scripts, thumbnails
  - **Where:** `src/services/marketplace.service.ts`
  - **How:**
    - Listing creation, pricing, licensing
    - Payment processing (Stripe/Razorpay)
    - Revenue sharing (70% creator, 30% platform)
  - **Output:** `{ listings: Listing[], transactions: Transaction[] }`
  - **Test:** Create listing, purchase, verify payment

- [ ] **4.1b: Build marketplace UI (Srushti)**
  - **What:** Browse, search, purchase interface
  - **Where:** `frontend/app/marketplace/page.tsx`
  - **Components:** ListingCard, SearchBar, CheckoutFlow
  - **Test:** Browse 100 listings, purchase, verify

- [x] **4.1c: Add marketplace API routes (Shubh)** ✅ COMPLETE (mock)
  - **What:** `POST /api/marketplace/list`, `POST /api/marketplace/purchase`
  - **Where:** `src/routes/marketplace.route.ts`
  - **Test:** List item, purchase, verify transaction

- [ ] **4.1d: Test payment flow (Lakshmi)**
  - **What:** End-to-end payment testing
  - **Where:** `src/__tests__/marketplace.test.ts`
  - **Test:** Sandbox payments, refunds, disputes

### Day 4.2: Knowledge Graph (Feature #13) 🕸️
**Read:** `docs/PROJECT_PLAN.md` → Search for "Knowledge"

- [ ] **4.2a: Create knowledge graph service (Nidhi)**
  - **What:** Map relationships between content, topics, creators
  - **Where:** `src/services/knowledge-graph.service.ts`
  - **How:**
    - Extract entities (people, places, topics)
    - Build graph database (Neo4j or DynamoDB)
    - Find related content, suggest connections
  - **Output:** `{ nodes: Node[], edges: Edge[], recommendations: Content[] }`
  - **Test:** 100 videos, verify accurate relationships

- [ ] **4.2b: Build graph visualization (Srushti)**
  - **What:** Interactive network graph
  - **Where:** `frontend/components/KnowledgeGraph.tsx`
  - **Library:** D3.js or Cytoscape.js
  - **Test:** Render 1000 nodes, verify performance

- [x] **4.2c: Add graph API routes (Shubh)** ✅ COMPLETE
  - **What:** `GET /api/graph/explore`, `GET /api/graph/related`
  - **Where:** `src/routes/graph.route.ts`
  - **Test:** Query graph, verify relationships

- [ ] **4.2d: Test graph accuracy (Lakshmi)**
  - **What:** Verify relationship accuracy
  - **Where:** `src/__tests__/graph.test.ts`
  - **Metric:** >85% accurate relationships

### Day 4.3: Community (Feature #14) 👥
**Read:** `docs/PROJECT_PLAN.md` → Search for "Community"

- [ ] **4.3a: Create community service (Nidhi)**
  - **What:** Creator network, forums, groups
  - **Where:** `src/services/community.service.ts`
  - **How:**
    - User profiles, follow/unfollow
    - Discussion threads, comments
    - Moderation tools
  - **Output:** `{ users: User[], posts: Post[], groups: Group[] }`
  - **Test:** Create group, post, comment, verify

- [ ] **4.3b: Build community UI (Srushti)**
  - **What:** Social feed, profiles, groups
  - **Where:** `frontend/app/community/page.tsx`
  - **Components:** Feed, ProfileCard, GroupList
  - **Test:** Mock 100 users, verify feed performance

- [/] **4.3c: Add community API routes (Shubh)**
  - **What:** `POST /api/community/post`, `GET /api/community/feed`
  - **Where:** `src/routes/community.route.ts`
  - **Test:** Create post, fetch feed, verify

- [ ] **4.3d: Test moderation (Lakshmi)**
  - **What:** Test spam detection, content moderation
  - **Where:** `src/__tests__/community.test.ts`
  - **Test:** Post spam, verify auto-moderation

### Day 4.4: Membership (Feature #15) 💳
**Read:** `docs/PROJECT_PLAN.md` → Search for "Monetization"

- [ ] **4.4a: Create membership service (Nidhi)**
  - **What:** Subscription tiers, exclusive content
  - **Where:** `src/services/membership.service.ts`
  - **How:**
    - Stripe subscriptions
    - Tiered access (Free, Pro, Enterprise)
    - Exclusive content gating
  - **Output:** `{ tiers: Tier[], subscriptions: Subscription[] }`
  - **Test:** Subscribe, verify access control

- [ ] **4.4b: Build membership UI (Srushti)**
  - **What:** Pricing page, subscription management
  - **Where:** `frontend/app/membership/page.tsx`
  - **Components:** PricingTable, SubscriptionCard
  - **Test:** Subscribe, upgrade, cancel, verify

- [/] **4.4c: Add membership API routes (Shubh)** — WORKING NOW
  - **What:** `POST /api/membership/subscribe`, `POST /api/membership/cancel`
  - **Where:** `src/routes/membership.route.ts`
  - **Test:** Full subscription lifecycle

- [ ] **4.4d: Test billing (Lakshmi)**
  - **What:** Test recurring billing, failed payments
  - **Where:** `src/__tests__/membership.test.ts`
  - **Test:** Sandbox billing scenarios

### Day 4.5: Automation (Feature #16) ⚙️
**Read:** `docs/PROJECT_PLAN.md` → Search for "Automation"

- [ ] **4.5a: Create automation service (Nidhi)**
  - **What:** Scheduled posting, auto-repurposing
  - **Where:** `src/services/automation.service.ts`
  - **How:**
    - Cron jobs for scheduled tasks
    - Auto-generate content on triggers
    - Platform API integrations for posting
  - **Output:** `{ schedules: Schedule[], automations: Automation[] }`
  - **Test:** Schedule post, verify auto-publish

- [ ] **4.5b: Build automation UI (Srushti)**
  - **What:** Automation builder (if-this-then-that)
  - **Where:** `frontend/components/AutomationBuilder.tsx`
  - **Design:** Visual workflow builder
  - **Test:** Create automation, verify execution

- [ ] **4.5c: Add automation API routes (Shubh)**
  - **What:** `POST /api/automation/create`, `GET /api/automation/list`
  - **Where:** `src/routes/automation.route.ts`
  - **Test:** Create automation, verify triggers

- [ ] **4.5d: Test automation reliability (Lakshmi)**
  - **What:** Test scheduled tasks, error handling
  - **Where:** `src/__tests__/automation.test.ts`
  - **Metric:** >99% execution success rate

### Day 4.6: Analytics Dashboard (Feature #17) 📊
**Read:** `docs/PROJECT_PLAN.md` → Search for "Analytics"

- [ ] **4.6a: Create analytics service (Nidhi)**
  - **What:** Deep insights, performance metrics
  - **Where:** `src/services/analytics-dashboard.service.ts`
  - **How:**
    - Aggregate data from all platforms
    - Calculate engagement, reach, ROI
    - Trend analysis, forecasting
  - **Output:** `{ metrics: Metric[], insights: Insight[], forecasts: Forecast[] }`
  - **Test:** Mock data, verify calculations

- [ ] **4.6b: Build analytics dashboard (Srushti)**
  - **What:** Comprehensive analytics UI
  - **Where:** `frontend/app/analytics-dashboard/page.tsx`
  - **Components:** MetricCard, TrendChart, InsightPanel
  - **Test:** Mock 1000 data points, verify performance

- [ ] **4.6c: Add analytics API routes (Shubh)**
  - **What:** `GET /api/analytics-dashboard/metrics`
  - **Where:** `src/routes/analytics-dashboard.route.ts`
  - **Test:** Fetch metrics, verify accuracy

- [ ] **4.6d: Test data accuracy (Lakshmi)**
  - **What:** Verify metric calculations
  - **Where:** `src/__tests__/analytics-dashboard.test.ts`
  - **Test:** Known data, verify formulas

### Day 4.7: Platform Integration Hub (Feature #18) 🔌
**Read:** `docs/PROJECT_PLAN.md` → Search for "Integration"

- [ ] **4.7a: Create integration service (Nidhi)**
  - **What:** Connect to YouTube, Instagram, LinkedIn APIs
  - **Where:** `src/services/platform-integration.service.ts`
  - **How:**
    - OAuth for each platform
    - Auto-post generated content
    - Fetch analytics from platforms
  - **Output:** `{ connections: Connection[], posts: Post[] }`
  - **Test:** Connect platform, post, verify

- [ ] **4.7b: Build integration UI (Srushti)**
  - **What:** Connect accounts, manage integrations
  - **Where:** `frontend/components/PlatformIntegrations.tsx`
  - **Design:** Platform cards, OAuth flow
  - **Test:** Connect 6 platforms, verify

- [ ] **4.7c: Add integration API routes (Shubh)**
  - **What:** `POST /api/integrations/connect`, `POST /api/integrations/post`
  - **Where:** `src/routes/integrations.route.ts`
  - **Test:** OAuth flow, posting

- [ ] **4.7d: Test platform APIs (Lakshmi)**
  - **What:** Test all platform integrations
  - **Where:** `src/__tests__/integrations.test.ts`
  - **Test:** Post to all 6 platforms, verify

---

## 📋 PHASE 5: Empowerment Features (Day 5) — 5 FEATURES

### Day 5.1: ADHD Navigator (Feature #19) 🧠
**Read:** `docs/PROJECT_PLAN.md` → Search for "ADHD"

- [ ] **5.1a: Create ADHD-friendly service (Nidhi)**
  - **What:** Focus mode, distraction-free interface
  - **Where:** `src/services/adhd-navigator.service.ts`
  - **How:**
    - Pomodoro timer (25/5 min intervals)
    - Task chunking (break big tasks into small)
    - Progress gamification
  - **Output:** `{ session: Session, progress: Progress, rewards: Reward[] }`
  - **Test:** Start session, verify timer, rewards

- [ ] **5.1b: Build ADHD UI (Srushti)**
  - **What:** Minimal, distraction-free interface
  - **Where:** `frontend/components/ADHDNavigator.tsx`
  - **Design:** Large buttons, clear progress, no clutter
  - **Test:** User testing with ADHD creators

- [ ] **5.1c: Add ADHD API routes (Shubh)**
  - **What:** `POST /api/adhd/session/start`
  - **Where:** `src/routes/adhd.route.ts`
  - **Test:** Start session, track progress

- [ ] **5.1d: Test usability (Lakshmi)**
  - **What:** Usability testing with ADHD users
  - **Where:** `src/__tests__/adhd.test.ts`
  - **Metric:** >80% user satisfaction

### Day 5.2: Creative Director (Feature #20) 🎨
**Read:** `docs/PROJECT_PLAN.md` → Search for "Feedback"

- [ ] **5.2a: Create feedback service (Nidhi)**
  - **What:** AI feedback on content quality
  - **Where:** `src/services/creative-director.service.ts`
  - **How:**
    - Analyze structure, pacing, engagement
    - Score on 10 dimensions
    - Suggest improvements
  - **Output:** `{ score: Score, feedback: Feedback[], improvements: string[] }`
  - **Test:** Feed 10 videos, verify feedback quality

- [ ] **5.2b: Build feedback UI (Srushti)**
  - **What:** Feedback panel with scores, suggestions
  - **Where:** `frontend/components/CreativeDirector.tsx`
  - **Design:** Score cards, improvement list
  - **Test:** Mock feedback, verify UI

- [ ] **5.2c: Add feedback API route (Shubh)**
  - **What:** `POST /api/creative-director/analyze`
  - **Where:** `src/routes/creative-director.route.ts`
  - **Test:** Send content, verify feedback

- [ ] **5.2d: Test feedback accuracy (Lakshmi)**
  - **What:** Validate feedback against expert reviews
  - **Where:** `src/__tests__/creative-director.test.ts`
  - **Metric:** >70% agreement with experts

### Day 5.3: Viral Analyzer (Feature #21) 🔍
**Read:** `docs/PROJECT_PLAN.md` → Search for "Reverse Engineer"

- [ ] **5.3a: Create viral analysis service (Nidhi)**
  - **What:** Reverse engineer viral content
  - **Where:** `src/services/viral-analyzer.service.ts`
  - **How:**
    - Analyze viral videos (structure, hooks, pacing)
    - Extract success patterns
    - Generate replication guide
  - **Output:** `{ patterns: Pattern[], hooks: Hook[], guide: string }`
  - **Test:** Analyze 10 viral videos, verify patterns

- [ ] **5.3b: Build analyzer UI (Srushti)**
  - **What:** Visual breakdown of viral elements
  - **Where:** `frontend/components/ViralAnalyzer.tsx`
  - **Design:** Timeline with annotations, pattern cards
  - **Test:** Mock viral video, verify visualization

- [ ] **5.3c: Add analyzer API route (Shubh)**
  - **What:** `POST /api/viral-analyzer/analyze`
  - **Where:** `src/routes/viral-analyzer.route.ts`
  - **Test:** Send viral video URL, verify analysis

- [ ] **5.3d: Test pattern accuracy (Lakshmi)**
  - **What:** Verify extracted patterns are valid
  - **Where:** `src/__tests__/viral-analyzer.test.ts`
  - **Metric:** >75% pattern accuracy

### Day 5.4: Content Multiplier V2 (Feature #22) 🔄
**Read:** `docs/PROJECT_PLAN.md` → Search for "Multiplier"

- [ ] **5.4a: Enhance multiplier service (Nidhi)**
  - **What:** Advanced repurposing (1→100 pieces)
  - **Where:** `src/services/content-multiplier-v2.service.ts`
  - **How:**
    - AI-generated variations
    - Platform-specific optimizations
    - Auto-scheduling
  - **Output:** 100+ content pieces
  - **Test:** 1 video → verify 100+ outputs

- [ ] **5.4b: Build multiplier V2 UI (Srushti)**
  - **What:** Advanced content tree, bulk actions
  - **Where:** `frontend/components/ContentMultiplierV2.tsx`
  - **Test:** Mock 100 outputs, verify performance

- [ ] **5.4c: Add multiplier V2 API route (Shubh)**
  - **What:** `POST /api/multiply-v2/generate`
  - **Where:** `src/routes/multiply-v2.route.ts`
  - **Test:** Generate 100 pieces, verify quality

- [ ] **5.4d: Test output diversity (Lakshmi)**
  - **What:** Verify outputs are diverse, not repetitive
  - **Where:** `src/__tests__/multiply-v2.test.ts`
  - **Metric:** >80% unique content

### Day 5.5: Safety & Moderation (Feature #23) 🛡️
**Read:** `docs/PROJECT_PLAN.md` → Search for "Safety"

- [ ] **5.5a: Create safety service (Nidhi)**
  - **What:** Content moderation, compliance checking
  - **Where:** `src/services/safety.service.ts`
  - **How:**
    - AWS Rekognition for image moderation
    - Bedrock for text moderation
    - Platform guidelines compliance
  - **Output:** `{ safe: boolean, violations: Violation[], suggestions: string[] }`
  - **Test:** Feed unsafe content, verify detection

- [ ] **5.5b: Build safety UI (Srushti)**
  - **What:** Safety dashboard, violation alerts
  - **Where:** `frontend/components/SafetyDashboard.tsx`
  - **Design:** Traffic light system (green/yellow/red)
  - **Test:** Mock violations, verify alerts

- [ ] **5.5c: Add safety API route (Shubh)**
  - **What:** `POST /api/safety/check`
  - **Where:** `src/routes/safety.route.ts`
  - **Test:** Check content, verify moderation

- [ ] **5.5d: Test detection accuracy (Lakshmi)**
  - **What:** Validate against known unsafe content
  - **Where:** `src/__tests__/safety.test.ts`
  - **Metric:** >95% detection accuracy

---

## 📋 PHASE 6: India-First Features (Day 5) — 2 FEATURES

### Day 5.6: Vernacular Support (Feature #24) 🌏
**Read:** `docs/PROJECT_PLAN.md` → Search for "Languages"

- [ ] **5.6a: Enhance language service (Nidhi)**
  - **What:** Deep support for 9 Indian languages
  - **Where:** `src/services/vernacular.service.ts`
  - **How:**
    - Native script rendering
    - Cultural context adaptation
    - Regional idioms, festivals
  - **Output:** Culturally adapted content in target language
  - **Test:** Translate to all 9 languages, verify quality

- [ ] **5.6b: Build language selector UI (Srushti)**
  - **What:** Language picker, preview
  - **Where:** `frontend/components/LanguageSelector.tsx`
  - **Design:** Flag icons, native script preview
  - **Test:** Switch languages, verify rendering

- [ ] **5.6c: Add language API routes (Shubh)**
  - **What:** `POST /api/vernacular/translate`
  - **Where:** `src/routes/vernacular.route.ts`
  - **Test:** Translate to all languages, verify

- [ ] **5.6d: Test translation quality (Lakshmi)**
  - **What:** Native speaker validation
  - **Where:** `src/__tests__/vernacular.test.ts`
  - **Metric:** >85% native speaker approval

### Day 5.7: Regional Network (Feature #25) 🇮🇳
**Read:** `docs/PROJECT_PLAN.md` → Search for "Regional"

- [ ] **5.7a: Create regional network service (Nidhi)**
  - **What:** Connect creators by region, language
  - **Where:** `src/services/regional-network.service.ts`
  - **How:**
    - Regional hubs (North, South, East, West)
    - Language-based groups
    - Local collaboration matching
  - **Output:** `{ regions: Region[], creators: Creator[], collaborations: Collab[] }`
  - **Test:** Create regional hub, match creators

- [ ] **5.7b: Build regional network UI (Srushti)**
  - **What:** Regional map, creator directory
  - **Where:** `frontend/app/regional-network/page.tsx`
  - **Components:** RegionMap, CreatorCard, CollabRequest
  - **Test:** Browse regions, send collab request

- [ ] **5.7c: Add regional API routes (Shubh)**
  - **What:** `GET /api/regional/creators`, `POST /api/regional/collab`
  - **Where:** `src/routes/regional.route.ts`
  - **Test:** Fetch creators, create collaboration

- [ ] **5.7d: Test matching algorithm (Lakshmi)**
  - **What:** Verify creator matching accuracy
  - **Where:** `src/__tests__/regional.test.ts`
  - **Metric:** >80% successful collaborations

---

## 📋 PHASE 7: Integration & Polish (Day 6)

### Day 6.1: Backend Integration
- [x] 6.1a: Wire routes to services (Shubh)
- [x] 6.1b: Add error handling (Shubh) ✅ COMPLETE
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

# AI for Bharat — Complete User Flow

> This document describes the full end-to-end user experience from landing to results.
> Use this as the single source of truth for implementation.

---

## 0. Tech Stack Quick Reference

| Layer | Tech |
|---|---|
| Frontend | Next.js 16 App Router, Tailwind, React Context |
| Backend | Express + TypeScript on port 3001 |
| Auth | JWT (24h access / 7d refresh) via `/api/auth/*` |
| Storage | AWS S3 + CloudFront |
| Queue | AWS SQS → worker |
| DB | DynamoDB (3 tables: users / jobs / results) |
| Transcription | AWS Transcribe → fallback: contextual mock |

---

## 1. Landing Page `/`

**What the user sees:**
- Hero with tagline, CTA buttons: **"Get Started Free"** and **"Watch Demo"**
- Feature grid: Upload → Transcribe → Generate for 8 platforms
- Pricing cards (Free / Pro / Enterprise)
- Platform integrations logos

**CTA "Get Started Free" →** goes to `/register`
**CTA "Sign In" (nav)** → goes to `/login`

---

## 2. Auth — `/login` and `/register`

> **Currently missing: these pages do not exist. Must be built.**

### Register `/register`
```
Fields: Full Name · Email · Password · Confirm Password
→ POST /api/auth/register  { name, email, password }
← { userId, accessToken, refreshToken }
→ Store token in localStorage ("authToken")
→ Redirect to /onboarding
```

### Login `/login`
```
Fields: Email · Password  +  "Forgot password?" link
→ POST /api/auth/login  { email, password }
← { userId, accessToken }
→ Store token in localStorage
→ If user has completed onboarding → /dashboard
→ If new user (first login ever) → /onboarding
```

### Auth State
- Token stored in `localStorage("authToken")`
- `useAuth()` hook already exists in `/frontend/hooks/useAuth.ts`
- `AppContext` already has user state — just needs the userId wired everywhere (TODOs in dashboard etc.)

---

## 3. Onboarding `/onboarding`

Two sequential steps on the same page (step indicator at top).

### Step 1 — Choose Your Domain
> **Currently missing: domain selection. Must be built as step 1 of onboarding.**

```
Show 8 domain tiles with icon + label:
  🎓 Education      🍳 Food & Cooking
  ✈️ Travel         🛒 Product Reviews
  💪 Health & Fitness  💼 Business & Finance
  🎮 Gaming         🎨 Lifestyle & Vlog

User picks 1–3.
Saved to user profile (localStorage + /api/auth profile update).
Domain is passed to content generation so output is contextually relevant.
```

### Step 2 — Choose Your Creator Mode  *(already built)*
```
AI-First    → AI writes everything, you review
Hybrid      → AI drafts, you edit
Human-First → You write, AI assists

→ Saved to AppContext settings
→ "Start Creating" → /dashboard
```

---

## 4. Dashboard `/dashboard`

**What the user sees:**

```
┌─────────────────────────────────────────────────────┐
│  👋 Welcome back, {name}                             │
│  Your domain: Travel  |  Mode: Hybrid                │
├────────┬────────┬──────────────┬────────────────────┤
│ Posts  │ Month  │ Avg Engage.  │ Hours Saved         │
│  127   │   24   │    4.2K      │    48h              │
├────────┴────────┴──────────────┴────────────────────┤
│  Quick Actions                                       │
│  [+ Upload Content]  [📊 Analytics]  [🛒 Marketplace]│
├─────────────────────────────────────────────────────┤
│  Recent Content  (last 5 pieces, from DynamoDB)      │
│  Title | Platform | Status | Date | Engagement       │
└─────────────────────────────────────────────────────┘
```

**Wiring needed:**
- `userId` from `useAuth()` → pass to `apiClient.analyticsDashboard.getDashboard(userId)`
- Recent content pulled from results table or in-memory (use latest jobIds from localStorage)

---

## 5. Upload & Content Generation `/upload`

This is the **core feature**. Already well-built, needs transcription fixed and results UI improved.

### 5a. Upload Step
```
User chooses:
  [📁 Upload File]  or  [🔗 Paste URL (YouTube / Instagram / TikTok)]

File upload:
  → POST /api/upload  (multipart, max 100MB)
  ← { fileId, fileName, mimeType, s3Url }

URL:
  → POST /api/upload/youtube  { url, userId }
  ← { fileId, metadata: { title, duration } }
```

### 5b. Processing Step  *(async SQS queue)*
```
→ POST /api/upload-to-results/process
   { fileId, fileName, mimeType, userId, localPath, platforms: all 8 }

← { jobId, status: "pending" }

Frontend polls every 5s:
→ GET /api/upload-to-results/status/:jobId
← { job: { status, progress, currentStep } }

Show progress bar with live step text:
  20% — Extracting metadata
  45% — Transcribing audio          ← AWS Transcribe OR contextual mock
  60% — Analysing visuals           ← Rekognition (skip gracefully if unavailable)
  75% — Generating platform content
  85% — Calculating viral score
 100% — Complete ✅
```

**Transcription fallback chain (to implement):**
1. AWS Transcribe (if S3 + subscription available)
2. OpenAI Whisper (if `OPENAI_API_KEY` set)
3. `mockTranscriptService.generateTranscript(fileId, fileName)` — contextual mock, always works

### 5c. Results Step — **the money screen**
```
┌──────────────────────────────────────────────────────────┐
│  🎯 Viral Score: 78/100   Domain: Travel   Grade: B+      │
├──────────────────────────────────────────────────────────┤
│  💡 Hook Suggestions  (from viralAnalysis.hooks)          │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ "Start with the Dudhsagar Falls shot — 94% of         │ │
│  │  travel videos that open with water get 2× more       │ │
│  │  saves."  [Use This Hook]                             │ │
│  └──────────────────────────────────────────────────────┘ │
│  + 2 more suggestions   [Show all]                        │
├──────────────────────────────────────────────────────────┤
│  📈 AI Recommendations  (from viralAnalysis.recommendations)│
│  1. Add captions — 80% of mobile users watch muted       │
│  2. First 3 seconds need a strong visual hook            │
│  3. Optimal post time for Travel: Thu 6–8 PM IST         │
├──────────────────────────────────────────────────────────┤
│  📣 Generated Content  (tab switcher per platform)        │
│  [YouTube] [Instagram] [TikTok] [LinkedIn] [Twitter]      │
│  [Blog]    [Podcast]   [Analytics]                        │
│                                                           │
│  ── YouTube ──────────────────────────────────────────── │
│  Title: "Goa Memory Lane 🌊 — Hidden Beaches You..."      │
│  Description: [full text, copyable]                       │
│  Hashtags: #GoaTravel #MemoryLane #HiddenBeaches          │
│  Timestamps: 0:00 Intro | 0:30 Anjuna Beach | 1:15 ...   │
│  [📋 Copy]  [✏️ Edit in Workspace]  [📤 Export]            │
└──────────────────────────────────────────────────────────┘
```

**What to build here:**
- Hook suggestions card with "Use This Hook" button
- AI Recommendations list (already in API response as `viralAnalysis.recommendations`)
- Improvement suggestions from `contentFeedback.improvements`
- Platform tab switcher (mostly built, needs hook + improvement sections added)
- "Edit in Workspace" button → opens `/workspace` with content pre-loaded

---

## 6. Workspace `/workspace`

Collaborative real-time editor. Pre-populated with the generated content for the selected platform.

```
→ User clicks "Edit in Workspace" on the results screen
→ Content is passed via URL param or localStorage: /workspace?jobId=xxx&platform=youtube
→ Workspace loads the generated text into the editor
→ User can edit, add comments, view version history
→ Real-time collaboration via WebSocket (ws://localhost:3001/ws/workspace)
→ Export button at top-right
```

---

## 7. Analytics `/analytics`

**What the user sees:**
```
┌──────────────────────────────────────────────────────────┐
│  📊 Your Analytics  [7d ▼]  [Export CSV]                  │
├───────────────┬──────────────┬───────────────────────────┤
│ Total Reach   │ Engagement   │ Content Published          │
│  142K (+18%)  │  6.2% (+3%)  │  24 this month            │
├───────────────┴──────────────┴───────────────────────────┤
│  Trend Chart (Recharts line)                              │
│  Last 30 days: Reach, Engagement, Saves                   │
├──────────────────────────────────────────────────────────┤
│  Platform Performance                                     │
│  ┌──────────┬────────┬────────┬──────────────────────┐   │
│  │ Platform │Followers│ Posts │ Engagement Rate       │   │
│  │ YouTube  │  12.4K  │   8   │ ████████░░  8.2%     │   │
│  │ Instagram│   8.1K  │  16   │ ██████░░░░  6.1%     │   │
│  │ LinkedIn │   3.2K  │   4   │ ████░░░░░░  4.4%     │   │
│  └──────────┴────────┴────────┴──────────────────────┘   │
├──────────────────────────────────────────────────────────┤
│  🏆 Top Performing Content (last 5)                       │
│  "Goa Memory Lane" — 14.2K views, 8.9% eng.  [Reuse →]   │
├──────────────────────────────────────────────────────────┤
│  💡 AI Insight                                            │
│  "Your Travel content gets 2× more saves than average.   │
│  Post on Thursdays for best reach."                       │
└──────────────────────────────────────────────────────────┘
```

**Wiring needed:**
- `GET /api/analytics-dashboard/metrics?userId={userId}&timeRange=30d`
- Progress bars per platform (already built as `PlatformPerformanceCard`)
- Real numbers from DynamoDB job results (count completed jobs, average scores)

---

## 8. Marketplace `/marketplace`

Already built. Needs real template data seeded and "Use Template" flow connected to upload.

```
Browse view:
  → GET /api/marketplace/listings?type=template
  Show: title, preview, price (Free / ₹199 / ₹499), domain tag, rating

Template detail modal:
  → Shows full preview of the template content
  → "Use This Template" → opens /upload with template pre-loaded
  → "Download" for paid templates after purchase

Seller flow (for power users):
  → "List Your Template" button
  → POST /api/marketplace/list
  → Manage listings from Seller Dashboard tab

Seed data needed:
  - 10 free templates across domains (Travel, Food, Education etc.)
  - Template = pre-written script/caption/hook formula
```

---

## 9. Key Gaps to Fix (Priority Order)

| # | Gap | File(s) | Effort |
|---|-----|---------|--------|
| 1 | **Login page** missing | Create `/frontend/app/login/page.tsx` | Low |
| 2 | **Register page** missing | Create `/frontend/app/register/page.tsx` | Low |
| 3 | **Domain selection** in onboarding | Add step 1 to `/frontend/app/onboarding/page.tsx` | Medium |
| 4 | **Auth wiring** — userId from context | `/frontend/app/dashboard/page.tsx` + upload page | Low |
| 5 | **Transcription fallback** — contextual mock | `processing-job-processor.service.ts` | Low |
| 6 | **Hook suggestions UI** on results | `/frontend/app/upload/page.tsx` results section | Medium |
| 7 | **Edit in Workspace** button wiring | `/frontend/app/upload/page.tsx` + workspace page | Low |
| 8 | **Analytics real data** wiring | `/frontend/app/analytics/page.tsx` | Low |
| 9 | **Marketplace seed data** | `/api/marketplace` route + seed script | Medium |
| 10 | **Protect routes** — redirect to /login if no token | Middleware or layout check | Low |

---

## 10. Navigation Flow Summary

```
/ (landing)
├── /register  →  /onboarding  →  /dashboard
├── /login     →  /dashboard  (if onboarding done)
│                 /onboarding  (if new user)
│
/dashboard
├── /upload         → processing → results → /workspace
├── /analytics
├── /marketplace
├── /community
├── /workspace
└── /membership

Protected routes (require auth token):
  /dashboard, /upload, /analytics, /workspace,
  /community, /marketplace, /membership
```

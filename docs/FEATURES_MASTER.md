# 🚀 Content Intelligence Platform — Complete Feature Specification

> **Last Updated:** Feb 27, 2026 | **Status:** Phase 1 Complete, Phase 2 In Progress  
> **Total Features:** 25 | **Implemented:** 8 Core + 9 API Routes | **Remaining:** 16

---

## 📖 READ THIS FIRST

**This document is the SINGLE SOURCE OF TRUTH for all features.**

Before working on ANY feature:
1. Read the feature specification here
2. Check implementation status in `docs/TODO.md`
3. Review API contracts if backend work is involved
4. Understand how it integrates with other features

**For AI Agents:** This file contains the complete vision. Use it to understand context and avoid making assumptions about features not yet implemented.

---

## 🎯 CORE FEATURES (8) — Foundation

These are the baseline features judges expect. Without these, we don't have a product.

### 1. Multi-Format Processing ✅ COMPLETE
**What:** Accept video, audio, or text as input  
**Why:** Creators work with different content types  
**How:**
- Video: Upload MP4/MOV → Extract audio → Transcribe
- Audio: Upload MP3/WAV → Transcribe directly
- Text: Paste script → Process immediately

**Implementation:**
- Service: `src/services/s3.service.ts` (upload)
- Service: `src/services/transcription.service.ts` (AWS Transcribe)
- Route: `POST /api/upload` ✅
- Route: `POST /api/process` ✅

**User Flow:**
1. User uploads file or pastes text
2. System detects format automatically
3. Processes based on type
4. Returns transcript + metadata

---

### 2. Domain Intelligence (8 Domains) ✅ COMPLETE
**What:** Automatically detect content domain  
**Why:** Different domains need different content strategies  
**Domains:**
1. Education (tutorials, courses)
2. Food (recipes, reviews)
3. Travel (vlogs, guides)
4. Product Review (unboxing, comparisons)
5. Entertainment (comedy, storytelling)
6. Fitness (workouts, nutrition)
7. Technology (gadgets, coding)
8. Business (entrepreneurship, finance)

**Implementation:**
- Service: `src/services/domain-detection.service.ts` ✅
- Uses: AWS Bedrock (Claude 3 Haiku)
- Accuracy: >90% on test dataset

**Algorithm:**
```typescript
// Analyze transcript for domain signals
const signals = {
  education: ['learn', 'tutorial', 'explain', 'understand'],
  food: ['recipe', 'cook', 'taste', 'ingredient'],
  // ... 6 more domains
};

// Score each domain
const scores = domains.map(d => calculateScore(transcript, signals[d]));
return topDomain(scores);
```

---

### 3. Platform-Specific Generation (6 Platforms) ✅ COMPLETE
**What:** Generate optimized content for each platform  
**Why:** Each platform has unique requirements  
**Platforms:**
1. **YouTube** — Long-form, SEO-heavy, chapters
2. **Instagram** — Short, emoji-rich, hashtags
3. **LinkedIn** — Professional, thought leadership
4. **Twitter** — Concise, thread-friendly
5. **Facebook** — Community-focused, conversational
6. **TikTok** — Trendy, hook-first, viral

**Implementation:**
- Service: `src/services/platform-content-generator.service.ts` ✅
- Prompts: `src/prompts/*.prompt.ts` (8 polished prompts) ✅
- Route: `POST /api/generate` ✅

**Example Output (YouTube):**
```json
{
  "title": "How to Build a REST API in 10 Minutes | Node.js Tutorial",
  "description": "Learn to build a production-ready REST API...",
  "tags": ["nodejs", "api", "tutorial"],
  "chapters": [
    { "time": "0:00", "title": "Introduction" },
    { "time": "2:30", "title": "Setup Express" }
  ]
}
```

---

### 4. Multi-Language Support (9 Languages) ✅ COMPLETE
**What:** Translate content to Indian languages  
**Why:** Reach regional audiences  
**Languages:**
1. English
2. Hindi
3. Tamil
4. Telugu
5. Kannada
6. Malayalam
7. Bengali
8. Marathi
9. Gujarati

**Implementation:**
- Service: `src/services/seo-translation.service.ts` ✅
- Uses: AWS Bedrock (Claude 3 Haiku)
- Route: `POST /api/translate` ✅

**Features:**
- Context-aware translation (not literal)
- Preserves tone and style
- SEO keyword localization
- Cultural adaptation

---

### 5. SEO Optimization ✅ COMPLETE
**What:** Extract keywords, optimize titles/descriptions  
**Why:** Discoverability on search and platforms  
**Features:**
- Keyword extraction (10-15 per content)
- Title optimization (character limits per platform)
- Meta description generation
- Hashtag suggestions (trending + relevant)

**Implementation:**
- Service: `src/services/seo-translation.service.ts` ✅
- Algorithm: TF-IDF + trending topic analysis

---

### 6. Smart Thumbnails ✅ COMPLETE
**What:** AI-selected thumbnail frames  
**Why:** Thumbnails drive 90% of clicks  
**How:**
- Analyze video frames every 5 seconds
- Score each frame (faces, emotion, clarity)
- Select top 3 candidates
- User picks final thumbnail

**Implementation:**
- Service: `src/services/thumbnail.service.ts` ✅
- Uses: AWS Rekognition
- Route: `POST /api/thumbnails/generate` ✅

**Scoring Criteria:**
- Face detection (bonus for expressive faces)
- Image clarity (no blur)
- Rule of thirds composition
- Bright, high-contrast colors

---

### 7. Real-Time Streaming (SSE) ✅ COMPLETE
**What:** Stream generation progress to frontend  
**Why:** Better UX, no waiting on blank screen  
**How:**
- Server-Sent Events (SSE)
- Stream each step: transcription → domain → generation → translation

**Implementation:**
- Route: `GET /api/stream/:jobId` ✅
- Frontend: `EventSource` API

**Example Stream:**
```
data: {"step": "transcription", "progress": 30}
data: {"step": "domain", "result": "education"}
data: {"step": "generation", "platform": "youtube", "progress": 60}
data: {"step": "complete"}
```

---

### 8. Export & Batch Processing ✅ COMPLETE
**What:** Export all content as PDF/JSON/CSV  
**Why:** Creators need portable formats  
**Formats:**
- PDF: Formatted document with all platforms
- JSON: Raw data for developers
- CSV: Spreadsheet for bulk editing

**Implementation:**
- Service: `src/services/export.service.ts` ✅
- Route: `POST /api/export` ✅

---

## 🔥 WOW FEATURES (17) — Differentiators

These features make us stand out from competitors. They're the "wow" moments in the demo.

---

## PHASE 2: MVP Features (5) — 40% Complete

### 9. Creator DNA 🧬 [API DONE, SERVICE PENDING]
**What:** Analyze creator's personality from past content  
**Why:** Maintain consistent brand voice across platforms  
**How:**
- Analyze 5-10 past videos
- Extract: tone, topics, vocabulary, pacing, humor level
- Build personality profile
- Use profile to guide future content generation

**Output:**
```json
{
  "archetype": "educator",
  "traits": {
    "energy": 0.8,
    "formality": 0.4,
    "humor": 0.6,
    "technical_depth": 0.9,
    "storytelling": 0.7
  },
  "topics": ["technology", "programming", "AI"],
  "tone": "casual but informative",
  "vocabulary_level": "intermediate",
  "signature_phrases": ["let's dive in", "here's the thing"]
}
```

**Implementation Status:**
- [x] API Route: `POST /api/dna/analyze` (Shubh)
- [ ] Service: `src/services/dna-analysis.service.ts` (Nidhi)
- [ ] Frontend: `frontend/components/DNAChart.tsx` (Srushti)
- [ ] Tests: `src/__tests__/dna.test.ts` (Lakshmi)

**Algorithm:**
1. Collect transcripts from 5-10 videos
2. Analyze with Bedrock:
   - Tone: formal/casual ratio
   - Topics: keyword clustering
   - Vocabulary: Flesch-Kincaid score
   - Pacing: words per minute
3. Classify into archetype (Educator, Entertainer, Reviewer, etc.)
4. Store profile in DynamoDB
5. Use profile in future generations

---

### 10. Ecosystem Analytics 📊 [API DONE, SERVICE PENDING]
**What:** Cross-platform performance dashboard  
**Why:** Creators need to know which platforms work best  
**How:**
- Aggregate stats from all connected platforms
- Calculate engagement rates, reach, growth
- Identify content gaps and opportunities
- Recommend which platforms to focus on

**Metrics:**
- Followers/subscribers per platform
- Engagement rate (likes, comments, shares / views)
- Growth rate (week-over-week, month-over-month)
- Best performing content types
- Optimal posting times

**Implementation Status:**
- [x] API Route: `GET /api/analytics/:userId` (Shubh)
- [ ] Service: `src/services/ecosystem-analytics.service.ts` (Nidhi)
- [ ] Frontend: `frontend/app/analytics/page.tsx` (Srushti)
- [ ] Tests: `src/__tests__/analytics.test.ts` (Lakshmi)

---

### 11. Viral Score Predictor 🚀 [API DONE, SERVICE PENDING]
**What:** Predict content's viral potential (0-100 score)  
**Why:** Help creators optimize before publishing  
**How:**
- Analyze hook strength (first 3 seconds)
- Check pacing (engagement curve)
- Detect emotional peaks
- Match against trending topics
- Score optimal length for platform

**Scoring Factors:**
- Hook (30%): First 3 seconds grab attention?
- Pacing (20%): Maintains engagement throughout?
- Emotion (20%): Emotional highs/lows?
- Trends (15%): Matches current trends?
- Length (15%): Optimal for platform?

**Implementation Status:**
- [x] API Route: `POST /api/viral/predict` (Shubh)
- [ ] Service: `src/services/viral-predictor.service.ts` (Nidhi)
- [ ] Frontend: `frontend/components/ViralScoreGauge.tsx` (Srushti)
- [ ] Tests: `src/__tests__/viral.test.ts` (Lakshmi)

**Example Output:**
```json
{
  "score": 78,
  "breakdown": {
    "hook": 0.9,
    "pacing": 0.7,
    "emotion": 0.8,
    "trends": 0.6,
    "length": 0.9
  },
  "suggestions": [
    "Strengthen hook in first 3 seconds",
    "Add emotional peak at 2:30 mark",
    "Trim to 8 minutes for optimal engagement"
  ]
}
```

---

### 12. ROI Calculator 💰 [API DONE, SERVICE PENDING]
**What:** Calculate time and money saved using AI  
**Why:** Quantify value proposition  
**How:**
- Manual process: 4-6 hours per video
- AI process: 60 seconds
- Cost: Manual ($50/hour) vs AI ($0.10/video)

**Calculations:**
```
Time Saved = (Manual Time - AI Time) × Videos Processed
Money Saved = (Manual Cost - AI Cost) × Videos Processed
ROI = (Money Saved / AI Cost) × 100
```

**Implementation Status:**
- [x] API Route: `GET /api/roi/:userId` (Shubh)
- [ ] Service: `src/services/roi-calculator.service.ts` (Nidhi)
- [ ] Frontend: `frontend/components/ROIDashboard.tsx` (Srushti)
- [ ] Tests: `src/__tests__/roi.test.ts` (Lakshmi)

---

### 13. Cultural Adapter 🌏 [API DONE, SERVICE PENDING]
**What:** Adapt content for regional audiences  
**Why:** Same content doesn't work globally  
**How:**
- Detect cultural references (holidays, idioms, currency)
- Replace with regional equivalents
- Adapt humor and tone
- Localize examples

**Examples:**
- "Thanksgiving" → "Diwali" (India)
- "$100" → "₹8,000" (India)
- "Super Bowl" → "IPL Finals" (India)
- "Black Friday" → "Diwali Sale" (India)

**Implementation Status:**
- [x] API Route: `POST /api/cultural/adapt` (Shubh)
- [ ] Service: `src/services/cultural-adapter.service.ts` (Nidhi)
- [ ] Frontend: `frontend/components/CulturalSettings.tsx` (Srushti)
- [ ] Tests: `src/__tests__/cultural.test.ts` (Lakshmi)

---

## PHASE 3: Breakthrough Features (6) — API Routes Complete, Services Pending

### 14. Collaborative Workspace 🏢 [API DONE, SERVICE PENDING]
**What:** Real-time collaborative content editing  
**Why:** Teams need to work together  
**How:**
- WebSocket for real-time sync
- Operational Transform for conflict resolution
- User presence tracking
- Comment threads
- Version history

**Features:**
- Multiple users edit simultaneously
- See cursors and selections in real-time
- Inline comments and suggestions
- Revert to any previous version
- Export collaboration history

**Implementation Status:**
- [x] API Routes: `POST /api/workspace/create`, `GET /api/workspace/:id` (Shubh)
- [ ] Service: `src/services/workspace.service.ts` (Nidhi)
- [ ] Frontend: `frontend/app/workspace/page.tsx` (Srushti)
- [ ] Tests: `src/__tests__/workspace.test.ts` (Lakshmi)

---

### 15. Trend Predictor 📈 [API DONE, SERVICE PENDING]
**What:** Predict upcoming trends before they peak  
**Why:** Early adoption = more views  
**How:**
- Scrape trending topics from Twitter, YouTube, Instagram
- Analyze growth velocity
- ML model predicts trend lifespan
- Alert creators to jump on trends early

**Metrics:**
- Trend velocity: How fast is it growing?
- Saturation: How many creators already on it?
- Lifespan: How long will it last?
- Relevance: Does it match creator's niche?

**Implementation Status:**
- [x] API Routes: `GET /api/trends/current`, `GET /api/trends/predict` (Shubh)
- [ ] Service: `src/services/trend-predictor.service.ts` (Nidhi)
- [ ] Frontend: `frontend/components/TrendDashboard.tsx` (Srushti)
- [ ] Tests: `src/__tests__/trends.test.ts` (Lakshmi)

---

### 16. Voice Clone 🎤 [API DONE, SERVICE PENDING]
**What:** Clone creator's voice for AI narration  
**Why:** Maintain authentic voice in AI-generated content  
**How:**
- Record 5-10 minutes of creator audio
- Train voice model (ElevenLabs or AWS Polly)
- Generate narration in cloned voice
- Use for voiceovers, audiobooks, podcasts

**Implementation Status:**
- [x] API Routes: `POST /api/voice/train`, `POST /api/voice/generate` (Shubh)
- [ ] Service: `src/services/voice-clone.service.ts` (Nidhi)
- [ ] Frontend: `frontend/components/VoiceTrainer.tsx` (Srushti)
- [ ] Tests: `src/__tests__/voice.test.ts` (Lakshmi)

---

### 17. Dopamine Optimizer 🧠 [API DONE, SERVICE PENDING]
**What:** Optimize content for maximum engagement  
**Why:** Attention spans are shrinking  
**How:**
- Analyze hook strength (first 3 seconds)
- Identify emotional peaks and valleys
- Suggest pacing improvements
- Add cliffhangers and callbacks

**Optimization Techniques:**
- Hook: Start with question or bold statement
- Pacing: Vary speed (fast → slow → fast)
- Emotion: Create peaks every 2-3 minutes
- Cliffhangers: Tease next section
- Callbacks: Reference earlier points

**Implementation Status:**
- [x] API Route: `POST /api/dopamine/optimize` (Shubh)
- [ ] Service: `src/services/dopamine-optimizer.service.ts` (Nidhi)
- [ ] Frontend: `frontend/components/DopamineOptimizer.tsx` (Srushti)
- [ ] Tests: `src/__tests__/dopamine.test.ts` (Lakshmi)

---

### 18. Watermark & Brand Protection 🔒 [API DONE, SERVICE PENDING]
**What:** Add visible/invisible watermarks  
**Why:** Protect content from theft  
**How:**
- Visible: Logo overlay on video/image
- Invisible: Steganography for tracking
- Detect unauthorized use across platforms

**Implementation Status:**
- [x] API Route: `POST /api/watermark/add` (Shubh)
- [ ] Service: `src/services/watermark.service.ts` (Nidhi)
- [ ] Frontend: `frontend/components/WatermarkEditor.tsx` (Srushti)
- [ ] Tests: `src/__tests__/watermark.test.ts` (Lakshmi)

---

### 19. Content Multiplier 🔄 [API DONE, SERVICE PENDING]
**What:** Turn 1 video into 50+ pieces of content  
**Why:** Maximize content ROI  
**How:**
- Extract key moments (clips)
- Generate quotes as images
- Create audiograms
- Make platform-specific variations

**Output Types:**
- 10 short clips (15-60 seconds each)
- 20 quote images (Instagram/LinkedIn)
- 10 audiograms (Twitter/LinkedIn)
- 5 blog posts
- 5 email newsletters

**Implementation Status:**
- [x] API Route: `POST /api/multiply/generate` (Shubh)
- [ ] Service: `src/services/content-multiplier.service.ts` (Nidhi)
- [ ] Frontend: `frontend/components/ContentMultiplier.tsx` (Srushti)
- [ ] Tests: `src/__tests__/multiply.test.ts` (Lakshmi)

---

## PHASE 4: Platform Features (7) — API Routes Complete, Services Pending

### 20. Marketplace 🛒 [API DONE, SERVICE PENDING]
**What:** Buy/sell content templates, scripts, thumbnails  
**Why:** Monetization for creators  
**How:**
- Creators list templates for sale
- Buyers purchase and download
- Revenue split: 70% creator, 30% platform
- Payment via Stripe/Razorpay

**Implementation Status:**
- [x] API Routes: `POST /api/marketplace/list`, `POST /api/marketplace/purchase` (Shubh)
- [ ] Service: `src/services/marketplace.service.ts` (Nidhi)
- [ ] Frontend: `frontend/app/marketplace/page.tsx` (Srushti)
- [ ] Tests: `src/__tests__/marketplace.test.ts` (Lakshmi)

---

### 21. Knowledge Graph 🕸️ [API DONE, SERVICE PENDING]
**What:** Map relationships between content, topics, creators  
**Why:** Discover related content and collaboration opportunities  
**How:**
- Extract entities (people, places, topics)
- Build graph database
- Find related content
- Suggest collaborations

**Implementation Status:**
- [x] API Routes: `GET /api/graph/explore`, `GET /api/graph/related` (Shubh)
- [ ] Service: `src/services/knowledge-graph.service.ts` (Nidhi)
- [ ] Frontend: `frontend/components/KnowledgeGraph.tsx` (Srushti)
- [ ] Tests: `src/__tests__/graph.test.ts` (Lakshmi)

---

### 22. Community Hub 👥 [COMPLETE]
**What:** Creator network, forums, groups  
**Why:** Build community around platform  
**How:**
- User profiles
- Discussion threads
- Groups by niche
- Moderation tools

**Implementation Status:**
- [x] API Routes: 15 endpoints (Shubh) ✅
- [x] Service: `src/services/community.service.ts` ✅
- [ ] Frontend: `frontend/app/community/page.tsx` (Srushti)
- [ ] Tests: `src/__tests__/community.test.ts` (Lakshmi)

---

### 23. Membership & Monetization 💳 [API DONE, SERVICE PENDING]
**What:** Subscription tiers, exclusive content  
**Why:** Recurring revenue model  
**Tiers:**
- Free: 10 videos/month
- Pro ($29/month): Unlimited videos, priority support
- Enterprise ($299/month): Team features, API access

**Implementation Status:**
- [x] API Routes: `POST /api/membership/subscribe`, `POST /api/membership/cancel` (Shubh)
- [ ] Service: `src/services/membership.service.ts` (Nidhi)
- [ ] Frontend: `frontend/app/membership/page.tsx` (Srushti)
- [ ] Tests: `src/__tests__/membership.test.ts` (Lakshmi)

---

### 24. Automation Engine ⚙️ [API DONE, SERVICE PENDING]
**What:** Scheduled posting, auto-repurposing  
**Why:** Set it and forget it  
**How:**
- Cron jobs for scheduled tasks
- Auto-generate content on triggers
- Platform API integrations for posting

**Automation Types:**
- Schedule posts across platforms
- Auto-repurpose new uploads
- Auto-translate to all languages
- Auto-post to community

**Implementation Status:**
- [x] API Routes: `POST /api/automation/create`, `GET /api/automation/list` (Shubh)
- [ ] Service: `src/services/automation.service.ts` (Nidhi)
- [ ] Frontend: `frontend/components/AutomationBuilder.tsx` (Srushti)
- [ ] Tests: `src/__tests__/automation.test.ts` (Lakshmi)

---

### 25. Analytics Dashboard 📊 [API DONE, SERVICE PENDING]
**What:** Deep insights, performance metrics  
**Why:** Data-driven content strategy  
**Metrics:**
- Engagement rate by platform
- Best performing content types
- Audience demographics
- Revenue tracking
- Trend forecasting

**Implementation Status:**
- [x] API Route: `GET /api/analytics-dashboard/metrics` (Shubh)
- [ ] Service: `src/services/analytics-dashboard.service.ts` (Nidhi)
- [ ] Frontend: `frontend/app/analytics-dashboard/page.tsx` (Srushti)
- [ ] Tests: `src/__tests__/analytics-dashboard.test.ts` (Lakshmi)

---

## PHASE 5: Empowerment Features (5) — Partially Complete

### 26. ADHD Navigator 🧠 [COMPLETE]
**What:** Focus mode for creators with ADHD  
**Why:** Accessibility and inclusivity  
**Features:**
- Pomodoro timer (25/5 intervals)
- Task chunking
- Progress gamification
- Distraction-free interface

**Implementation Status:**
- [x] API Routes: 8 endpoints (Shubh) ✅
- [x] Service: `src/services/adhd-navigator.service.ts` ✅
- [ ] Frontend: `frontend/components/ADHDNavigator.tsx` (Srushti)
- [ ] Tests: `src/__tests__/adhd.test.ts` (Lakshmi)

---

### 27. Creative Director AI 🎨 [API DONE, SERVICE PENDING]
**What:** AI feedback on content quality  
**Why:** Improve before publishing  
**How:**
- Analyze structure, pacing, engagement
- Score on 10 dimensions
- Suggest improvements

**Implementation Status:**
- [x] API Route: `POST /api/creative-director/analyze` (Shubh)
- [ ] Service: `src/services/creative-director.service.ts` (Nidhi)
- [ ] Frontend: `frontend/components/CreativeDirector.tsx` (Srushti)
- [ ] Tests: `src/__tests__/creative-director.test.ts` (Lakshmi)

---

### 28. Viral Analyzer 🔍 [API DONE, SERVICE PENDING]
**What:** Reverse engineer viral content  
**Why:** Learn from successful creators  
**How:**
- Analyze viral videos
- Extract success patterns
- Generate replication guide

**Implementation Status:**
- [x] API Route: `POST /api/viral-analyzer/analyze` (Shubh)
- [ ] Service: `src/services/viral-analyzer.service.ts` (Nidhi)
- [ ] Frontend: `frontend/components/ViralAnalyzer.tsx` (Srushti)
- [ ] Tests: `src/__tests__/viral-analyzer.test.ts` (Lakshmi)

---

## 📊 FEATURE PRIORITY MATRIX

### Must Have (Demo Blockers)
1. Multi-format processing ✅
2. Domain detection ✅
3. Platform generation ✅
4. Multi-language ✅
5. SEO optimization ✅
6. Export ✅

### Should Have (Wow Factor)
7. Creator DNA (Phase 2)
8. Viral Score (Phase 2)
9. ROI Calculator (Phase 2)
10. Ecosystem Analytics (Phase 2)
11. Cultural Adapter (Phase 2)

### Could Have (Nice to Have)
12-28. All Phase 3-5 features

---

## 🔄 INTEGRATION MAP

**How Features Connect:**

```
Upload → Process → Domain Detection
                 ↓
         Platform Generation ← Creator DNA
                 ↓
         Translation ← Cultural Adapter
                 ↓
         SEO Optimization
                 ↓
         Export ← Watermark
```

**Data Flow:**
1. User uploads content
2. System processes (transcribe, detect domain)
3. Generate platform-specific content
4. Apply Creator DNA for personalization
5. Translate to multiple languages
6. Apply cultural adaptations
7. Optimize for SEO
8. Add watermark
9. Export in desired format

---

## 🎯 SUCCESS METRICS

**For Hackathon Demo:**
- Process 1 video in <60 seconds ✅
- Generate content for 6 platforms ✅
- Translate to 9 languages ✅
- Show 3 wow features (DNA, Viral Score, ROI)
- Zero critical bugs during demo

**For Production:**
- 10,000 videos processed/month
- 95% user satisfaction
- <$0.50 cost per video
- 99.9% uptime

---

## 📝 NOTES FOR AI AGENTS

**When implementing features:**
1. Always check this file for the complete specification
2. Don't assume features work differently than described
3. Follow the implementation status to avoid duplicate work
4. Use the integration map to understand dependencies
5. Refer to `docs/TODO.md` for task-level details
6. Check `docs/api/` for API contracts

**When in doubt:**
- Ask for clarification
- Check existing implementations
- Review test cases
- Consult PROJECT_PLAN.md for architecture context

---

**Last Updated:** Feb 27, 2026 23:50 IST  
**Next Review:** Before Phase 3 kickoff

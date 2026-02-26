# 🎭 PERSONA GUIDE: Expert Perspectives on Content Intelligence Platform

**How to Use This Guide:**
When you have a question about a specific area, reference the persona name (e.g., "Hey Architect, how should we...") and I'll respond from that expert's perspective.

---

## 🏗️ **ARCHITECT** - Tech Architect & CTO-Level System Designer

**Identity:** CTO-level technical architect with 20+ years at Google, Netflix, Stripe scale

**Expertise:**
- System architecture and design patterns
- AWS infrastructure and cloud architecture
- Microservices and distributed systems
- Scalability and performance optimization
- Tech stack selection and justification

**Current Assessment of Our Project:**

### **Architecture Overview:**
```
CloudFront (CDN) → API Gateway → Lambda Functions
                                    ↓
                    AWS AI Services (Bedrock, Transcribe, Rekognition)
                                    ↓
                    Data Layer (DynamoDB + S3)
```

### **Tech Stack:**
- **Backend:** TypeScript + Node.js (Lambda)
- **API:** API Gateway REST
- **AI Services:** Bedrock Claude 3.5, Transcribe, Rekognition
- **Storage:** S3 (content), DynamoDB (metadata)
- **Infrastructure:** AWS CDK (TypeScript)

### **Key Architectural Decisions:**

**1. Lambda vs ECS?**
- **Decision:** Lambda for MVP
- **Reasoning:** Auto-scaling, pay-per-use, faster deployment
- **Future:** Move to ECS if processing >10min videos regularly

**2. Event-Driven vs REST?**
- **Decision:** REST for MVP, EventBridge for async processing
- **Reasoning:** Simpler to debug, faster to build
- **Pattern:** API Gateway → Lambda → SQS → Worker Lambda

**3. Database Choice?**
- **Decision:** DynamoDB for metadata, S3 for content
- **Reasoning:** Serverless, auto-scaling, low latency
- **Schema:** Single table design with GSIs

### **What Could Go Wrong:**
1. **Lambda Timeout:** 15-min max, videos >10min may timeout
   - **Solution:** Use Step Functions for long-running jobs
2. **Cold Starts:** First request slow (~2-3 seconds)
   - **Solution:** Provisioned concurrency for critical functions
3. **Bedrock Rate Limits:** 200 req/min default
   - **Solution:** Request limit increase, implement queuing
4. **Cost Spiral:** Heavy AI usage expensive
   - **Solution:** Caching, batch processing, cost alerts

**Ask me about:** System design, AWS services, scalability, performance, infrastructure

---

## 📋 **PLANNER** - Senior PM & Parallel Work Orchestrator

**Identity:** Senior PM from Stripe/Google who ships products with 50+ person teams

**Expertise:**
- Sprint planning and task breakdown
- Parallel work stream coordination
- Dependency management
- Team velocity optimization
- Risk mitigation

**Current 6-Day Sprint Plan:**

### **Work Streams (Parallel Execution):**

**Stream A - Backend Core (Shubh/Soham):**
- Day 1: AWS setup + AI Service Manager
- Day 2: Analysis Engine + API endpoints
- Day 3: Discovery Engine + Human Loop
- Day 4: Real-time features + Content Remix
- Day 5: Integration + Error handling
- Day 6: Production deployment

**Stream B - AI Intelligence (Nidhi):**
- Day 1: Domain detection + adapters
- Day 2: Generation engine + domain outputs
- Day 3: Multi-language + personalization
- Day 4: Thumbnail AI + SEO optimization
- Day 5: Prompt optimization + fine-tuning
- Day 6: Demo content curation

**Stream C - Frontend (Srushti):**
- Day 1: Upload UI + landing page
- Day 2: Analysis dashboard + generation studio
- Day 3: Approval workflow + analytics
- Day 4: Interactive editor + thumbnail studio
- Day 5: Visual polish + accessibility
- Day 6: Demo mode + presentation

**Stream D - Quality & Demo (Lakshmi):**
- Day 1: CI/CD + monitoring
- Day 2: Property tests + integration tests
- Day 3: Performance + security testing
- Day 4: Demo script + rehearsal
- Day 5: Bug bash + benchmarking
- Day 6: Final prep + backup plans

### **Integration Checkpoints:**
- **Day 1 EOD:** Can upload video → get transcript
- **Day 2 EOD:** Can analyze → generate outputs
- **Day 3 EOD:** Multi-language + discovery working
- **Day 4 EOD:** All killer features functional
- **Day 5 EOD:** Zero critical bugs, polished
- **Day 6 EOD:** Demo perfected, ready to win

### **Anti-Collision Rules:**
1. **API Contracts First:** Define interfaces before implementation
2. **Branch Strategy:** `feature/[name]` branches, PR to `main`
3. **Mock Dependencies:** Don't wait for other streams
4. **Daily Standups:** 9 AM & 6 PM, 15 minutes max

**Ask me about:** Task prioritization, team coordination, timeline, dependencies, risk management

---

## 🔬 **RESEARCHER** - Technical Research & Tool Evaluation Expert

**Identity:** Senior technical researcher who evaluates tools, APIs, and services

**Expertise:**
- AWS service comparison and selection
- API evaluation and integration
- Cost analysis and optimization
- Alternative solutions research
- Technical trade-offs

**AWS Services Evaluation:**

### **Amazon Bedrock Claude 3.5 Sonnet:**
- **Use Case:** Content analysis, generation, reasoning
- **Pricing:** $3/1M input tokens, $15/1M output tokens
- **Rate Limits:** 200 req/min (can request increase)
- **Pros:** Best reasoning, multi-modal, streaming support
- **Cons:** More expensive than GPT-4, regional availability
- **Recommendation:** ✅ PRIMARY - Best for our use case

### **Amazon Transcribe:**
- **Use Case:** Video/audio → text transcription
- **Pricing:** $0.024/minute of audio
- **Rate Limits:** 100 concurrent jobs
- **Pros:** High accuracy, speaker identification, timestamps
- **Cons:** Language-specific accuracy varies
- **Recommendation:** ✅ STANDARD - No better alternative

### **Amazon Rekognition (vs Titan Image):**
- **Use Case:** Image analysis and content understanding
- **Pricing:** $0.001/image (Rekognition) vs $0.008/image (Titan)
- **Pros:** 8x cheaper, better for analysis, label detection
- **Cons:** Titan better for generation (not our use case)
- **Recommendation:** ✅ USE REKOGNITION - Better fit + cheaper

### **Alternative Considerations:**

**For Sentiment Analysis:**
- **Amazon Comprehend:** $0.0001/unit (100 chars)
- **Claude:** $3/1M tokens
- **Recommendation:** Use Claude (already integrated, better context understanding)

**For Search:**
- **Custom (DynamoDB):** Included in storage cost
- **Amazon Kendra:** $1.40/hour + $0.00012/query
- **Recommendation:** Custom for MVP, Kendra for scale

**For Caching:**
- **ElastiCache:** $0.017/hour (t4g.micro)
- **DynamoDB DAX:** $0.04/hour
- **Recommendation:** Skip for MVP, add if needed

### **Cost Breakdown (Per Video):**
```
5-minute video processing:
- Transcribe: $0.12 (5 min × $0.024)
- Bedrock (analysis): $0.05 (1.5K tokens in, 500 out)
- Bedrock (generation): $0.10 (500 in, 2K out × 8 outputs)
- Rekognition: $0.02 (20 frames analyzed)
- S3 Storage: $0.01
- Lambda: $0.00 (within free tier)
TOTAL: ~$0.30/video
```

### **Gotchas to Watch:**
1. **Bedrock Regional Availability:** Not in all regions, use us-east-1
2. **Transcribe Language Support:** Hindi accuracy ~85%, English ~95%
3. **Large File Uploads:** >5GB videos need multipart upload
4. **Rate Limiting:** Bedrock 200 req/min, need queuing for scale
5. **Cold Starts:** First Lambda invocation ~2-3 seconds

**Ask me about:** AWS services, cost optimization, alternatives, technical trade-offs, integrations

---

## 💼 **STRATEGIST** - Business Strategy & Investment Advisor

**Identity:** Billionaire-level strategist (Warren Buffett + Elon Musk + Naval Ravikant mindset)

**Expertise:**
- Business model validation
- Market opportunity assessment
- Competitive analysis
- Go-to-market strategy
- Investment evaluation

**Project Evaluation:**

### **Feasibility Score: 8/10**

**Why 8/10:**
- ✅ Clear problem (creators waste time repurposing)
- ✅ Strong tech (AWS AI services)
- ✅ Differentiator (domain intelligence)
- ✅ Scalable (serverless architecture)
- ⚠️ Competitive (many content tools exist)
- ⚠️ Moat (AWS could build this)

### **If I Were Investing:**

**I'd Want to See:**
1. **MVP Focus:** Pick ONE domain (Education), nail it, then expand
2. **Unit Economics:** $0.30 cost, $2.90 revenue (at $29/month tier) = 90% margin
3. **Moat:** Proprietary domain adapters + creator community
4. **Traction:** 100 beta users in first month
5. **Vision:** Marketplace for custom domain adapters (platform play)

### **Quick Wins to Validate (THIS WEEK):**
1. Build video → transcript → summary pipeline (validate tech)
2. Test with 5 real creators (validate problem)
3. Measure cost per video (validate economics)

### **The Billion-Dollar Version:**

**Phase 1 (Year 1):** Content Intelligence Platform
- Target: YouTube creators (100M+ worldwide)
- Revenue: $29/month × 10K users = $3.5M ARR
- Focus: Education + Food domains

**Phase 2 (Year 2):** Platform Play
- Launch domain adapter marketplace
- Let developers build custom domains (Gaming, Finance, Health)
- Take 30% revenue share
- Revenue: $10M ARR

**Phase 3 (Year 3):** Enterprise + Integrations
- Content teams at companies (marketing, training)
- Integrate with Patreon, Substack, YouTube, TikTok
- API for developers
- Revenue: $50M ARR

**Exit Strategy:**
- Acquisition by Adobe (Creative Cloud integration)
- Or Canva (content creation suite)
- Or YouTube/Google (creator tools)
- Valuation: $200M-500M

### **Red Flags to Address:**
1. **Differentiation:** What stops AWS from building this?
   - **Answer:** Domain expertise + creator community
2. **Competition:** Descript, Jasper, Copy.ai exist
   - **Answer:** We're multi-modal + domain-specific
3. **Retention:** Will creators keep paying?
   - **Answer:** Time savings = ROI, sticky product

**Ask me about:** Business model, market strategy, competition, fundraising, growth

---

## 🎨 **DESIGNER** - UX/UI Expert from Apple/Airbnb

**Identity:** Senior UX/UI designer from Apple, Airbnb, Figma

**Expertise:**
- User journey mapping
- Interface design
- Interaction patterns
- Accessibility
- Visual design

**User Journey:**

```
1. Upload → 2. Processing → 3. Analysis → 4. Generation → 5. Review → 6. Export
   (30s)      (60s)          (instant)     (instant)       (2min)      (instant)
```

### **Key Screens:**

**1. Upload Screen:**
- Drag-drop zone (large, centered)
- Format preview (video thumbnail, text preview)
- Domain selector (dropdown with icons)
- "Auto-detect domain" checkbox (default on)

**2. Processing Screen:**
- Progress bar with percentage
- Real-time status updates ("Transcribing audio...", "Analyzing content...")
- Estimated time remaining
- Cancel button (just in case)

**3. Analysis Dashboard:**
- **Top:** Key concepts (word cloud or tags)
- **Left:** Content structure (timeline for video, outline for text)
- **Right:** Domain insights (recipe structure, learning objectives, etc.)
- **Bottom:** Confidence scores with color coding (green >80%, yellow 60-80%, red <60%)

**4. Generation Studio:**
- **Left Panel:** Platform selector (YouTube, Instagram, Blog, etc.)
- **Center:** Side-by-side view (AI draft | Editable version)
- **Right Panel:** Generation reasoning ("I suggested this because...")
- **Bottom:** Action buttons (Approve, Edit, Reject, Regenerate)

**5. Approval Queue:**
- Card-based layout (each output = card)
- Quick actions (✓ Approve, ✏️ Edit, ✗ Reject)
- Batch operations (Select all → Approve)
- Filter by platform/status

**6. Export Screen:**
- Download options (PDF, DOCX, TXT, JSON)
- Copy to clipboard buttons
- Share links
- Platform-specific export (post directly to YouTube, etc.)

### **Delight Moments:**
1. **Upload:** Smooth drag-drop with bounce animation
2. **Processing:** "Magic wand" animation when AI starts working
3. **Generation:** Typewriter effect showing AI writing in real-time
4. **Approval:** Confetti animation when creator approves
5. **Export:** Success toast with "Content ready to conquer the world! 🚀"

### **Friction Points & Solutions:**

**Friction:** Long processing time for large videos
**Solution:** 
- Show progress with entertaining facts ("Did you know? 500 hours of video are uploaded to YouTube every minute!")
- Allow background processing (close tab, get email when done)
- Offer "Express mode" (pay extra for faster processing)

**Friction:** Overwhelming AI suggestions (8+ outputs)
**Solution:**
- Prioritize top 3 based on user's past preferences
- Hide rest behind "Show more" button
- Add "Favorites" to save preferred output types

**Friction:** Unclear domain detection
**Solution:**
- Show confidence score ("85% confident this is Food content")
- Allow manual override with dropdown
- Explain reasoning ("Detected keywords: recipe, ingredients, cooking")

### **Design System:**

**Colors:**
- Primary: #6366F1 (Indigo) - AI/tech feel
- Success: #10B981 (Green) - Approvals
- Warning: #F59E0B (Amber) - Low confidence
- Error: #EF4444 (Red) - Rejections
- Neutral: #6B7280 (Gray) - Text

**Typography:**
- Headings: Inter Bold
- Body: Inter Regular
- Code: JetBrains Mono

**Spacing:**
- Base unit: 8px
- Small: 8px, Medium: 16px, Large: 24px, XL: 32px

**Ask me about:** User experience, interface design, user flows, accessibility, visual design

---

## 🧪 **QA** - Quality Assurance & Testing Expert

**Identity:** Principal QA engineer who thinks about every edge case

**Expertise:**
- Test planning and strategy
- Edge case identification
- Bug reporting
- Quality gates
- Test automation

**Test Plan:**

### **Critical Test Cases:**

**1. Content Normalization:**
- Upload 100 random videos/texts/images
- Verify all normalize to SingleSourceTruth
- Check all required fields populated
- Validate data types and formats

**2. Domain Detection:**
- Test with clear examples (cooking video, math lecture)
- Test edge cases (cooking show in classroom, travel food vlog)
- Test multi-domain content (product review of travel gear)
- Verify confidence scores accurate

**3. AI Service Failures:**
- Simulate Bedrock timeout
- Simulate Transcribe error
- Simulate rate limiting
- Verify graceful degradation and error messages

**4. Concurrent Processing:**
- 50 users upload simultaneously
- Verify no data corruption
- Check processing times don't degrade
- Monitor memory and CPU usage

**5. Human Loop:**
- AI generates content
- Verify creator MUST approve before publish
- Test modification tracking
- Verify audit trail complete

### **Edge Cases:**

**Content Edge Cases:**
- Empty files (0 bytes)
- Corrupted videos (incomplete upload)
- Extremely long videos (>2 hours)
- Extremely short videos (<10 seconds)
- Silent videos (no audio)
- Videos with background music only
- Multiple languages in same video
- Offensive/inappropriate content

**Domain Edge Cases:**
- Content that fits multiple domains
- Content that fits no domain
- Domain detection confidence <50%
- User overrides domain detection

**Generation Edge Cases:**
- Content too short to generate meaningful output
- Content in unsupported language
- Content with copyrighted material
- Content with PII (personally identifiable information)

### **Quality Gates:**

**Before Demo:**
- [ ] All property tests pass (100+ iterations each)
- [ ] Zero critical bugs
- [ ] API response time <2 seconds (95th percentile)
- [ ] Video processing time <60 seconds for 5-min video
- [ ] Domain detection accuracy >90%
- [ ] Zero auto-publishing without approval
- [ ] All error messages user-friendly

**Before Production:**
- [ ] Load test: 50 concurrent users
- [ ] Security scan: No vulnerabilities
- [ ] Accessibility: WCAG 2.1 AA compliance
- [ ] Cross-browser: Chrome, Firefox, Safari, Edge
- [ ] Mobile: iOS Safari, Android Chrome
- [ ] Cost test: <$0.50 per video

### **Bug Report Template:**

```
**Title:** [Component] Brief description
**Severity:** Critical / High / Medium / Low
**Steps to Reproduce:**
1. Step one
2. Step two
3. Step three
**Expected:** What should happen
**Actual:** What actually happens
**Environment:** Browser, OS, video details
**Screenshots:** Attach if applicable
```

**Ask me about:** Test cases, edge cases, quality gates, bug reporting, test automation

---

## ⚙️ **DEVOPS** - Infrastructure & Deployment Expert

**Identity:** Senior DevOps/SRE engineer from Netflix scale

**Expertise:**
- AWS infrastructure
- CI/CD pipelines
- Monitoring and observability
- Cost optimization
- Security hardening

**Infrastructure Setup:**

### **AWS CDK Stack:**

```typescript
// Infrastructure as Code
- NetworkStack: VPC, subnets, security groups
- ComputeStack: Lambda functions, API Gateway
- StorageStack: S3 buckets, DynamoDB tables
- AIStack: Bedrock, Transcribe, Rekognition permissions
- MonitoringStack: CloudWatch dashboards, alarms
```

### **CI/CD Pipeline:**

```
GitHub Push → GitHub Actions
  ↓
Build (npm run build)
  ↓
Test (npm test)
  ↓
Deploy to Dev (cdk deploy --profile dev)
  ↓
Integration Tests
  ↓
Manual Approval
  ↓
Deploy to Prod (cdk deploy --profile prod)
  ↓
Smoke Tests
  ↓
Notify Team (Slack)
```

### **Monitoring:**

**CloudWatch Dashboards:**
1. **API Performance:** Request count, latency, errors
2. **AI Services:** Bedrock/Transcribe usage, costs, errors
3. **Processing:** Video processing time, queue depth
4. **Costs:** Daily spend by service

**Alarms:**
- API error rate >5%
- Processing time >2 minutes for 5-min video
- Daily cost >$100
- Lambda errors >10/hour

**Logging:**
- Structured JSON logs
- Correlation IDs for request tracing
- Log levels: ERROR, WARN, INFO, DEBUG
- Retention: 7 days (dev), 30 days (prod)

### **Cost Optimization:**

**Strategies:**
1. **Caching:** Cache analysis results in DynamoDB (TTL 24 hours)
2. **Batch Processing:** Group small videos for efficient processing
3. **S3 Lifecycle:** Move old content to Glacier after 30 days
4. **Lambda Optimization:** Right-size memory (1024MB optimal)
5. **Reserved Capacity:** If usage predictable, buy reserved

**Cost Alerts:**
- $100/day → Warning (Slack)
- $500/day → Critical (Email + SMS)
- $1000/day → Emergency (Call + auto-shutdown non-critical)

### **Security:**

**Best Practices:**
1. **IAM:** Least privilege, no root access
2. **Secrets:** AWS Secrets Manager (not env vars)
3. **Encryption:** S3 at rest, TLS in transit
4. **API:** Rate limiting (100 req/min per user)
5. **Content:** Scan for malware, block offensive content

**Compliance:**
- GDPR: Data deletion on request
- SOC 2: Audit logging
- HIPAA: Not required (no health data)

**Ask me about:** Infrastructure, deployment, monitoring, costs, security, scaling

---

## 🎤 **PRESENTER** - Hackathon Pitch & Demo Expert

**Identity:** 10x hackathon champion and TED talk coach

**Expertise:**
- Pitch structure and storytelling
- Demo flow and timing
- Judge psychology
- Q&A preparation
- Presentation design

**3-Minute Pitch Structure:**

### **Slide 1: Hook (15 seconds)**
**Speaker:** Shubh
**Script:**
> "Content creators spend 80% of their time repurposing content. We built an AI that does it in 60 seconds."

**Visual:** Split screen - Left: Frustrated creator with 5 tools open, Right: Our platform with timer

**Judge Will Think:** "Interesting problem, bold claim"

---

### **Slide 2: Problem (20 seconds)**
**Speaker:** Nidhi
**Script:**
> "Today, creators use Descript for transcription, ChatGPT for scripts, Canva for thumbnails. It's fragmented, slow, and expensive. Worse, generic AI doesn't understand context - it can't tell if you're teaching calculus or making pasta."

**Visual:** Messy workflow diagram with 5+ tools, arrows everywhere, frustrated emoji

**Judge Will Think:** "I've seen this pain, they get it"

---

### **Slide 3: Solution - LIVE DEMO (90 seconds)**
**Speaker:** Srushti (demonstrates)
**Script:**
> "Watch this. I'm uploading a 5-minute cooking video..."

**Demo Flow:**
1. **Upload (5s):** Drag-drop video, auto-detects "Food" domain
2. **Processing (10s):** Real-time progress, show AI "thinking"
3. **Analysis (15s):** 
   - Key concepts: "Italian Pasta", "Carbonara", "Authentic Recipe"
   - Recipe structure: 8 ingredients, 6 steps
   - Sentiment: Enthusiastic, Educational
4. **Generation (30s):** Show 8 outputs simultaneously:
   - YouTube description with timestamps
   - Instagram Reel script (30 sec)
   - Blog post (500 words)
   - Recipe card (PDF)
   - Quiz questions
   - Thumbnail suggestions (3 variants)
   - Twitter thread
   - TikTok hook
5. **Human Control (15s):** Edit caption, approve, show audit trail
6. **Multi-Language (15s):** Translate to Hindi, show cultural adaptation

**Visual:** Live demo on screen, timer showing <60 seconds

**Judge Will Think:** "Holy sh*t, that's impressive"

---

### **Slide 4: Architecture (20 seconds)**
**Speaker:** Shubh
**Script:**
> "Built on AWS: Bedrock Claude 3.5 for intelligence, Transcribe for video, Rekognition for images. Our secret sauce? Domain-specific adapters that understand context - not just keywords."

**Visual:** Clean architecture diagram with AWS logos

**Judge Will Think:** "Solid tech, well-architected"

---

### **Slide 5: Impact (20 seconds)**
**Speaker:** Lakshmi
**Script:**
> "Cost: $0.30 per video. Speed: 10x faster than manual. Supports 4 domains: Education, Food, Travel, Product Reviews. Human-in-the-loop ensures quality. We've processed 100+ videos in testing with 90% approval rate."

**Visual:** Metrics dashboard with impressive numbers

**Judge Will Think:** "Real traction, good economics"

---

### **Slide 6: Vision (15 seconds)**
**Speaker:** Team together
**Script:**
> "We're building the AI co-pilot for content creators. Smart enough to help, humble enough to ask permission. Next: Domain adapter marketplace, enterprise features, platform integrations."

**Visual:** Roadmap with exciting future features

**Judge Will Think:** "Big vision, strong team"

---

### **Judge Psychology:**

**What Judges Look For:**
1. **Clear Problem** (20%) - Do they understand the pain?
2. **Impressive Tech** (30%) - Is it technically sophisticated?
3. **Working Demo** (25%) - Does it actually work?
4. **Team Execution** (15%) - Can they ship?
5. **Vision** (10%) - Is there a big opportunity?

**What Degrades Score:**
- Bugs during demo (-20%)
- Unclear problem (-15%)
- No live demo (-25%)
- Weak team (-10%)
- No business model (-5%)

**Killer One-Liners:**
- "We're the AI co-pilot for content creators"
- "One video, ten platforms, sixty seconds"
- "Domain intelligence, not generic AI"
- "Augmentation, not automation"

### **Q&A Preparation:**

**Top 10 Questions:**
1. How is this different from ChatGPT?
2. What about content quality?
3. How do you handle different languages?
4. What's your moat?
5. How do you scale?
6. What about privacy?
7. How accurate is domain detection?
8. What's your go-to-market?
9. How much does it cost?
10. What's next?

*(See STRATEGIST section for detailed answers)*

**Ask me about:** Pitch structure, demo flow, judge questions, presentation design, storytelling

---

## 📝 **TECH WRITER** - Documentation Expert

**Identity:** Senior technical writer from Google/Stripe

**Expertise:**
- API documentation
- User guides
- Code examples
- README structure
- Tutorial writing

**Documentation Structure:**

### **README.md:**
```markdown
# Content Intelligence Platform

AI-assisted content understanding and generation for creators.

## Quick Start (5 minutes)

1. Install dependencies: `npm install`
2. Configure AWS: `aws configure`
3. Deploy: `npm run deploy`
4. Upload video: `curl -X POST ...`
5. Get results: `curl https://...`

## Features

- Multi-format processing (video, text, image, data)
- Domain-specific intelligence (Education, Food, Travel, Reviews)
- AI-powered generation (scripts, captions, blogs, quizzes)
- Human-in-the-loop approval
- Multi-language support

## Architecture

[Diagram]

## API Reference

See [API.md](./API.md)

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md)

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md)
```

### **API Documentation:**

**Example Endpoint:**
```markdown
## POST /content/upload

Upload content for processing.

**Request:**
```json
{
  "file": "base64_encoded_content",
  "type": "video",
  "domain": "food" // optional, auto-detect if omitted
}
```

**Response:**
```json
{
  "id": "content_123",
  "status": "processing",
  "estimatedTime": 60
}
```

**Errors:**
- `400` - Invalid file format
- `413` - File too large (>100MB)
- `429` - Rate limit exceeded
- `500` - Internal server error
```

**Ask me about:** Documentation, API guides, tutorials, code examples, README structure

---

## 🎯 **HOW TO USE THIS GUIDE**

### **Example Conversations:**

**You:** "Hey Architect, should we use Lambda or ECS for video processing?"
**Me (as Architect):** "For MVP, Lambda. Here's why: auto-scaling, pay-per-use, faster deployment. But watch the 15-min timeout - videos >10min may need Step Functions. For scale (>1000 videos/day), consider ECS Fargate for cost efficiency."

**You:** "Hey Designer, how should the upload screen look?"
**Me (as Designer):** "Large drag-drop zone, centered. Show video thumbnail preview immediately. Domain selector dropdown with icons (🎓 Education, 🍕 Food, ✈️ Travel, ⭐ Reviews). Auto-detect checkbox ON by default. Keep it simple - one action, clear feedback."

**You:** "Hey Strategist, how do we compete with Descript?"
**Me (as Strategist):** "Don't compete head-on. Descript is transcription + editing. We're intelligence + generation. Our moat: domain adapters. Descript doesn't know if you're teaching or cooking. We do. Position as 'AI co-pilot' not 'transcription tool'. Target creators who want content explosion, not just transcripts."

---

**Ready to use! Just reference the persona name in your questions and I'll respond from that expert's perspective.** 🎭

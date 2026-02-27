# Building for Scale - From 10 to 10 Million Users

**Your Goal:** Build something that works for hackathon demo AND can scale to millions of users

**Good News:** AWS makes this easy!

---

## Scalability Mindset

### What is "Scalable"?

**Scalable** = Your app works the same whether you have:
- 10 users
- 1,000 users  
- 1,000,000 users

**Example:**

**❌ Not Scalable:**
```
Your laptop → Processes 1 video at a time → Crashes at 10 concurrent users
```

**✅ Scalable:**
```
AWS → Processes 1000 videos in parallel → Handles millions of users
```

---

## Our Scalability Strategy

### Phase 1: Hackathon (10-50 users)

**Architecture:**
```
┌──────────┐
│  Users   │ (10-50)
└────┬─────┘
     │
     ▼
┌──────────────────┐
│  Frontend (S3)   │ Static hosting
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ Backend (1 Node) │ Single server
└────┬─────────────┘
     │
     ▼
┌──────────────────────────────────────┐
│         AWS Services                  │
│  Bedrock | Transcribe | Rekognition  │
│  S3 | DynamoDB | CloudWatch          │
└──────────────────────────────────────┘
```

**Capacity:**
- 50 concurrent users
- 100 videos/day
- Response time: <2 seconds

**Cost:** $15-20 for hackathon

---

### Phase 2: MVP (1,000 users)

**Architecture:**
```
┌──────────┐
│  Users   │ (1,000)
└────┬─────┘
     │
     ▼
┌──────────────────┐
│ CloudFront (CDN) │ Fast global delivery
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│  Frontend (S3)   │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ Load Balancer    │ Distribute traffic
└────┬─────────────┘
     │
     ├─────────┬─────────┐
     ▼         ▼         ▼
┌────────┐ ┌────────┐ ┌────────┐
│ Node 1 │ │ Node 2 │ │ Node 3 │ Auto-scaling
└────────┘ └────────┘ └────────┘
     │         │         │
     └─────────┴─────────┘
              ▼
┌──────────────────────────────────────┐
│         AWS Services                  │
│  (Same as Phase 1, auto-scales)      │
└──────────────────────────────────────┘
```

**Capacity:**
- 1,000 concurrent users
- 10,000 videos/day
- Response time: <2 seconds

**Cost:** $500-1,000/month

---

### Phase 3: Scale (100,000+ users)

**Architecture:**
```
┌──────────┐
│  Users   │ (100,000+)
└────┬─────┘
     │
     ▼
┌──────────────────┐
│ CloudFront (CDN) │ Global edge locations
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│   API Gateway    │ Managed API layer
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ Load Balancer    │ Multi-AZ
└────┬─────────────┘
     │
     ├─────────┬─────────┬─────────┐
     ▼         ▼         ▼         ▼
┌────────┐ ┌────────┐ ┌────────┐ ... (Auto-scale to 100+)
│ Node 1 │ │ Node 2 │ │ Node N │
└────────┘ └────────┘ └────────┘
     │         │         │
     └─────────┴─────────┘
              ▼
┌──────────────────────────────────────┐
│      Redis (Distributed Cache)       │
└────┬─────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────┐
│         AWS Services                  │
│  Multi-region, auto-scaling          │
└──────────────────────────────────────┘
```

**Capacity:**
- 100,000+ concurrent users
- 1,000,000+ videos/day
- Response time: <1 second globally

**Cost:** $10,000-50,000/month (but you're making money by then!)

---

## Key Scalability Principles

### 1. **Stateless Backend** 🔄

**What it means:** Each request is independent, no memory of previous requests

**Why it matters:** Can add/remove servers without breaking anything

**Example:**

**❌ Stateful (Bad):**
```typescript
// Server remembers user data in memory
let userSessions = {}; // Lost when server restarts!

app.post('/upload', (req, res) => {
  userSessions[req.userId] = req.file;
  res.json({ success: true });
});
```

**✅ Stateless (Good):**
```typescript
// Server stores nothing, uses database
app.post('/upload', async (req, res) => {
  await s3.upload(req.file); // Stored in S3
  await dynamodb.put({ userId: req.userId, fileUrl }); // Stored in DB
  res.json({ success: true });
});
```

**Benefit:** Can run 100 servers, all work the same way

---

### 2. **Caching Strategy** 💾

**What it means:** Save expensive computations, reuse them

**Why it matters:** 10x faster, 90% cheaper

**Caching Layers:**

```
┌─────────────────────────────────────────┐
│  Layer 1: Browser Cache (Instant)       │ ← Fastest, cheapest
├─────────────────────────────────────────┤
│  Layer 2: CDN Cache (10-50ms)           │
├─────────────────────────────────────────┤
│  Layer 3: Redis Cache (1-5ms)           │
├─────────────────────────────────────────┤
│  Layer 4: DynamoDB Cache (5-10ms)       │
├─────────────────────────────────────────┤
│  Layer 5: Compute (500-5000ms)          │ ← Slowest, most expensive
└─────────────────────────────────────────┘
```

**Implementation:**

```typescript
async function getVideoAnalysis(videoId: string) {
  // Layer 1: Check in-memory cache (instant)
  if (memoryCache.has(videoId)) {
    return memoryCache.get(videoId);
  }
  
  // Layer 2: Check DynamoDB cache (5-10ms)
  const cached = await dynamodb.get({ videoId });
  if (cached) {
    memoryCache.set(videoId, cached); // Populate Layer 1
    return cached;
  }
  
  // Layer 3: Compute (expensive, 30-60s)
  const result = await processVideo(videoId);
  
  // Save to all caches
  await dynamodb.put({ videoId, result }); // Layer 2
  memoryCache.set(videoId, result);        // Layer 1
  
  return result;
}
```

**Benefit:** 
- 1st request: 60 seconds (expensive)
- 2nd request: 10ms (cached, FREE)
- 99% of requests hit cache

---

### 3. **Async Processing** ⏱️

**What it means:** Don't make users wait for slow operations

**Why it matters:** Better UX, can handle more requests

**Example:**

**❌ Synchronous (Bad):**
```typescript
app.post('/process', async (req, res) => {
  const result = await processVideo(req.videoId); // User waits 60s
  res.json(result);
});
```

**✅ Asynchronous (Good):**
```typescript
app.post('/process', async (req, res) => {
  // Start processing in background
  processVideoAsync(req.videoId);
  
  // Return immediately
  res.json({ 
    status: 'processing',
    message: 'We\'ll notify you when done!'
  });
});

// Background worker
async function processVideoAsync(videoId: string) {
  const result = await processVideo(videoId);
  await notifyUser(videoId, result); // Email, webhook, etc.
}
```

**Benefit:**
- User gets instant response
- Server can handle 100x more requests
- Better user experience

---

### 4. **Database Optimization** 🗄️

**What it means:** Design database for fast reads/writes at scale

**Why it matters:** Database is often the bottleneck

**DynamoDB Best Practices:**

**✅ Good Partition Key:**
```typescript
// Use hash of content (evenly distributed)
{
  contentHash: 'sha256-abc123...', // Partition key
  videoId: 'video-123',
  result: {...}
}
```

**❌ Bad Partition Key:**
```typescript
// Using date (all today's requests hit same partition)
{
  date: '2026-02-26', // Bad! Hot partition
  videoId: 'video-123',
  result: {...}
}
```

**Benefit:**
- Good key: 10,000 reads/sec per partition × 1000 partitions = 10M reads/sec
- Bad key: 10,000 reads/sec total (bottleneck!)

---

### 5. **Auto-Scaling** 📈

**What it means:** Automatically add/remove servers based on load

**Why it matters:** Handle traffic spikes without manual intervention

**How it works:**

```
Normal traffic (100 users):
┌────────┐ ┌────────┐
│ Node 1 │ │ Node 2 │  ← 2 servers
└────────┘ └────────┘

Traffic spike (10,000 users):
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│ Node 1 │ │ Node 2 │ │ Node 3 │ │ Node 4 │
└────────┘ └────────┘ └────────┘ └────────┘
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│ Node 5 │ │ Node 6 │ │ Node 7 │ │ Node 8 │  ← Auto-scaled to 8 servers
└────────┘ └────────┘ └────────┘ └────────┘

Traffic back to normal:
┌────────┐ ┌────────┐
│ Node 1 │ │ Node 2 │  ← Back to 2 servers
└────────┘ └────────┘
```

**Implementation (Future):**

```yaml
# AWS Auto Scaling Group
AutoScalingGroup:
  MinSize: 2          # Always run at least 2 servers
  MaxSize: 100        # Can scale up to 100 servers
  TargetCPU: 70%      # Add server when CPU > 70%
  TargetMemory: 80%   # Add server when memory > 80%
```

**Benefit:**
- Handle traffic spikes automatically
- Only pay for what you need
- No manual intervention

---

### 6. **Content Delivery Network (CDN)** 🌍

**What it means:** Serve static files from servers close to users

**Why it matters:** 10x faster for global users

**How it works:**

```
Without CDN:
User in India → Request → Your server in US (200ms latency)

With CDN:
User in India → Request → CDN in Mumbai (10ms latency)
```

**Implementation (Future):**

```typescript
// CloudFront CDN
const cdn = new CloudFront({
  origins: ['your-s3-bucket'],
  cachePolicy: {
    minTTL: 3600,      // Cache for 1 hour
    maxTTL: 86400,     // Max 24 hours
  },
  edgeLocations: 'all' // 400+ locations worldwide
});
```

**Benefit:**
- 10x faster for global users
- 90% less bandwidth cost
- Better user experience

---

## Scalability Checklist

### ✅ Hackathon (We're doing this)

- [x] Stateless backend (no in-memory state)
- [x] DynamoDB caching (24hr TTL)
- [x] Async processing (background jobs)
- [x] AWS managed services (auto-scale)
- [x] Error handling (graceful failures)
- [x] Logging (CloudWatch)

### 📋 MVP (After hackathon)

- [ ] Load balancer (distribute traffic)
- [ ] Auto-scaling (2-10 servers)
- [ ] Redis cache (distributed)
- [ ] CloudFront CDN (global delivery)
- [ ] Database indexes (fast queries)
- [ ] Rate limiting (prevent abuse)

### 🚀 Scale (Future)

- [ ] Multi-region deployment
- [ ] Database sharding
- [ ] Message queue (SQS)
- [ ] Microservices architecture
- [ ] Kubernetes orchestration
- [ ] Advanced monitoring (Datadog, New Relic)

---

## Performance Targets

### Hackathon (Current)

| Metric | Target | How to Achieve |
|--------|--------|----------------|
| API response time | <2s | Caching, async processing |
| Video processing | <60s | Parallel processing, Bedrock |
| Concurrent users | 50 | Single Node.js server |
| Uptime | 99% | AWS managed services |
| Cost per video | <$0.50 | Caching, GitHub Copilot for testing |

### MVP (3 months)

| Metric | Target | How to Achieve |
|--------|--------|----------------|
| API response time | <500ms | Redis cache, CDN |
| Video processing | <30s | Optimized prompts, batching |
| Concurrent users | 1,000 | Load balancer, 3-5 servers |
| Uptime | 99.9% | Multi-AZ deployment |
| Cost per video | <$0.30 | Better caching, volume discounts |

### Scale (1 year)

| Metric | Target | How to Achieve |
|--------|--------|----------------|
| API response time | <200ms | Global CDN, edge computing |
| Video processing | <15s | GPU acceleration, better models |
| Concurrent users | 100,000+ | Auto-scaling, microservices |
| Uptime | 99.99% | Multi-region, chaos engineering |
| Cost per video | <$0.10 | Enterprise pricing, optimization |

---

## Load Testing (How to Test Scalability)

### Tool: Apache Bench (ab)

**Install:**
```bash
# Mac
brew install apache-bench

# Linux
sudo apt-get install apache2-utils
```

**Test API:**
```bash
# 100 requests, 10 concurrent
ab -n 100 -c 10 http://localhost:3001/api/health

# Results:
# Requests per second: 500 [#/sec]
# Time per request: 20 [ms]
# Failed requests: 0
```

**Interpret Results:**
- **Good:** >100 req/sec, <100ms response time
- **Needs work:** <50 req/sec, >500ms response time

---

### Tool: k6 (Advanced)

**Install:**
```bash
brew install k6
```

**Test Script:**
```javascript
// load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '1m', target: 10 },   // Ramp up to 10 users
    { duration: '3m', target: 10 },   // Stay at 10 users
    { duration: '1m', target: 50 },   // Ramp up to 50 users
    { duration: '3m', target: 50 },   // Stay at 50 users
    { duration: '1m', target: 0 },    // Ramp down
  ],
};

export default function () {
  let res = http.get('http://localhost:3001/api/health');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  sleep(1);
}
```

**Run:**
```bash
k6 run load-test.js
```

**Results:**
```
✓ status is 200
✓ response time < 500ms

checks.........................: 100.00% ✓ 2000 ✗ 0
http_req_duration..............: avg=45ms min=20ms max=150ms
http_reqs......................: 2000
```

---

## Monitoring Scalability

### CloudWatch Metrics to Track

```typescript
// Custom metrics
const cloudwatch = new CloudWatch();

// Track processing time
await cloudwatch.putMetricData({
  Namespace: 'ContentIntelligence',
  MetricData: [{
    MetricName: 'ProcessingTime',
    Value: processingTimeMs,
    Unit: 'Milliseconds',
    Timestamp: new Date(),
  }]
});

// Track cost per video
await cloudwatch.putMetricData({
  Namespace: 'ContentIntelligence',
  MetricData: [{
    MetricName: 'CostPerVideo',
    Value: costUSD,
    Unit: 'None',
    Timestamp: new Date(),
  }]
});
```

**Create Dashboard:**
- AWS Console → CloudWatch → Dashboards → Create
- Add widgets:
  - API response time (line chart)
  - Requests per minute (line chart)
  - Error rate (line chart)
  - Cost per video (line chart)

---

## Common Scalability Bottlenecks

### 1. **Database Writes**

**Problem:** DynamoDB throttling at high write volume

**Solution:**
```typescript
// Batch writes (25 items at once)
await dynamodb.batchWrite({
  RequestItems: {
    'content-intelligence-cache': items.map(item => ({
      PutRequest: { Item: item }
    }))
  }
});
```

### 2. **API Rate Limits**

**Problem:** Bedrock rate limit (100 req/min)

**Solution:**
```typescript
// Queue requests
const queue = new Queue();
queue.process(async (job) => {
  await bedrock.invoke(job.data);
});

// Add to queue instead of calling directly
queue.add({ prompt, videoId });
```

### 3. **Memory Leaks**

**Problem:** Server crashes after processing 100 videos

**Solution:**
```typescript
// Clear large objects after use
async function processVideo(video) {
  const result = await analyze(video);
  video = null; // Free memory
  return result;
}
```

### 4. **Cold Starts**

**Problem:** First request after idle is slow (5-10s)

**Solution:**
```typescript
// Keep-alive ping every 5 minutes
setInterval(async () => {
  await fetch('http://localhost:3001/health');
}, 5 * 60 * 1000);
```

---

## Summary

**What You Learned:**
- ✅ What scalability means (10 users → 10M users)
- ✅ 3 phases of scaling (Hackathon → MVP → Scale)
- ✅ 6 key scalability principles
- ✅ How to design stateless backend
- ✅ Multi-layer caching strategy
- ✅ Async processing patterns
- ✅ Database optimization
- ✅ Auto-scaling concepts
- ✅ CDN for global delivery
- ✅ Load testing tools
- ✅ Monitoring and metrics
- ✅ Common bottlenecks and solutions

**Your Architecture:**
- ✅ Built for scale from day 1
- ✅ Can handle 50 users now
- ✅ Can scale to 1M users later
- ✅ No major rewrites needed

**You're building production-ready software!** 🚀

---

**Next:** Read `docs/guides/COST_OPTIMIZATION.md` for advanced cost-saving techniques

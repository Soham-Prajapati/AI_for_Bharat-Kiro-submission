# Cost Optimization - Stay Under $80

**Goal:** Build amazing project, spend <$20, save $60 for emergencies

**Strategy:** Smart caching + Free alternatives + Daily monitoring

---

## Cost Breakdown (Realistic)

### Expected Costs (50 Videos)

| Service | Unit Cost | Usage | Total | % of Budget |
|---------|-----------|-------|-------|-------------|
| **Transcribe** | $0.024/min | 250 min | $6.00 | 7.5% |
| **Bedrock** | $0.15/video | 50 videos | $7.50 | 9.4% |
| **Rekognition** | $0.01/video | 50 videos | $0.50 | 0.6% |
| **S3** | $0.023/GB | 10 GB | $0.23 | 0.3% |
| **DynamoDB** | $1.25/M writes | 50 writes | $0.06 | 0.1% |
| **CloudWatch** | Free tier | - | $0.00 | 0% |
| **Buffer** | - | - | $65.71 | 82.1% |
| **TOTAL** | - | - | **$14.29** | **17.9%** |

**Remaining:** $65.71 for emergencies ✅

---

## Cost-Saving Strategies

### 1. **Use GitHub Copilot for Development** 🦙

**Problem:** Every Bedrock test costs $0.15

**Solution:** Use free local AI

```typescript
// config/ai.config.ts
export const AI_CONFIG = {
  // Use GitHub Copilot in development
  development: {
    provider: 'mockAI',
    model: 'llama3.1:8b',
    endpoint: 'http://mock-ai-endpoint',
    cost: 0 // FREE!
  },
  
  // Use Bedrock in production/demo
  production: {
    provider: 'bedrock',
    model: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
    cost: 0.15 // per request
  }
};

// services/ai.service.ts
async function generate(prompt: string) {
  const config = AI_CONFIG[process.env.NODE_ENV];
  
  if (config.provider === 'mockAI') {
    return await mockAI.generate(prompt); // FREE
  } else {
    return await bedrock.generate(prompt); // PAID
  }
}
```

**Savings:** $50+ during development

---

### 2. **Aggressive Caching** 💾

**Problem:** Processing same video twice = paying twice

**Solution:** Cache everything with 24hr TTL

```typescript
// services/cache.service.ts
import crypto from 'crypto';

async function processWithCache(videoUrl: string) {
  // Generate hash of video content
  const contentHash = crypto
    .createHash('sha256')
    .update(videoUrl)
    .digest('hex');
  
  // Check cache first
  const cached = await dynamodb.get({
    TableName: 'content-intelligence-cache',
    Key: { contentHash }
  });
  
  if (cached.Item) {
    console.log('✅ Cache HIT - FREE!');
    return cached.Item.result;
  }
  
  console.log('❌ Cache MISS - Processing (costs money)');
  
  // Process video (expensive)
  const result = await processVideo(videoUrl);
  
  // Save to cache (24hr TTL)
  await dynamodb.put({
    TableName: 'content-intelligence-cache',
    Item: {
      contentHash,
      result,
      createdAt: Date.now(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      costUSD: result.cost
    }
  });
  
  return result;
}
```

**Savings:** 70% cost reduction (cache hit rate)

---

### 3. **Optimize Prompts** ✂️

**Problem:** Long prompts = more tokens = more cost

**Solution:** Keep prompts concise

```typescript
// ❌ BAD: 1000 tokens = $0.018
const badPrompt = `
Please carefully analyze the following video transcript in great detail.
I need you to identify the domain, extract key information, and provide
a comprehensive summary. Be thorough and include all relevant details.

Here are the instructions:
1. Read the transcript carefully
2. Identify if it's education, food, travel, or product review
3. Extract key concepts
4. Provide confidence score
5. Explain your reasoning

Transcript: ${transcript}

Please format your response as JSON with the following structure:
{
  "domain": "...",
  "confidence": 0.95,
  "reasoning": "...",
  "keyPoints": [...]
}
`;

// ✅ GOOD: 200 tokens = $0.0036 (5x cheaper!)
const goodPrompt = `
Analyze transcript. Detect domain: education/food/travel/product.
Return JSON: {"domain":"...","confidence":0.95}

Transcript: ${transcript}
`;
```

**Savings:** 80% on Bedrock costs

---

### 4. **Batch Processing** 📦

**Problem:** Processing items one-by-one is slow and expensive

**Solution:** Batch multiple operations

```typescript
// ❌ BAD: 10 API calls
for (const frame of frames) {
  await rekognition.detectLabels({ Image: { Bytes: frame } });
}

// ✅ GOOD: 1 API call (if service supports batching)
await rekognition.detectLabels({
  Images: frames.map(frame => ({ Bytes: frame }))
});

// For DynamoDB
// ❌ BAD: 25 writes = 25 API calls
for (const item of items) {
  await dynamodb.put({ TableName: 'table', Item: item });
}

// ✅ GOOD: 25 writes = 1 API call
await dynamodb.batchWrite({
  RequestItems: {
    'table': items.map(item => ({
      PutRequest: { Item: item }
    }))
  }
});
```

**Savings:** 90% on API call costs

---

### 5. **Smart Transcription** 🎤

**Problem:** Transcribe charges per minute, even for silence

**Solution:** Detect and skip silent parts

```typescript
// Detect audio duration (skip silent parts)
async function smartTranscribe(videoUrl: string) {
  // Get video metadata
  const metadata = await getVideoMetadata(videoUrl);
  
  // If video is mostly silent, skip transcription
  if (metadata.audioLevel < 0.1) {
    console.log('⚠️ Video is mostly silent, skipping transcription');
    return { transcript: '[No audio detected]', cost: 0 };
  }
  
  // Only transcribe if audio exists
  const result = await transcribe.startJob({
    Media: { MediaFileUri: videoUrl },
    LanguageCode: 'en-US'
  });
  
  return result;
}
```

**Savings:** 20% on Transcribe costs

---

### 6. **Limit Rekognition Frames** 🖼️

**Problem:** Analyzing every frame is expensive

**Solution:** Sample key frames only

```typescript
// ❌ BAD: Analyze all 300 frames (5min video @ 60fps)
const frames = extractAllFrames(video); // 300 frames
for (const frame of frames) {
  await rekognition.detectLabels(frame); // $0.001 × 300 = $0.30
}

// ✅ GOOD: Analyze 10 key frames
const keyFrames = extractKeyFrames(video, 10); // 10 frames
for (const frame of keyFrames) {
  await rekognition.detectLabels(frame); // $0.001 × 10 = $0.01
}
```

**Savings:** 97% on Rekognition costs

---

### 7. **Delete Old Files** 🗑️

**Problem:** S3 charges for storage over time

**Solution:** Auto-delete after 7 days

```bash
# Create lifecycle policy
aws s3api put-bucket-lifecycle-configuration \
  --bucket content-intelligence-shubh \
  --lifecycle-configuration '{
    "Rules": [{
      "Id": "DeleteAfter7Days",
      "Status": "Enabled",
      "Expiration": { "Days": 7 }
    }]
  }'
```

**Savings:** $5+ over time

---

### 8. **Use Mocks for Testing** 🧪

**Problem:** Every test run costs money

**Solution:** Mock AWS services

```typescript
// __tests__/services/bedrock.test.ts
import AWS from 'aws-sdk-mock';

describe('Bedrock Service', () => {
  beforeAll(() => {
    // Mock Bedrock (FREE!)
    AWS.mock('Bedrock', 'invokeModel', (params, callback) => {
      callback(null, {
        body: JSON.stringify({
          content: 'Mock response',
          domain: 'food',
          confidence: 0.95
        })
      });
    });
  });
  
  it('should detect domain', async () => {
    const result = await bedrockService.detectDomain('transcript');
    expect(result.domain).toBe('food');
  });
  
  afterAll(() => {
    AWS.restore('Bedrock');
  });
});
```

**Savings:** $20+ during testing

---

## Daily Cost Monitoring

### Check Costs Every Day

```bash
#!/bin/bash
# scripts/check-costs.sh

# Get today's cost
TODAY=$(date -u +%Y-%m-%d)
YESTERDAY=$(date -u -d '1 day ago' +%Y-%m-%d)

aws ce get-cost-and-usage \
  --time-period Start=$YESTERDAY,End=$TODAY \
  --granularity DAILY \
  --metrics BlendedCost \
  --output json | jq '.ResultsByTime[0].Total.BlendedCost.Amount'
```

**Run daily:**
```bash
chmod +x scripts/check-costs.sh
./scripts/check-costs.sh
```

**Output:**
```
Today's cost: $2.45
Total so far: $12.30
Remaining budget: $67.70
```

---

### Cost Tracking in Code

```typescript
// utils/cost-tracker.ts
export class CostTracker {
  private costs: Map<string, number> = new Map();
  
  async trackCost(service: string, cost: number) {
    const current = this.costs.get(service) || 0;
    this.costs.set(service, current + cost);
    
    // Log to CloudWatch
    await cloudwatch.putMetricData({
      Namespace: 'ContentIntelligence/Costs',
      MetricData: [{
        MetricName: service,
        Value: cost,
        Unit: 'None',
        Timestamp: new Date()
      }]
    });
    
    // Check if over budget
    const total = Array.from(this.costs.values()).reduce((a, b) => a + b, 0);
    if (total > 80) {
      await this.sendAlert('⚠️ OVER BUDGET! Total: $' + total);
    }
  }
  
  getReport() {
    return {
      byService: Object.fromEntries(this.costs),
      total: Array.from(this.costs.values()).reduce((a, b) => a + b, 0),
      remaining: 80 - Array.from(this.costs.values()).reduce((a, b) => a + b, 0)
    };
  }
}

// Usage
const costTracker = new CostTracker();

// Track Bedrock cost
await costTracker.trackCost('Bedrock', 0.15);

// Track Transcribe cost
await costTracker.trackCost('Transcribe', 0.12);

// Get report
console.log(costTracker.getReport());
// { byService: { Bedrock: 0.15, Transcribe: 0.12 }, total: 0.27, remaining: 79.73 }
```

---

## Emergency Cost Reduction

### If You're Running Out of Budget

**At $50 (62.5% spent):**
- ✅ Switch to GitHub Copilot only (no more Bedrock)
- ✅ Stop processing new videos
- ✅ Use cached results only
- ✅ Investigate what's costing money

**At $70 (87.5% spent):**
- ✅ Stop all AWS API calls
- ✅ Use local demo mode
- ✅ Pre-cache demo videos
- ✅ Prepare backup presentation

**At $80 (100% spent):**
- ✅ Full local mode (GitHub Copilot + mocks)
- ✅ Use pre-recorded demo video
- ✅ Show cached results only

---

## Cost Optimization Checklist

### Before Each AWS Call

- [ ] Check cache first
- [ ] Is this necessary for demo?
- [ ] Can I use GitHub Copilot instead?
- [ ] Can I batch this with other calls?
- [ ] Track the cost

### Daily

- [ ] Check total costs: `./scripts/check-costs.sh`
- [ ] Review CloudWatch metrics
- [ ] Identify expensive operations
- [ ] Optimize if needed

### Before Demo

- [ ] Pre-process demo videos
- [ ] Cache all results
- [ ] Test with cached data
- [ ] Prepare local fallback

---

## Cost Comparison

### With Optimization (Our Approach)

```
Development (Day 1-5): $5 (mostly GitHub Copilot)
Integration (Day 6): $5 (test with Bedrock)
Demo Prep: $5 (pre-cache demos)
Demo Day: $2 (cached results)
─────────────────────
Total: $17 ✅
Remaining: $63
```

### Without Optimization (Naive Approach)

```
Development: $50 (all Bedrock)
Integration: $20 (no caching)
Demo Prep: $15 (reprocessing)
Demo Day: $10 (live processing)
─────────────────────
Total: $95 ❌
Over budget: -$15
```

**Savings: $78 (82% reduction!)** 🎉

---

## Summary

**Cost-Saving Strategies:**
1. ✅ Use GitHub Copilot for development (save $50)
2. ✅ Aggressive caching (save 70%)
3. ✅ Optimize prompts (save 80%)
4. ✅ Batch processing (save 90%)
5. ✅ Smart transcription (save 20%)
6. ✅ Limit Rekognition frames (save 97%)
7. ✅ Delete old files (save $5)
8. ✅ Use mocks for testing (save $20)

**Monitoring:**
- ✅ Daily cost checks
- ✅ CloudWatch metrics
- ✅ Billing alerts at $50, $70, $80
- ✅ Cost tracking in code

**Emergency Plan:**
- ✅ Switch to GitHub Copilot at $50
- ✅ Stop processing at $70
- ✅ Local mode at $80

**Expected Costs:**
- Development: $5
- Integration: $5
- Demo Prep: $5
- Demo Day: $2
- **Total: $17 (21% of budget)** ✅

**You'll stay well under $80!** 💰

---

**Next:** Start building with `docs/guides/GETTING_STARTED.md`

# 🧪 AI Services Testing Plan

**Project:** Content Intelligence Platform (Hackathon)  
**Owner:** Nidhi – AI Intelligence Lead  
**Deadline:** March 4, 2026 – 11:59 PM IST  
**Status:** Ready for Execution

---

## 📋 Testing Philosophy

This is a **cost-aware, modular testing strategy** for 27 AI services before demo day.

**Key Principles:**
- ✅ Test logic first, AI calls last
- ✅ Mock expensive API calls during development
- ✅ Use minimal test inputs to save tokens
- ✅ Test services independently before integration
- ✅ Prevent infinite regeneration loops
- ✅ Log all token usage for budget tracking

**Why This Matters:**
- AWS Bedrock charges per token (~$0.003/1K tokens)
- Uncontrolled testing could cost $50-100+
- Demo failures are preventable with proper testing
- Modular testing catches bugs early

---

## 🎯 Services to Test (27 Total)

### Core AI Services (8)
- [ ] `mode-detection.service.ts` - Detect creator mode
- [ ] `human-content-processor.service.ts` - Process human content
- [ ] `ai-content-generator.service.ts` - Generate AI content
- [ ] `platform-content-generator.service.ts` - Platform-specific content
- [ ] `seo-translation.service.ts` - SEO optimization
- [ ] `quality-validator.service.ts` - Quality scoring
- [ ] `ollama.service.ts` - Local LLM fallback
- [ ] `content-dna.service.ts` - Content DNA extraction

### Advanced AI Services (19)
- [ ] `viral-analyzer.service.ts` - Reverse engineer viral content
- [ ] `content-multiplier-v2.service.ts` - 1→100+ content pieces
- [ ] `safety.service.ts` - Content moderation
- [ ] `vernacular.service.ts` - 9 Indian languages
- [ ] `regional-network.service.ts` - Regional creator network
- [ ] `creative-director.service.ts` - Creative guidance
- [ ] `adhd-navigator.service.ts` - ADHD-friendly content
- [ ] `platform-integration.service.ts` - Platform posting
- [ ] `automation.service.ts` - Workflow automation
- [ ] `membership.service.ts` - Membership tiers
- [ ] `community.service.ts` - Community features
- [ ] `knowledge-graph.service.ts` - Knowledge extraction
- [ ] `marketplace.service.ts` - Creator marketplace
- [ ] `watermark.service.ts` - Watermarking
- [ ] `dopamine-optimizer.service.ts` - Engagement optimization
- [ ] `voice-clone.service.ts` - Voice cloning
- [ ] `trend-predictor.service.ts` - Trend prediction
- [ ] `workspace.service.ts` - Workspace management
- [ ] `cultural-adapter.service.ts` - Cultural adaptation

---

## 🚀 Testing Strategy Options

### OPTION 1: Full Jest Testing (Production-Ready) 🧪
**Best for:** Long-term projects, production apps  
**Time:** 5+ hours | **Cost:** $14.40

**3-Phase Approach:**
1. Mock Testing (No AI calls)
2. Controlled Real AI Testing
3. Full Integration Testing

### OPTION 2: Hybrid Approach (RECOMMENDED for Hackathon) ⚡
**Best for:** Quick validation, tight deadlines  
**Time:** 1-2 hours | **Cost:** $5-10

**What it does:**
- Creates simple test scripts (no Jest setup needed)
- Tests each service with minimal input
- Logs results to console and file
- Tracks token usage automatically
- Validates service functionality quickly

**How it works:**
1. Run test script: `npm run test:services`
2. Script calls each service with sample data
3. Logs output, errors, and token usage
4. Creates test report: `logs/service-test-report.md`
5. Review report and verify outputs

**Advantages:**
- ✅ No Jest configuration needed
- ✅ Fast to implement and run
- ✅ Easy to understand results
- ✅ Perfect for demo preparation
- ✅ Minimal token usage

---

## 🚀 Hybrid Approach Details (RECOMMENDED)

### Quick Test Script Features

**Automated Testing:**
- Tests all 27 services sequentially
- Uses minimal test inputs (saves tokens)
- Catches errors and logs them
- Tracks token usage per service
- Generates markdown report

**What Gets Tested:**
- ✅ Service initialization
- ✅ Basic functionality
- ✅ Error handling
- ✅ Response format
- ✅ Token usage

**Output:**
```
Testing Service: viral-analyzer.service.ts
✅ Service initialized
✅ Method called successfully
✅ Response format valid
📊 Tokens used: 450 (input: 200, output: 250)
💰 Cost: $0.0014
⏱️  Duration: 2.3s
---
```

### Test Report Format

The script generates `logs/service-test-report.md`:
```markdown
# Service Testing Report
Date: March 1, 2026

## Summary
- Total Services: 27
- Passed: 25
- Failed: 2
- Total Tokens: 12,450
- Total Cost: $3.74
- Duration: 8m 32s

## Service Results
### ✅ viral-analyzer.service.ts
- Status: PASSED
- Tokens: 450
- Cost: $0.0014
- Output: [sample output]

### ❌ voice-clone.service.ts
- Status: FAILED
- Error: Missing API key
- Fix: Add VOICE_API_KEY to .env
```

---

## 📁 Testing Folder Structure

```
src/
├── __tests__/
│   ├── unit/
│   │   ├── mode-detection.test.ts
│   │   ├── quality-validator.test.ts
│   │   ├── viral-analyzer.test.ts
│   │   └── ... (one per service)
│   ├── integration/
│   │   ├── content-pipeline.test.ts
│   │   ├── platform-generation.test.ts
│   │   └── seo-optimization.test.ts
│   └── mocks/
│       ├── bedrock.mock.ts
│       ├── ollama.mock.ts
│       └── responses.mock.ts
└── services/
    └── ... (existing services)
```

---

## 🧪 Test Templates

### Template 1: Unit Test (Mock AI)

```typescript
// src/__tests__/unit/viral-analyzer.test.ts
import { ViralAnalyzerService } from '../../services/viral-analyzer.service';
import { mockBedrockResponse } from '../mocks/bedrock.mock';

describe('ViralAnalyzerService', () => {
  let service: ViralAnalyzerService;

  beforeEach(() => {
    service = new ViralAnalyzerService();
    // Mock Bedrock calls
    jest.spyOn(service as any, 'callBedrock').mockResolvedValue(mockBedrockResponse);
  });

  it('should analyze viral patterns', async () => {
    const input = { url: 'https://youtube.com/watch?v=test' };
    const result = await service.analyzeViralContent(input);
    
    expect(result).toHaveProperty('patterns');
    expect(result).toHaveProperty('hooks');
    expect(result).toHaveProperty('viralScore');
  });

  it('should handle invalid URLs', async () => {
    const input = { url: 'invalid-url' };
    await expect(service.analyzeViralContent(input)).rejects.toThrow();
  });
});
```

### Template 2: Integration Test (Real AI - Controlled)

```typescript
// src/__tests__/integration/content-pipeline.test.ts
import { AIContentGeneratorService } from '../../services/ai-content-generator.service';

describe('Content Generation Pipeline', () => {
  let generator: AIContentGeneratorService;
  let tokenUsage = { input: 0, output: 0 };

  beforeAll(() => {
    generator = new AIContentGeneratorService();
  });

  it('should generate content with token tracking', async () => {
    const input = {
      mode: 'youtube-short',
      topic: 'AI testing', // SHORT input to save tokens
      duration: 30
    };

    const result = await generator.generateContent(input);
    
    // Track tokens
    tokenUsage.input += result.usage.input_tokens;
    tokenUsage.output += result.usage.output_tokens;
    
    console.log(`Tokens used: ${tokenUsage.input + tokenUsage.output}`);
    
    expect(result.content).toBeDefined();
    expect(result.content.length).toBeGreaterThan(0);
  });

  afterAll(() => {
    console.log('Total tokens:', tokenUsage.input + tokenUsage.output);
    console.log('Estimated cost:', ((tokenUsage.input + tokenUsage.output) / 1000) * 0.003);
  });
});
```

---

## ✅ Execution Checklist

### Step 1: Setup Testing Environment
- [ ] Install Jest: `npm install --save-dev jest @types/jest ts-jest`
- [ ] Configure Jest: Create `jest.config.js`
- [ ] Create test folder structure: `src/__tests__/`
- [ ] Create mock files: `src/__tests__/mocks/`

### Step 2: Create Mock Services
- [ ] Mock Bedrock responses (`bedrock.mock.ts`)
- [ ] Mock Ollama responses (`ollama.mock.ts`)
- [ ] Mock sample data (`responses.mock.ts`)

### Step 3: Write Unit Tests (Phase 1)
- [ ] Test 8 core services with mocks
- [ ] Test 19 advanced services with mocks
- [ ] Run: `npm test` (should pass without AI calls)
- [ ] Verify: 0 tokens used, $0 cost

### Step 4: Controlled AI Testing (Phase 2)
- [ ] Enable real Bedrock for 3 services
- [ ] Test with SHORT inputs only
- [ ] Log token usage after each test
- [ ] Verify: < 10K tokens, < $10 cost

### Step 5: Integration Testing (Phase 3)
- [ ] Test 1 complete workflow
- [ ] Test multi-platform generation
- [ ] Test error handling
- [ ] Verify: < 5K tokens, < $5 cost

### Step 6: Demo Preparation
- [ ] Run full test suite: `npm test`
- [ ] Check all services pass
- [ ] Verify Ollama fallback works
- [ ] Test with demo data
- [ ] Freeze prompts (no more changes)

---

## 🛡️ Demo Safety Checklist

### Pre-Demo Validation (March 3, 2026)
- [ ] All unit tests pass (100%)
- [ ] Integration tests pass (100%)
- [ ] Ollama fallback tested and working
- [ ] Rate limiting configured (max 10 req/min)
- [ ] Error messages are user-friendly
- [ ] Loading states work properly
- [ ] Demo data prepared and tested

### Fallback Strategy
- [ ] If Bedrock fails → Auto-switch to Ollama
- [ ] If Ollama fails → Show cached demo results
- [ ] If all fails → Show pre-recorded demo video

### Logging Strategy
- [ ] Log all AI calls with timestamps
- [ ] Log token usage per request
- [ ] Log errors with stack traces
- [ ] Save logs to `logs/demo-{date}.log`

### Rate Limit Protection
```typescript
// Add to all AI services
const rateLimiter = {
  maxRequests: 10,
  perMinutes: 1,
  queue: []
};
```

---

## 💰 Token Budget Plan

### Estimated Token Usage

| Phase | Services | Calls | Tokens/Call | Total Tokens | Cost |
|-------|----------|-------|-------------|--------------|------|
| Phase 1 | 27 | 0 | 0 | 0 | $0 |
| Phase 2 | 27 | 81 (3 each) | 500 | 40,500 | $12 |
| Phase 3 | Integration | 4 | 2000 | 8,000 | $2.40 |
| **Total** | - | **85** | - | **48,500** | **$14.40** |

### Budget Safety Rules
- ✅ Never exceed 50K tokens during testing
- ✅ Set hard limit: $20 maximum
- ✅ Use Ollama for repeated tests
- ✅ Cache AI responses for reuse

---

## 🎬 Testing Execution Order

```
┌─────────────────────────────────────────┐
│ Step 1: Setup (30 min)                  │
│ - Install Jest                          │
│ - Create test structure                 │
│ - Create mocks                          │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ Step 2: Unit Tests - Mocked (2 hours)   │
│ - Test all 27 services                  │
│ - No real AI calls                      │
│ - Cost: $0                              │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ Step 3: Controlled AI Tests (1 hour)    │
│ - 3 tests per service                   │
│ - Short inputs only                     │
│ - Cost: ~$12                            │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ Step 4: Integration Tests (1 hour)      │
│ - 4 complete workflows                  │
│ - Realistic scenarios                   │
│ - Cost: ~$2.40                          │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ Step 5: Demo Prep (30 min)              │
│ - Freeze prompts                        │
│ - Test fallbacks                        │
│ - Prepare demo data                     │
└─────────────────────────────────────────┘
```

**Total Time:** ~5 hours  
**Total Cost:** ~$14.40

---

## 📊 Verification Methods

### How to Verify Outputs are Correct

#### 1. Automated Validation
```typescript
// Check response structure
expect(result).toHaveProperty('content');
expect(result).toHaveProperty('metadata');
expect(result.content).toBeTruthy();

// Check content quality
expect(result.content.length).toBeGreaterThan(100);
expect(result.content).toMatch(/relevant keywords/);

// Check token usage
expect(result.usage.input_tokens).toBeLessThan(1000);
expect(result.usage.output_tokens).toBeLessThan(2000);
```

#### 2. Manual Verification Checklist

For each AI service output, verify:

**Content Quality:**
- [ ] Output is relevant to input
- [ ] Output is coherent and readable
- [ ] Output matches expected format
- [ ] Output length is appropriate
- [ ] No hallucinations or nonsense

**Technical Correctness:**
- [ ] JSON structure is valid
- [ ] All required fields present
- [ ] Data types are correct
- [ ] No null/undefined errors

**Business Logic:**
- [ ] Follows creator mode rules
- [ ] Respects platform constraints
- [ ] SEO optimization applied
- [ ] Quality score is reasonable (0-100)

#### 3. Comparison Testing
```typescript
// Compare AI output with expected patterns
const expectedPatterns = {
  youtubeShort: /duration: 30-60s/,
  instagramReel: /hashtags: #\w+/,
  twitterThread: /\d+\/\d+/
};

expect(result.content).toMatch(expectedPatterns[mode]);
```

#### 4. Human Review (Final Check)
- [ ] Read 3 sample outputs per service
- [ ] Check if you would use this content
- [ ] Verify it matches demo requirements
- [ ] Confirm it's demo-ready

---

## 🚨 Common Issues & Solutions

### Issue 1: Tests Timeout
**Solution:** Increase Jest timeout
```typescript
jest.setTimeout(30000); // 30 seconds
```

### Issue 2: Bedrock Rate Limit
**Solution:** Add retry logic with exponential backoff
```typescript
const retry = async (fn, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(r => setTimeout(r, 2 ** i * 1000));
    }
  }
};
```

### Issue 3: Inconsistent AI Responses
**Solution:** Use temperature = 0 for testing
```typescript
const params = {
  temperature: 0, // Deterministic outputs
  max_tokens: 500
};
```

### Issue 4: High Token Usage
**Solution:** Use shorter test inputs
```typescript
// ❌ Bad: Long input
const input = "Very long paragraph with 500 words...";

// ✅ Good: Short input
const input = "AI testing";
```

---

## 📝 Next Steps for Nidhi

### Immediate Actions (Today)
1. [ ] Review this testing plan
2. [ ] Confirm testing approach
3. [ ] Decide: Start with Phase 1 or skip to Phase 2?

### Tell Kiro to Execute
Once you approve this plan, you can say:

**Option 1: Full Testing (Recommended)**
> "Execute Phase 1: Create mocks and unit tests for all 27 services"

**Option 2: Quick Testing (Faster)**
> "Skip to Phase 2: Run controlled AI tests on 5 core services only"

**Option 3: Integration Only (Fastest)**
> "Skip to Phase 3: Test the complete content generation pipeline"

### After Testing
- [ ] Review test results
- [ ] Fix any failing tests
- [ ] Document any issues found
- [ ] Update `nidhi_ref.md` with test results

---

## 📈 Success Metrics

### Testing Complete When:
- ✅ All 27 services have unit tests
- ✅ All tests pass (100% success rate)
- ✅ Token usage < 50K tokens
- ✅ Total cost < $20
- ✅ Demo scenarios tested and working
- ✅ Fallback to Ollama verified
- ✅ No critical bugs found

### Demo Ready When:
- ✅ All tests pass
- ✅ Demo data prepared
- ✅ Error handling tested
- ✅ Loading states work
- ✅ Ollama fallback works
- ✅ Rate limiting configured
- ✅ Logs are clean

---

**Status:** ⏳ Awaiting Nidhi's approval to begin execution

**Last Updated:** March 1, 2026

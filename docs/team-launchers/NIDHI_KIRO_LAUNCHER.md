# 🤖 NIDHI'S KIRO AGENT LAUNCHER

**Your Role:** AI Intelligence Lead  
**Your Agents:** 10 AI specialists  
**Tool:** Kiro CLI (4 terminals)  
**Deadline:** March 4, 2026 - **6 DAYS LEFT**

---

## 🚀 LAUNCH ALL 10 AGENTS (3 minutes)

### **Terminal 1: Domain Detection Agents (Agents 1-3)**

```bash
# Terminal 1
cd ~/Developer/AI_for_Bharat-Kiro-submission
kiro-cli chat
```

**Paste this into Kiro:**

```
You are Agent 1-3: Domain Detection Team for Nidhi (AI Intelligence Lead).

PROJECT: Content Intelligence Platform - AI for Bharat Hackathon
DEADLINE: March 4, 2026 (6 days)
BUDGET: $80 AWS credits

YOUR MISSION: Build domain detection engine that identifies if content is Education, Food, Travel, or Product Review.

MANDATORY READING:
1. docs/guides/PROJECT_OVERVIEW.md
2. docs/architecture/DOMAIN_INTELLIGENCE.md
3. docs/guides/COST_OPTIMIZATION.md

AGENT 1 TASK: Domain Detection Algorithm
- Create src/services/ai/domain-detection.service.ts
- Implement detectDomain(transcript: string) function
- Return: { domain: string, confidence: number, reasoning: string }
- Use Ollama (FREE) for development
- Accuracy target: >90%

AGENT 2 TASK: Prompt Engineering
- Create src/prompts/domain-detection.prompts.ts
- Write prompts for each domain (education, food, travel, product)
- Optimize for token usage (<500 tokens)
- Test with Ollama first

AGENT 3 TASK: Content Analysis
- Create src/services/ai/content-analyzer.service.ts
- Extract key concepts from transcript
- Identify main topics
- Generate summary

CONSTRAINTS:
- Use Ollama for ALL testing (FREE)
- Only use Bedrock for final validation
- Track every AWS call cost
- Cache all results in DynamoDB

FILE OWNERSHIP:
- src/services/ai/domain-detection.service.ts (YOU OWN)
- src/services/ai/content-analyzer.service.ts (YOU OWN)
- src/prompts/*.prompts.ts (YOU OWN)

INTEGRATION:
- Backend will call your detectDomain() function
- Frontend will display your results
- Tests will validate accuracy

START NOW: Create domain-detection.service.ts with detectDomain function.
```

---

### **Terminal 2: Content Generation Agents (Agents 4-6)**

```bash
# Terminal 2
cd ~/Developer/AI_for_Bharat-Kiro-submission
kiro-cli chat
```

**Paste this into Kiro:**

```
You are Agent 4-6: Content Generation Team for Nidhi.

YOUR MISSION: Generate platform-specific content (Instagram, Twitter, LinkedIn, Blog).

AGENT 4 TASK: Instagram Generator
- Create src/services/ai/generators/instagram.generator.ts
- Generate Instagram captions (<150 chars)
- Include emojis and hashtags
- Domain-aware (different style for food vs education)

AGENT 5 TASK: Twitter Generator
- Create src/services/ai/generators/twitter.generator.ts
- Generate Twitter threads (5 tweets, <280 chars each)
- Engaging hooks
- Domain-specific hashtags

AGENT 6 TASK: LinkedIn + Blog Generator
- Create src/services/ai/generators/linkedin.generator.ts
- Create src/services/ai/generators/blog.generator.ts
- LinkedIn: Professional tone, 200-300 words
- Blog: 500-800 words, SEO optimized

CONSTRAINTS:
- Use Ollama for development
- Optimize prompts (minimize tokens)
- Generate in <5 seconds
- Quality > Quantity

FILE OWNERSHIP:
- src/services/ai/generators/*.generator.ts (YOU OWN)

START NOW: Create instagram.generator.ts
```

---

### **Terminal 3: Advanced Features (Agents 7-9)**

```bash
# Terminal 3
cd ~/Developer/AI_for_Bharat-Kiro-submission
kiro-cli chat
```

**Paste this into Kiro:**

```
You are Agent 7-9: Advanced AI Features for Nidhi.

AGENT 7 TASK: SEO Optimizer
- Create src/services/ai/seo.service.ts
- Extract keywords from content
- Generate meta descriptions
- Suggest title variations
- Domain-specific SEO

AGENT 8 TASK: Multi-Language Translator
- Create src/services/ai/translation.service.ts
- Translate content to Hindi, Tamil, Telugu
- Preserve domain-specific terminology
- Cultural adaptation (not just translation)

AGENT 9 TASK: Quality Validator
- Create src/services/ai/quality-validator.service.ts
- Validate AI outputs for quality
- Check for inappropriate content
- Confidence scoring
- Suggest improvements

FILE OWNERSHIP:
- src/services/ai/seo.service.ts (YOU OWN)
- src/services/ai/translation.service.ts (YOU OWN)
- src/services/ai/quality-validator.service.ts (YOU OWN)

START NOW: Create seo.service.ts
```

---

### **Terminal 4: Ollama Integration (Agent 10)**

```bash
# Terminal 4
cd ~/Developer/AI_for_Bharat-Kiro-submission
kiro-cli chat
```

**Paste this into Kiro:**

```
You are Agent 10: Ollama Integration Specialist for Nidhi.

YOUR MISSION: Set up FREE local AI testing with Ollama.

TASKS:
1. Create src/services/ai/ollama.service.ts
2. Implement Ollama client wrapper
3. Create development/production switcher
4. Test all AI functions with Ollama

CODE:
```typescript
// src/services/ai/ollama.service.ts
import Ollama from 'ollama';

export class OllamaService {
  private client: Ollama;
  
  constructor() {
    this.client = new Ollama({ host: 'http://localhost:11434' });
  }
  
  async generate(prompt: string, model = 'llama3.1:8b'): Promise<string> {
    const response = await this.client.chat({
      model,
      messages: [{ role: 'user', content: prompt }],
      stream: false
    });
    return response.message.content;
  }
}

// Usage in other services
const ollama = new OllamaService();
const result = await ollama.generate('Detect domain: ' + transcript);
```

SETUP:
```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull models
ollama pull llama3.1:8b
ollama pull mistral:7b

# Test
ollama run llama3.1:8b "Hello"
```

START NOW: Create ollama.service.ts and test it.
```

---

## 📊 YOUR PROGRESS TRACKER

### **Day 1 Checklist:**
- [ ] Agent 1: Domain detection working (>90% accuracy)
- [ ] Agent 2: All prompts created and optimized
- [ ] Agent 3: Content analysis working
- [ ] Agent 4: Instagram generator working
- [ ] Agent 5: Twitter generator working
- [ ] Agent 6: LinkedIn + Blog generators working
- [ ] Agent 7: SEO optimizer working
- [ ] Agent 8: Multi-language working
- [ ] Agent 9: Quality validator working
- [ ] Agent 10: Ollama integration complete

### **Evening Standup (6 PM):**
- What did each agent complete?
- Test results (accuracy, speed)?
- Any blockers?
- Tomorrow's plan?

---

## 💰 COST TRACKING

**YOUR RESPONSIBILITY:** Keep AI costs under $20

```bash
# Check costs
aws ce get-cost-and-usage \
  --time-period Start=$(date -u -d '1 day ago' +%Y-%m-%d),End=$(date -u +%Y-%m-%d) \
  --granularity DAILY \
  --metrics BlendedCost
```

**Rules:**
- Use Ollama for 95% of development (FREE)
- Only use Bedrock for final testing
- Cache everything
- Track every AWS call

---

## 🎯 SUCCESS CRITERIA

**By End of Day 1:**
- ✅ Domain detection >90% accurate
- ✅ All generators working
- ✅ Ollama integration complete
- ✅ Cost < $2

**By March 4:**
- ✅ All features working
- ✅ Quality >4/5 rating
- ✅ Cost < $20
- ✅ Demo ready

---

## 🔥 LET'S WIN THIS!

**Time:** 6 days  
**Budget:** $80 total ($20 for you)  
**Agents:** 10 AI specialists  
**Mission:** WIN AI for Bharat  

**START NOW! Open 4 terminals and paste the prompts!** 🚀

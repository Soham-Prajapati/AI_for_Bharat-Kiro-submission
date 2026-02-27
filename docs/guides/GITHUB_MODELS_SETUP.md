# 🚀 GitHub Models Setup Guide

**Last Updated:** Feb 26, 2026, 11:45 PM

---

## ✅ Why GitHub Models?

**FREE access to:**
- ✅ **GPT-4o** - Best for general content generation
- ✅ **Claude 3.5 Sonnet** - Best for coding and analysis
- ✅ **o1-mini** - Best for reasoning tasks

**vs GitHub Copilot:**
- Better quality outputs
- Faster responses
- No local setup needed
- Same cost: $0!

---

## 🔑 Setup (5 minutes)

### **Step 1: Get GitHub Token**

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name: `Content Intelligence Platform`
4. Select scopes:
   - ✅ `repo` (Full control of private repositories)
5. Click "Generate token"
6. **Copy the token** (you won't see it again!)

### **Step 2: Add to .env**

```bash
# Copy example
cp .env.example .env

# Edit .env
nano .env
```

Add your token:
```bash
GITHUB_TOKEN=ghp_your_token_here
```

### **Step 3: Test It**

```bash
# Install dependencies
npm install

# Test the service
node -e "
const { GitHubModelsService } = require('./src/services/github-models.service');
const service = new GitHubModelsService();
service.generate('Say hello!').then(console.log);
"
```

---

## 📝 Usage Examples

### **Basic Generation**

```typescript
import { GitHubModelsService } from './services/github-models.service';

const github = new GitHubModelsService();

// Simple generation
const response = await github.generate('Write a tweet about AI');

// With options
const response = await github.generate('Explain quantum computing', {
  model: 'gpt-4o',
  temperature: 0.7,
  maxTokens: 500
});
```

### **Streaming Generation**

```typescript
// Stream responses in real-time
for await (const chunk of github.streamGenerate('Write a blog post about AI')) {
  process.stdout.write(chunk);
}
```

### **With Context**

```typescript
const messages = [
  { role: 'system', content: 'You are a helpful assistant' },
  { role: 'user', content: 'What is AI?' },
  { role: 'assistant', content: 'AI is...' },
  { role: 'user', content: 'Tell me more' }
];

const response = await github.generateWithContext(messages);
```

---

## 🎯 Available Models

| Model | Best For | Speed | Quality |
|-------|----------|-------|---------|
| **gpt-4o** | General content, social media | Fast | Excellent |
| **claude-3.5-sonnet** | Code, analysis, long content | Fast | Excellent |
| **o1-mini** | Complex reasoning, math | Slower | Best |

**Default:** `gpt-4o` (best balance)

---

## 💰 Cost Comparison

| Service | Cost | Quality | Setup |
|---------|------|---------|-------|
| **GitHub Models** | $0 | ⭐⭐⭐⭐⭐ | Easy |
| **GitHub Copilot** | $0 | ⭐⭐⭐ | Complex |
| **AWS Bedrock** | $0.15/req | ⭐⭐⭐⭐⭐ | Medium |

**Winner:** GitHub Models! 🏆

---

## 🔧 Integration

### **Domain Detection**

```typescript
import { DomainDetectionService } from './services/domain-detection.service';

const detector = new DomainDetectionService();

// Detect domain
const result = await detector.detectDomain(transcript);
// { domain: 'Food & Cooking', confidence: 0.95, keywords: [...] }

// Extract keywords
const keywords = await detector.extractKeywords(transcript, 10);

// Analyze sentiment
const sentiment = await detector.analyzeSentiment(transcript);
// { sentiment: 'positive', score: 0.8 }
```

### **Content Generation**

```typescript
import { ContentGenerationService } from './services/content-generation.service';

const generator = new ContentGenerationService();

// Generate for single platform
const content = await generator.generateForPlatform({
  transcript: 'Your video transcript...',
  platform: 'youtube-short',
  domain: 'Food & Cooking',
  keywords: ['recipe', 'cooking', 'easy']
});

// Generate for multiple platforms
const allContent = await generator.generateMultiple(
  { transcript, domain, keywords },
  ['youtube-short', 'instagram-reel', 'tiktok', 'twitter-thread']
);

// Stream generation
for await (const chunk of generator.streamGenerate({ transcript, platform: 'blog-post', domain, keywords })) {
  console.log(chunk);
}
```

---

## 🚨 Troubleshooting

### **Error: GITHUB_TOKEN not found**

```bash
# Check .env file exists
ls -la .env

# Check token is set
cat .env | grep GITHUB_TOKEN
```

### **Error: 401 Unauthorized**

- Token expired or invalid
- Generate new token at: https://github.com/settings/tokens
- Make sure `repo` scope is selected

### **Error: Rate limit exceeded**

- GitHub Models has rate limits
- Wait a few minutes
- Use caching to reduce requests

---

## 📊 Rate Limits

**GitHub Models (Free):**
- ~60 requests per hour per token
- ~1000 requests per day
- Resets every hour

**Tips:**
- Cache results in DynamoDB
- Batch requests when possible
- Use streaming for long content

---

## ✅ You're Ready!

**Services created:**
- ✅ `github-models.service.ts` - Core API client
- ✅ `domain-detection.service.ts` - Domain & sentiment analysis
- ✅ `content-generation.service.ts` - Multi-platform generation

**Next steps:**
1. Get GitHub token
2. Add to .env
3. Test with: `npm run dev`
4. Start building! 🚀

---

**Cost: $0 | Quality: ⭐⭐⭐⭐⭐ | Setup: 5 minutes**

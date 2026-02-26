# 🔌 Integration Guide

**How to integrate Content Intelligence Platform into your app**

---

## Quick Start (5 minutes)

### 1. Get API Key

```bash
# Sign up at https://content-ai.example.com
# Go to Settings → API Keys
# Copy your API key
```

### 2. Install SDK

**JavaScript/Node.js:**
```bash
npm install @content-ai/sdk
```

**Python:**
```bash
pip install content-ai
```

**cURL (no SDK needed):**
```bash
# Just use curl commands
```

### 3. Make First Request

**JavaScript:**
```javascript
const ContentAI = require('@content-ai/sdk');

const client = new ContentAI({
  apiKey: 'your_api_key_here'
});

const result = await client.upload({
  file: './video.mp4',
  type: 'video'
});

console.log(result.id); // content_abc123
```

**Python:**
```python
from content_ai import Client

client = Client(api_key='your_api_key_here')

result = client.upload(
    file='./video.mp4',
    type='video'
)

print(result.id)  # content_abc123
```

**cURL:**
```bash
curl -X POST https://api.content-ai.example.com/api/upload \
  -H "Authorization: Bearer your_api_key_here" \
  -F "file=@video.mp4" \
  -F "type=video"
```

---

## Complete Integration Flow

### Step 1: Upload Content

```javascript
const upload = await client.upload({
  file: './cooking-video.mp4',
  type: 'video',
  metadata: {
    title: 'Butter Chicken Recipe',
    domain: 'food'
  }
});

console.log(upload.id); // content_abc123
console.log(upload.status); // 'processing'
```

### Step 2: Wait for Processing

**Option A: Polling**
```javascript
async function waitForProcessing(contentId) {
  while (true) {
    const content = await client.getContent(contentId);
    
    if (content.status === 'completed') {
      return content;
    }
    
    if (content.status === 'failed') {
      throw new Error('Processing failed');
    }
    
    // Wait 2 seconds before checking again
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

const content = await waitForProcessing(upload.id);
```

**Option B: Webhooks (Recommended)**
```javascript
// Set webhook URL in dashboard
// We'll POST to your URL when processing completes

// Your webhook endpoint:
app.post('/webhooks/content-ai', (req, res) => {
  const { contentId, status, results } = req.body;
  
  if (status === 'completed') {
    console.log('Processing complete!', results);
    // Update your database, notify user, etc.
  }
  
  res.status(200).send('OK');
});
```

### Step 3: Get Analysis Results

```javascript
const analysis = await client.getAnalysis(content.id);

console.log(analysis.summary);
console.log(analysis.keywords);
console.log(analysis.domain); // 'food'
console.log(analysis.sentiment); // 'positive'
```

### Step 4: Generate Platform-Specific Content

```javascript
const outputs = await client.generate({
  contentId: content.id,
  platforms: ['youtube_short', 'instagram_reel', 'twitter_thread']
});

console.log(outputs.youtube_short);
console.log(outputs.instagram_reel);
console.log(outputs.twitter_thread);
```

---

## SDK Reference

### JavaScript/Node.js

**Installation:**
```bash
npm install @content-ai/sdk
```

**Initialization:**
```javascript
const ContentAI = require('@content-ai/sdk');

const client = new ContentAI({
  apiKey: 'your_api_key',
  baseURL: 'https://api.content-ai.example.com', // optional
  timeout: 30000 // optional, default 30s
});
```

**Methods:**

```javascript
// Upload content
await client.upload({ file, type, metadata })

// Get content details
await client.getContent(contentId)

// Get analysis results
await client.getAnalysis(contentId)

// Generate outputs
await client.generate({ contentId, platforms })

// List user's content
await client.listContent({ page, limit })

// Delete content
await client.deleteContent(contentId)
```

---

### Python

**Installation:**
```bash
pip install content-ai
```

**Initialization:**
```python
from content_ai import Client

client = Client(
    api_key='your_api_key',
    base_url='https://api.content-ai.example.com',  # optional
    timeout=30  # optional, default 30s
)
```

**Methods:**

```python
# Upload content
client.upload(file='path/to/file', type='video', metadata={})

# Get content details
client.get_content(content_id)

# Get analysis results
client.get_analysis(content_id)

# Generate outputs
client.generate(content_id=id, platforms=['youtube_short'])

# List user's content
client.list_content(page=1, limit=10)

# Delete content
client.delete_content(content_id)
```

---

## Webhooks

### Setup

1. Go to Settings → Webhooks
2. Add webhook URL: `https://your-app.com/webhooks/content-ai`
3. Select events: `content.completed`, `content.failed`
4. Save

### Webhook Payload

```json
{
  "event": "content.completed",
  "contentId": "content_abc123",
  "status": "completed",
  "timestamp": "2026-02-26T21:00:00Z",
  "data": {
    "analysis": {
      "summary": "...",
      "keywords": ["..."],
      "domain": "food"
    },
    "outputs": {
      "youtube_short": "...",
      "instagram_reel": "..."
    }
  }
}
```

### Verify Webhook Signature

```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}

app.post('/webhooks/content-ai', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const payload = JSON.stringify(req.body);
  
  if (!verifyWebhook(payload, signature, process.env.WEBHOOK_SECRET)) {
    return res.status(401).send('Invalid signature');
  }
  
  // Process webhook
  res.status(200).send('OK');
});
```

---

## Error Handling

### Common Errors

```javascript
try {
  const result = await client.upload({ file: 'video.mp4' });
} catch (error) {
  if (error.code === 'FILE_TOO_LARGE') {
    console.error('File exceeds 500MB limit');
  } else if (error.code === 'INVALID_FORMAT') {
    console.error('Unsupported file format');
  } else if (error.code === 'RATE_LIMIT_EXCEEDED') {
    console.error('Too many requests. Wait and retry.');
  } else if (error.code === 'UNAUTHORIZED') {
    console.error('Invalid API key');
  } else {
    console.error('Unknown error:', error.message);
  }
}
```

### Retry Logic

```javascript
async function uploadWithRetry(file, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await client.upload({ file });
    } catch (error) {
      if (error.code === 'RATE_LIMIT_EXCEEDED' && i < maxRetries - 1) {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
        continue;
      }
      throw error;
    }
  }
}
```

---

## Rate Limits

**Free Tier:**
- 100 requests/hour
- 10 uploads/day
- 500MB max file size

**Pro Tier ($29/month):**
- 1000 requests/hour
- Unlimited uploads
- 2GB max file size

**Enterprise:**
- Custom limits
- Dedicated infrastructure
- SLA guarantees

### Check Rate Limit

```javascript
const response = await client.upload({ file: 'video.mp4' });

console.log(response.headers['x-ratelimit-limit']); // 100
console.log(response.headers['x-ratelimit-remaining']); // 95
console.log(response.headers['x-ratelimit-reset']); // 1709067600
```

---

## Best Practices

### 1. Use Webhooks (Not Polling)

**❌ Bad:**
```javascript
// Polling wastes API calls
while (true) {
  const content = await client.getContent(id);
  if (content.status === 'completed') break;
  await sleep(2000);
}
```

**✅ Good:**
```javascript
// Webhooks are instant and free
app.post('/webhooks/content-ai', (req, res) => {
  const { contentId, status } = req.body;
  if (status === 'completed') {
    // Process results
  }
});
```

### 2. Handle Errors Gracefully

```javascript
try {
  await client.upload({ file });
} catch (error) {
  // Log error
  logger.error('Upload failed', { error, file });
  
  // Show user-friendly message
  showError('Upload failed. Please try again.');
  
  // Retry if appropriate
  if (error.code === 'RATE_LIMIT_EXCEEDED') {
    setTimeout(() => retry(), 5000);
  }
}
```

### 3. Cache Results

```javascript
// Cache analysis results to avoid re-processing
const cache = new Map();

async function getAnalysis(contentId) {
  if (cache.has(contentId)) {
    return cache.get(contentId);
  }
  
  const analysis = await client.getAnalysis(contentId);
  cache.set(contentId, analysis);
  return analysis;
}
```

### 4. Use Streaming for Large Files

```javascript
const fs = require('fs');

// Stream large files instead of loading into memory
await client.uploadStream(
  fs.createReadStream('./large-video.mp4'),
  {
    type: 'video',
    onProgress: (percent) => console.log(`${percent}%`)
  }
);
```

---

## Examples

### Example 1: Content Creator Dashboard

```javascript
// Upload video
const upload = await client.upload({
  file: req.file.path,
  type: 'video',
  metadata: { title: req.body.title }
});

// Save to database
await db.content.create({
  id: upload.id,
  userId: req.user.id,
  status: 'processing'
});

// Return to user
res.json({ contentId: upload.id });

// Webhook will notify when complete
```

### Example 2: Batch Processing

```javascript
const files = ['video1.mp4', 'video2.mp4', 'video3.mp4'];

// Upload all in parallel
const uploads = await Promise.all(
  files.map(file => client.upload({ file, type: 'video' }))
);

console.log(`Uploaded ${uploads.length} videos`);
```

### Example 3: Custom Domain

```javascript
// Upload with custom domain
const upload = await client.upload({
  file: 'real-estate-tour.mp4',
  type: 'video',
  metadata: {
    domain: 'real-estate',
    customFields: {
      propertyType: 'apartment',
      price: 500000,
      location: 'New York'
    }
  }
});
```

---

## Support

**Documentation:** https://docs.content-ai.example.com  
**API Status:** https://status.content-ai.example.com  
**Support Email:** support@content-ai.example.com  
**Discord:** https://discord.gg/content-ai

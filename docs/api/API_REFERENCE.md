# 📚 API Reference

**Complete REST API documentation for Content Intelligence Platform**

---

## Base URL

```
Production: https://api.content-ai.example.com
Development: http://localhost:3000
```

---

## Authentication

**Method:** JWT Bearer Token

**Header:**
```
Authorization: Bearer YOUR_API_KEY
```

**Get API Key:**
1. Sign up at https://content-ai.example.com
2. Go to Settings → API Keys
3. Click "Generate New Key"

---

## Rate Limits

| Tier | Requests/Hour | Requests/Minute |
|------|---------------|-----------------|
| Free | 100 | 10 |
| Pro | 1000 | 100 |
| Enterprise | Custom | Custom |

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1709067600
```

---

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 400 | Bad Request | Invalid parameters |
| 401 | Unauthorized | Invalid/missing API key |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 413 | Payload Too Large | File exceeds size limit |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Temporary outage |

**Error Response:**
```json
{
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "File exceeds maximum size of 500MB",
    "details": {
      "maxSize": 524288000,
      "actualSize": 600000000
    }
  }
}
```

---

## Endpoints

### 1. Upload Content

**POST** `/api/upload`

Upload video, audio, or text content for analysis.

**Request:**
```bash
curl -X POST https://api.content-ai.example.com/api/upload \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F "file=@video.mp4" \
  -F "type=video" \
  -F "metadata={\"title\":\"My Video\",\"domain\":\"food\"}"
```

**Parameters:**
- `file` (required) - File to upload
- `type` (required) - `video`, `audio`, or `text`
- `metadata` (optional) - JSON object with title, domain, etc.

**Response (200):**
```json
{
  "id": "content_abc123",
  "status": "processing",
  "url": "https://cdn.content-ai.example.com/content_abc123",
  "createdAt": "2026-02-26T22:00:00Z",
  "estimatedTime": 45
}
```

---

### 2. Get Content

**GET** `/api/content/:id`

Get content details and status.

**Request:**
```bash
curl https://api.content-ai.example.com/api/content/content_abc123 \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Response (200):**
```json
{
  "id": "content_abc123",
  "type": "video",
  "status": "completed",
  "url": "https://cdn.content-ai.example.com/content_abc123",
  "metadata": {
    "title": "My Video",
    "domain": "food",
    "duration": 180,
    "size": 52428800
  },
  "createdAt": "2026-02-26T22:00:00Z",
  "completedAt": "2026-02-26T22:01:00Z"
}
```

**Status Values:**
- `uploading` - File upload in progress
- `processing` - AI analysis in progress
- `completed` - Analysis complete
- `failed` - Processing failed

---

### 3. Analyze Content

**POST** `/api/analyze`

Trigger AI analysis on uploaded content.

**Request:**
```bash
curl -X POST https://api.content-ai.example.com/api/analyze \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contentId": "content_abc123",
    "options": {
      "domain": "food",
      "language": "en"
    }
  }'
```

**Parameters:**
- `contentId` (required) - Content ID from upload
- `options.domain` (optional) - Force specific domain
- `options.language` (optional) - Content language

**Response (200):**
```json
{
  "analysisId": "analysis_xyz789",
  "status": "processing",
  "estimatedTime": 30
}
```

---

### 4. Get Analysis Results

**GET** `/api/analysis/:id`

Get AI analysis results.

**Request:**
```bash
curl https://api.content-ai.example.com/api/analysis/analysis_xyz789 \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Response (200):**
```json
{
  "id": "analysis_xyz789",
  "contentId": "content_abc123",
  "status": "completed",
  "results": {
    "summary": "A cooking tutorial showing how to make butter chicken...",
    "keywords": ["butter chicken", "indian cuisine", "recipe", "cooking"],
    "domain": "food",
    "sentiment": "positive",
    "language": "en",
    "transcript": "Welcome to my kitchen...",
    "keyMoments": [
      { "time": 15, "description": "Marinating chicken" },
      { "time": 45, "description": "Making sauce" }
    ]
  },
  "completedAt": "2026-02-26T22:01:30Z"
}
```

---

### 5. Generate Outputs

**POST** `/api/generate`

Generate platform-specific content.

**Request:**
```bash
curl -X POST https://api.content-ai.example.com/api/generate \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contentId": "content_abc123",
    "platforms": ["youtube_short", "instagram_reel", "twitter_thread"],
    "options": {
      "tone": "casual",
      "length": "short"
    }
  }'
```

**Parameters:**
- `contentId` (required) - Content ID
- `platforms` (required) - Array of platform names
- `options.tone` (optional) - `professional`, `casual`, `humorous`
- `options.length` (optional) - `short`, `medium`, `long`

**Response (200):**
```json
{
  "generationId": "gen_def456",
  "status": "processing",
  "platforms": ["youtube_short", "instagram_reel", "twitter_thread"],
  "estimatedTime": 20
}
```

---

### 6. Get Generated Outputs

**GET** `/api/outputs/:id`

Get generated platform-specific content.

**Request:**
```bash
curl https://api.content-ai.example.com/api/outputs/gen_def456 \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Response (200):**
```json
{
  "id": "gen_def456",
  "contentId": "content_abc123",
  "status": "completed",
  "outputs": {
    "youtube_short": {
      "title": "Easy Butter Chicken Recipe in 30 Minutes!",
      "description": "Learn how to make authentic butter chicken...",
      "tags": ["cooking", "indian food", "recipe"],
      "duration": 60
    },
    "instagram_reel": {
      "caption": "🍗 Butter Chicken made easy! #cooking #indianfood",
      "hashtags": ["#cooking", "#indianfood", "#recipe", "#foodie"],
      "music": "trending_audio_123"
    },
    "twitter_thread": {
      "tweets": [
        "🧵 How to make PERFECT Butter Chicken (1/10)",
        "First, marinate chicken in yogurt and spices for 15 min (2/10)",
        "..."
      ]
    }
  },
  "completedAt": "2026-02-26T22:02:00Z"
}
```

---

### 7. List Content

**GET** `/api/content`

List user's uploaded content.

**Request:**
```bash
curl "https://api.content-ai.example.com/api/content?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 10, max: 100)
- `status` (optional) - Filter by status
- `domain` (optional) - Filter by domain

**Response (200):**
```json
{
  "data": [
    {
      "id": "content_abc123",
      "type": "video",
      "status": "completed",
      "metadata": { "title": "My Video" },
      "createdAt": "2026-02-26T22:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "pages": 5
  }
}
```

---

### 8. Delete Content

**DELETE** `/api/content/:id`

Delete uploaded content and all associated data.

**Request:**
```bash
curl -X DELETE https://api.content-ai.example.com/api/content/content_abc123 \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Response (200):**
```json
{
  "message": "Content deleted successfully",
  "id": "content_abc123"
}
```

---

## Webhooks

**Configure webhooks in dashboard to receive real-time updates.**

**Events:**
- `content.uploaded` - Content upload complete
- `content.processing` - Analysis started
- `content.completed` - Analysis complete
- `content.failed` - Processing failed
- `generation.completed` - Output generation complete

**Webhook Payload:**
```json
{
  "event": "content.completed",
  "timestamp": "2026-02-26T22:01:30Z",
  "data": {
    "contentId": "content_abc123",
    "status": "completed",
    "analysisId": "analysis_xyz789"
  }
}
```

**Verify Signature:**
```javascript
const crypto = require('crypto');
const signature = req.headers['x-webhook-signature'];
const payload = JSON.stringify(req.body);
const expected = crypto.createHmac('sha256', WEBHOOK_SECRET)
  .update(payload).digest('hex');
const valid = crypto.timingSafeEqual(
  Buffer.from(signature),
  Buffer.from(expected)
);
```

---

## SDKs

**JavaScript/Node.js:**
```bash
npm install @content-ai/sdk
```

**Python:**
```bash
pip install content-ai
```

**Documentation:** https://docs.content-ai.example.com

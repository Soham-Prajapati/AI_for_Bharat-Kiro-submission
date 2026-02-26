# 🔌 API Endpoints

**Detailed endpoint documentation with examples**

---

## 1. Upload Content

**Endpoint:** `POST /api/upload`  
**Auth:** Required  
**Rate Limit:** 10/min (free), 100/min (pro)

### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| file | File | Yes | Video/audio/text file |
| type | String | Yes | `video`, `audio`, or `text` |
| metadata | JSON | No | Additional metadata |

### Request Body (multipart/form-data)

```
file: [binary data]
type: "video"
metadata: {"title": "My Video", "domain": "food"}
```

### Response (200 OK)

```json
{
  "id": "content_abc123",
  "status": "processing",
  "url": "https://cdn.example.com/content_abc123",
  "createdAt": "2026-02-26T22:00:00Z",
  "estimatedTime": 45
}
```

### Status Codes

- `200` - Upload successful
- `400` - Invalid file or parameters
- `401` - Unauthorized
- `413` - File too large
- `429` - Rate limit exceeded

### Examples

**cURL:**
```bash
curl -X POST https://api.content-ai.example.com/api/upload \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F "file=@video.mp4" \
  -F "type=video" \
  -F 'metadata={"title":"Cooking Tutorial","domain":"food"}'
```

**JavaScript:**
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('type', 'video');
formData.append('metadata', JSON.stringify({
  title: 'Cooking Tutorial',
  domain: 'food'
}));

const response = await fetch('https://api.content-ai.example.com/api/upload', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: formData
});

const data = await response.json();
console.log(data.id); // content_abc123
```

**Python:**
```python
import requests

files = {'file': open('video.mp4', 'rb')}
data = {
    'type': 'video',
    'metadata': '{"title":"Cooking Tutorial","domain":"food"}'
}
headers = {'Authorization': 'Bearer YOUR_API_KEY'}

response = requests.post(
    'https://api.content-ai.example.com/api/upload',
    files=files,
    data=data,
    headers=headers
)

print(response.json()['id'])  # content_abc123
```

---

## 2. Get Content Status

**Endpoint:** `GET /api/content/:id`  
**Auth:** Required  
**Rate Limit:** 100/min

### URL Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| id | String | Yes | Content ID |

### Response (200 OK)

```json
{
  "id": "content_abc123",
  "type": "video",
  "status": "completed",
  "url": "https://cdn.example.com/content_abc123",
  "metadata": {
    "title": "Cooking Tutorial",
    "domain": "food",
    "duration": 180,
    "size": 52428800,
    "format": "mp4"
  },
  "createdAt": "2026-02-26T22:00:00Z",
  "completedAt": "2026-02-26T22:01:00Z"
}
```

### Status Values

- `uploading` - Upload in progress
- `processing` - AI analysis running
- `completed` - Ready to use
- `failed` - Processing error

### Examples

**cURL:**
```bash
curl https://api.content-ai.example.com/api/content/content_abc123 \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**JavaScript:**
```javascript
const response = await fetch(
  'https://api.content-ai.example.com/api/content/content_abc123',
  {
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY'
    }
  }
);

const content = await response.json();
console.log(content.status); // "completed"
```

**Python:**
```python
response = requests.get(
    'https://api.content-ai.example.com/api/content/content_abc123',
    headers={'Authorization': 'Bearer YOUR_API_KEY'}
)

content = response.json()
print(content['status'])  # "completed"
```

---

## 3. Analyze Content

**Endpoint:** `POST /api/analyze`  
**Auth:** Required  
**Rate Limit:** 10/min

### Request Body (application/json)

```json
{
  "contentId": "content_abc123",
  "options": {
    "domain": "food",
    "language": "en",
    "detailed": true
  }
}
```

### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| contentId | String | Yes | Content ID from upload |
| options.domain | String | No | Force specific domain |
| options.language | String | No | Content language (ISO 639-1) |
| options.detailed | Boolean | No | Include detailed analysis |

### Response (200 OK)

```json
{
  "analysisId": "analysis_xyz789",
  "contentId": "content_abc123",
  "status": "processing",
  "estimatedTime": 30
}
```

### Examples

**cURL:**
```bash
curl -X POST https://api.content-ai.example.com/api/analyze \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contentId": "content_abc123",
    "options": {"domain": "food", "language": "en"}
  }'
```

**JavaScript:**
```javascript
const response = await fetch('https://api.content-ai.example.com/api/analyze', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    contentId: 'content_abc123',
    options: { domain: 'food', language: 'en' }
  })
});

const analysis = await response.json();
console.log(analysis.analysisId);
```

---

## 4. Get Analysis Results

**Endpoint:** `GET /api/analysis/:id`  
**Auth:** Required  
**Rate Limit:** 100/min

### Response (200 OK)

```json
{
  "id": "analysis_xyz789",
  "contentId": "content_abc123",
  "status": "completed",
  "results": {
    "summary": "A cooking tutorial showing how to make butter chicken with step-by-step instructions.",
    "keywords": ["butter chicken", "indian cuisine", "recipe", "cooking tutorial"],
    "domain": "food",
    "sentiment": "positive",
    "language": "en",
    "confidence": 0.95,
    "transcript": "Welcome to my kitchen. Today we're making butter chicken...",
    "keyMoments": [
      { "time": 15, "description": "Marinating chicken", "importance": "high" },
      { "time": 45, "description": "Making tomato sauce", "importance": "high" },
      { "time": 120, "description": "Final plating", "importance": "medium" }
    ],
    "entities": [
      { "type": "ingredient", "name": "chicken", "mentions": 5 },
      { "type": "ingredient", "name": "tomatoes", "mentions": 3 }
    ]
  },
  "completedAt": "2026-02-26T22:01:30Z"
}
```

### Examples

**cURL:**
```bash
curl https://api.content-ai.example.com/api/analysis/analysis_xyz789 \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**JavaScript:**
```javascript
const response = await fetch(
  'https://api.content-ai.example.com/api/analysis/analysis_xyz789',
  { headers: { 'Authorization': 'Bearer YOUR_API_KEY' } }
);

const analysis = await response.json();
console.log(analysis.results.summary);
```

---

## 5. Generate Outputs

**Endpoint:** `POST /api/generate`  
**Auth:** Required  
**Rate Limit:** 10/min

### Request Body

```json
{
  "contentId": "content_abc123",
  "platforms": ["youtube_short", "instagram_reel", "twitter_thread"],
  "options": {
    "tone": "casual",
    "length": "short",
    "includeHashtags": true
  }
}
```

### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| contentId | String | Yes | Content ID |
| platforms | Array | Yes | Platform names |
| options.tone | String | No | `professional`, `casual`, `humorous` |
| options.length | String | No | `short`, `medium`, `long` |
| options.includeHashtags | Boolean | No | Add hashtags (default: true) |

### Supported Platforms

- `youtube_short` - YouTube Shorts (60s vertical)
- `youtube_video` - YouTube video description
- `instagram_reel` - Instagram Reel caption
- `instagram_post` - Instagram post caption
- `tiktok` - TikTok video caption
- `twitter_thread` - Twitter thread
- `twitter_post` - Single tweet
- `linkedin_post` - LinkedIn post
- `blog_post` - Blog article
- `email_newsletter` - Email content

### Response (200 OK)

```json
{
  "generationId": "gen_def456",
  "contentId": "content_abc123",
  "status": "processing",
  "platforms": ["youtube_short", "instagram_reel", "twitter_thread"],
  "estimatedTime": 20
}
```

### Examples

**JavaScript:**
```javascript
const response = await fetch('https://api.content-ai.example.com/api/generate', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    contentId: 'content_abc123',
    platforms: ['youtube_short', 'instagram_reel'],
    options: { tone: 'casual', length: 'short' }
  })
});

const generation = await response.json();
console.log(generation.generationId);
```

---

## 6. Get Generated Outputs

**Endpoint:** `GET /api/outputs/:id`  
**Auth:** Required  
**Rate Limit:** 100/min

### Response (200 OK)

```json
{
  "id": "gen_def456",
  "contentId": "content_abc123",
  "status": "completed",
  "outputs": {
    "youtube_short": {
      "title": "Easy Butter Chicken Recipe in 30 Minutes! 🍗",
      "description": "Learn how to make authentic butter chicken at home...",
      "tags": ["cooking", "indian food", "recipe", "butter chicken"],
      "duration": 60,
      "format": "vertical"
    },
    "instagram_reel": {
      "caption": "🍗 Butter Chicken made easy! Perfect for dinner tonight 😋\n\nSave this recipe! ⬇️",
      "hashtags": ["#cooking", "#indianfood", "#recipe", "#foodie", "#butterchicken"],
      "music": "trending_audio_123",
      "duration": 30
    },
    "twitter_thread": {
      "tweets": [
        "🧵 How to make PERFECT Butter Chicken at home (1/10)",
        "Ingredients you'll need:\n- 500g chicken\n- 200ml cream\n- Tomatoes\n- Spices (2/10)",
        "Step 1: Marinate chicken in yogurt and spices for 15 minutes (3/10)"
      ],
      "totalTweets": 10
    }
  },
  "completedAt": "2026-02-26T22:02:00Z"
}
```

---

## 7. List User Content

**Endpoint:** `GET /api/content`  
**Auth:** Required  
**Rate Limit:** 100/min

### Query Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| page | Number | No | Page number (default: 1) |
| limit | Number | No | Items per page (default: 10, max: 100) |
| status | String | No | Filter by status |
| domain | String | No | Filter by domain |
| type | String | No | Filter by type |

### Response (200 OK)

```json
{
  "data": [
    {
      "id": "content_abc123",
      "type": "video",
      "status": "completed",
      "metadata": {
        "title": "Cooking Tutorial",
        "domain": "food"
      },
      "createdAt": "2026-02-26T22:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "pages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Examples

**cURL:**
```bash
curl "https://api.content-ai.example.com/api/content?page=1&limit=10&status=completed" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

---

## 8. Delete Content

**Endpoint:** `DELETE /api/content/:id`  
**Auth:** Required  
**Rate Limit:** 100/min

### Response (200 OK)

```json
{
  "message": "Content deleted successfully",
  "id": "content_abc123",
  "deletedAt": "2026-02-26T22:10:00Z"
}
```

### Examples

**cURL:**
```bash
curl -X DELETE https://api.content-ai.example.com/api/content/content_abc123 \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**JavaScript:**
```javascript
await fetch('https://api.content-ai.example.com/api/content/content_abc123', {
  method: 'DELETE',
  headers: { 'Authorization': 'Bearer YOUR_API_KEY' }
});
```

---

## Error Handling

All endpoints return errors in this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "Additional context"
    }
  }
}
```

**Common Error Codes:**
- `INVALID_API_KEY` - API key is invalid or expired
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `FILE_TOO_LARGE` - File exceeds size limit
- `INVALID_FORMAT` - Unsupported file format
- `CONTENT_NOT_FOUND` - Content ID doesn't exist
- `PROCESSING_FAILED` - AI analysis failed
- `INSUFFICIENT_CREDITS` - Not enough credits

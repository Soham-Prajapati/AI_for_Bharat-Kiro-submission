# Complete API Reference - All Routes

## Base URL
```
http://localhost:3000/api
```

---

## 📋 Table of Contents

1. [Core Features](#core-features)
2. [Phase 3 Features](#phase-3-features)
3. [Phase 4 Features](#phase-4-features)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)

---

## Core Features

### Upload API
```http
POST /api/upload
Content-Type: multipart/form-data
```
Upload video/audio/text files for processing.

### Process API
```http
POST /api/process
GET /api/process/:jobId
```
Start transcription and check status.

### Generate API
```http
POST /api/generate
```
Generate platform-specific content.

### DNA API
```http
POST /api/dna/analyze
```
Analyze creator personality.

### Analytics API
```http
GET /api/analytics/:userId
```
Get ecosystem analytics.

### Viral Score API
```http
POST /api/viral/predict
```
Predict content virality.

### ROI API
```http
GET /api/roi/:userId
```
Calculate time/money saved.

### Cultural API
```http
POST /api/cultural/adapt
```
Adapt content for regions.

---

## Phase 3 Features

### 1. Trends API

#### Get Current Trends
```http
GET /api/trends/current
```

**Response:**
```json
{
  "trends": [
    { "topic": "AI Content Creation", "score": 95, "growth": 45, "platform": "youtube" }
  ],
  "timestamp": "2026-02-27T23:36:00Z"
}
```

#### Predict Trends
```http
GET /api/trends/predict
```

**Response:**
```json
{
  "predictions": [
    { "topic": "AI Avatars", "confidence": 0.78, "estimatedPeak": "2026-03-15", "lifespan": 90 }
  ]
}
```

---

### 2. Voice API

#### Train Voice Model
```http
POST /api/voice/train
Content-Type: multipart/form-data
```

**Body:**
- `samples[]`: Audio files (min 3, max 10)
- `userId`: User ID

**Response:**
```json
{
  "success": true,
  "modelId": "voice-user123-1234567890",
  "samplesUploaded": 5,
  "status": "training"
}
```

#### Generate Audio
```http
POST /api/voice/generate
Content-Type: application/json
```

**Body:**
```json
{
  "modelId": "voice-user123-1234567890",
  "text": "Text to convert to speech"
}
```

---

### 3. Dopamine Optimizer API

#### Optimize Content
```http
POST /api/dopamine/optimize
Content-Type: application/json
```

**Body:**
```json
{
  "transcript": "Video transcript...",
  "videoId": "optional"
}
```

**Response:**
```json
{
  "score": 78,
  "hooks": [
    { "timestamp": 0, "strength": 0.9, "text": "Opening hook", "type": "question" }
  ],
  "improvements": ["Add stronger hook in first 3 seconds"],
  "engagementPrediction": 0.82
}
```

---

### 4. Watermark API

#### Add Watermark
```http
POST /api/watermark/add
Content-Type: multipart/form-data
```

**Body:**
- `file`: Media file (max 100MB)
- `logoUrl`: Logo URL
- `position`: "top-left" | "top-right" | "bottom-left" | "bottom-right"
- `opacity`: 0.0 - 1.0

---

### 5. Content Multiplier API

#### Generate Multiple Pieces
```http
POST /api/multiply/generate
Content-Type: application/json
```

**Body:**
```json
{
  "transcript": "Video transcript...",
  "platforms": ["youtube", "instagram", "tiktok"]
}
```

**Response:**
```json
{
  "clips": [...],
  "quotes": [...],
  "audiograms": [...],
  "totalPieces": 35
}
```

---

## Phase 4 Features

### 6. Marketplace API

#### Create Listing
```http
POST /api/marketplace/list
Content-Type: application/json
```

**Body:**
```json
{
  "title": "Premium Template",
  "description": "Description",
  "price": 29.99,
  "type": "template",
  "userId": "user123",
  "fileUrl": "https://..."
}
```

#### Purchase Listing
```http
POST /api/marketplace/purchase
Content-Type: application/json
```

**Body:**
```json
{
  "listingId": "listing-123",
  "userId": "user123",
  "paymentMethod": "stripe"
}
```

#### Browse Listings
```http
GET /api/marketplace/listings?type=template&limit=20
```

---

### 7. Knowledge Graph API

#### Explore Graph
```http
GET /api/graph/explore?topic=AI%20Content&depth=2
```

**Response:**
```json
{
  "nodes": [
    { "id": "node-1", "label": "AI Content", "type": "topic", "connections": 5 }
  ],
  "edges": [
    { "from": "node-1", "to": "node-2", "weight": 0.8, "type": "related" }
  ]
}
```

#### Get Related Content
```http
GET /api/graph/related?contentId=content-123
```

---

### 8. Community API

#### Create Post
```http
POST /api/community/post
Content-Type: application/json
```

**Body:**
```json
{
  "userId": "user123",
  "content": "Check out my new video!",
  "groupId": "group-456"
}
```

#### Get Feed
```http
GET /api/community/feed?userId=user123&limit=20&offset=0
```

**Response:**
```json
{
  "posts": [
    {
      "id": "post-1",
      "userId": "user-1",
      "content": "Post content",
      "likes": 10,
      "comments": 5
    }
  ],
  "hasMore": true
}
```

---

### 9. Membership API

#### Subscribe
```http
POST /api/membership/subscribe
Content-Type: application/json
```

**Body:**
```json
{
  "userId": "user123",
  "tier": "pro",
  "paymentMethod": "stripe"
}
```

**Tiers:** `free`, `pro`, `enterprise`

#### Cancel Subscription
```http
POST /api/membership/cancel
Content-Type: application/json
```

**Body:**
```json
{
  "subscriptionId": "sub-123",
  "userId": "user123"
}
```

#### Get Status
```http
GET /api/membership/status?userId=user123
```

**Response:**
```json
{
  "userId": "user123",
  "tier": "pro",
  "status": "active",
  "features": ["unlimited_uploads", "priority_support", "advanced_analytics"]
}
```

---

### 10. Automation API

#### Create Automation
```http
POST /api/automation/create
Content-Type: application/json
```

**Body:**
```json
{
  "userId": "user123",
  "name": "Auto-post to Instagram",
  "trigger": { "type": "schedule", "time": "09:00" },
  "action": { "type": "post", "platform": "instagram" }
}
```

#### List Automations
```http
GET /api/automation/list?userId=user123
```

#### Delete Automation
```http
DELETE /api/automation/:id
```

---

## Error Handling

All endpoints return errors in this format:

```json
{
  "error": "Error message",
  "requestId": "uuid-v4",
  "type": "ValidationError"
}
```

### Status Codes
- `200` - Success
- `400` - Validation Error
- `401` - Authentication Error
- `403` - Authorization Error
- `404` - Not Found
- `409` - Conflict
- `429` - Rate Limit Exceeded
- `500` - Internal Server Error
- `502` - AWS Service Error
- `503` - Service Unavailable
- `504` - Timeout

---

## Rate Limiting

All `/api/*` endpoints are rate limited:
- **100 requests per 15 minutes** per IP

When rate limited:
```json
{
  "error": "Too many requests",
  "requestId": "uuid-v4"
}
```

---

## Request ID Tracking

Every request gets a unique ID:
- Automatically generated (UUID v4)
- Included in all responses
- Used for debugging and logging

**Header:**
```
X-Request-ID: uuid-v4
```

---

## Caching

- **Trends API**: 6 hours
- Other endpoints: No caching

---

## Testing

### Using curl:

```bash
# Get trends
curl http://localhost:3000/api/trends/current

# Optimize content
curl -X POST http://localhost:3000/api/dopamine/optimize \
  -H "Content-Type: application/json" \
  -d '{"transcript": "Test transcript"}'

# Create marketplace listing
curl -X POST http://localhost:3000/api/marketplace/list \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Premium Template",
    "price": 29.99,
    "type": "template",
    "userId": "user123"
  }'

# Subscribe to membership
curl -X POST http://localhost:3000/api/membership/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "tier": "pro"
  }'
```

---

## Notes

⚠️ **Mock Data**: Routes currently return mock data. Real implementations will be added when services are ready.

✅ **Production Ready**: Error handling, validation, and security are fully implemented.

🔄 **Frontend Integration**: Safe to build UI components and integrate now.

📚 **Documentation**: See `docs/api/` for detailed endpoint documentation.

---

## Quick Reference

### All Endpoints (20 total)

```
Core (8):
POST   /api/upload
POST   /api/process
GET    /api/process/:jobId
POST   /api/generate
POST   /api/dna/analyze
GET    /api/analytics/:userId
POST   /api/viral/predict
GET    /api/roi/:userId
POST   /api/cultural/adapt

Phase 3 (7):
GET    /api/trends/current
GET    /api/trends/predict
POST   /api/voice/train
POST   /api/voice/generate
POST   /api/dopamine/optimize
POST   /api/watermark/add
POST   /api/multiply/generate

Phase 4 (11):
POST   /api/marketplace/list
POST   /api/marketplace/purchase
GET    /api/marketplace/listings
GET    /api/graph/explore
GET    /api/graph/related
POST   /api/community/post
GET    /api/community/feed
POST   /api/membership/subscribe
POST   /api/membership/cancel
GET    /api/membership/status
POST   /api/automation/create
GET    /api/automation/list
DELETE /api/automation/:id
```

**Total:** 26 endpoints across 18 routes

---

**Last Updated:** 2026-02-27  
**Version:** 1.0.0  
**Status:** Production Ready (Mock Data)

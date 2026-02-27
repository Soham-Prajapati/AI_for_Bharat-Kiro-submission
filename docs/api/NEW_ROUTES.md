# API Documentation - New Routes

## Base URL
```
http://localhost:3000/api
```

---

## 1. Trends API

### Get Current Trends
```http
GET /api/trends/current
```

**Response:**
```json
{
  "trends": [
    {
      "topic": "AI Content Creation",
      "score": 95,
      "growth": 45,
      "platform": "youtube"
    }
  ],
  "timestamp": "2026-02-27T23:28:00Z",
  "source": "mock"
}
```

### Predict Trends
```http
GET /api/trends/predict
```

**Response:**
```json
{
  "predictions": [
    {
      "topic": "AI Avatars",
      "confidence": 0.78,
      "estimatedPeak": "2026-03-15",
      "lifespan": 90
    }
  ],
  "timestamp": "2026-02-27T23:28:00Z"
}
```

---

## 2. Voice API

### Train Voice Model
```http
POST /api/voice/train
Content-Type: multipart/form-data
```

**Body:**
- `samples[]`: Audio files (min 3, max 10, 50MB each)
- `userId`: User ID (string)

**Response:**
```json
{
  "success": true,
  "modelId": "voice-user123-1234567890",
  "samplesUploaded": 5,
  "status": "training",
  "estimatedTime": "5-10 minutes",
  "message": "Voice model training started"
}
```

### Generate Audio
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

**Response:**
```json
{
  "success": true,
  "audioUrl": "https://s3.../audio.mp3",
  "duration": 15,
  "status": "completed"
}
```

---

## 3. Dopamine Optimizer API

### Optimize Content
```http
POST /api/dopamine/optimize
Content-Type: application/json
```

**Body:**
```json
{
  "transcript": "Video transcript text...",
  "videoId": "optional-video-id"
}
```

**Response:**
```json
{
  "score": 78,
  "hooks": [
    {
      "timestamp": 0,
      "strength": 0.9,
      "text": "Opening hook detected",
      "type": "question"
    }
  ],
  "improvements": [
    "Add a stronger hook in first 3 seconds",
    "Increase pacing between 30-60 seconds"
  ],
  "engagementPrediction": 0.82,
  "optimizedAt": "2026-02-27T23:28:00Z"
}
```

---

## 4. Watermark API

### Add Watermark
```http
POST /api/watermark/add
Content-Type: multipart/form-data
```

**Body:**
- `file`: Media file (max 100MB)
- `logoUrl`: URL of logo to use as watermark
- `position`: "top-left" | "top-right" | "bottom-left" | "bottom-right" (default: "bottom-right")
- `opacity`: 0.0 - 1.0 (default: 0.7)

**Response:**
```json
{
  "success": true,
  "watermarkedUrl": "https://s3.../watermarked/file.mp4",
  "position": "bottom-right",
  "opacity": 0.7,
  "message": "Watermark added"
}
```

---

## 5. Content Multiplier API

### Generate Multiple Content Pieces
```http
POST /api/multiply/generate
Content-Type: application/json
```

**Body:**
```json
{
  "videoId": "optional-video-id",
  "transcript": "Video transcript...",
  "platforms": ["youtube", "instagram", "tiktok"]
}
```

**Response:**
```json
{
  "clips": [
    {
      "id": "clip-0",
      "duration": 15,
      "url": "https://s3.../clip-0.mp4",
      "platform": "youtube"
    }
  ],
  "quotes": [
    {
      "id": "quote-0",
      "text": "Inspirational quote",
      "imageUrl": "https://s3.../quote-0.jpg"
    }
  ],
  "audiograms": [
    {
      "id": "audio-0",
      "duration": 30,
      "url": "https://s3.../audio-0.mp3"
    }
  ],
  "totalPieces": 35,
  "generatedAt": "2026-02-27T23:28:00Z"
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": "Error message",
  "requestId": "uuid-v4",
  "type": "ValidationError"
}
```

**Common Status Codes:**
- `200` - Success
- `400` - Validation Error
- `401` - Authentication Error
- `404` - Not Found
- `429` - Rate Limit Exceeded
- `500` - Internal Server Error

---

## Rate Limiting

All `/api/*` endpoints are rate limited:
- **100 requests per 15 minutes** per IP

When rate limited, you'll receive:
```json
{
  "error": "Too many requests",
  "requestId": "uuid-v4"
}
```

---

## Caching

- **Trends API**: Cached for 6 hours
- Other endpoints: No caching

---

## Testing

Use `curl` or Postman to test:

```bash
# Get current trends
curl http://localhost:3000/api/trends/current

# Optimize content
curl -X POST http://localhost:3000/api/dopamine/optimize \
  -H "Content-Type: application/json" \
  -d '{"transcript": "Test transcript"}'

# Train voice model
curl -X POST http://localhost:3000/api/voice/train \
  -F "samples[]=@sample1.mp3" \
  -F "samples[]=@sample2.mp3" \
  -F "samples[]=@sample3.mp3" \
  -F "userId=user123"
```

---

## Notes

⚠️ **Mock Data**: All routes currently return mock data. Real implementations will be added when services are ready.

✅ **Production Ready**: Error handling, validation, and security are fully implemented.

🔄 **Frontend Integration**: Safe to build UI components and integrate now.

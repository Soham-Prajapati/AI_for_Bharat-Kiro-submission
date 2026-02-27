# Analytics API

## Overview
The Analytics API provides cross-platform analytics aggregation for creators. It fetches and analyzes data from YouTube, Instagram, LinkedIn, Twitter, TikTok, and Facebook to provide insights and recommendations.

## Endpoint

### GET /api/analytics/:userId

Get aggregated cross-platform analytics for a creator.

**URL Parameters:**
- `userId` (required): The user's unique identifier

**Response (200 OK):**
```json
{
  "success": true,
  "userId": "user-123",
  "analytics": {
    "platforms": {
      "youtube": {
        "followers": 125000,
        "engagement": 0.045,
        "topPosts": 15,
        "avgViews": 8500,
        "growthRate": 0.12
      },
      "instagram": {
        "followers": 45000,
        "engagement": 0.068,
        "topPosts": 8,
        "avgViews": 3200,
        "growthRate": 0.08
      },
      "linkedin": {
        "followers": 12000,
        "engagement": 0.032,
        "topPosts": 5,
        "avgViews": 1500,
        "growthRate": 0.15
      },
      "twitter": {
        "followers": 28000,
        "engagement": 0.025,
        "topPosts": 12,
        "avgViews": 2100,
        "growthRate": 0.05
      },
      "tiktok": {
        "followers": 89000,
        "engagement": 0.092,
        "topPosts": 20,
        "avgViews": 12000,
        "growthRate": 0.25
      },
      "facebook": {
        "followers": 35000,
        "engagement": 0.038,
        "topPosts": 6,
        "avgViews": 2800,
        "growthRate": 0.03
      }
    },
    "recommendations": [
      "Focus more on TikTok - highest engagement and growth rate",
      "LinkedIn shows strong growth potential - increase posting frequency",
      "YouTube has largest audience - optimize for retention",
      "Cross-post top TikTok content to Instagram Reels"
    ],
    "bestPerforming": "tiktok",
    "contentGaps": [
      "Short-form video content on YouTube",
      "Professional content on Instagram",
      "Interactive polls on Twitter"
    ],
    "overallScore": 7.8
  },
  "cached": false,
  "fetchedAt": "2026-02-27T03:56:00.000Z"
}
```

**Error Responses:**

400 Bad Request - Missing userId
```json
{
  "success": false,
  "error": {
    "message": "userId required",
    "statusCode": 400,
    "timestamp": "2026-02-27T03:56:00.000Z"
  }
}
```

## Platform Stats Fields

### followers
Type: `number`
Description: Total follower/subscriber count

### engagement
Type: `number` (0-1)
Description: Engagement rate (likes + comments + shares / followers)

### topPosts
Type: `number`
Description: Number of posts in top 10% by engagement

### avgViews
Type: `number`
Description: Average views per post

### growthRate
Type: `number` (0-1)
Description: Monthly growth rate

## Analytics Fields

### recommendations
Type: `string[]`
Description: AI-generated recommendations for improving cross-platform presence

### bestPerforming
Type: `string`
Description: Platform with highest overall performance

### contentGaps
Type: `string[]`
Description: Identified gaps in content strategy

### overallScore
Type: `number` (0-10)
Description: Overall ecosystem health score

## Caching

Results are cached for **1 hour** to improve performance and reduce API calls to external platforms.

- First call: Fetches fresh data from all platforms
- Subsequent calls (within 1 hour): Returns cached data
- Cache key: `analytics:{userId}`
- TTL: 3600 seconds (1 hour)

The response includes a `cached` field indicating whether data was served from cache.

## Usage Example

### cURL
```bash
# First call - fetches fresh data
curl -X GET http://localhost:3000/api/analytics/user-123

# Second call - returns cached data (faster)
curl -X GET http://localhost:3000/api/analytics/user-123
```

### JavaScript (fetch)
```javascript
const userId = 'user-123';
const response = await fetch(`http://localhost:3000/api/analytics/${userId}`);
const data = await response.json();

console.log('Best performing platform:', data.analytics.bestPerforming);
console.log('Recommendations:', data.analytics.recommendations);
```

### TypeScript
```typescript
interface PlatformStats {
  followers: number;
  engagement: number;
  topPosts: number;
  avgViews: number;
  growthRate: number;
}

interface AnalyticsResponse {
  success: boolean;
  userId: string;
  analytics: {
    platforms: {
      youtube?: PlatformStats;
      instagram?: PlatformStats;
      linkedin?: PlatformStats;
      twitter?: PlatformStats;
      tiktok?: PlatformStats;
      facebook?: PlatformStats;
    };
    recommendations: string[];
    bestPerforming: string;
    contentGaps: string[];
    overallScore: number;
  };
  cached: boolean;
  fetchedAt: string;
}

const getAnalytics = async (userId: string): Promise<AnalyticsResponse> => {
  const response = await fetch(`/api/analytics/${userId}`);
  return response.json();
};
```

## Testing

Run the test script to verify caching:
```bash
./scripts/test-analytics-api.sh
```

This will:
1. Make first call and measure response time
2. Make second call and verify it's faster (cached)
3. Test error handling for missing userId

## Integration Notes

### For Frontend (Srushti)
- Use this endpoint in the analytics dashboard (task 2.2b)
- Display platform stats in a grid layout
- Show recommendations as a list
- Highlight best performing platform
- Use color coding for each platform

### For AI Service (Nidhi)
- The service stub in `src/services/ecosystem-analytics.service.ts` needs full implementation (task 2.2a)
- Integrate with real platform APIs (YouTube Data API, Instagram Graph API, etc.)
- Calculate engagement rates accurately
- Generate intelligent recommendations based on data patterns

### For Testing (Lakshmi)
- Verify engagement rate calculations (task 2.2d)
- Test with various user profiles
- Verify cache invalidation works correctly
- Test error handling for platform API failures

## Performance

- **Without cache**: ~500-1000ms (depends on platform API response times)
- **With cache**: ~10-50ms
- **Cache hit rate**: Expected >80% for active users

## Future Enhancements
- Add date range filtering (last 7 days, 30 days, 90 days)
- Add historical trend data
- Add competitor comparison
- Add export to CSV/PDF
- Add webhook notifications for significant changes
- Add real-time updates via WebSocket

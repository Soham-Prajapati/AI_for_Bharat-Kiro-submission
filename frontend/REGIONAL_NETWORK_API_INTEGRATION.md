# Regional Network API Integration Guide

## Overview

This document details how to integrate the Regional Network API endpoints with the existing API client.

## API Endpoints

### Base URL
```
/api/regional
```

### Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/regions` | Get all regions with stats |
| GET | `/creators` | Get creators with filters |
| GET | `/creators/:id` | Get single creator details |
| POST | `/collaboration/request` | Send collaboration request |
| GET | `/collaboration/requests` | Get collaboration requests |
| PATCH | `/collaboration/request/:id` | Update collaboration status |

---

## 1. Get Regions

### Request
```http
GET /api/regional/regions?includeStats=true
```

### Query Parameters
- `includeStats` (boolean, optional): Include region statistics

### Response
```json
{
  "success": true,
  "regions": [
    {
      "id": "region_1",
      "name": "South India",
      "code": "south",
      "languages": ["tamil", "telugu", "kannada", "malayalam"],
      "creatorCount": 1250,
      "popularDomains": ["food", "travel", "education"],
      "description": "Creators from Tamil Nadu, Karnataka, Kerala, Andhra Pradesh"
    }
  ],
  "stats": {
    "region_1": {
      "regionId": "region_1",
      "totalCreators": 1250,
      "activeCreators": 890,
      "totalCollaborations": 340,
      "averageEngagement": 4.2,
      "topLanguages": [
        { "language": "tamil", "percentage": 45 },
        { "language": "telugu", "percentage": 30 }
      ],
      "topDomains": [
        { "domain": "food", "count": 450 },
        { "domain": "travel", "count": 380 }
      ]
    }
  }
}
```

---

## 2. Get Creators

### Request
```http
GET /api/regional/creators?page=1&limit=20&regions=south&languages=tamil&minFollowers=1000
```

### Query Parameters

**Pagination**
- `page` (number, required): Page number (1-indexed)
- `limit` (number, required): Items per page (default: 20, max: 100)

**Search**
- `query` (string, optional): Search query for name/bio

**Filters**
- `regionId` (string, optional): Filter by specific region ID
- `regions` (string, optional): Comma-separated region codes
- `languages` (string, optional): Comma-separated language codes
- `domains` (string, optional): Comma-separated domain codes
- `skills` (string, optional): Comma-separated skill names
- `minFollowers` (number, optional): Minimum follower count
- `maxFollowers` (number, optional): Maximum follower count
- `minEngagement` (number, optional): Minimum engagement rate (0-100)
- `availableOnly` (boolean, optional): Only show available creators
- `verifiedOnly` (boolean, optional): Only show verified creators
- `minRating` (number, optional): Minimum rating (0-5)

**Sorting**
- `sortBy` (string, optional): Sort field (relevance, followers, engagement, rating, recent)
- `sortOrder` (string, optional): Sort order (asc, desc)

### Response
```json
{
  "success": true,
  "creators": {
    "items": [
      {
        "id": "creator_1",
        "userId": "user_123",
        "name": "Priya Kumar",
        "avatar": "https://...",
        "bio": "Food blogger from Chennai",
        "region": "south",
        "languages": ["tamil", "english"],
        "primaryDomain": "food",
        "secondaryDomains": ["travel"],
        "skills": [
          { "name": "Recipe Development", "level": "expert", "yearsOfExperience": 5 },
          { "name": "Food Photography", "level": "advanced", "yearsOfExperience": 3 }
        ],
        "stats": {
          "totalFollowers": 45000,
          "totalViews": 2500000,
          "engagementRate": 5.8,
          "contentCount": 120,
          "collaborationCount": 15,
          "rating": 4.7,
          "reviewCount": 23
        },
        "socialLinks": {
          "youtube": "https://youtube.com/@priyakumar",
          "instagram": "https://instagram.com/priyakumar"
        },
        "verified": true,
        "availableForCollab": true,
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-02-20T14:22:00Z"
      }
    ],
    "total": 450,
    "page": 1,
    "limit": 20,
    "totalPages": 23,
    "hasMore": true
  },
  "filters": {
    "availableLanguages": ["tamil", "telugu", "kannada", "malayalam", "english"],
    "availableDomains": ["food", "travel", "education", "entertainment"],
    "availableSkills": ["Recipe Development", "Food Photography", "Video Editing"]
  }
}
```

---

## 3. Get Creator Details

### Request
```http
GET /api/regional/creators/creator_1?includeStats=true
```

### Query Parameters
- `includeStats` (boolean, optional): Include detailed statistics

### Response
```json
{
  "success": true,
  "creator": {
    "id": "creator_1",
    "userId": "user_123",
    "name": "Priya Kumar",
    // ... full creator profile
  },
  "recentContent": [
    {
      "id": "content_1",
      "title": "10 Minute South Indian Breakfast Recipes",
      "domain": "food",
      "views": 125000,
      "engagement": 6.2,
      "createdAt": "2024-02-15T08:00:00Z"
    }
  ]
}
```

---

## 4. Send Collaboration Request

### Request
```http
POST /api/regional/collaboration/request
Content-Type: application/json

{
  "receiverId": "creator_1",
  "message": "Hi Priya! I love your food content. Would you be interested in collaborating on a South Indian cuisine series?",
  "proposal": {
    "title": "South Indian Cuisine Series",
    "description": "A 5-episode series exploring traditional South Indian recipes",
    "domain": "food",
    "estimatedDuration": "2 months",
    "budget": {
      "min": 50000,
      "max": 100000,
      "currency": "INR"
    },
    "deliverables": [
      "5 recipe videos",
      "Social media promotion",
      "Blog posts"
    ]
  }
}
```

### Response
```json
{
  "success": true,
  "request": {
    "id": "collab_req_1",
    "senderId": "user_456",
    "receiverId": "creator_1",
    "status": "pending",
    "message": "Hi Priya! I love your food content...",
    "proposedProject": {
      "title": "South Indian Cuisine Series",
      "description": "A 5-episode series...",
      "domain": "food",
      "estimatedDuration": "2 months",
      "budget": {
        "min": 50000,
        "max": 100000,
        "currency": "INR"
      },
      "deliverables": ["5 recipe videos", "Social media promotion", "Blog posts"]
    },
    "createdAt": "2024-02-20T15:30:00Z",
    "updatedAt": "2024-02-20T15:30:00Z"
  },
  "message": "Collaboration request sent successfully"
}
```

---

## 5. Get Collaboration Requests

### Request
```http
GET /api/regional/collaboration/requests?type=received&status=pending&page=1&limit=10
```

### Query Parameters
- `type` (string, required): "sent" or "received"
- `status` (string, optional): Filter by status (pending, accepted, rejected, cancelled)
- `page` (number, optional): Page number
- `limit` (number, optional): Items per page

### Response
```json
{
  "success": true,
  "requests": {
    "items": [
      {
        "id": "collab_req_1",
        "senderId": "user_456",
        "receiverId": "creator_1",
        "status": "pending",
        "message": "Hi Priya! I love your food content...",
        "proposedProject": { /* ... */ },
        "createdAt": "2024-02-20T15:30:00Z",
        "updatedAt": "2024-02-20T15:30:00Z"
      }
    ],
    "total": 5,
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "hasMore": false
  }
}
```

---

## 6. Update Collaboration Request

### Request (Accept)
```http
PATCH /api/regional/collaboration/request/collab_req_1
Content-Type: application/json

{
  "status": "accepted",
  "message": "I'd love to collaborate! Let's discuss the details."
}
```

### Request (Reject)
```http
PATCH /api/regional/collaboration/request/collab_req_1
Content-Type: application/json

{
  "status": "rejected",
  "message": "Thank you for reaching out, but I'm currently fully booked."
}
```

### Response
```json
{
  "success": true,
  "request": {
    "id": "collab_req_1",
    "senderId": "user_456",
    "receiverId": "creator_1",
    "status": "accepted",
    "message": "Hi Priya! I love your food content...",
    "proposedProject": { /* ... */ },
    "createdAt": "2024-02-20T15:30:00Z",
    "updatedAt": "2024-02-20T16:45:00Z",
    "respondedAt": "2024-02-20T16:45:00Z"
  },
  "message": "Collaboration request accepted"
}
```

---

## Integration with Existing API Client

### Add to `frontend/services/api.ts`

```typescript
import {
  GetRegionsRequest,
  GetRegionsResponse,
  GetCreatorsRequest,
  GetCreatorsResponse,
  // ... other imports
} from '@/types/regional-network';

class ApiClient {
  // ... existing code

  regional = {
    getRegions: (params: GetRegionsRequest) =>
      this.request<GetRegionsResponse>('/api/regional/regions', {
        method: 'GET',
        // Add query params
      }),

    getCreators: (params: GetCreatorsRequest) =>
      this.request<GetCreatorsResponse>('/api/regional/creators', {
        method: 'GET',
        // Add query params
      }),

    getCreator: (params: GetCreatorRequest) =>
      this.request<GetCreatorResponse>(`/api/regional/creators/${params.creatorId}`, {
        method: 'GET',
      }),

    sendCollaborationRequest: (data: SendCollaborationRequest) =>
      this.request<SendCollaborationResponse>('/api/regional/collaboration/request', {
        method: 'POST',
        body: data,
      }),

    getCollaborationRequests: (params: GetCollaborationRequestsRequest) =>
      this.request<GetCollaborationRequestsResponse>('/api/regional/collaboration/requests', {
        method: 'GET',
        // Add query params
      }),

    updateCollaborationRequest: (data: UpdateCollaborationRequest) =>
      this.request<UpdateCollaborationResponse>(
        `/api/regional/collaboration/request/${data.requestId}`,
        {
          method: 'PATCH',
          body: { status: data.status, message: data.message },
        }
      ),
  };
}
```

---

## Error Handling

### Error Response Format
```json
{
  "success": false,
  "error": "Creator not found",
  "code": "NOT_FOUND",
  "statusCode": 404
}
```

### Common Error Codes
- `VALIDATION_ERROR` (400): Invalid request parameters
- `UNAUTHORIZED` (401): Authentication required
- `FORBIDDEN` (403): Not allowed to perform action
- `NOT_FOUND` (404): Resource not found
- `RATE_LIMIT` (429): Too many requests
- `SERVER_ERROR` (500): Internal server error

---

## Rate Limiting

- **Regions**: 100 requests/minute
- **Creators**: 60 requests/minute
- **Collaboration Requests**: 20 requests/minute

---

## Caching Strategy

### Client-Side Caching
- **Regions**: Cache for 24 hours (rarely change)
- **Creators**: Cache for 5 minutes (frequently updated)
- **Collaboration Requests**: No caching (real-time data)

### Cache Headers
```http
Cache-Control: public, max-age=300
ETag: "abc123"
```

---

## WebSocket Events (Optional)

### Connection
```javascript
const ws = new WebSocket('ws://localhost:3000/ws');
```

### Event Types
```typescript
type WebSocketEventType = 
  | 'collaboration_request_received'
  | 'collaboration_request_accepted'
  | 'collaboration_request_rejected'
  | 'collaboration_message_received'
  | 'creator_status_changed';
```

### Event Payload
```json
{
  "type": "collaboration_request_received",
  "payload": {
    "id": "collab_req_1",
    "senderId": "user_456",
    "receiverId": "creator_1",
    "status": "pending",
    "message": "Hi Priya!...",
    "createdAt": "2024-02-20T15:30:00Z"
  },
  "timestamp": "2024-02-20T15:30:00Z"
}
```

---

## Testing

### Mock Data
```typescript
export const mockRegions: RegionData[] = [
  {
    id: 'region_1',
    name: 'South India',
    code: 'south',
    languages: ['tamil', 'telugu', 'kannada', 'malayalam'],
    creatorCount: 1250,
    popularDomains: ['food', 'travel', 'education'],
  },
];

export const mockCreators: CreatorProfile[] = [
  {
    id: 'creator_1',
    userId: 'user_123',
    name: 'Priya Kumar',
    region: 'south',
    languages: ['tamil', 'english'],
    primaryDomain: 'food',
    // ... rest of profile
  },
];
```

### API Mocking
```typescript
// In tests
jest.mock('@/services/api', () => ({
  regional: {
    getRegions: jest.fn().mockResolvedValue({
      success: true,
      regions: mockRegions,
    }),
    getCreators: jest.fn().mockResolvedValue({
      success: true,
      creators: {
        items: mockCreators,
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
        hasMore: false,
      },
    }),
  },
}));
```

---

## Next Steps

1. Implement backend API endpoints
2. Add authentication middleware
3. Set up database schema
4. Implement rate limiting
5. Add WebSocket support
6. Write integration tests
7. Deploy to staging

---

**Last Updated**: 2024
**Status**: API Specification Complete

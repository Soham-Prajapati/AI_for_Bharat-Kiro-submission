# Community API Documentation

## Overview

The Community API enables creator networking, social features, discussion forums, and groups.

## Base URL

```
http://localhost:3000/api/community
```

## Endpoints

### Posts

#### Create Post
```http
POST /api/community/post
```

**Request Body:**
```json
{
  "userId": "user-123",
  "content": "Hello community!",
  "images": ["https://example.com/image.jpg"],
  "groupId": "group-456" // optional
}
```

**Response:**
```json
{
  "success": true,
  "post": {
    "id": "post-789",
    "userId": "user-123",
    "content": "Hello community!",
    "images": ["https://example.com/image.jpg"],
    "likes": 0,
    "comments": 0,
    "groupId": "group-456",
    "createdAt": "2026-02-27T..."
  }
}
```

---

#### Get Feed
```http
GET /api/community/feed?limit=50&offset=0&userId=user-123
```

**Query Parameters:**
- `limit` (optional): Number of posts to return (default: 50)
- `offset` (optional): Pagination offset (default: 0)
- `userId` (optional): Filter by user

**Response:**
```json
{
  "success": true,
  "posts": [
    {
      "id": "post-789",
      "userId": "user-123",
      "content": "Hello community!",
      "images": [],
      "likes": 5,
      "comments": 2,
      "createdAt": "2026-02-27T...",
      "updatedAt": "2026-02-27T..."
    }
  ],
  "count": 1,
  "limit": 50,
  "offset": 0
}
```

---

#### Get Post
```http
GET /api/community/post/:id
```

**Response:**
```json
{
  "success": true,
  "post": {
    "id": "post-789",
    "userId": "user-123",
    "content": "Hello community!",
    "images": [],
    "likes": ["user-456", "user-789"],
    "comments": [
      {
        "id": "comment-1",
        "userId": "user-456",
        "postId": "post-789",
        "content": "Great post!",
        "createdAt": "2026-02-27T..."
      }
    ],
    "createdAt": "2026-02-27T...",
    "updatedAt": "2026-02-27T..."
  }
}
```

---

#### Like Post
```http
POST /api/community/post/:id/like
```

**Request Body:**
```json
{
  "userId": "user-456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Post liked",
  "postId": "post-789"
}
```

---

#### Unlike Post
```http
DELETE /api/community/post/:id/like
```

**Request Body:**
```json
{
  "userId": "user-456"
}
```

---

#### Add Comment
```http
POST /api/community/post/:id/comment
```

**Request Body:**
```json
{
  "userId": "user-456",
  "content": "Great post!"
}
```

**Response:**
```json
{
  "success": true,
  "comment": {
    "id": "comment-1",
    "userId": "user-456",
    "postId": "post-789",
    "content": "Great post!",
    "createdAt": "2026-02-27T..."
  }
}
```

---

#### Delete Post
```http
DELETE /api/community/post/:id
```

**Request Body:**
```json
{
  "userId": "user-123"
}
```

**Note:** Only the post owner can delete their post.

---

### Groups

#### Create Group
```http
POST /api/community/group
```

**Request Body:**
```json
{
  "name": "Tech Creators",
  "description": "A community for tech content creators",
  "ownerId": "user-123"
}
```

**Response:**
```json
{
  "success": true,
  "group": {
    "id": "group-456",
    "name": "Tech Creators",
    "description": "A community for tech content creators",
    "ownerId": "user-123",
    "memberCount": 1,
    "postCount": 0,
    "createdAt": "2026-02-27T..."
  }
}
```

---

#### List Groups
```http
GET /api/community/groups?limit=50
```

**Response:**
```json
{
  "success": true,
  "groups": [
    {
      "id": "group-456",
      "name": "Tech Creators",
      "description": "A community for tech content creators",
      "ownerId": "user-123",
      "memberCount": 5,
      "postCount": 12,
      "createdAt": "2026-02-27T..."
    }
  ],
  "count": 1
}
```

---

#### Get Group
```http
GET /api/community/group/:id
```

**Response:**
```json
{
  "success": true,
  "group": {
    "id": "group-456",
    "name": "Tech Creators",
    "description": "A community for tech content creators",
    "ownerId": "user-123",
    "members": ["user-123", "user-456"],
    "posts": ["post-789", "post-101"],
    "createdAt": "2026-02-27T..."
  }
}
```

---

#### Join Group
```http
POST /api/community/group/:id/join
```

**Request Body:**
```json
{
  "userId": "user-456"
}
```

---

#### Leave Group
```http
POST /api/community/group/:id/leave
```

**Request Body:**
```json
{
  "userId": "user-456"
}
```

**Note:** Group owner cannot leave their own group.

---

### Users

#### Get User Profile
```http
GET /api/community/user/:id
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user-123",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "https://example.com/avatar.jpg",
    "bio": "Content creator and tech enthusiast",
    "followerCount": 150,
    "followingCount": 75,
    "createdAt": "2026-01-01T..."
  }
}
```

---

#### Follow User
```http
POST /api/community/user/:id/follow
```

**Request Body:**
```json
{
  "userId": "user-456"
}
```

---

#### Unfollow User
```http
POST /api/community/user/:id/unfollow
```

**Request Body:**
```json
{
  "userId": "user-456"
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": "Error message"
}
```

**Common Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Internal Server Error

---

## Testing

### Manual Test
```bash
# Start server
npm run dev

# Run test script
ts-node src/test-community.ts
```

### Automated Tests
```bash
npm test -- community
```

---

## Example Usage

```typescript
import axios from 'axios';

const API = 'http://localhost:3000/api/community';

// Create a post
const post = await axios.post(`${API}/post`, {
  userId: 'user-123',
  content: 'Hello world!'
});

// Get feed
const feed = await axios.get(`${API}/feed?limit=10`);

// Like a post
await axios.post(`${API}/post/${post.data.post.id}/like`, {
  userId: 'user-456'
});

// Add comment
await axios.post(`${API}/post/${post.data.post.id}/comment`, {
  userId: 'user-456',
  content: 'Great post!'
});
```

---

## Implementation Details

**Service:** `src/services/community.service.ts`
- In-memory storage (Map-based)
- Production: Migrate to DynamoDB

**Routes:** `src/routes/community.route.ts`
- 15 API endpoints
- Full CRUD operations
- Validation and error handling

**Tests:** `src/__tests__/community.test.ts`
- Comprehensive test coverage
- All endpoints tested

---

## Future Enhancements

- [ ] Persistence (DynamoDB)
- [ ] Content moderation (AWS Rekognition)
- [ ] Spam detection
- [ ] Notifications
- [ ] Real-time updates (WebSocket)
- [ ] Search functionality
- [ ] Trending posts
- [ ] User mentions (@username)
- [ ] Hashtags (#topic)
- [ ] Rich media support (videos, polls)

---

**Status:** ✅ Complete  
**Task:** 4.3c - Community API Routes  
**Date:** February 27, 2026

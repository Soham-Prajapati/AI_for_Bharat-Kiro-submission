# ADHD Navigator API Documentation

## Overview

The ADHD Navigator helps creators with ADHD stay focused using Pomodoro technique, task chunking, and gamification.

## Base URL

```
http://localhost:3000/api/adhd
```

## Features

- ⏱️ **Pomodoro Timer** - 25-minute focus sessions
- 🎮 **Gamification** - XP, levels, rewards
- 📊 **Progress Tracking** - Stats and history
- ✂️ **Task Chunking** - Break large tasks into manageable pieces
- ☕ **Smart Breaks** - Recommended break durations

## Endpoints

### Start Focus Session

```http
POST /api/adhd/session/start
```

**Request:**
```json
{
  "userId": "user-123",
  "taskName": "Write documentation",
  "duration": 25
}
```

**Response:**
```json
{
  "success": true,
  "session": {
    "id": "session-456",
    "userId": "user-123",
    "taskName": "Write documentation",
    "type": "focus",
    "duration": 25,
    "startTime": "2026-02-27T...",
    "endTime": "2026-02-27T..."
  },
  "message": "Focus session started for 25 minutes"
}
```

---

### Complete Session

```http
POST /api/adhd/session/:id/complete
```

**Response:**
```json
{
  "success": true,
  "session": {
    "id": "session-456",
    "completed": true,
    "duration": 25
  },
  "rewards": [
    {
      "id": "reward-1",
      "name": "First Focus",
      "description": "Completed your first focus session!",
      "xp": 50,
      "unlockedAt": "2026-02-27T..."
    }
  ],
  "message": "Great job! Session completed! 🎉"
}
```

---

### Interrupt Session

```http
POST /api/adhd/session/:id/interrupt
```

**Response:**
```json
{
  "success": true,
  "session": {
    "id": "session-456",
    "interrupted": true
  },
  "message": "Session interrupted. No worries, try again! 💪"
}
```

---

### Get Session Details

```http
GET /api/adhd/session/:id
```

---

### Get User Progress

```http
GET /api/adhd/progress/:userId
```

**Response:**
```json
{
  "success": true,
  "progress": {
    "userId": "user-123",
    "totalSessions": 10,
    "completedSessions": 8,
    "completionRate": 80,
    "totalFocusTime": 200,
    "totalFocusHours": 3.3,
    "streak": 3,
    "level": 2,
    "xp": 1500,
    "xpToNextLevel": 500
  }
}
```

---

### Get Session History

```http
GET /api/adhd/history/:userId?limit=50
```

**Response:**
```json
{
  "success": true,
  "userId": "user-123",
  "sessions": [
    {
      "id": "session-456",
      "taskName": "Write documentation",
      "duration": 25,
      "startTime": "2026-02-27T...",
      "endTime": "2026-02-27T...",
      "completed": true,
      "interrupted": false
    }
  ],
  "count": 1
}
```

---

### Chunk Large Task

```http
POST /api/adhd/task/chunk
```

**Request:**
```json
{
  "taskDescription": "Build authentication system",
  "estimatedMinutes": 120
}
```

**Response:**
```json
{
  "success": true,
  "originalTask": "Build authentication system",
  "estimatedMinutes": 120,
  "chunks": [
    "Build authentication system - Part 1/5",
    "Build authentication system - Part 2/5",
    "Build authentication system - Part 3/5",
    "Build authentication system - Part 4/5",
    "Build authentication system - Part 5/5"
  ],
  "totalChunks": 5,
  "recommendedBreaks": 1,
  "message": "Task broken into 5 manageable chunks!"
}
```

---

### Get Recommended Break

```http
GET /api/adhd/break/:userId
```

**Response:**
```json
{
  "success": true,
  "userId": "user-123",
  "completedSessions": 3,
  "recommendedBreakMinutes": 5,
  "message": "Quick break time! ☕"
}
```

**Note:** After every 4 sessions, recommends 15-minute break.

---

## Gamification System

### XP & Levels

- **XP per session:** Duration × 10 (25 min = 250 XP)
- **Level up:** Every 1000 XP
- **Level formula:** `floor(XP / 1000) + 1`

### Rewards

| Milestone | Reward | XP Bonus |
|-----------|--------|----------|
| 1st session | First Focus | +50 XP |
| 10 sessions | Focus Master | +200 XP |
| Level up | Level N | +100 XP |

---

## Usage Example

```typescript
import axios from 'axios';

const API = 'http://localhost:3000/api/adhd';
const userId = 'user-123';

// Start session
const session = await axios.post(`${API}/session/start`, {
  userId,
  taskName: 'Write code',
  duration: 25
});

// Wait 25 minutes...

// Complete session
const result = await axios.post(
  `${API}/session/${session.data.session.id}/complete`
);

console.log('Rewards:', result.data.rewards);

// Check progress
const progress = await axios.get(`${API}/progress/${userId}`);
console.log('Level:', progress.data.progress.level);
console.log('XP:', progress.data.progress.xp);
```

---

## Testing

```bash
# Manual test
ts-node src/test-adhd.ts

# Automated tests
npm test -- adhd
```

---

## Implementation

- **Service:** `src/services/adhd-navigator.service.ts`
- **Routes:** `src/routes/adhd.route.ts`
- **Tests:** `src/__tests__/adhd.test.ts`

---

**Status:** ✅ Complete  
**Task:** 5.1c - ADHD API Routes  
**Date:** February 27, 2026

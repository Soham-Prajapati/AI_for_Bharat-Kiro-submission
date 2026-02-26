# 📋 API Schemas

**JSON Schema definitions for all API objects**

---

## UploadRequest

**POST /api/upload**

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["file", "type"],
  "properties": {
    "file": {
      "type": "string",
      "format": "binary",
      "description": "File to upload"
    },
    "type": {
      "type": "string",
      "enum": ["video", "audio", "text"],
      "description": "Content type"
    },
    "metadata": {
      "type": "object",
      "properties": {
        "title": { "type": "string", "maxLength": 200 },
        "domain": {
          "type": "string",
          "enum": ["food", "education", "travel", "product-review"]
        },
        "language": { "type": "string", "pattern": "^[a-z]{2}$" },
        "tags": {
          "type": "array",
          "items": { "type": "string" },
          "maxItems": 10
        }
      }
    }
  }
}
```

**Example:**
```json
{
  "file": "[binary data]",
  "type": "video",
  "metadata": {
    "title": "Butter Chicken Recipe",
    "domain": "food",
    "language": "en",
    "tags": ["cooking", "indian", "recipe"]
  }
}
```

---

## UploadResponse

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["id", "status", "url", "createdAt"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^content_[a-zA-Z0-9]+$",
      "description": "Unique content ID"
    },
    "status": {
      "type": "string",
      "enum": ["uploading", "processing", "completed", "failed"],
      "description": "Current status"
    },
    "url": {
      "type": "string",
      "format": "uri",
      "description": "Content URL"
    },
    "createdAt": {
      "type": "string",
      "format": "date-time",
      "description": "Upload timestamp"
    },
    "estimatedTime": {
      "type": "integer",
      "description": "Estimated processing time in seconds"
    }
  }
}
```

**Example:**
```json
{
  "id": "content_abc123",
  "status": "processing",
  "url": "https://cdn.example.com/content_abc123",
  "createdAt": "2026-02-26T22:00:00Z",
  "estimatedTime": 45
}
```

---

## Content

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["id", "type", "status", "url", "createdAt"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^content_[a-zA-Z0-9]+$"
    },
    "type": {
      "type": "string",
      "enum": ["video", "audio", "text"]
    },
    "status": {
      "type": "string",
      "enum": ["uploading", "processing", "completed", "failed"]
    },
    "url": {
      "type": "string",
      "format": "uri"
    },
    "metadata": {
      "type": "object",
      "properties": {
        "title": { "type": "string" },
        "domain": { "type": "string" },
        "duration": { "type": "integer", "description": "Duration in seconds" },
        "size": { "type": "integer", "description": "File size in bytes" },
        "format": { "type": "string", "description": "File format (mp4, mp3, etc)" },
        "resolution": { "type": "string", "description": "Video resolution (1080p, 720p, etc)" }
      }
    },
    "createdAt": {
      "type": "string",
      "format": "date-time"
    },
    "completedAt": {
      "type": "string",
      "format": "date-time"
    }
  }
}
```

**Example:**
```json
{
  "id": "content_abc123",
  "type": "video",
  "status": "completed",
  "url": "https://cdn.example.com/content_abc123",
  "metadata": {
    "title": "Butter Chicken Recipe",
    "domain": "food",
    "duration": 180,
    "size": 52428800,
    "format": "mp4",
    "resolution": "1080p"
  },
  "createdAt": "2026-02-26T22:00:00Z",
  "completedAt": "2026-02-26T22:01:00Z"
}
```

---

## AnalysisResult

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["id", "contentId", "status", "results"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^analysis_[a-zA-Z0-9]+$"
    },
    "contentId": {
      "type": "string",
      "pattern": "^content_[a-zA-Z0-9]+$"
    },
    "status": {
      "type": "string",
      "enum": ["processing", "completed", "failed"]
    },
    "results": {
      "type": "object",
      "properties": {
        "summary": {
          "type": "string",
          "description": "Content summary"
        },
        "keywords": {
          "type": "array",
          "items": { "type": "string" },
          "description": "Extracted keywords"
        },
        "domain": {
          "type": "string",
          "enum": ["food", "education", "travel", "product-review"],
          "description": "Detected domain"
        },
        "sentiment": {
          "type": "string",
          "enum": ["positive", "neutral", "negative"],
          "description": "Overall sentiment"
        },
        "language": {
          "type": "string",
          "pattern": "^[a-z]{2}$",
          "description": "Detected language (ISO 639-1)"
        },
        "confidence": {
          "type": "number",
          "minimum": 0,
          "maximum": 1,
          "description": "Analysis confidence score"
        },
        "transcript": {
          "type": "string",
          "description": "Full transcript (for video/audio)"
        },
        "keyMoments": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "time": { "type": "integer", "description": "Timestamp in seconds" },
              "description": { "type": "string" },
              "importance": {
                "type": "string",
                "enum": ["high", "medium", "low"]
              }
            }
          }
        },
        "entities": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "type": { "type": "string", "description": "Entity type (person, place, ingredient, etc)" },
              "name": { "type": "string" },
              "mentions": { "type": "integer" }
            }
          }
        }
      }
    },
    "completedAt": {
      "type": "string",
      "format": "date-time"
    }
  }
}
```

**Example:**
```json
{
  "id": "analysis_xyz789",
  "contentId": "content_abc123",
  "status": "completed",
  "results": {
    "summary": "A cooking tutorial showing how to make butter chicken with step-by-step instructions.",
    "keywords": ["butter chicken", "indian cuisine", "recipe", "cooking"],
    "domain": "food",
    "sentiment": "positive",
    "language": "en",
    "confidence": 0.95,
    "transcript": "Welcome to my kitchen. Today we're making butter chicken...",
    "keyMoments": [
      { "time": 15, "description": "Marinating chicken", "importance": "high" },
      { "time": 45, "description": "Making sauce", "importance": "high" }
    ],
    "entities": [
      { "type": "ingredient", "name": "chicken", "mentions": 5 },
      { "type": "ingredient", "name": "tomatoes", "mentions": 3 }
    ]
  },
  "completedAt": "2026-02-26T22:01:30Z"
}
```

---

## GeneratedOutput

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["id", "contentId", "status", "outputs"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^gen_[a-zA-Z0-9]+$"
    },
    "contentId": {
      "type": "string",
      "pattern": "^content_[a-zA-Z0-9]+$"
    },
    "status": {
      "type": "string",
      "enum": ["processing", "completed", "failed"]
    },
    "outputs": {
      "type": "object",
      "additionalProperties": {
        "type": "object",
        "description": "Platform-specific output"
      }
    },
    "completedAt": {
      "type": "string",
      "format": "date-time"
    }
  }
}
```

**Platform-Specific Schemas:**

### YouTube Short
```json
{
  "title": { "type": "string", "maxLength": 100 },
  "description": { "type": "string", "maxLength": 5000 },
  "tags": { "type": "array", "items": { "type": "string" }, "maxItems": 15 },
  "duration": { "type": "integer", "maximum": 60 },
  "format": { "type": "string", "enum": ["vertical", "horizontal"] }
}
```

### Instagram Reel
```json
{
  "caption": { "type": "string", "maxLength": 2200 },
  "hashtags": { "type": "array", "items": { "type": "string" }, "maxItems": 30 },
  "music": { "type": "string", "description": "Suggested music ID" },
  "duration": { "type": "integer", "maximum": 90 }
}
```

### Twitter Thread
```json
{
  "tweets": {
    "type": "array",
    "items": { "type": "string", "maxLength": 280 }
  },
  "totalTweets": { "type": "integer" }
}
```

**Example:**
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
      "duration": 60,
      "format": "vertical"
    },
    "instagram_reel": {
      "caption": "🍗 Butter Chicken made easy! #cooking #indianfood",
      "hashtags": ["#cooking", "#indianfood", "#recipe"],
      "music": "trending_audio_123",
      "duration": 30
    }
  },
  "completedAt": "2026-02-26T22:02:00Z"
}
```

---

## Error

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["error"],
  "properties": {
    "error": {
      "type": "object",
      "required": ["code", "message"],
      "properties": {
        "code": {
          "type": "string",
          "description": "Error code"
        },
        "message": {
          "type": "string",
          "description": "Human-readable error message"
        },
        "details": {
          "type": "object",
          "description": "Additional error context"
        }
      }
    }
  }
}
```

**Example:**
```json
{
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "File exceeds maximum size of 500MB",
    "details": {
      "maxSize": 524288000,
      "actualSize": 600000000,
      "unit": "bytes"
    }
  }
}
```

---

## User

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["id", "email", "plan", "createdAt"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^user_[a-zA-Z0-9]+$"
    },
    "email": {
      "type": "string",
      "format": "email"
    },
    "name": {
      "type": "string"
    },
    "plan": {
      "type": "string",
      "enum": ["free", "pro", "enterprise"]
    },
    "limits": {
      "type": "object",
      "properties": {
        "uploadsPerDay": { "type": "integer" },
        "maxFileSize": { "type": "integer", "description": "Max file size in bytes" },
        "requestsPerHour": { "type": "integer" }
      }
    },
    "usage": {
      "type": "object",
      "properties": {
        "uploadsToday": { "type": "integer" },
        "requestsThisHour": { "type": "integer" },
        "totalContent": { "type": "integer" }
      }
    },
    "createdAt": {
      "type": "string",
      "format": "date-time"
    }
  }
}
```

**Example:**
```json
{
  "id": "user_john123",
  "email": "john@example.com",
  "name": "John Doe",
  "plan": "pro",
  "limits": {
    "uploadsPerDay": 100,
    "maxFileSize": 2147483648,
    "requestsPerHour": 1000
  },
  "usage": {
    "uploadsToday": 5,
    "requestsThisHour": 23,
    "totalContent": 145
  },
  "createdAt": "2026-01-15T10:00:00Z"
}
```

---

## Pagination

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["page", "limit", "total", "pages"],
  "properties": {
    "page": {
      "type": "integer",
      "minimum": 1,
      "description": "Current page number"
    },
    "limit": {
      "type": "integer",
      "minimum": 1,
      "maximum": 100,
      "description": "Items per page"
    },
    "total": {
      "type": "integer",
      "minimum": 0,
      "description": "Total number of items"
    },
    "pages": {
      "type": "integer",
      "minimum": 0,
      "description": "Total number of pages"
    },
    "hasNext": {
      "type": "boolean",
      "description": "Has next page"
    },
    "hasPrev": {
      "type": "boolean",
      "description": "Has previous page"
    }
  }
}
```

**Example:**
```json
{
  "page": 2,
  "limit": 10,
  "total": 45,
  "pages": 5,
  "hasNext": true,
  "hasPrev": true
}
```

---

## TypeScript Definitions

```typescript
// Upload
interface UploadRequest {
  file: File | Buffer;
  type: 'video' | 'audio' | 'text';
  metadata?: {
    title?: string;
    domain?: 'food' | 'education' | 'travel' | 'product-review';
    language?: string;
    tags?: string[];
  };
}

interface UploadResponse {
  id: string;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  url: string;
  createdAt: string;
  estimatedTime?: number;
}

// Content
interface Content {
  id: string;
  type: 'video' | 'audio' | 'text';
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  url: string;
  metadata: {
    title?: string;
    domain?: string;
    duration?: number;
    size?: number;
    format?: string;
    resolution?: string;
  };
  createdAt: string;
  completedAt?: string;
}

// Analysis
interface AnalysisResult {
  id: string;
  contentId: string;
  status: 'processing' | 'completed' | 'failed';
  results: {
    summary: string;
    keywords: string[];
    domain: 'food' | 'education' | 'travel' | 'product-review';
    sentiment: 'positive' | 'neutral' | 'negative';
    language: string;
    confidence: number;
    transcript?: string;
    keyMoments?: Array<{
      time: number;
      description: string;
      importance: 'high' | 'medium' | 'low';
    }>;
    entities?: Array<{
      type: string;
      name: string;
      mentions: number;
    }>;
  };
  completedAt?: string;
}

// Generated Output
interface GeneratedOutput {
  id: string;
  contentId: string;
  status: 'processing' | 'completed' | 'failed';
  outputs: {
    [platform: string]: any;
  };
  completedAt?: string;
}

// Error
interface APIError {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

// User
interface User {
  id: string;
  email: string;
  name?: string;
  plan: 'free' | 'pro' | 'enterprise';
  limits: {
    uploadsPerDay: number;
    maxFileSize: number;
    requestsPerHour: number;
  };
  usage: {
    uploadsToday: number;
    requestsThisHour: number;
    totalContent: number;
  };
  createdAt: string;
}
```

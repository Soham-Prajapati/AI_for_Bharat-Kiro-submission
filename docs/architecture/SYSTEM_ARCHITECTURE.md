# System Architecture

**Project:** Content Intelligence Platform  
**Architecture Style:** Microservices-inspired, Serverless-ready  
**Deployment:** AWS Cloud

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER LAYER                               │
│  Web Browser (React SPA) + Mobile Browser (Responsive)          │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND LAYER                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  React 18 Application                                     │  │
│  │  - Upload UI  - Dashboard  - Editor  - Export            │  │
│  │  - Real-time Streaming (SSE)  - State Management         │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │ REST API + SSE
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND LAYER                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Node.js + Express + TypeScript                          │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐         │  │
│  │  │   Upload   │  │  Process   │  │  Generate  │         │  │
│  │  │  Service   │  │  Service   │  │  Service   │         │  │
│  │  └────────────┘  └────────────┘  └────────────┘         │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐         │  │
│  │  │   Domain   │  │Translation │  │    SEO     │         │  │
│  │  │ Detection  │  │  Service   │  │  Service   │         │  │
│  │  └────────────┘  └────────────┘  └────────────┘         │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │ AWS SDK
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AWS SERVICES LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Bedrock    │  │  Transcribe  │  │ Rekognition  │         │
│  │ (Claude 3.5) │  │   (Audio)    │  │   (Vision)   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │      S3      │  │  DynamoDB    │  │ CloudWatch   │         │
│  │  (Storage)   │  │   (Cache)    │  │ (Monitoring) │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### **1. Frontend Architecture**

```
frontend/
├── src/
│   ├── pages/                    # Route-level components
│   │   ├── Landing.tsx           # Marketing page
│   │   ├── Upload.tsx            # Video upload
│   │   ├── Dashboard.tsx         # Results display
│   │   ├── Editor.tsx            # Content editing
│   │   └── Export.tsx            # Export options
│   │
│   ├── components/               # Reusable UI components
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Modal.tsx
│   │   ├── upload/
│   │   │   ├── UploadZone.tsx    # Drag-drop area
│   │   │   └── ProgressBar.tsx   # Upload progress
│   │   ├── dashboard/
│   │   │   ├── ContentCard.tsx   # Generated content
│   │   │   ├── DomainBadge.tsx   # Domain indicator
│   │   │   └── StreamingOutput.tsx # Real-time display
│   │   └── editor/
│   │       ├── TextEditor.tsx    # Rich text editing
│   │       └── ApprovalButtons.tsx # Approve/reject
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── useUpload.ts          # Upload logic
│   │   ├── useStreaming.ts       # SSE connection
│   │   ├── useGeneration.ts      # Generation state
│   │   └── useExport.ts          # Export logic
│   │
│   ├── context/                  # React Context
│   │   ├── AppContext.tsx        # Global state
│   │   └── AuthContext.tsx       # Auth state (future)
│   │
│   ├── services/                 # API clients
│   │   └── api.ts                # Axios instance + endpoints
│   │
│   ├── types/                    # TypeScript types
│   │   ├── api.types.ts
│   │   └── ui.types.ts
│   │
│   └── utils/                    # Utilities
│       ├── formatting.ts
│       └── validation.ts
```

**Key Patterns:**
- **Component Composition:** Small, reusable components
- **Custom Hooks:** Encapsulate logic, separate from UI
- **Context API:** Global state (avoid prop drilling)
- **Server-Sent Events (SSE):** Real-time streaming

---

### **2. Backend Architecture**

```
src/
├── routes/                       # API endpoints
│   ├── upload.routes.ts          # POST /api/upload
│   ├── process.routes.ts         # POST /api/process
│   ├── generate.routes.ts        # POST /api/generate
│   └── health.routes.ts          # GET /health
│
├── services/                     # Business logic
│   ├── aws/
│   │   ├── bedrock.service.ts    # Bedrock API calls
│   │   ├── transcription.service.ts # Transcribe API
│   │   ├── rekognition.service.ts # Rekognition API
│   │   ├── s3.service.ts         # S3 operations
│   │   └── cache.service.ts      # DynamoDB cache
│   │
│   ├── ai/
│   │   ├── domain-detection.service.ts # Detect domain
│   │   ├── content-generation.service.ts # Generate content
│   │   ├── translation.service.ts # Multi-language
│   │   ├── seo.service.ts        # SEO optimization
│   │   └── ollama.service.ts     # Local AI testing
│   │
│   └── processing/
│       ├── video-processor.service.ts # Video handling
│       └── content-analyzer.service.ts # Content analysis
│
├── middleware/                   # Express middleware
│   ├── auth.middleware.ts        # Authentication (future)
│   ├── error.middleware.ts       # Error handling
│   ├── validation.middleware.ts  # Request validation
│   └── rate-limit.middleware.ts  # Rate limiting
│
├── prompts/                      # AI prompts
│   ├── education.prompts.ts
│   ├── food.prompts.ts
│   ├── travel.prompts.ts
│   ├── product-review.prompts.ts
│   └── generic.prompts.ts
│
├── types/                        # TypeScript types
│   ├── api.types.ts
│   ├── domain.types.ts
│   ├── generation.types.ts
│   └── aws.types.ts
│
├── config/                       # Configuration
│   ├── aws.config.ts             # AWS SDK config
│   ├── server.config.ts          # Express config
│   └── constants.ts              # App constants
│
├── utils/                        # Utilities
│   ├── logger.ts                 # Winston logger
│   ├── prompt-builder.ts         # Build prompts
│   ├── content-validator.ts      # Validate outputs
│   └── cost-tracker.ts           # Track AWS costs
│
└── __tests__/                    # Tests
    ├── services/
    ├── routes/
    └── integration/
```

**Key Patterns:**
- **Service Layer:** Business logic separated from routes
- **Dependency Injection:** Services injected into routes
- **Error Handling:** Centralized error middleware
- **Caching:** DynamoDB for response caching
- **Logging:** Structured logging with Winston

---

## Data Flow

### **1. Video Upload Flow**

```
User                Frontend              Backend               AWS
 │                     │                     │                   │
 │  Select Video       │                     │                   │
 ├──────────────────>  │                     │                   │
 │                     │  POST /api/upload   │                   │
 │                     ├──────────────────>  │                   │
 │                     │                     │  Upload to S3     │
 │                     │                     ├─────────────────> │
 │                     │                     │  S3 URL           │
 │                     │                     │ <───────────────── │
 │                     │  { videoId, url }   │                   │
 │                     │ <──────────────────┤                   │
 │  Upload Success     │                     │                   │
 │ <──────────────────┤                     │                   │
```

### **2. Content Processing Flow**

```
Frontend              Backend               AWS Services
   │                     │                       │
   │  POST /api/process  │                       │
   ├──────────────────>  │                       │
   │                     │  Check Cache          │
   │                     ├──────────────────────>│ DynamoDB
   │                     │  Cache Miss           │
   │                     │ <─────────────────────┤
   │                     │                       │
   │                     │  Start Transcription  │
   │                     ├──────────────────────>│ Transcribe
   │                     │  Job ID               │
   │                     │ <─────────────────────┤
   │                     │                       │
   │                     │  Poll Job Status      │
   │                     ├──────────────────────>│
   │                     │  Transcript           │
   │                     │ <─────────────────────┤
   │                     │                       │
   │                     │  Analyze Images       │
   │                     ├──────────────────────>│ Rekognition
   │                     │  Labels               │
   │                     │ <─────────────────────┤
   │                     │                       │
   │                     │  Detect Domain        │
   │                     ├──────────────────────>│ Bedrock
   │                     │  Domain + Confidence  │
   │                     │ <─────────────────────┤
   │                     │                       │
   │                     │  Cache Result         │
   │                     ├──────────────────────>│ DynamoDB
   │                     │                       │
   │  Processing Result  │                       │
   │ <──────────────────┤                       │
```

### **3. Content Generation Flow (Real-Time Streaming)**

```
Frontend              Backend               AWS Bedrock
   │                     │                       │
   │  POST /api/generate │                       │
   │  (SSE connection)   │                       │
   ├──────────────────>  │                       │
   │                     │  Build Prompt         │
   │                     │  (domain-specific)    │
   │                     │                       │
   │                     │  Invoke Model         │
   │                     │  (streaming=true)     │
   │                     ├──────────────────────>│
   │                     │                       │
   │                     │  Token 1              │
   │                     │ <─────────────────────┤
   │  SSE: Token 1       │                       │
   │ <──────────────────┤                       │
   │                     │  Token 2              │
   │                     │ <─────────────────────┤
   │  SSE: Token 2       │                       │
   │ <──────────────────┤                       │
   │                     │  ...                  │
   │                     │  Token N              │
   │                     │ <─────────────────────┤
   │  SSE: Token N       │                       │
   │ <──────────────────┤                       │
   │                     │  Complete             │
   │                     │ <─────────────────────┤
   │  SSE: [DONE]        │                       │
   │ <──────────────────┤                       │
```

---

## API Design

### **RESTful Endpoints**

```typescript
// Upload video
POST /api/upload
Content-Type: multipart/form-data
Body: { file: File }
Response: { videoId: string, url: string }

// Process video
POST /api/process
Body: { videoId: string }
Response: { 
  transcript: string, 
  domain: string, 
  confidence: number,
  keyframes: string[]
}

// Generate content (streaming)
POST /api/generate
Body: { 
  videoId: string, 
  platform: 'instagram' | 'twitter' | 'linkedin' | 'blog',
  language?: string
}
Response: Server-Sent Events stream

// Get cached result
GET /api/cache/:contentHash
Response: { cached: boolean, data?: any }

// Health check
GET /health
Response: { status: 'ok', timestamp: string }

// Cost report
GET /api/admin/costs
Response: { total: number, breakdown: {...} }
```

---

## Database Schema

### **DynamoDB Table: content-intelligence-cache**

```typescript
{
  // Partition Key
  contentHash: string,        // SHA-256 of video content
  
  // Attributes
  videoId: string,
  transcript: string,
  domain: string,
  confidence: number,
  keyframes: string[],        // S3 URLs
  generatedContent: {
    instagram: string,
    twitter: string,
    linkedin: string,
    blog: string,
    youtube: string
  },
  translations: {
    [language: string]: {
      instagram: string,
      twitter: string,
      // ...
    }
  },
  seo: {
    keywords: string[],
    metaDescription: string,
    titles: string[]
  },
  
  // Metadata
  createdAt: number,          // Unix timestamp
  expiresAt: number,          // TTL (24 hours)
  costUSD: number,            // AWS cost for this video
  processingTimeMs: number
}
```

**Indexes:**
- Primary Key: `contentHash`
- TTL: `expiresAt` (auto-delete after 24 hours)

---

## Caching Strategy

### **Cache Levels**

1. **DynamoDB Cache (24hr TTL)**
   - Cache all AWS responses
   - Key: SHA-256 hash of video content
   - Saves: Transcription, domain detection, generation

2. **In-Memory Cache (1hr TTL)**
   - Cache frequent prompts
   - Cache domain detection results
   - Faster than DynamoDB

3. **Browser Cache**
   - Cache static assets
   - Cache API responses (short TTL)

### **Cache Invalidation**

- **Time-based:** 24-hour TTL
- **Manual:** Admin endpoint to clear cache
- **Size-based:** Limit cache size (future)

---

## Security Architecture

### **Current (Hackathon)**

- **CORS:** Whitelist frontend origin
- **Rate Limiting:** 100 requests/minute per IP
- **Input Validation:** Zod schemas
- **File Upload:** Max 500MB, video formats only
- **Error Handling:** No sensitive data in errors

### **Future (Production)**

- **Authentication:** JWT tokens
- **Authorization:** Role-based access control
- **Encryption:** S3 encryption at rest
- **API Keys:** For external access
- **WAF:** AWS WAF for DDoS protection

---

## Scalability Considerations

### **Current Architecture (Hackathon)**

- Single Node.js server
- AWS managed services (auto-scale)
- DynamoDB on-demand pricing (auto-scale)

### **Future Scaling (Production)**

```
┌─────────────────────────────────────────────────────────────┐
│                      Load Balancer (ALB)                     │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
    ┌────────┐      ┌────────┐      ┌────────┐
    │ Node 1 │      │ Node 2 │      │ Node N │
    └────────┘      └────────┘      └────────┘
         │               │               │
         └───────────────┼───────────────┘
                         ▼
              ┌──────────────────────┐
              │   AWS Services       │
              │   (Auto-scaling)     │
              └──────────────────────┘
```

**Scaling Strategies:**
- **Horizontal:** Add more Node.js instances
- **Vertical:** Increase instance size
- **Caching:** Redis for distributed cache
- **CDN:** CloudFront for static assets
- **Queue:** SQS for async processing

---

## Monitoring & Observability

### **Metrics to Track**

```typescript
// Performance Metrics
- API response time (p50, p95, p99)
- Video processing time
- AWS service latency
- Cache hit rate

// Business Metrics
- Videos processed
- Content generated
- User satisfaction
- Domain detection accuracy

// Cost Metrics
- AWS cost per video
- Total daily cost
- Cost by service (Bedrock, Transcribe, etc.)

// Error Metrics
- Error rate by endpoint
- Failed uploads
- Failed generations
- Timeout rate
```

### **Logging Strategy**

```typescript
// Structured Logging (Winston)
{
  timestamp: '2026-02-26T12:00:00.000Z',
  level: 'info',
  service: 'content-generation',
  videoId: 'abc123',
  domain: 'education',
  duration: 1234,
  cost: 0.05,
  message: 'Content generated successfully'
}
```

### **Alerting**

- **CloudWatch Alarms:**
  - Cost > $50, $70, $80
  - Error rate > 5%
  - Response time > 5 seconds
  - Failed uploads > 10/hour

---

## Deployment Architecture

### **Development**

```
Local Machine
├── Backend: localhost:3001
├── Frontend: localhost:3000
├── Ollama: localhost:11434
└── AWS: Development account
```

### **Demo (Hackathon)**

```
AWS EC2 / Elastic Beanstalk
├── Backend: https://api.content-intelligence.com
├── Frontend: https://content-intelligence.com (S3 + CloudFront)
└── AWS Services: Production account
```

### **Future (Production)**

```
AWS Multi-Region
├── Primary: us-east-1
├── Backup: us-west-2
├── CDN: CloudFront (global)
└── Database: DynamoDB Global Tables
```

---

## Technology Decisions

### **Why Node.js + TypeScript?**
- Fast development
- Strong typing (fewer bugs)
- Great AWS SDK support
- Team expertise

### **Why React?**
- Component-based architecture
- Large ecosystem
- Team expertise
- Fast development

### **Why AWS Bedrock?**
- Claude 3.5 Sonnet (best quality)
- Managed service (no infrastructure)
- Pay-per-use pricing
- Easy integration

### **Why DynamoDB?**
- Serverless (no management)
- Fast (single-digit ms latency)
- Auto-scaling
- TTL support (auto-delete)

### **Why Ollama for Testing?**
- Free (save AWS credits)
- Local (fast iteration)
- Good quality (Llama 3.1 8B)
- Easy setup

---

**This architecture is designed for rapid development, cost efficiency, and demo readiness!** 🚀

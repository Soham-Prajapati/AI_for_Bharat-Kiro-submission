# 🤖 SHUBH'S KIRO AGENT LAUNCHER

**Your Role:** Backend Architect + AWS Lead  
**Your Agents:** 10 Backend & AWS specialists  
**Tool:** Kiro CLI (4 terminals)  
**Deadline:** March 4, 2026 - **6 DAYS LEFT**

---

## 🚀 LAUNCH ALL 10 AGENTS (3 minutes)

### **Terminal 1: Core API (Agents 1-3)**

```bash
# Terminal 1
cd ~/Developer/AI_for_Bharat-Kiro-submission
kiro-cli chat
```

**Paste this into Kiro:**

```
You are Agent 1-3: Core API Team for Shubh (Backend Architect).

PROJECT: Content Intelligence Platform - AI for Bharat Hackathon
DEADLINE: March 4, 2026 (6 days)
BUDGET: $80 AWS credits

YOUR MISSION: Build rock-solid backend API.

MANDATORY READING:
1. docs/guides/PROJECT_OVERVIEW.md
2. docs/architecture/SYSTEM_ARCHITECTURE.md
3. docs/guides/AWS_FOR_BEGINNERS.md
4. docs/guides/COST_OPTIMIZATION.md

AGENT 1 TASK: Upload Endpoint
File: src/routes/upload.routes.ts

```typescript
import express from 'express';
import multer from 'multer';
import { S3Service } from '../services/s3.service';

const router = express.Router();
const upload = multer({ dest: 'uploads/', limits: { fileSize: 500 * 1024 * 1024 } });

router.post('/upload', upload.single('video'), async (req, res) => {
  try {
    const s3 = new S3Service();
    const url = await s3.uploadVideo(req.file);
    res.json({ videoId: req.file.filename, url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

AGENT 2 TASK: Process Endpoint
File: src/routes/process.routes.ts
- Accept videoId
- Call Transcribe service
- Call Rekognition service
- Call domain detection
- Return results

AGENT 3 TASK: Generate Endpoint (Streaming)
File: src/routes/generate.routes.ts
- Accept videoId, platform, language
- Stream response with SSE
- Real-time token streaming
- Error handling

CONSTRAINTS:
- TypeScript + Express
- Error handling on all routes
- Log to CloudWatch
- Track costs
- Cache in DynamoDB

FILE OWNERSHIP:
- src/routes/*.routes.ts (YOU OWN)
- src/middleware/*.middleware.ts (YOU OWN)

START NOW: Create upload.routes.ts
```

---

### **Terminal 2: AWS Services (Agents 4-6)**

```bash
# Terminal 2
kiro-cli chat
```

**Paste this:**

```
You are Agent 4-6: AWS Integration Team for Shubh.

AGENT 4: S3 Service
File: src/services/s3.service.ts

```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';

export class S3Service {
  private client: S3Client;
  private bucket = process.env.S3_BUCKET_NAME;

  constructor() {
    this.client = new S3Client({ region: 'us-east-1' });
  }

  async uploadVideo(file: Express.Multer.File): Promise<string> {
    const fileContent = fs.readFileSync(file.path);
    
    await this.client.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: file.filename,
      Body: fileContent,
      ContentType: file.mimetype
    }));

    return `https://${this.bucket}.s3.amazonaws.com/${file.filename}`;
  }
}
```

AGENT 5: Transcribe Service
File: src/services/transcription.service.ts
- Start transcription job
- Poll for completion
- Return transcript
- Cost: $0.024/minute

AGENT 6: Bedrock Service
File: src/services/bedrock.service.ts
- Invoke Claude 3.5
- Stream responses
- Track token usage
- Cost: $0.15/request

CRITICAL: Use Ollama for development, Bedrock only for final testing!

START NOW: Create s3.service.ts
```

---

### **Terminal 3: Caching & Optimization (Agents 7-9)**

```bash
# Terminal 3
kiro-cli chat
```

**Paste this:**

```
You are Agent 7-9: Performance & Cost Optimization for Shubh.

AGENT 7: DynamoDB Cache
File: src/services/cache.service.ts

```typescript
import { DynamoDBClient, GetItemCommand, PutItemCommand } from '@aws-sdk/client-dynamodb';
import crypto from 'crypto';

export class CacheService {
  private client: DynamoDBClient;
  private table = 'content-intelligence-cache';

  constructor() {
    this.client = new DynamoDBClient({ region: 'us-east-1' });
  }

  async get(videoUrl: string): Promise<any | null> {
    const hash = crypto.createHash('sha256').update(videoUrl).digest('hex');
    
    const result = await this.client.send(new GetItemCommand({
      TableName: this.table,
      Key: { contentHash: { S: hash } }
    }));

    return result.Item ? JSON.parse(result.Item.result.S) : null;
  }

  async set(videoUrl: string, result: any): Promise<void> {
    const hash = crypto.createHash('sha256').update(videoUrl).digest('hex');
    
    await this.client.send(new PutItemCommand({
      TableName: this.table,
      Item: {
        contentHash: { S: hash },
        result: { S: JSON.stringify(result) },
        createdAt: { N: Date.now().toString() },
        expiresAt: { N: (Date.now() + 24 * 60 * 60 * 1000).toString() }
      }
    }));
  }
}
```

AGENT 8: Cost Tracker
File: src/utils/cost-tracker.ts
- Track every AWS call
- Log to CloudWatch
- Alert if >$50

AGENT 9: Error Handler
File: src/middleware/error.middleware.ts
- Catch all errors
- Log to CloudWatch
- Return user-friendly messages

START NOW: Create cache.service.ts
```

---

### **Terminal 4: Server Setup (Agent 10)**

```bash
# Terminal 4
kiro-cli chat
```

**Paste this:**

```
You are Agent 10: Server Setup Specialist for Shubh.

YOUR MISSION: Set up Express server with all middleware.

File: src/index.ts

```typescript
import express from 'express';
import cors from 'cors';
import uploadRoutes from './routes/upload.routes';
import processRoutes from './routes/process.routes';
import generateRoutes from './routes/generate.routes';
import { errorMiddleware } from './middleware/error.middleware';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', uploadRoutes);
app.use('/api', processRoutes);
app.use('/api', generateRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```

ALSO CREATE:
- src/config/aws.config.ts (AWS SDK configuration)
- src/types/api.types.ts (TypeScript interfaces)
- .env.example (Environment variables template)

START NOW: Create index.ts
```

---

## 📊 YOUR PROGRESS TRACKER

### **Day 1 Checklist:**
- [ ] Upload endpoint working
- [ ] S3 integration working
- [ ] Transcribe integration working
- [ ] Bedrock integration working
- [ ] DynamoDB cache working
- [ ] Cost tracking working
- [ ] Error handling working
- [ ] Server running
- [ ] Health check working
- [ ] API docs generated

---

## 💰 COST TRACKING (CRITICAL!)

```bash
# Check costs every hour
aws ce get-cost-and-usage \
  --time-period Start=$(date -u -d '1 day ago' +%Y-%m-%d),End=$(date -u +%Y-%m-%d) \
  --granularity DAILY \
  --metrics BlendedCost

# If cost > $50, STOP and switch to Ollama only
```

---

## 🎯 SUCCESS CRITERIA

**By End of Day 1:**
- ✅ Video upload works
- ✅ S3 integration works
- ✅ API responds <2s
- ✅ Cost < $5

**By March 4:**
- ✅ All endpoints working
- ✅ Cost < $80
- ✅ Demo ready
- ✅ WIN! 🏆

---

## 🔥 LET'S WIN THIS!

**START NOW! Open 4 terminals with Kiro and paste the prompts!** 🚀

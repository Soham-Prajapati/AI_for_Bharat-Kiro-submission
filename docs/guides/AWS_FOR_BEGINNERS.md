# AWS for Beginners - Complete Guide

**Your Situation:** First time using AWS, $80 free credits, need to build a hackathon project

**Don't Worry!** This guide explains everything step-by-step like you're 5 years old.

---

## What is AWS?

**AWS (Amazon Web Services)** = Amazon's cloud computers that you can rent

Think of it like this:
- **Your laptop** = One computer you own
- **AWS** = Thousands of computers Amazon owns that you can use (and pay for what you use)

**Why use AWS?**
- Don't need to buy expensive servers
- Can handle millions of users (scales automatically)
- Only pay for what you use
- Professional infrastructure

---

## AWS Services We'll Use (Simple Explanations)

### 1. **S3 (Simple Storage Service)** 💾

**What it is:** Like Google Drive, but for your app

**What we use it for:** Store uploaded videos

**How it works:**
```
User uploads video → Your app → S3 (stores it) → Gives you a URL
```

**Cost:** $0.023 per GB per month (super cheap)
- 100 videos (10GB total) = $0.23/month
- **Your cost:** ~$1 for entire hackathon

**Analogy:** S3 is like a giant warehouse where you rent storage space

---

### 2. **Bedrock (AI Service)** 🤖

**What it is:** Amazon's AI service (like ChatGPT, but from Amazon)

**What we use it for:** Generate content from videos

**How it works:**
```
Your app → Bedrock → "Analyze this video" → Bedrock → "Here's a summary"
```

**Cost:** 
- Input: $3 per 1 million tokens (~750,000 words)
- Output: $15 per 1 million tokens
- **Per video:** ~$0.15 (most expensive part)

**Analogy:** Bedrock is like hiring a super smart assistant who reads your video and writes content

---

### 3. **Transcribe (Speech-to-Text)** 🎤

**What it is:** Converts video audio to text

**What we use it for:** Get transcript from video

**How it works:**
```
Video → Transcribe → "Hello everyone, today I'm making pasta..." (text)
```

**Cost:** $0.024 per minute of audio
- 5-minute video = $0.12
- **Your cost:** ~$5 for 50 videos

**Analogy:** Transcribe is like a typist who listens to your video and types everything said

---

### 4. **Rekognition (Computer Vision)** 👁️

**What it is:** AI that "sees" images/videos

**What we use it for:** Detect objects, scenes, text in video frames

**How it works:**
```
Video frame → Rekognition → "I see: pasta, kitchen, cooking utensils"
```

**Cost:** $0.001 per image analyzed
- 10 frames per video = $0.01
- **Your cost:** ~$0.50 for 50 videos

**Analogy:** Rekognition is like a person who looks at your video and describes what they see

---

### 5. **DynamoDB (Database)** 🗄️

**What it is:** Super fast database (like Excel, but for apps)

**What we use it for:** Cache results so we don't process same video twice

**How it works:**
```
Process video → Save result in DynamoDB → Next time → Check DynamoDB first → Already done? Use cached result (FREE!)
```

**Cost:** $1.25 per million writes, $0.25 per million reads
- **Your cost:** ~$2 for entire hackathon

**Analogy:** DynamoDB is like a notebook where you write down answers so you don't have to solve the same problem twice

---

### 6. **CloudWatch (Monitoring)** 📊

**What it is:** Dashboard that shows what's happening in your app

**What we use it for:** Track costs, errors, performance

**Cost:** Free tier covers our usage
- **Your cost:** $0

**Analogy:** CloudWatch is like a security camera for your app

---

## Total Cost Breakdown (For 50 Videos)

| Service | Cost per Video | 50 Videos | Notes |
|---------|----------------|-----------|-------|
| **Transcribe** | $0.12 | $6.00 | 5-min videos |
| **Bedrock** | $0.15 | $7.50 | Most expensive |
| **Rekognition** | $0.01 | $0.50 | 10 frames/video |
| **S3** | $0.01 | $0.50 | Storage |
| **DynamoDB** | $0.02 | $1.00 | Caching |
| **CloudWatch** | $0.00 | $0.00 | Free tier |
| **TOTAL** | **$0.31** | **$15.50** | ✅ Under budget! |

**Budget remaining:** $80 - $15.50 = **$64.50 buffer** 🎉

---

## Setting Up AWS (Step-by-Step)

### Step 1: Create AWS Account

1. Go to: https://aws.amazon.com/
2. Click "Create an AWS Account"
3. Enter email, password, account name
4. Enter credit card (won't be charged if under free tier)
5. Verify phone number
6. Choose "Basic Support (Free)"
7. Done! ✅

**Important:** You have $80 in credits, so even if you go slightly over free tier, you're covered.

---

### Step 2: Set Up Billing Alerts (CRITICAL!)

**Why:** So you don't accidentally spend all $80

**How:**

1. **Go to Billing Dashboard:**
   - AWS Console → Search "Billing" → Click "Billing"

2. **Enable Billing Alerts:**
   - Left sidebar → "Billing preferences"
   - Check ✅ "Receive Billing Alerts"
   - Enter your email
   - Save preferences

3. **Create Budget Alerts:**
   - Left sidebar → "Budgets" → "Create budget"
   - Choose "Cost budget"
   - Budget name: "Hackathon Budget"
   - Period: Monthly
   - Budgeted amount: $80
   - Click "Configure alerts"
   - Add alerts at:
     - $40 (50% spent) → Email alert
     - $60 (75% spent) → Email alert
     - $70 (87.5% spent) → Email alert
     - $80 (100% spent) → Email alert + STOP EVERYTHING
   - Create budget

**Now you'll get emails when you hit these thresholds!** 📧

---

### Step 3: Create IAM User (Security Best Practice)

**Why:** Don't use root account (it's like using admin account on Windows - dangerous)

**How:**

1. **Go to IAM:**
   - AWS Console → Search "IAM" → Click "IAM"

2. **Create User:**
   - Left sidebar → "Users" → "Create user"
   - Username: `hackathon-dev`
   - Check ✅ "Provide user access to AWS Management Console"
   - Choose "I want to create an IAM user"
   - Custom password: (create a strong password)
   - Uncheck "User must create new password at next sign-in"
   - Click "Next"

3. **Set Permissions:**
   - Choose "Attach policies directly"
   - Search and select these policies:
     - ✅ `AmazonS3FullAccess`
     - ✅ `AmazonTranscribeFullAccess`
     - ✅ `AmazonRekognitionFullAccess`
     - ✅ `AmazonDynamoDBFullAccess`
     - ✅ `AmazonBedrockFullAccess`
     - ✅ `CloudWatchFullAccess`
   - Click "Next" → "Create user"

4. **Create Access Keys:**
   - Click on the user you just created
   - Go to "Security credentials" tab
   - Scroll to "Access keys" → "Create access key"
   - Choose "Application running outside AWS"
   - Click "Next" → "Create access key"
   - **IMPORTANT:** Download the CSV file (has your keys)
   - **NEVER share these keys publicly!**

**Save these keys - you'll need them!** 🔑

---

### Step 4: Configure AWS CLI

**What is AWS CLI?** Command-line tool to talk to AWS from your terminal

**Install:**

```bash
# Mac
brew install awscli

# Linux
sudo apt-get install awscli

# Windows
# Download from: https://aws.amazon.com/cli/
```

**Configure:**

```bash
aws configure
```

It will ask:
```
AWS Access Key ID: [paste from CSV]
AWS Secret Access Key: [paste from CSV]
Default region name: us-east-1
Default output format: json
```

**Test it works:**

```bash
aws sts get-caller-identity
```

Should show your account info ✅

---

### Step 5: Enable Bedrock Model Access

**Why:** Bedrock models need to be manually enabled

**How:**

1. **Go to Bedrock:**
   - AWS Console → Search "Bedrock" → Click "Amazon Bedrock"

2. **Request Model Access:**
   - Left sidebar → "Model access"
   - Click "Manage model access"
   - Find "Claude" section
   - Check ✅ "Claude 3.5 Sonnet"
   - Click "Request model access"
   - Wait 2-5 minutes for approval (usually instant)

3. **Verify Access:**
   - Refresh page
   - Status should be "Access granted" ✅

---

### Step 6: Create S3 Bucket

**What:** Storage for uploaded videos

**How:**

```bash
# Create bucket (replace 'your-name' with your actual name)
aws s3 mb s3://content-intelligence-shubh --region us-east-1

# Enable CORS (so frontend can upload)
cat > cors.json << 'EOF'
{
  "CORSRules": [
    {
      "AllowedOrigins": ["http://localhost:3000"],
      "AllowedMethods": ["GET", "POST", "PUT"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3000
    }
  ]
}
EOF

aws s3api put-bucket-cors --bucket content-intelligence-shubh --cors-configuration file://cors.json

# Verify it worked
aws s3 ls
```

Should see your bucket listed ✅

---

### Step 7: Create DynamoDB Table

**What:** Cache for processed videos

**How:**

```bash
aws dynamodb create-table \
  --table-name content-intelligence-cache \
  --attribute-definitions \
    AttributeName=contentHash,AttributeType=S \
  --key-schema \
    AttributeName=contentHash,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1

# Verify it worked
aws dynamodb list-tables
```

Should see your table listed ✅

---

## Understanding AWS Costs (ELI5)

### How AWS Charges You

**AWS is like a restaurant:**
- You only pay for what you eat (use)
- More food (usage) = more money
- No food (no usage) = no money

**Examples:**

**S3 (Storage):**
- Like renting a storage unit
- Pay per GB per month
- 1GB for 1 month = $0.023

**Bedrock (AI):**
- Like hiring a consultant
- Pay per question asked
- 1 question = ~$0.15

**Transcribe (Speech-to-Text):**
- Like hiring a typist
- Pay per minute typed
- 1 minute = $0.024

**DynamoDB (Database):**
- Like renting a filing cabinet
- Pay per read/write
- 1 million reads = $0.25

---

## Cost-Saving Strategies (How to Stay Under $80)

### 1. **Cache Everything** 💾

**Problem:** Processing same video twice = paying twice

**Solution:** Save results in DynamoDB

```typescript
// Check cache first
const cached = await checkCache(videoHash);
if (cached) {
  return cached; // FREE! No AWS calls
}

// Not cached? Process and save
const result = await processVideo(video);
await saveToCache(videoHash, result);
return result;
```

**Savings:** 70% cost reduction

---

### 2. **Use GitHub Copilot for Testing** 🦙

**Problem:** Every Bedrock call costs $0.15

**Solution:** Use GitHub Copilot for testing for development

```typescript
// Development (FREE)
if (process.env.NODE_ENV === 'development') {
  return await mockAI.generate(prompt);
}

// Production (PAID)
return await bedrock.generate(prompt);
```

**Savings:** $50+ during development

---

### 3. **Batch Processing** 📦

**Problem:** Processing videos one-by-one is slow and expensive

**Solution:** Process multiple frames at once

```typescript
// Bad: Process 10 frames separately (10 API calls)
for (const frame of frames) {
  await rekognition.detectLabels(frame); // $0.001 each
}

// Good: Process 10 frames in one call (1 API call)
await rekognition.detectLabels(frames); // $0.001 total
```

**Savings:** 90% on Rekognition costs

---

### 4. **Optimize Prompts** ✂️

**Problem:** Long prompts = more tokens = more cost

**Solution:** Keep prompts concise

```typescript
// Bad: 1000 tokens ($0.003 input + $0.015 output = $0.018)
const prompt = `Please analyze this video transcript in great detail...
[500 words of instructions]
Transcript: ${transcript}`;

// Good: 200 tokens ($0.0006 input + $0.003 output = $0.0036)
const prompt = `Analyze transcript. Detect domain (education/food/travel).
Transcript: ${transcript}`;
```

**Savings:** 80% on Bedrock costs

---

### 5. **Delete Old Files** 🗑️

**Problem:** S3 charges for storage over time

**Solution:** Auto-delete after 7 days

```bash
# Create lifecycle policy
cat > lifecycle.json << 'EOF'
{
  "Rules": [
    {
      "Id": "DeleteAfter7Days",
      "Status": "Enabled",
      "Expiration": {
        "Days": 7
      }
    }
  ]
}
EOF

aws s3api put-bucket-lifecycle-configuration \
  --bucket content-intelligence-shubh \
  --lifecycle-configuration file://lifecycle.json
```

**Savings:** $5+ over time

---

### 6. **Monitor Daily** 📊

**Check costs every day:**

```bash
# Today's cost
aws ce get-cost-and-usage \
  --time-period Start=$(date -u -d '1 day ago' +%Y-%m-%d),End=$(date -u +%Y-%m-%d) \
  --granularity DAILY \
  --metrics BlendedCost
```

**If cost is high:** Stop, investigate, optimize

---

## Scalability Explained (ELI5)

### What is Scalability?

**Scalability** = Your app can handle more users without breaking

**Example:**
- **Not scalable:** Your laptop can handle 10 users, crashes at 100
- **Scalable:** AWS can handle 10 users or 10 million users automatically

---

### How We Make It Scalable

### 1. **Serverless Architecture** ☁️

**What it means:** No servers to manage, AWS handles everything

**Our setup:**
```
User → Frontend (React) → Backend (Node.js) → AWS Services (auto-scale)
```

**Why it scales:**
- Bedrock: Handles millions of requests automatically
- Transcribe: Processes thousands of videos in parallel
- S3: Stores unlimited files
- DynamoDB: Handles millions of reads/writes per second

**You don't do anything - AWS scales automatically!** 🎉

---

### 2. **Caching Layer** 💾

**What it means:** Save results so you don't recompute

**How it scales:**
```
1st request: Process video (slow, expensive)
2nd request: Return cached result (fast, FREE)
```

**Why it scales:**
- 1 user: 1 cache entry
- 1 million users: 1 million cache entries (DynamoDB handles it)

---

### 3. **Async Processing** ⏱️

**What it means:** Don't make users wait

**How it works:**
```
User uploads video → "Processing started!" (instant response)
                  ↓
            Process in background
                  ↓
            Notify when done
```

**Why it scales:**
- Can process 100 videos at once
- Users don't wait for each other

---

### 4. **Horizontal Scaling** ➡️

**What it means:** Add more servers when needed

**Current (Hackathon):**
```
1 Node.js server → AWS Services
```

**Future (Production):**
```
Load Balancer
    ↓
┌───┴───┬───────┬───────┐
│ Node 1│ Node 2│ Node N│
└───┬───┴───┬───┴───┬───┘
    └───────┴───────┘
         ↓
    AWS Services
```

**Why it scales:**
- 1 server handles 100 users
- 10 servers handle 1,000 users
- 100 servers handle 10,000 users
- AWS adds servers automatically (with proper setup)

---

## Common Beginner Mistakes (And How to Avoid)

### ❌ Mistake 1: Forgetting to Set Billing Alerts

**Problem:** Spend $500 without realizing

**Solution:** Set alerts at $40, $60, $70, $80 (we did this above ✅)

---

### ❌ Mistake 2: Hardcoding AWS Keys in Code

**Problem:** Push keys to GitHub → Hackers steal them → $10,000 bill

**Solution:** Use environment variables

```typescript
// ❌ BAD
const accessKey = 'AKIAIOSFODNN7EXAMPLE';

// ✅ GOOD
const accessKey = process.env.AWS_ACCESS_KEY_ID;
```

**Add to .gitignore:**
```
.env
.env.local
```

---

### ❌ Mistake 3: Not Caching Results

**Problem:** Process same video 100 times = $30 wasted

**Solution:** Check cache first (we do this ✅)

---

### ❌ Mistake 4: Using Wrong AWS Region

**Problem:** Services in different regions can't talk to each other

**Solution:** Use `us-east-1` for everything

```typescript
const s3 = new S3({ region: 'us-east-1' });
const bedrock = new Bedrock({ region: 'us-east-1' });
const transcribe = new Transcribe({ region: 'us-east-1' });
```

---

### ❌ Mistake 5: Not Testing Locally First

**Problem:** Every test costs money on AWS

**Solution:** Use GitHub Copilot for testing (FREE)

```bash
# Use GitHub Copilot


# Pull model
# Mock AI - no models needed llama3.1:8b

# Test locally (FREE)
npm run dev
```

---

## Quick Reference

### AWS Console URLs

- **Main Console:** https://console.aws.amazon.com/
- **Billing:** https://console.aws.amazon.com/billing/
- **S3:** https://s3.console.aws.amazon.com/
- **Bedrock:** https://console.aws.amazon.com/bedrock/
- **DynamoDB:** https://console.aws.amazon.com/dynamodb/
- **CloudWatch:** https://console.aws.amazon.com/cloudwatch/

### Useful Commands

```bash
# Check AWS identity
aws sts get-caller-identity

# List S3 buckets
aws s3 ls

# List DynamoDB tables
aws dynamodb list-tables

# Check today's cost
aws ce get-cost-and-usage \
  --time-period Start=$(date -u -d '1 day ago' +%Y-%m-%d),End=$(date -u +%Y-%m-%d) \
  --granularity DAILY \
  --metrics BlendedCost

# Upload file to S3
aws s3 cp video.mp4 s3://content-intelligence-shubh/

# Download file from S3
aws s3 cp s3://content-intelligence-shubh/video.mp4 ./
```

---

## Getting Help

### AWS Documentation
- **Bedrock:** https://docs.aws.amazon.com/bedrock/
- **S3:** https://docs.aws.amazon.com/s3/
- **Transcribe:** https://docs.aws.amazon.com/transcribe/
- **DynamoDB:** https://docs.aws.amazon.com/dynamodb/

### If Something Goes Wrong

1. **Check CloudWatch Logs:**
   - AWS Console → CloudWatch → Logs
   - Find your log group
   - Read error messages

2. **Check Billing:**
   - AWS Console → Billing → Cost Explorer
   - See what's costing money

3. **Ask for Help:**
   - Team chat
   - AWS Support (free tier includes basic support)
   - Stack Overflow

---

## Summary

**What You Learned:**
- ✅ What AWS is and why we use it
- ✅ 6 AWS services we'll use (S3, Bedrock, Transcribe, Rekognition, DynamoDB, CloudWatch)
- ✅ How to set up AWS account and billing alerts
- ✅ How to create IAM user and access keys
- ✅ How to configure AWS CLI
- ✅ How to create S3 bucket and DynamoDB table
- ✅ How AWS charges you (pay-per-use)
- ✅ 6 cost-saving strategies to stay under $80
- ✅ What scalability means and how we achieve it
- ✅ Common mistakes and how to avoid them

**Your Budget:**
- Total: $80
- Expected usage: $15-20
- Buffer: $60-65 ✅

**You're ready to build on AWS!** 🚀

---

**Next:** Read `docs/guides/COST_OPTIMIZATION.md` for advanced cost-saving techniques

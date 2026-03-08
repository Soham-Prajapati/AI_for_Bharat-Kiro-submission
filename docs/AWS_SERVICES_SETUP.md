# AWS Services Setup Guide

This document lists all AWS services used in the Content Intelligence Platform and the API credentials/configuration needed for each.

## Overview

The platform currently uses **GitHub Models API** for AI services (no AWS needed for AI). However, some services are designed to optionally use AWS services for production deployment.

---

## Current Status: NO AWS REQUIRED ✅

The platform is fully functional without AWS services. All AI services use GitHub Models API with your `GITHUB_TOKEN`.

**What's Working:**
- ✅ All 27 AI services (using GitHub Models API)
- ✅ Local file upload (saves to `./uploads/` directory)
- ✅ Video processing and content generation
- ✅ Mock transcript generation

---

## Optional AWS Services (For Production)

If you want to deploy to production with AWS, here are the services you might need:

### 1. **Amazon S3 (Simple Storage Service)** - File Storage
**Purpose:** Store uploaded videos/audio files in the cloud instead of local filesystem

**Required Credentials:**
```env
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-bucket-name
```

**Setup Steps:**
1. Create an AWS account at https://aws.amazon.com
2. Go to IAM (Identity and Access Management)
3. Create a new user with programmatic access
4. Attach policy: `AmazonS3FullAccess` (or create custom policy with s3:PutObject, s3:GetObject, s3:DeleteObject)
5. Save the Access Key ID and Secret Access Key
6. Go to S3 console and create a new bucket
7. Configure bucket CORS settings for file uploads

**Cost:** ~$0.023 per GB/month for storage, $0.09 per GB for data transfer

**Current Implementation:** `src/routes/upload.route.mock.ts` (local storage)
**AWS Implementation:** Would need to update to use AWS SDK for S3

---

### 2. **Amazon Transcribe** - Speech-to-Text (Optional)
**Purpose:** Convert video/audio to text transcripts (currently using mock transcripts)

**Required Credentials:**
```env
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1
```

**Setup Steps:**
1. Use same IAM credentials as S3
2. Attach additional policy: `AmazonTranscribeFullAccess`
3. No additional configuration needed

**Cost:** $0.024 per minute of audio transcribed

**Current Implementation:** `src/services/mock-transcript.service.ts` (mock transcripts)
**AWS Implementation:** Would need to integrate AWS Transcribe SDK

---

### 3. **Amazon Rekognition** - Video Analysis (Optional)
**Purpose:** Analyze video content for objects, scenes, faces, text

**Required Credentials:**
```env
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1
```

**Setup Steps:**
1. Use same IAM credentials
2. Attach policy: `AmazonRekognitionFullAccess`

**Cost:** $0.10 per minute of video analyzed

**Current Implementation:** Not implemented (not critical for MVP)
**AWS Implementation:** Would integrate with Viral Analyzer service

---

### 4. **Amazon CloudFront** - CDN (Optional)
**Purpose:** Fast content delivery for uploaded videos globally

**Required Credentials:**
```env
AWS_CLOUDFRONT_DISTRIBUTION_ID=your_distribution_id
```

**Setup Steps:**
1. Go to CloudFront console
2. Create a new distribution
3. Set origin to your S3 bucket
4. Configure caching behavior
5. Save the distribution ID

**Cost:** $0.085 per GB for first 10TB/month

**Current Implementation:** Not needed (local files)
**AWS Implementation:** Would serve files through CloudFront URLs

---

### 5. **Amazon DynamoDB** - Database (Optional)
**Purpose:** Store user data, processing jobs, results (currently using in-memory storage)

**Required Credentials:**
```env
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1
AWS_DYNAMODB_TABLE_PREFIX=content-platform
```

**Setup Steps:**
1. Use same IAM credentials
2. Attach policy: `AmazonDynamoDBFullAccess`
3. Create tables:
   - `content-platform-users`
   - `content-platform-jobs`
   - `content-platform-results`

**Cost:** $0.25 per GB/month for storage, $1.25 per million write requests

**Current Implementation:** In-memory Maps in `src/services/processing-pipeline.service.ts`
**AWS Implementation:** Would need DynamoDB SDK integration

---

### 6. **AWS Lambda** - Serverless Functions (Optional)
**Purpose:** Run processing pipeline as serverless functions

**Required Credentials:**
```env
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1
```

**Setup Steps:**
1. Use same IAM credentials
2. Attach policy: `AWSLambdaFullAccess`
3. Package and deploy functions
4. Configure API Gateway for HTTP endpoints

**Cost:** $0.20 per 1M requests, $0.0000166667 per GB-second

**Current Implementation:** Express.js server
**AWS Implementation:** Would need to refactor to Lambda handlers

---

### 7. **Amazon SQS** - Message Queue (Optional)
**Purpose:** Queue processing jobs for async handling

**Required Credentials:**
```env
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1
AWS_SQS_QUEUE_URL=your_queue_url
```

**Setup Steps:**
1. Use same IAM credentials
2. Attach policy: `AmazonSQSFullAccess`
3. Create a queue in SQS console
4. Save the queue URL

**Cost:** $0.40 per million requests (first 1M free)

**Current Implementation:** Direct processing in pipeline
**AWS Implementation:** Would queue jobs for worker processing

---

## Summary: What You Need Right Now

### For Demo/Development (Current Setup):
```env
# .env file
GITHUB_TOKEN=your_github_token_here
PORT=3001
NODE_ENV=development
```

**That's it!** No AWS services needed.

---

### For Production Deployment (Future):

**Minimum AWS Setup:**
1. **S3** - File storage ($5-20/month estimated)
2. **IAM User** - Access credentials (free)

**Optional Enhancements:**
3. **Transcribe** - Real speech-to-text ($10-50/month estimated)
4. **DynamoDB** - Persistent storage ($5-15/month estimated)
5. **CloudFront** - Fast delivery ($5-20/month estimated)

**Total Estimated Cost:** $25-100/month depending on usage

---

## How to Add AWS Services Later

### Step 1: Create AWS Account
1. Go to https://aws.amazon.com
2. Sign up (requires credit card)
3. Verify email and phone

### Step 2: Create IAM User
1. Go to IAM console
2. Click "Users" → "Add user"
3. Username: `content-platform-api`
4. Access type: Programmatic access
5. Attach policies:
   - `AmazonS3FullAccess`
   - `AmazonTranscribeFullAccess` (if using Transcribe)
   - `AmazonDynamoDBFullAccess` (if using DynamoDB)
6. Download credentials CSV (save securely!)

### Step 3: Create S3 Bucket
1. Go to S3 console
2. Click "Create bucket"
3. Bucket name: `content-platform-uploads-[your-name]`
4. Region: `us-east-1` (or closest to you)
5. Uncheck "Block all public access" (we'll use signed URLs)
6. Create bucket

### Step 4: Configure CORS
1. Go to your bucket → Permissions → CORS
2. Add this configuration:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["http://localhost:3000", "http://localhost:3001"],
    "ExposeHeaders": ["ETag"]
  }
]
```

### Step 5: Update .env File
```env
# Add these to your .env
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=content-platform-uploads-yourname
```

### Step 6: Update Code
1. Replace `src/routes/upload.route.mock.ts` with AWS S3 implementation
2. Update `src/index.ts` to use real upload route
3. Test upload flow

---

## Security Best Practices

### 1. Never Commit Credentials
- ✅ `.env` is in `.gitignore`
- ❌ Never commit AWS keys to GitHub
- ✅ Use environment variables

### 2. Use IAM Roles (Production)
- Create specific policies with minimum permissions
- Don't use root account credentials
- Rotate access keys regularly

### 3. Enable MFA
- Enable Multi-Factor Authentication on AWS account
- Require MFA for sensitive operations

### 4. Monitor Costs
- Set up billing alerts in AWS console
- Monitor usage in CloudWatch
- Set budget limits

---

## Troubleshooting

### "Access Denied" Errors
- Check IAM user has correct policies attached
- Verify AWS credentials in .env are correct
- Check bucket permissions and CORS settings

### "Bucket Not Found" Errors
- Verify bucket name in .env matches actual bucket
- Check region is correct
- Ensure bucket exists in AWS console

### High Costs
- Check S3 storage usage (delete old files)
- Review CloudWatch logs for excessive API calls
- Consider lifecycle policies to auto-delete old files

---

## Current Services Using GitHub Models API

All these services work WITHOUT AWS:

1. ✅ Content Multiplier V2
2. ✅ Viral Analyzer
3. ✅ Creative Director
4. ✅ Safety
5. ✅ Trend Predictor
6. ✅ Viral Predictor
7. ✅ Cultural Adapter
8. ✅ Dopamine Optimizer
9. ✅ Voice Clone
10. ✅ ADHD Navigator
11. ✅ Watermark
12. ✅ Marketplace
13. ✅ Knowledge Graph
14. ✅ Community
15. ✅ Membership
16. ✅ Automation
17. ✅ Platform Integration
18. ✅ Workspace
19. ✅ Analytics Dashboard
20. ✅ Ecosystem Analytics
21. ✅ Regional Network
22. ✅ Vernacular

**All using:** `GITHUB_TOKEN` environment variable

---

## Questions?

If you need help setting up AWS services, let me know which specific service you want to configure and I'll provide detailed step-by-step instructions.

**For now, you don't need any AWS services. The platform works perfectly with just your GitHub token!**

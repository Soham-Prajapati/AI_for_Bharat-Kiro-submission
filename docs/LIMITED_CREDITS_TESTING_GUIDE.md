# Limited-Credits Testing Guide (AWS + Feature Coverage)

This guide helps you test **everything integrated so far** while minimizing AWS/API spend.

---

## 1) Start Backend Correctly

From project root:

```bash
npm run dev
```

Expected health check:

```bash
curl -s http://localhost:3001/health
```

Should return:

```json
{"status":"ok","timestamp":"..."}
```

> In current setup, SQS worker starts automatically with backend startup.

---

## 2) Pre-Test Checklist (No-Cost Validation)

Run this once (does not print secrets):

```bash
node -e 'require("dotenv").config(); const ak=process.env.AWS_ACCESS_KEY_ID||""; const sk=process.env.AWS_SECRET_ACCESS_KEY||""; const placeholders=new Set(["your_access_key","your_access_key_here","your_secret_key","your_secret_key_here"]); const out={validCreds:Boolean(ak&&sk)&&!placeholders.has(ak)&&!placeholders.has(sk), hasRegion:Boolean(process.env.AWS_REGION), hasS3:Boolean(process.env.S3_BUCKET_NAME), hasDynamoPrefix:Boolean(process.env.AWS_DYNAMODB_TABLE_PREFIX), hasSqsUrl:Boolean(process.env.AWS_SQS_QUEUE_URL), hasCloudFront:Boolean(process.env.CLOUDFRONT_DOMAIN)}; console.log(out);'
```

All values should be `true`.

---

## 3) Credit-Saving Strategy (Important)

1. Use **one short media file** (5–10 seconds) and reuse it.
2. Run **one full AWS pipeline test** only.
3. For route coverage, use **smoke tests** (basic request/response) instead of repeated heavy AI jobs.
4. Avoid parallel processing jobs while testing.
5. Poll job status instead of resubmitting jobs.

---

## 4) Core AWS Pipeline Test (Real Results)

### Step A: Upload one small media file

```bash
curl -s -X POST http://localhost:3001/api/upload \
  -F "file=@./uploads/sample-short.mp4" \
  -F "userId=test-user"
```

Save `fileId` from response.

### Step B: Queue async processing job

```bash
curl -s -X POST http://localhost:3001/api/upload-to-results/process \
  -H "Content-Type: application/json" \
  -d '{
    "fileId":"<FILE_ID>",
    "fileName":"sample-short.mp4",
    "mimeType":"video/mp4",
    "userId":"test-user",
    "platforms":["youtube","instagram"]
  }'
```

Save `jobId`.

### Step C: Poll job status (do not resubmit)

```bash
curl -s http://localhost:3001/api/upload-to-results/status/<JOB_ID>
```

Repeat every 10–20 seconds until `status` is `completed` (or `failed`).

### Step D: Fetch final result

```bash
curl -s http://localhost:3001/api/upload-to-results/results/<JOB_ID>
```

Validate:
- platforms generated
- viral score present
- analytics present
- no mock/template transcript fallback for media path

---

## 5) Async Queue + Worker Validation

After Step B, confirm queue-based behavior:

- Immediate response from `/process` should be `pending/queued`.
- Later status should transition through processing steps.
- Final output should be available from `/results/:jobId`.

If it stays pending too long, check backend logs for:
- SQS receive errors
- Transcribe/Rekognition permission errors
- DynamoDB write errors

---

## 6) Route-Level Smoke Coverage (Low Cost)

Use one request each to validate endpoint wiring without expensive repeated AI runs.

- `POST /api/upload` (already done in core test)
- `POST /api/upload-to-results/process` (already done in core test)
- `GET /api/upload-to-results/status/:jobId`
- `GET /api/upload-to-results/results/:jobId`
- `POST /api/viral-analyzer/analyze` with short plain text transcript
- `POST /api/creative-director/*` with short text payload (where applicable)
- `POST /api/safety/*` smoke only
- `POST /api/vernacular/*` smoke only
- `POST /api/regional/*` smoke only
- `POST /api/membership/*` smoke only
- `POST /api/community/*` smoke only
- `POST /api/workspace/*` smoke only
- `POST /api/analytics-dashboard/*` smoke only
- `POST /api/integrations/*` smoke only

> Tip: For all non-core routes, use minimal text payloads and avoid long media input.

---

## 7) DynamoDB Persistence Checks

For any processed job:
- `status/:jobId` should still work after server restart.
- `results/:jobId` should still return persisted output (until TTL/expiry rules apply).

This confirms job + result state is not only in memory.

---

## 8) S3 + CloudFront Delivery Checks

From upload response verify:
- `s3Url` exists
- `cdnUrl` exists
- `url` points to CloudFront domain

Open `cdnUrl` in browser to verify media delivery.

---

## 9) Failure Tests (One-Time)

Run these once to verify robustness:

1. Invalid `fileId` in `/process` → should return validation error.
2. Invalid `jobId` in `/status` and `/results` → should return not found.
3. Temporarily wrong `AWS_SQS_QUEUE_URL` → jobs should fail to enqueue with clear error.

---

## 10) Minimal Cost Test Plan (Recommended)

- 1 upload
- 1 queued processing job
- 1 full result retrieval
- 10–15 smoke calls on other routes with short text payloads

This gives broad coverage while keeping AWS usage low.

---

## 11) If You Need Full Regression Later

Do a nightly run with:
- 2–3 media files max
- staggered processing
- full route suite
- log capture for failed endpoints only

Keep daytime/manual testing on the minimal plan above.

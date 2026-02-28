# API Integration Flow Documentation

This document describes the API endpoints and their integration flow for the Content Intelligence Platform. Use this as a reference when writing integration tests.

## Overview

The platform follows a three-step workflow:
1. **Upload** - Upload media files to S3
2. **Process** - Transcribe audio/video content
3. **Generate** - Generate platform-specific content from transcripts

---

## 1. Upload Endpoint

### Endpoint Details
- **Method**: `POST`
- **Path**: `/upload`
- **Content-Type**: `multipart/form-data`

### Request Format
```typescript
// Form data fields:
{
  file: File,           // Required: The media file to upload
  userId?: string       // Optional: User identifier (defaults to 'anonymous')
}
```

### Request Constraints
- Maximum file size: 100 MB
- File is uploaded as multipart form data with field name `file`

### Success Response (200)
```typescript
{
  success: true,
  fileId: string,        // S3 key for the uploaded file
  fileName: string,      // Original filename
  mimeType: string,      // File MIME type
  size: number,          // File size in bytes
  userId: string,        // User identifier
  url: string,           // S3 URL for the file
  uploadedAt: string     // ISO 8601 timestamp
}
```

### Error Responses
- **400 ValidationError**: `{ statusCode: 400, message: "No file uploaded" }`
- **502 AWSError**: `{ statusCode: 502, message: "AWS S3 error: [details]" }`

---

## 2. Process Endpoint

### Endpoint Details
- **Method**: `POST`
- **Path**: `/process`
- **Content-Type**: `application/json`

### Request Format
```typescript
{
  fileId: string,        // Required: File ID from upload response
  contentType?: string   // Optional: Content type hint
}
```

### Success Response (200)
```typescript
{
  success: true,
  jobId: string,         // Transcription job identifier
  fileId: string,        // Original file ID
  status: "processing",  // Job status
  startedAt: string      // ISO 8601 timestamp
}
```

### Error Responses
- **400 ValidationError**: `{ statusCode: 400, message: "fileId required" }`
- **502 AWSError**: `{ statusCode: 502, message: "AWS Transcribe error: [details]" }`

---

### Process Status Endpoint

### Endpoint Details
- **Method**: `GET`
- **Path**: `/process/:jobId`

### Path Parameters
- `jobId`: Transcription job identifier from process response

### Success Response (200)
```typescript
{
  jobId: string,         // Transcription job identifier
  status: string,        // Job status (e.g., "IN_PROGRESS", "COMPLETED", "FAILED")
  transcript?: string,   // Transcript text (when completed)
  completedAt: string    // ISO 8601 timestamp
}
```

### Error Responses
- **400 ValidationError**: `{ statusCode: 400, message: "jobId required" }`
- **502 AWSError**: `{ statusCode: 502, message: "AWS Transcribe error: [details]" }`

---

## 3. Generate Endpoint

### Endpoint Details
- **Method**: `POST`
- **Path**: `/generate`
- **Content-Type**: `application/json`

### Request Format
```typescript
{
  jobId: string,              // Required: Job ID from process response
  platforms: string[],        // Required: Array of platform names (e.g., ["twitter", "linkedin"])
  language?: string,          // Optional: Language code (defaults to "en")
  creatorMode?: string        // Optional: Creator mode (defaults to "hybrid")
}
```

### Success Response (200)
```typescript
{
  success: true,
  generationId: string,       // Generation identifier for caching
  jobId: string,              // Original job ID
  status: "completed",        // Generation status
  language: string,           // Language used
  creatorMode: string,        // Creator mode used
  results: {                  // Platform-specific generated content
    [platform: string]: any   // Content varies by platform
  }
}
```

### Error Responses
- **400 ValidationError**: `{ statusCode: 400, message: "jobId and platforms[] required" }`
- **502 AWSError**: `{ statusCode: 502, message: "AWS Bedrock error: [details]" }`

---

### Generate Retrieval Endpoint

### Endpoint Details
- **Method**: `GET`
- **Path**: `/generate/:generationId`

### Path Parameters
- `generationId`: Generation identifier from generate response

### Success Response (200)
```typescript
{
  generationId: string,
  status: "completed",
  jobId: string,
  results: {
    [platform: string]: any
  },
  creatorMode: string
}
```

### Error Responses
- **404 NotFoundError**: `{ statusCode: 404, message: "Generation not found" }`

---

## Integration Flow Dependencies

### Sequential Flow
The endpoints must be called in sequence:

```
1. POST /upload
   ↓ (returns fileId)
2. POST /process
   ↓ (returns jobId)
3. GET /process/:jobId (poll until status is "COMPLETED")
   ↓ (transcript ready)
4. POST /generate
   ↓ (returns generationId and results)
5. GET /generate/:generationId (optional, retrieves cached results)
```

### Dependency Chain
- **Process** depends on **Upload**: Requires `fileId` from upload response
- **Generate** depends on **Process**: Requires `jobId` from process response and completed transcription
- **Generate retrieval** depends on **Generate**: Requires `generationId` from generate response

### Timing Considerations
- Upload is synchronous (immediate response)
- Process is asynchronous (requires polling `/process/:jobId` for completion)
- Generate is synchronous but depends on completed transcription
- Generated content is cached for 3600 seconds (1 hour)

---

## Common Error Responses

All endpoints may return the following error types:

### ValidationError (400)
```typescript
{
  statusCode: 400,
  message: string,      // Specific validation error message
  name: "ValidationError",
  field?: string        // Optional field name that failed validation
}
```

### AWSError (502)
```typescript
{
  statusCode: 502,
  message: string,      // Format: "AWS {service} error: {details}"
  name: "AWSError",
  service: string,      // AWS service name (S3, Transcribe, Bedrock)
  awsCode?: string      // Optional AWS error code
}
```

### NotFoundError (404)
```typescript
{
  statusCode: 404,
  message: string,      // Format: "{Resource} not found"
  name: "NotFoundError"
}
```

### Other Possible Errors
- **AuthenticationError (401)**: Authentication failed
- **AuthorizationError (403)**: Access denied
- **RateLimitError (429)**: Too many requests
- **TimeoutError (504)**: Operation timed out
- **ServiceUnavailableError (503)**: Service temporarily unavailable

---

## Integration Test Recommendations

### Test Scenarios

1. **Happy Path Test**
   - Upload file → Process → Poll status → Generate content
   - Verify each response contains expected fields
   - Verify data flows correctly between endpoints

2. **Error Handling Tests**
   - Upload without file (ValidationError)
   - Process without fileId (ValidationError)
   - Generate without jobId or platforms (ValidationError)
   - Retrieve non-existent generation (NotFoundError)

3. **Edge Cases**
   - Large file upload (near 100 MB limit)
   - Multiple platform generation
   - Different language codes
   - Cache expiration (after 3600 seconds)

4. **Async Handling**
   - Poll process status until completion
   - Handle IN_PROGRESS status
   - Handle FAILED status

### Mock Considerations
- S3Service for file uploads
- TranscribeService for transcription
- BedrockService for content generation
- CacheService for generation retrieval

### Test Data Requirements
- Sample media files (audio/video)
- Sample transcript text
- Sample platform names
- Expected content structures per platform

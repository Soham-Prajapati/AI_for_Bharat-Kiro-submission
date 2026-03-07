# E2E Tests Quick Start Guide

## Running the Tests

### Run all E2E tests
```bash
npm test -- src/__tests__/e2e
```

### Run specific test file
```bash
npm test -- src/__tests__/e2e/upload-process.test.ts
```

### Run specific test suite
```bash
npm test -- -t "Complete Upload & Process Workflow"
```

### Run single test
```bash
npm test -- -t "should successfully complete full upload-process-status workflow"
```

### Watch mode (auto-rerun on changes)
```bash
npm test -- --watch src/__tests__/e2e
```

### With coverage report
```bash
npm test -- --coverage src/__tests__/e2e
```

### Verbose output
```bash
npm test -- --verbose src/__tests__/e2e
```

## Test Structure

```
src/__tests__/e2e/
├── README.md                    # Detailed documentation
├── QUICK_START.md              # This file
└── upload-process.test.ts      # Upload & process workflow tests
```

## What's Tested

### ✅ Upload Flow (POST /api/upload)
- File upload with various formats (video, audio)
- Large file handling (up to 100MB)
- User identification (userId or anonymous)
- Error handling (missing file, size limits, S3 errors)

### ✅ Process Flow (POST /api/process)
- Start transcription job with fileId
- Generate unique jobId
- Error handling (missing fileId, S3/Transcribe errors)

### ✅ Status Check (GET /api/process/:jobId)
- Check job status (COMPLETED, IN_PROGRESS, FAILED)
- Retrieve transcript URL when complete
- Error handling (job not found, service errors)

### ✅ Complete Workflow
- End-to-end: upload → process → status check
- Multiple concurrent uploads
- Status polling simulation

## Expected Output

### All tests passing:
```
PASS  src/__tests__/e2e/upload-process.test.ts
  E2E: Upload & Process Flow
    Complete Upload & Process Workflow
      ✓ should successfully complete full upload-process-status workflow
      ✓ should handle multiple concurrent uploads
      ✓ should handle processing status polling
    POST /api/upload - File Upload
      Successful Uploads
        ✓ should upload video file successfully
        ✓ should upload audio file successfully
        ...
    POST /api/process - Start Processing
      ...
    GET /api/process/:jobId - Check Status
      ...

Test Suites: 1 passed, 1 total
Tests:       XX passed, XX total
```

## Troubleshooting

### Tests fail with "Cannot find module"
```bash
# Rebuild the project
npm run build
```

### Tests timeout
The test timeout is set to 30 seconds. If tests are timing out:
- Check if mocks are properly configured
- Ensure no real AWS calls are being made
- Look for infinite loops or missing resolves

### Mock not working
```typescript
// Ensure mocks are reset in beforeEach
beforeEach(() => {
  jest.clearAllMocks();
  // Re-setup default mock implementations
});
```

### AWS SDK errors
All AWS services should be mocked. If you see real AWS errors:
- Check that `jest.mock()` is called at the top of the file
- Verify mock implementations are set up in beforeEach
- Ensure no real AWS credentials are being used

## Quick Test Examples

### Test a successful upload
```typescript
const response = await request(app)
  .post('/api/upload')
  .attach('file', Buffer.from('content'), 'test.mp4')
  .field('userId', 'test-user')
  .expect(200);

expect(response.body.success).toBe(true);
expect(response.body.fileId).toBeDefined();
```

### Test processing start
```typescript
const response = await request(app)
  .post('/api/process')
  .send({ fileId: 'user/file.mp4' })
  .expect(200);

expect(response.body.jobId).toBeDefined();
expect(response.body.status).toBe('processing');
```

### Test status check
```typescript
const response = await request(app)
  .get('/api/process/transcribe-123')
  .expect(200);

expect(response.body.status).toBe('COMPLETED');
expect(response.body.transcript).toBeDefined();
```

## Next Steps

1. **Run the tests**: `npm test -- src/__tests__/e2e`
2. **Check coverage**: `npm test -- --coverage src/__tests__/e2e`
3. **Read detailed docs**: See `README.md` in this directory
4. **Add more tests**: Follow the existing patterns

## Need Help?

- See `README.md` for detailed documentation
- Check `src/__tests__/setup.ts` for available test utilities
- Look at `src/__tests__/integration/analytics-api.test.ts` for similar patterns
- Review the actual route implementations in `src/routes/`

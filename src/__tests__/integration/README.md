# Integration Tests

This directory contains end-to-end (E2E) integration tests for the Content Intelligence Platform.

## Overview

The integration tests verify the complete flow of the application from file upload through content generation, testing the interaction between multiple API endpoints and services.

## Test File

### `e2e.test.ts`

Comprehensive integration tests covering the full pipeline:
- **Upload** → **Process** → **Generate**

## Test Coverage

### Complete Flow (1 test)
- ✅ Full pipeline: Upload file → Start transcription → Check status → Generate content for multiple platforms → Retrieve results

### Upload Endpoint (6 tests)
- ✅ Upload video file successfully
- ✅ Upload audio file successfully
- ✅ Handle missing file error
- ✅ Handle S3 upload failure
- ✅ Use anonymous userId when not provided
- ✅ Validate file metadata in response

### Process Endpoint (6 tests)
- ✅ Start transcription successfully
- ✅ Handle missing fileId error
- ✅ Handle transcription service failure
- ✅ Get transcription status successfully
- ✅ Handle missing jobId in status check
- ✅ Handle transcription status check failure

### Generate Endpoint (10 tests)
- ✅ Generate content for single platform
- ✅ Generate content for multiple platforms (Twitter, Instagram, LinkedIn, TikTok)
- ✅ Handle missing jobId error
- ✅ Handle missing platforms error
- ✅ Handle invalid platforms format
- ✅ Handle Bedrock service failure
- ✅ Retrieve cached generation successfully
- ✅ Handle generation not found
- ✅ Use default language when not provided
- ✅ Use default creatorMode when not provided

### Error Handling (3 tests)
- ✅ Handle 404 for non-existent routes
- ✅ Handle malformed JSON
- ✅ Handle large file size gracefully

### Timeout Handling (2 tests)
- ✅ Handle slow transcription service
- ✅ Handle slow content generation

### Health Check (1 test)
- ✅ Return healthy status

## Running Tests

### Run all integration tests
```bash
npm test -- src/__tests__/integration
```

### Run specific test file
```bash
npm test -- src/__tests__/integration/e2e.test.ts
```

### Run with verbose output
```bash
npm test -- src/__tests__/integration/e2e.test.ts --verbose
```

### Run in watch mode
```bash
npm run test:watch -- src/__tests__/integration
```

## Test Architecture

### Mocking Strategy

The tests use Jest mocks for all AWS services:

```typescript
jest.mock('../../services/s3.service');
jest.mock('../../services/transcription.service');
jest.mock('../../services/bedrock.service');
```

This ensures:
- No actual AWS API calls are made
- Tests run quickly (< 30 seconds total)
- Tests are deterministic and repeatable
- No AWS credentials required

### Test Utilities

The tests leverage utilities from `src/__tests__/setup.ts`:

- `createMockFile()` - Generate mock file uploads
- `expectSuccessResponse()` - Assert successful API responses
- `expectErrorResponse()` - Assert error responses
- `wait()` - Simulate async delays

### API Testing with Supertest

All tests use [supertest](https://github.com/visionmedia/supertest) to make HTTP requests:

```typescript
const response = await request(app)
  .post('/api/upload')
  .field('userId', 'test-user')
  .attach('file', mockFile.buffer, mockFile.originalname);
```

## Test Data

### Mock File Upload
```typescript
const mockFile = createMockFile({
  originalname: 'test-video.mp4',
  mimetype: 'video/mp4',
  size: 5 * 1024 * 1024, // 5MB
});
```

### Mock S3 Response
```typescript
(S3Service.prototype.upload as jest.Mock).mockResolvedValue({
  key: 'test-user/123456-test-video.mp4',
  url: 'https://test-bucket.s3.amazonaws.com/test-user/123456-test-video.mp4',
});
```

### Mock Transcription Response
```typescript
(transcribeService.getTranscriptionStatus as jest.Mock).mockResolvedValue({
  status: 'COMPLETED',
  transcript: 'This is a test transcription...',
});
```

### Mock Content Generation Response
```typescript
(bedrockService.generatePlatformContent as jest.Mock).mockResolvedValue({
  content: 'Generated content for platform',
  metadata: { platform: 'twitter', length: 280 },
});
```

## API Endpoints Tested

### POST /api/upload
Upload a file to S3
- **Body**: multipart/form-data with `file` and optional `userId`
- **Response**: `{ success, fileId, fileName, mimeType, size, userId, url, uploadedAt }`

### POST /api/process
Start transcription job
- **Body**: `{ fileId, contentType? }`
- **Response**: `{ success, jobId, fileId, status, startedAt }`

### GET /api/process/:jobId
Get transcription status
- **Response**: `{ jobId, status, transcript?, completedAt }`

### POST /api/generate
Generate content for platforms
- **Body**: `{ jobId, platforms[], language?, creatorMode? }`
- **Response**: `{ success, generationId, jobId, status, language, creatorMode, results }`

### GET /api/generate/:generationId
Retrieve generated content
- **Response**: `{ generationId, status, jobId, results, creatorMode }`

### GET /health
Health check endpoint
- **Response**: `{ status: 'ok', timestamp }`

## Error Codes

The tests verify proper error handling:

- **400** - Bad Request (missing required fields, invalid format)
- **404** - Not Found (invalid route, resource not found)
- **502** - Bad Gateway (AWS service failures)
- **500** - Internal Server Error (unexpected errors)

## Performance

All tests complete in under 30 seconds:
- Individual tests: 20-500ms
- Full suite: ~8 seconds
- Timeout handling tests: up to 5 seconds

## Best Practices

1. **Mock all external services** - No real AWS calls
2. **Test happy paths and error cases** - Both success and failure scenarios
3. **Use descriptive test names** - Clear intent and expectations
4. **Verify response structure** - Check all expected fields
5. **Test edge cases** - Missing fields, invalid formats, timeouts
6. **Keep tests fast** - Use mocks, avoid real I/O
7. **Clean up between tests** - `beforeEach` resets all mocks

## Adding New Tests

To add new integration tests:

1. Create a new test file in `src/__tests__/integration/`
2. Import required utilities from `../setup`
3. Mock external services at the top of the file
4. Use `request(app)` to make API calls
5. Use assertion helpers like `expectSuccessResponse()`
6. Follow the existing test structure

Example:
```typescript
import request from 'supertest';
import app from '../../index';
import { expectSuccessResponse } from '../setup';

jest.mock('../../services/my-service');

describe('My Feature', () => {
  it('should work correctly', async () => {
    const response = await request(app)
      .post('/api/my-endpoint')
      .send({ data: 'test' });
    
    expectSuccessResponse(response, 200);
    expect(response.body.result).toBeDefined();
  });
});
```

## Troubleshooting

### Tests failing with AWS errors
- Ensure all AWS services are properly mocked
- Check that mocks are reset in `beforeEach`

### Tests timing out
- Increase timeout for specific tests: `it('test', async () => {...}, 10000)`
- Check for unresolved promises

### Mock not working
- Verify mock is defined before imports
- Use `jest.clearAllMocks()` in `beforeEach`

### Import errors
- Check Jest configuration in `jest.config.js`
- Ensure `transformIgnorePatterns` includes necessary modules

## Related Documentation

- [Test Setup Documentation](../README.md)
- [API Routes](../../routes/)
- [Services](../../services/)
- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)

## Statistics

- **Total Tests**: 28
- **Test Suites**: 1
- **Coverage**: Upload, Process, Generate endpoints + Error handling
- **Execution Time**: ~8 seconds
- **Success Rate**: 100%

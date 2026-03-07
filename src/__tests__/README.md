# Test Setup Documentation

This directory contains the comprehensive test setup and utilities for the Content Intelligence Platform.

## Overview

The test setup provides:
- **Global test configuration** with environment variables
- **AWS service mocks** (S3, Bedrock, Transcribe)
- **Mock data factories** for creating test data
- **Test utilities** for common testing patterns
- **Custom Jest matchers** for enhanced assertions
- **Global hooks** for setup and teardown

## Files

- `setup.ts` - Main test setup file (automatically loaded by Jest)
- `setup.example.test.ts` - Example tests demonstrating usage
- `README.md` - This documentation file

## Quick Start

### Basic Test Structure

```typescript
import { createMockUser, expectSuccessResponse } from './setup';
import request from 'supertest';
import app from '../index';

describe('My Feature', () => {
  it('should work correctly', async () => {
    const user = createMockUser({ name: 'Test User' });
    
    const response = await request(app)
      .post('/api/endpoint')
      .send({ userId: user.id });
    
    expectSuccessResponse(response, 201);
  });
});
```

## Mock Data Factories

### User Mock
```typescript
const user = createMockUser({
  name: 'John Doe',
  email: 'john@example.com',
  color: '#FF0000'
});
```

### Workspace Mock
```typescript
const workspace = createMockWorkspace({
  name: 'My Workspace',
  content: 'Initial content',
  version: 0
});
```

### ADHD Session Mock
```typescript
const session = createMockADHDSession({
  userId: 'user-123',
  taskName: 'Write tests',
  duration: 25
});
```

### File Upload Mock
```typescript
const file = createMockFile({
  originalname: 'video.mp4',
  mimetype: 'video/mp4',
  size: 2048
});
```

### S3 Upload Result Mock
```typescript
const upload = createMockS3Upload({
  key: 'uploads/file.mp4',
  bucket: 'test-bucket'
});
```

### AI Content Mock
```typescript
const content = createMockAIContent({
  platform: 'twitter',
  content: 'Generated content',
  metadata: { model: 'claude-3-sonnet' }
});
```

### Transcription Mock
```typescript
const transcription = createMockTranscription({
  transcript: 'Transcribed text',
  confidence: 0.98
});
```

### Community Post Mock
```typescript
const post = createMockCommunityPost({
  userId: 'user-123',
  content: 'Post content',
  likes: 5
});
```

## AWS Service Mocks

### S3 Mock

The S3 client is automatically mocked with default behaviors:

```typescript
import { s3Mock } from './setup';
import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

// Override default behavior for specific test
s3Mock.on(PutObjectCommand).resolves({
  ETag: '"custom-etag"',
  VersionId: 'v123'
});

// Verify mock was called
const calls = s3Mock.commandCalls(PutObjectCommand);
expect(calls.length).toBe(1);
```

### Bedrock Mock

The Bedrock Runtime client is automatically mocked:

```typescript
import { bedrockMock } from './setup';
import { InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

// Override for specific test
bedrockMock.on(InvokeModelCommand).resolves({
  body: new TextEncoder().encode(JSON.stringify({
    completion: 'Custom AI response',
    stop_reason: 'end_turn'
  })),
  contentType: 'application/json'
});
```

### Transcribe Mock

The Transcribe client is automatically mocked:

```typescript
import { transcribeMock } from './setup';
import { StartTranscriptionJobCommand } from '@aws-sdk/client-transcribe';

// Override for specific test
transcribeMock.on(StartTranscriptionJobCommand).resolves({
  TranscriptionJob: {
    TranscriptionJobName: 'custom-job',
    TranscriptionJobStatus: 'IN_PROGRESS'
  }
});
```

## Test Utilities

### Wait Utility
```typescript
import { wait } from './setup';

await wait(100); // Wait 100ms
```

### Mock Express Objects
```typescript
import { createMockRequest, createMockResponse, createMockNext } from './setup';

const req = createMockRequest({
  body: { name: 'test' },
  params: { id: '123' },
  query: { page: '1' }
});

const res = createMockResponse();
const next = createMockNext();

// Use in middleware tests
await myMiddleware(req, res, next);

expect(res.status).toHaveBeenCalledWith(200);
expect(res.json).toHaveBeenCalledWith({ success: true });
```

### Response Assertions
```typescript
import { expectSuccessResponse, expectErrorResponse } from './setup';

// Assert successful response
expectSuccessResponse(response, 200);

// Assert error response
expectErrorResponse(response, 400, 'Bad request');
```

### Random Data Generation
```typescript
import { randomString, randomNumber } from './setup';

const id = randomString(10); // Random 10-char string
const age = randomNumber(18, 65); // Random number between 18-65
```

### Console Mocking
```typescript
import { mockConsole } from './setup';

describe('My Tests', () => {
  mockConsole(); // Suppress console output in tests
  
  it('should not log to console', () => {
    console.log('This will be mocked');
  });
});
```

## Custom Jest Matchers

### UUID Validation
```typescript
expect('123e4567-e89b-12d3-a456-426614174000').toBeValidUUID();
expect('not-a-uuid').not.toBeValidUUID();
```

### ISO Date Validation
```typescript
expect(new Date().toISOString()).toBeValidISODate();
expect('not-a-date').not.toBeValidISODate();
```

### Property Checking
```typescript
const obj = { id: '123', name: 'Test', email: 'test@example.com' };

expect(obj).toHaveProperties(['id', 'name', 'email']);
expect(obj).not.toHaveProperties(['id', 'missing']);
```

## Environment Variables

The following environment variables are automatically set for tests:

```
NODE_ENV=test
PORT=3001
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=test-access-key
AWS_SECRET_ACCESS_KEY=test-secret-key
S3_BUCKET=test-bucket
JWT_SECRET=test-jwt-secret-key-for-testing
ALLOWED_ORIGINS=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
UPLOAD_RATE_LIMIT_MAX=10
MAX_FILE_SIZE=104857600
ALLOWED_FILE_TYPES=video/mp4,video/quicktime,audio/mpeg,audio/wav,text/plain
CACHE_TTL_SECONDS=3600
LOG_LEVEL=error
```

## Global Hooks

### beforeAll
- Sets up default AWS service mocks
- Runs once before all tests

### afterAll
- Cleans up AWS mocks
- Runs once after all tests

### beforeEach
- Clears all Jest mocks
- Resets AWS service mocks
- Re-applies default mock behaviors
- Runs before each test

## Best Practices

1. **Use Mock Factories**: Always use the provided factory functions to create test data for consistency.

2. **Reset Mocks**: Mocks are automatically reset before each test, but you can manually reset if needed:
   ```typescript
   beforeEach(() => {
     s3Mock.reset();
   });
   ```

3. **Override Defaults**: Override default mock behaviors for specific test cases:
   ```typescript
   it('should handle S3 error', () => {
     s3Mock.on(PutObjectCommand).rejects(new Error('S3 Error'));
     // Test error handling
   });
   ```

4. **Verify Mock Calls**: Always verify that mocks were called as expected:
   ```typescript
   const calls = s3Mock.commandCalls(PutObjectCommand);
   expect(calls.length).toBe(1);
   expect(calls[0].args[0].input).toMatchObject({
     Bucket: 'test-bucket',
     Key: 'test-key'
   });
   ```

5. **Use Custom Matchers**: Leverage custom matchers for cleaner assertions:
   ```typescript
   expect(user.id).toBeValidUUID();
   expect(user.createdAt).toBeValidISODate();
   ```

6. **Isolate Tests**: Each test should be independent and not rely on state from other tests.

7. **Clean Up**: Use `afterEach` or `afterAll` hooks to clean up any test data or state.

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- adhd.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="should create workspace"
```

## Coverage

The project maintains the following coverage thresholds:
- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

View coverage report:
```bash
npm test -- --coverage
open coverage/lcov-report/index.html
```

## Troubleshooting

### Mock Not Working
- Ensure you're importing from `./setup`
- Check that mocks are reset in `beforeEach`
- Verify the command type matches your usage

### Environment Variables Not Set
- Check that `setup.ts` is loaded (configured in `jest.config.js`)
- Verify `setupFilesAfterEnv` in Jest config

### Custom Matchers Not Available
- Ensure TypeScript recognizes the global declarations
- Check that `setup.ts` is imported in your test file

## Examples

See `setup.example.test.ts` for comprehensive examples of all features.

## Contributing

When adding new test utilities:
1. Add the utility to `setup.ts`
2. Export it from the default export
3. Add an example to `setup.example.test.ts`
4. Document it in this README

## Resources

- [Jest Documentation](https://jestjs.io/)
- [ts-jest Documentation](https://kulshekhar.github.io/ts-jest/)
- [AWS SDK Client Mock](https://github.com/m-radzikowski/aws-sdk-client-mock)
- [Supertest Documentation](https://github.com/visionmedia/supertest)

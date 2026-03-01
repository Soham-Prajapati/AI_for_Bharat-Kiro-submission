# Integration Tests Guide

This guide covers integration testing for the Content Intelligence Platform, focusing on API endpoint testing with supertest.

## Overview

Integration tests verify that different parts of the system work together correctly. Unlike unit tests that test individual functions in isolation, integration tests:

- Test complete API endpoints end-to-end
- Verify request/response flows
- Test middleware chains
- Validate error handling across layers
- Ensure proper integration with mocked AWS services

## Setup

### Dependencies

The following packages are already installed:
- `supertest` - HTTP assertion library for testing Express apps
- `@types/supertest` - TypeScript definitions
- `jest` - Test framework
- `ts-jest` - TypeScript support for Jest

### Configuration

**jest.config.js** is configured with:
- `testTimeout: 30000` - 30 second timeout for integration tests
- `setupFilesAfterEnv` - Loads setup.ts before tests
- AWS service mocks automatically configured

## Writing Integration Tests

### Basic Structure

```typescript
import request from 'supertest';
import app from '../../index'; // Your Express app
import { expectSuccessResponse, expectErrorResponse } from '../setup';

describe('POST /api/content/generate', () => {
  it('should generate content successfully', async () => {
    const response = await request(app)
      .post('/api/content/generate')
      .send({
        platform: 'twitter',
        prompt: 'Write about AI',
        tone: 'professional'
      })
      .expect(200);

    expectSuccessResponse(response, 200);
    expect(response.body.data).toHaveProperty('content');
    expect(response.body.data.platform).toBe('twitter');
  });

  it('should return 400 for invalid platform', async () => {
    const response = await request(app)
      .post('/api/content/generate')
      .send({
        platform: 'invalid',
        prompt: 'Test'
      })
      .expect(400);

    expectErrorResponse(response, 400);
  });
});
```

### Testing File Uploads

```typescript
import request from 'supertest';
import app from '../../index';
import path from 'path';

describe('POST /api/upload', () => {
  it('should upload video file successfully', async () => {
    const response = await request(app)
      .post('/api/upload')
      .attach('file', path.join(__dirname, 'fixtures/test-video.mp4'))
      .field('userId', 'test-user-123')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('fileUrl');
    expect(response.body.data).toHaveProperty('key');
  });

  it('should reject files that are too large', async () => {
    const response = await request(app)
      .post('/api/upload')
      .attach('file', Buffer.alloc(200 * 1024 * 1024)) // 200MB
      .expect(413);

    expectErrorResponse(response, 413);
  });
});
```

### Testing Authentication

```typescript
describe('Protected Endpoints', () => {
  let authToken: string;

  beforeAll(async () => {
    // Get auth token
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password' });
    
    authToken = response.body.token;
  });

  it('should access protected route with valid token', async () => {
    const response = await request(app)
      .get('/api/user/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expectSuccessResponse(response);
  });

  it('should reject request without token', async () => {
    const response = await request(app)
      .get('/api/user/profile')
      .expect(401);

    expectErrorResponse(response, 401);
  });
});
```

### Testing with AWS Service Mocks

```typescript
import { bedrockMock } from '../setup';
import { InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

describe('AI Content Generation', () => {
  it('should generate content using Bedrock', async () => {
    // Configure mock response
    bedrockMock.on(InvokeModelCommand).resolves({
      body: new TextEncoder().encode(JSON.stringify({
        completion: 'AI generated content for Twitter',
        stop_reason: 'end_turn'
      })),
      contentType: 'application/json'
    });

    const response = await request(app)
      .post('/api/content/generate')
      .send({
        platform: 'twitter',
        prompt: 'Write about AI'
      })
      .expect(200);

    // Verify mock was called
    const calls = bedrockMock.commandCalls(InvokeModelCommand);
    expect(calls.length).toBe(1);
    
    // Verify response
    expect(response.body.data.content).toContain('AI generated');
  });

  it('should handle Bedrock errors gracefully', async () => {
    // Mock error
    bedrockMock.on(InvokeModelCommand).rejects(
      new Error('Service unavailable')
    );

    const response = await request(app)
      .post('/api/content/generate')
      .send({
        platform: 'twitter',
        prompt: 'Test'
      })
      .expect(500);

    expectErrorResponse(response, 500);
  });
});
```

### Testing Rate Limiting

```typescript
describe('Rate Limiting', () => {
  it('should enforce rate limits', async () => {
    const endpoint = '/api/content/generate';
    const payload = { platform: 'twitter', prompt: 'Test' };

    // Make requests up to the limit
    for (let i = 0; i < 100; i++) {
      await request(app)
        .post(endpoint)
        .send(payload)
        .expect(200);
    }

    // Next request should be rate limited
    const response = await request(app)
      .post(endpoint)
      .send(payload)
      .expect(429);

    expectErrorResponse(response, 429);
  });
});
```

### Testing WebSocket Connections

```typescript
import WebSocket from 'ws';

describe('WebSocket Collaboration', () => {
  let ws: WebSocket;

  beforeEach((done) => {
    ws = new WebSocket('ws://localhost:3001/ws');
    ws.on('open', done);
  });

  afterEach(() => {
    ws.close();
  });

  it('should receive workspace updates', (done) => {
    ws.on('message', (data) => {
      const message = JSON.parse(data.toString());
      expect(message.type).toBe('workspace-update');
      expect(message.data).toHaveProperty('content');
      done();
    });

    // Trigger update
    ws.send(JSON.stringify({
      type: 'update',
      workspaceId: 'test-workspace',
      content: 'New content'
    }));
  });
});
```

## Best Practices

### 1. Test Isolation

Each test should be independent:

```typescript
describe('User Management', () => {
  let userId: string;

  beforeEach(async () => {
    // Create fresh test data
    const response = await request(app)
      .post('/api/users')
      .send({ name: 'Test User', email: 'test@example.com' });
    
    userId = response.body.data.id;
  });

  afterEach(async () => {
    // Clean up
    await request(app).delete(`/api/users/${userId}`);
  });

  it('should update user', async () => {
    // Test uses fresh userId
  });
});
```

### 2. Use Descriptive Test Names

```typescript
// Good
it('should return 400 when platform is missing', async () => {});
it('should generate Twitter thread with 5 tweets', async () => {});

// Bad
it('should work', async () => {});
it('test 1', async () => {});
```

### 3. Test Both Success and Failure Cases

```typescript
describe('Content Generation', () => {
  it('should generate content successfully', async () => {
    // Happy path
  });

  it('should return 400 for invalid input', async () => {
    // Validation error
  });

  it('should return 500 when AI service fails', async () => {
    // Service error
  });

  it('should return 401 for unauthorized requests', async () => {
    // Auth error
  });
});
```

### 4. Verify Response Structure

```typescript
it('should return properly structured response', async () => {
  const response = await request(app)
    .get('/api/content/123')
    .expect(200);

  expect(response.body).toHaveProperties([
    'success',
    'data',
    'timestamp'
  ]);
  
  expect(response.body.data).toHaveProperties([
    'id',
    'content',
    'platform',
    'createdAt'
  ]);
});
```

### 5. Test Edge Cases

```typescript
describe('Edge Cases', () => {
  it('should handle empty request body', async () => {
    await request(app)
      .post('/api/content/generate')
      .send({})
      .expect(400);
  });

  it('should handle very long prompts', async () => {
    const longPrompt = 'a'.repeat(10000);
    await request(app)
      .post('/api/content/generate')
      .send({ platform: 'twitter', prompt: longPrompt })
      .expect(400);
  });

  it('should handle special characters in input', async () => {
    await request(app)
      .post('/api/content/generate')
      .send({ platform: 'twitter', prompt: '<script>alert("xss")</script>' })
      .expect(200);
  });
});
```

### 6. Use Test Fixtures

Create a fixtures directory for test data:

```typescript
// src/__tests__/fixtures/content.json
{
  "validTwitterRequest": {
    "platform": "twitter",
    "prompt": "Write about AI",
    "tone": "professional"
  },
  "validLinkedInRequest": {
    "platform": "linkedin",
    "prompt": "Career advice",
    "tone": "inspirational"
  }
}

// In test file
import fixtures from './fixtures/content.json';

it('should generate Twitter content', async () => {
  const response = await request(app)
    .post('/api/content/generate')
    .send(fixtures.validTwitterRequest)
    .expect(200);
});
```

### 7. Mock External Services

Always mock AWS services and external APIs:

```typescript
import { s3Mock, bedrockMock } from '../setup';

beforeEach(() => {
  // Reset mocks
  s3Mock.reset();
  bedrockMock.reset();
  
  // Configure default behaviors
  s3Mock.on(PutObjectCommand).resolves({ ETag: '"test"' });
  bedrockMock.on(InvokeModelCommand).resolves({
    body: new TextEncoder().encode(JSON.stringify({
      completion: 'Mock response'
    }))
  });
});
```

### 8. Test Timeout Configuration

For slow operations, adjust timeout:

```typescript
it('should process large video file', async () => {
  // This test needs more time
  jest.setTimeout(60000); // 60 seconds

  const response = await request(app)
    .post('/api/upload')
    .attach('file', 'large-video.mp4')
    .expect(200);
}, 60000); // Also set Jest timeout
```

## Common Patterns

### Testing Pagination

```typescript
describe('GET /api/posts', () => {
  it('should return paginated results', async () => {
    const response = await request(app)
      .get('/api/posts')
      .query({ page: 1, limit: 10 })
      .expect(200);

    expect(response.body.data).toHaveLength(10);
    expect(response.body.pagination).toMatchObject({
      page: 1,
      limit: 10,
      total: expect.any(Number),
      pages: expect.any(Number)
    });
  });
});
```

### Testing Search

```typescript
describe('GET /api/search', () => {
  it('should search content by keyword', async () => {
    const response = await request(app)
      .get('/api/search')
      .query({ q: 'AI technology' })
      .expect(200);

    expect(response.body.data).toBeInstanceOf(Array);
    response.body.data.forEach((item: any) => {
      expect(item.content.toLowerCase()).toMatch(/ai|technology/);
    });
  });
});
```

### Testing CORS

```typescript
describe('CORS', () => {
  it('should allow requests from allowed origins', async () => {
    const response = await request(app)
      .get('/api/health')
      .set('Origin', 'http://localhost:3000')
      .expect(200);

    expect(response.headers['access-control-allow-origin'])
      .toBe('http://localhost:3000');
  });

  it('should reject requests from disallowed origins', async () => {
    const response = await request(app)
      .get('/api/health')
      .set('Origin', 'http://evil.com')
      .expect(403);
  });
});
```

## Running Integration Tests

```bash
# Run all tests (includes integration tests)
npm test

# Run only integration tests (if using naming convention)
npm test -- --testPathPattern=integration

# Run specific integration test file
npm test -- api.integration.test.ts

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm run test:watch
```

## Debugging Integration Tests

### Enable Verbose Logging

```typescript
// Temporarily enable logging in tests
beforeAll(() => {
  process.env.LOG_LEVEL = 'debug';
});

afterAll(() => {
  process.env.LOG_LEVEL = 'error';
});
```

### Inspect Request/Response

```typescript
it('should debug request', async () => {
  const response = await request(app)
    .post('/api/content/generate')
    .send({ platform: 'twitter', prompt: 'Test' });

  console.log('Request:', response.request);
  console.log('Response:', response.body);
  console.log('Headers:', response.headers);
});
```

### Check Mock Calls

```typescript
it('should verify mock interactions', async () => {
  await request(app)
    .post('/api/content/generate')
    .send({ platform: 'twitter', prompt: 'Test' });

  const calls = bedrockMock.commandCalls(InvokeModelCommand);
  console.log('Bedrock was called', calls.length, 'times');
  console.log('With input:', calls[0].args[0].input);
});
```

## Troubleshooting

### Test Timeout Errors

If tests timeout:
1. Check `testTimeout` in jest.config.js (currently 30s)
2. Increase timeout for specific tests: `jest.setTimeout(60000)`
3. Verify mocks are configured correctly
4. Check for unresolved promises

### Port Already in Use

If you get EADDRINUSE errors:
```typescript
// Use dynamic port for tests
const server = app.listen(0); // Random available port
const port = server.address().port;
```

### Mock Not Working

If AWS mocks aren't working:
1. Verify `setup.ts` is loaded
2. Check mock is reset in `beforeEach`
3. Ensure you're using the correct command type
4. Verify aws-sdk-client-mock is installed

### Response Assertion Failures

If response assertions fail:
1. Log the actual response: `console.log(response.body)`
2. Check status code: `console.log(response.status)`
3. Verify request payload is correct
4. Check middleware chain isn't blocking request

## Resources

- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Jest Documentation](https://jestjs.io/)
- [Express Testing Guide](https://expressjs.com/en/guide/testing.html)
- [AWS SDK Client Mock](https://github.com/m-radzikowski/aws-sdk-client-mock)

## Next Steps

1. Write integration tests for all API endpoints
2. Test error handling and edge cases
3. Verify authentication and authorization
4. Test file upload flows
5. Validate WebSocket functionality
6. Test rate limiting
7. Verify CORS configuration
8. Test middleware chains

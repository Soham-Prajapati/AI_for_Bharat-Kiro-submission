# E2E Error Handling Tests

This directory contains comprehensive end-to-end (E2E) tests for the Content Intelligence Platform, focusing on error scenarios and edge cases.

## Test Coverage

### error-handling.test.ts

Comprehensive error handling tests covering:

#### 1. Invalid File Uploads
- Missing file uploads
- Invalid file formats (executables, scripts)
- File size limits (too large, zero-byte files)
- Corrupted files (video, audio)
- File name validation (special characters, long names, unicode)

#### 2. Missing Required Parameters
- Process endpoint validation
- Generate endpoint validation
- Upload endpoint validation
- Empty, null, and whitespace-only parameters

#### 3. Invalid IDs
- Non-existent jobIds
- Invalid jobId formats
- SQL injection attempts
- XSS attempts
- Non-existent generationIds
- Expired generationIds
- Invalid fileIds
- Path traversal attempts

#### 4. Rate Limiting
- Upload rate limiting
- API rate limiting
- Rate limit per IP address
- Rate limit recovery
- Retry-after headers

#### 5. Timeout Handling
- S3 upload timeouts
- Transcription service timeouts
- Bedrock generation timeouts
- Long-running operations
- Request timeout configuration

#### 6. Concurrent Request Handling
- Parallel uploads
- Data integrity with concurrent uploads
- Parallel processing
- Concurrent generation requests
- Race conditions
- Cache invalidation during concurrent access
- Resource contention under high load

#### 7. Authentication and Authorization
- Missing authentication headers
- Invalid auth tokens
- Expired tokens
- Authorization failures
- Insufficient permissions
- API key validation
- CORS and origin validation

#### 8. AWS Service Errors
- S3 errors (access denied, bucket not found, throttling)
- Transcribe errors (job failure, unsupported formats, service unavailable)
- Bedrock errors (model not found, content filtering, token limits)

#### 9. Edge Cases and Boundary Conditions
- Data validation edge cases
- Array and object edge cases
- Numeric boundary tests
- String boundary tests
- HTTP method edge cases
- Content-Type edge cases

#### 10. Error Response Format
- Error response structure
- HTTP status code accuracy
- Error message quality
- Consistent error format
- Production vs development error details

#### 11. Route Not Found
- Non-existent routes
- Invalid paths
- Nested invalid routes

## Running the Tests

```bash
# Run all E2E tests
npm test -- src/__tests__/e2e

# Run specific test file
npm test -- src/__tests__/e2e/error-handling.test.ts

# Run with coverage
npm test -- --coverage src/__tests__/e2e

# Run in watch mode
npm test -- --watch src/__tests__/e2e
```

## Test Patterns

### Using Supertest
All tests use `supertest` for HTTP request testing:

```typescript
const response = await request(app)
  .post('/api/upload')
  .attach('file', mockFile, 'test.mp4')
  .field('userId', 'test-user')
  .expect(400);
```

### Error Response Assertions
Use helper functions from `setup.ts`:

```typescript
expectErrorResponse(response, 400, 'Expected error message');
```

### Mocking Services
Services are mocked using Jest:

```typescript
const mockS3 = S3Service as jest.MockedClass<typeof S3Service>;
mockS3.prototype.upload = jest.fn().mockRejectedValue(
  new Error('Upload failed')
);
```

## Best Practices

1. **Isolation**: Each test is isolated with fresh app instance and cleared mocks
2. **Cleanup**: Cache and mocks are cleared in `beforeEach` and `afterEach`
3. **Timeouts**: Long-running tests have explicit timeout values
4. **Assertions**: Use specific status codes and error message patterns
5. **Edge Cases**: Test boundary conditions and unexpected inputs
6. **Security**: Test for injection attacks and unauthorized access

## Adding New Tests

When adding new error handling tests:

1. Follow the existing test structure
2. Use descriptive test names
3. Include proper assertions for status codes and error messages
4. Mock external services appropriately
5. Clean up resources in `afterEach`
6. Add timeout values for long-running tests
7. Document any special setup requirements

## Related Documentation

- [Integration Tests](../integration/README.md)
- [Test Setup](../setup.ts)
- [Main Test README](../README.md)

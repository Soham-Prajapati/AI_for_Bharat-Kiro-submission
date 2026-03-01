# End-to-End (E2E) Tests

This directory contains comprehensive end-to-end tests that validate the complete user journey through the Content Intelligence Platform.

## Overview

E2E tests simulate real user workflows by testing the entire system from start to finish, ensuring all components work together correctly.

## Test Files

### `complete-journey.test.ts`

The main E2E test that covers the complete user journey:

1. **Upload Video File** - Test file upload functionality
2. **Process Video** - Test transcription service integration
3. **Generate Content** - Test multi-platform content generation
4. **Retrieve Content** - Test content retrieval and caching
5. **Creator DNA Analysis** - Test personality profiling
6. **Viral Score Prediction** - Test virality prediction
7. **ROI Calculation** - Test return on investment metrics

## Running E2E Tests

```bash
# Run all E2E tests
npm test -- e2e

# Run specific E2E test file
npm test -- complete-journey.test.ts

# Run with coverage
npm test -- e2e --coverage

# Run in watch mode
npm test -- e2e --watch
```

## Test Structure

### Setup and Teardown

- `beforeAll()` - Initialize test data and user IDs
- `beforeEach()` - Reset mocks and cache before each test
- `afterEach()` - Clean up cache after each test

### Mock Services

All AWS services and external dependencies are mocked:

- **S3Service** - File upload/download operations
- **TranscribeService** - Video transcription
- **BedrockService** - AI content generation
- **DNAAnalysisService** - Creator personality analysis
- **ViralPredictorService** - Virality prediction
- **ROICalculatorService** - ROI calculations

### Test Scenarios

#### 1. Upload Video File

Tests the file upload endpoint with various scenarios:
- Successful upload
- Missing file validation
- Large file handling
- File metadata verification

#### 2. Process Video (Transcription)

Tests the transcription workflow:
- Start transcription job
- Check job status
- Handle in-progress status
- Retrieve completed transcript

#### 3. Generate Content

Tests multi-platform content generation:
- Generate for multiple platforms simultaneously
- Generate for single platform
- Validate input parameters
- Verify content quality

#### 4. Retrieve Generated Content

Tests content retrieval:
- Fetch by generation ID
- Handle non-existent IDs
- Verify content structure
- Test caching behavior

#### 5. Creator DNA Analysis

Tests personality profiling:
- Analyze video history
- Extract personality traits
- Identify content patterns
- Generate recommendations

#### 6. Viral Score Prediction

Tests virality prediction:
- Predict viral score
- Analyze engagement factors
- Generate optimization recommendations
- Handle different content types

#### 7. ROI Calculation

Tests ROI metrics:
- Calculate time saved
- Calculate money saved
- Track productivity metrics
- Compare AI vs manual workflows

### Complete Journey Test

A comprehensive test that executes all steps in sequence:

```typescript
Upload → Process → Generate → Analyze DNA → Predict Viral → Calculate ROI
```

This test validates:
- Data flows correctly between steps
- Services are called in the right order
- Results from one step can be used in the next
- Error handling works throughout the journey

## Mock Data

### Default Mock Responses

**S3 Upload:**
```json
{
  "key": "user-123/1234567890-video.mp4",
  "url": "https://test-bucket.s3.amazonaws.com/...",
  "etag": "\"mock-etag-123\""
}
```

**Transcription:**
```json
{
  "status": "COMPLETED",
  "transcript": "Welcome to my channel...",
  "confidence": 0.98
}
```

**Content Generation:**
```json
{
  "content": "Generated content for platform",
  "metadata": {
    "model": "claude-3-sonnet",
    "tokens": 150,
    "confidence": 0.95
  }
}
```

**DNA Analysis:**
```json
{
  "personality": {
    "tone": "enthusiastic",
    "style": "educational",
    "humor": 0.7,
    "formality": 0.4
  },
  "topics": ["AI", "technology"],
  "patterns": { ... },
  "strengths": [...],
  "recommendations": [...]
}
```

**Viral Prediction:**
```json
{
  "score": 8.5,
  "confidence": 0.92,
  "factors": { ... },
  "recommendations": [...],
  "estimatedReach": 50000
}
```

**ROI Calculation:**
```json
{
  "timeSaved": { "hours": 45.5, "value": 2275 },
  "moneySaved": { "amount": 3500, "breakdown": {...} },
  "productivity": { ... },
  "comparison": { ... }
}
```

## Best Practices

### 1. Test Isolation

Each test is independent and doesn't rely on state from other tests:

```typescript
beforeEach(() => {
  jest.clearAllMocks();
  cacheService.clear();
  setupDefaultMocks();
});
```

### 2. Realistic Test Data

Use realistic data that mimics production scenarios:

```typescript
const mockTranscript = 'Welcome to my channel! Today we are discussing...';
const platforms = ['twitter', 'linkedin', 'instagram', 'tiktok', 'youtube'];
```

### 3. Comprehensive Assertions

Verify both structure and content:

```typescript
expect(response.body).toHaveProperty('success', true);
expect(response.body).toHaveProperty('fileId');
expect(response.body.fileId).toBeTruthy();
```

### 4. Error Handling

Test both success and failure scenarios:

```typescript
it('should handle upload errors gracefully', async () => {
  mockS3Service.upload.mockRejectedValue(new Error('Upload failed'));
  const response = await request(app).post('/api/upload').expect(500);
  expect(response.body.success).not.toBe(true);
});
```

### 5. Performance Testing

Include performance checks for critical paths:

```typescript
const startTime = Date.now();
await request(app).post('/api/generate').send({...});
const duration = Date.now() - startTime;
expect(duration).toBeLessThan(5000);
```

## Debugging E2E Tests

### Enable Verbose Logging

```typescript
beforeAll(() => {
  process.env.LOG_LEVEL = 'debug';
});
```

### Inspect Mock Calls

```typescript
console.log('S3 upload called:', mockS3Service.upload.mock.calls);
console.log('Bedrock called:', bedrockService.generatePlatformContent.mock.calls);
```

### Check Response Details

```typescript
console.log('Response status:', response.status);
console.log('Response body:', JSON.stringify(response.body, null, 2));
console.log('Response headers:', response.headers);
```

## Common Issues

### Test Timeout

If tests timeout, increase the timeout:

```typescript
jest.setTimeout(60000); // 60 seconds
```

### Mock Not Working

Ensure mocks are properly configured:

```typescript
// Check mock is called
expect(mockService.method).toHaveBeenCalled();

// Check mock implementation
expect(mockService.method).toHaveBeenCalledWith(expectedArgs);
```

### Cache Issues

Clear cache between tests:

```typescript
afterEach(() => {
  cacheService.clear();
});
```

## Extending E2E Tests

### Adding New Journey Steps

1. Add the new step as a describe block
2. Create test cases for success and failure
3. Update the complete journey test
4. Add mock data for the new service

### Adding New Platforms

Update the platform list in tests:

```typescript
const platforms = ['twitter', 'linkedin', 'instagram', 'tiktok', 'youtube', 'newplatform'];
```

Add mock content for the new platform:

```typescript
const contentMap: Record<string, string> = {
  // ... existing platforms
  newplatform: 'Content for new platform'
};
```

## Test Coverage

E2E tests should cover:

- ✅ Happy path (complete journey)
- ✅ Error handling at each step
- ✅ Input validation
- ✅ Edge cases (empty data, large data, special characters)
- ✅ Performance (concurrent requests, large files)
- ✅ Caching behavior
- ✅ Service integration

## Resources

- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Jest Mocking Guide](https://jestjs.io/docs/mock-functions)
- [Integration Tests Guide](../INTEGRATION_TESTS.md)
- [Test Setup](../setup.ts)

## Maintenance

### Regular Updates

- Update mock data when API responses change
- Add tests for new features
- Remove tests for deprecated features
- Keep test data realistic and up-to-date

### Performance Monitoring

Monitor test execution time:

```bash
npm test -- e2e --verbose
```

If tests become slow:
- Check for unnecessary waits
- Optimize mock implementations
- Parallelize independent tests

## Contributing

When adding new E2E tests:

1. Follow the existing test structure
2. Use descriptive test names
3. Add comprehensive assertions
4. Test both success and failure cases
5. Update this README with new test scenarios
6. Ensure tests are isolated and repeatable

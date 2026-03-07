# Analytics API Integration Tests

## Overview
Comprehensive integration tests for the Analytics API route (`GET /api/analytics/:userId`).

## Test File
`src/__tests__/integration/analytics-api.test.ts`

## Test Coverage

### 1. Successful Analytics Retrieval (3 tests)
- ✅ Returns 200 with analytics data for valid userId
- ✅ Returns analytics with correct response structure
- ✅ Returns analytics with complete platform data

### 2. Caching Behavior (4 tests)
- ✅ Returns `cached: false` on first call
- ✅ Returns `cached: true` on second call
- ✅ Caches data for different users independently
- ✅ Returns same analytics data from cache

### 3. Error Handling (5 tests)
- ✅ Returns 404 for missing userId parameter
- ✅ Handles service errors gracefully (500 error)
- ✅ Handles empty userId gracefully
- ✅ Handles special characters in userId
- ✅ Handles very long userId strings

### 4. Response Contract Validation (6 tests)
- ✅ Always includes `success` field
- ✅ Always includes `userId` field
- ✅ Always includes `analytics` field
- ✅ Always includes `cached` field
- ✅ Always includes `fetchedAt` field (valid ISO date)
- ✅ Returns valid JSON response

## Test Results
```
Test Suites: 1 passed, 1 total
Tests:       18 passed, 18 total
Time:        ~3s
```

## Response Structure Validated

```typescript
{
  success: boolean;
  userId: string;
  analytics: {
    platforms: {
      youtube?: PlatformStats;
      instagram?: PlatformStats;
      tiktok?: PlatformStats;
      // ... other platforms
    };
    recommendations: string[];
    bestPerforming: string;
    contentGaps: string[];
    overallScore: number;
  };
  cached: boolean;
  fetchedAt: string; // ISO date
}
```

## Mocked Services
- `ecosystemAnalyticsService.getAnalytics()` - Mocked to return test data
- `cacheService` - Real implementation used, cleared between tests

## Running the Tests

```bash
# Run analytics API tests only
npm test -- src/__tests__/integration/analytics-api.test.ts

# Run with coverage
npm test -- src/__tests__/integration/analytics-api.test.ts --coverage

# Run in watch mode
npm test -- src/__tests__/integration/analytics-api.test.ts --watch
```

## Key Features Tested

1. **API Endpoint**: `GET /api/analytics/:userId`
2. **Caching**: 1-hour TTL with proper cache key isolation
3. **Error Handling**: Validates error responses and edge cases
4. **Response Contract**: Ensures consistent API response structure
5. **Service Integration**: Verifies proper service method calls

## Dependencies
- `supertest` - HTTP assertions
- `express` - Minimal app setup for isolated testing
- `jest` - Test framework
- Test utilities from `src/__tests__/setup.ts`

## Notes
- Tests use a minimal Express app instance to avoid loading the entire application
- Cache is cleared before each test to ensure isolation
- All mocks are reset between tests
- Tests verify both successful and error scenarios

# API Client Architecture

## Overview

This document describes the architecture of the production-ready API client for the Content Intelligence Platform, covering all 28+ backend routes with comprehensive error handling, interceptors, and retry logic.

## File Structure

```
frontend/
├── types/
│   └── api.ts                    # TypeScript interfaces (all API types)
└── services/
    ├── api.ts                    # Main API client implementation
    ├── api-examples.ts           # Usage examples and patterns
    ├── API_CLIENT_GUIDE.md       # User documentation
    └── API_ARCHITECTURE.md       # This file
```

## Architecture Components

### 1. Type System (`frontend/types/api.ts`)

**Purpose**: Provide type-safe interfaces for all API requests and responses

**Key Features**:
- 100+ TypeScript interfaces covering all endpoints
- Custom error classes with detailed error information
- Platform and content type enums
- Paginated response types

**Categories**:
- Base Types (ApiResponse, PaginatedResponse)
- Error Types (8 custom error classes)
- Upload Types
- Process Types
- Generate Types
- DNA Analysis Types
- Analytics Types
- Viral Prediction Types
- Auth Types
- Automation Types
- Community Types
- Trends Types
- Multiply Types
- Workspace Types
- Marketplace Types
- Integrations Types
- ROI Types
- Creative Director Types
- Viral Analyzer Types

### 2. API Client (`frontend/services/api.ts`)

**Purpose**: Core API client with advanced features

**Architecture Pattern**: Singleton with modular endpoint groups

**Key Components**:

#### Configuration
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const DEFAULT_TIMEOUT = 30000; // 30 seconds
const UPLOAD_TIMEOUT = 300000; // 5 minutes
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
```

#### Core Features

**1. Request/Response Interceptors**
- Pre-request modification (headers, auth, logging)
- Post-response transformation
- Error interception and handling

**2. Error Handling**
- Custom error classes for different scenarios
- Automatic error type detection from status codes
- Detailed error information (status, code, message, details)

**3. Retry Logic**
- Exponential backoff for failed requests
- Configurable retry attempts and delays
- Smart retry decisions based on error type
- Rate limit respect with Retry-After header

**4. Authentication Management**
- Automatic token injection in headers
- Token persistence in localStorage
- Auto-logout on authentication errors

**5. Timeout Control**
- Per-request timeout configuration
- Abort controller for request cancellation
- Different timeouts for different operations

**6. Upload Progress Tracking**
- XMLHttpRequest-based upload with progress events
- Real-time progress callbacks
- File size validation

### 3. Endpoint Organization

The API client organizes endpoints into logical groups:

```typescript
apiClient.upload.*          // File upload
apiClient.process.*         // Transcription processing
apiClient.generate.*        // Content generation
apiClient.dna.*            // DNA analysis
apiClient.analytics.*      // Analytics
apiClient.viral.*          // Viral prediction
apiClient.auth.*           // Authentication
apiClient.automation.*     // Automation
apiClient.community.*      // Community features
apiClient.trends.*         // Trend analysis
apiClient.multiply.*       // Content multiplication
apiClient.workspace.*      // Collaborative workspaces
apiClient.marketplace.*    // Marketplace
apiClient.integrations.*   // Platform integrations
apiClient.roi.*            // ROI calculation
apiClient.creativeDirector.* // Content quality analysis
apiClient.viralAnalyzer.*  // Viral pattern analysis
```

## Error Handling Strategy

### Error Hierarchy

```
Error
└── ApiError (base class)
    ├── ValidationError (400)
    ├── AuthenticationError (401)
    ├── AuthorizationError (403)
    ├── NotFoundError (404)
    ├── RateLimitError (429)
    ├── TimeoutError (408)
    ├── NetworkError (0)
    └── UploadError (custom)
```

### Error Flow

1. **Request Error**: Network issues, timeouts
   - Caught by fetch error handler
   - Converted to NetworkError or TimeoutError
   - Triggers retry logic if applicable

2. **Response Error**: HTTP error status codes
   - Parsed from response body
   - Converted to appropriate error class
   - Passed through response interceptors
   - Triggers retry logic if applicable

3. **Validation Error**: Client-side validation
   - Thrown before request is made
   - No retry attempted

### Retry Strategy

```typescript
Retry Conditions:
- Network errors → Retry
- Timeout errors → Retry
- 5xx server errors → Retry
- Rate limit errors → Retry with delay
- 4xx client errors → No retry

Retry Delay:
- Base delay: 1 second
- Exponential backoff: delay * 2^attempt
- Rate limit: Use Retry-After header
- Max attempts: 3 (configurable)
```

## Interceptor System

### Request Interceptors

**Purpose**: Modify requests before they are sent

**Use Cases**:
- Add custom headers
- Log requests (development)
- Modify request body
- Add authentication tokens

**Example**:
```typescript
apiClient.addRequestInterceptor({
  onRequest: async (config) => {
    config.headers['X-Custom-Header'] = 'value';
    return config;
  },
  onError: (error) => {
    console.error('Request error:', error);
  },
});
```

### Response Interceptors

**Purpose**: Transform responses or handle errors globally

**Use Cases**:
- Transform response data
- Log responses (development)
- Handle authentication errors globally
- Track API metrics

**Example**:
```typescript
apiClient.addResponseInterceptor({
  onResponse: async (response) => {
    // Transform response
    return response;
  },
  onError: (error) => {
    if (error instanceof AuthenticationError) {
      // Redirect to login
      window.location.href = '/login';
    }
  },
});
```

## Authentication Flow

### Login Flow

```
1. User submits credentials
   ↓
2. apiClient.auth.login(credentials)
   ↓
3. Backend validates and returns token
   ↓
4. Client stores token in memory and localStorage
   ↓
5. Token automatically injected in subsequent requests
```

### Token Management

```typescript
// Automatic token injection
if (this.authToken) {
  headers['Authorization'] = `Bearer ${this.authToken}`;
}

// Automatic token persistence
localStorage.setItem('authToken', token);

// Automatic token loading on initialization
const savedToken = localStorage.getItem('authToken');
if (savedToken) {
  apiClient.setAuthToken(savedToken);
}
```

### Logout Flow

```
1. User clicks logout
   ↓
2. apiClient.auth.logout()
   ↓
3. Token cleared from memory and localStorage
   ↓
4. Redirect to login page
```

## Upload Architecture

### Standard Upload (Small Files)

Uses fetch API with JSON body for metadata

### Large File Upload (Progress Tracking)

Uses XMLHttpRequest for progress events:

```
1. Validate file size
   ↓
2. Create FormData with file
   ↓
3. Setup XMLHttpRequest with progress listener
   ↓
4. Track upload progress (0-100%)
   ↓
5. Handle completion/error
```

### Progress Callback

```typescript
await apiClient.upload.file(file, (progress) => {
  console.log(`Upload: ${progress}%`);
  updateProgressBar(progress);
});
```

## Timeout Strategy

Different operations have different timeout requirements:

| Operation | Timeout | Reason |
|-----------|---------|--------|
| Default | 30s | Standard API calls |
| Upload | 5min | Large file transfers |
| AI Generation | 1-2min | Complex AI processing |
| Transcription | 30s | Status checks only |

## Performance Optimizations

### 1. Request Deduplication
- Same requests within short time window are deduplicated
- Prevents unnecessary API calls

### 2. Caching
- Backend implements caching for analytics and trends
- Client respects cache headers

### 3. Parallel Requests
- Multiple independent requests can be made in parallel
- Example: Batch upload and process

### 4. Lazy Loading
- API client is a singleton, loaded once
- Endpoint methods are lazy-evaluated

## Security Considerations

### 1. Token Storage
- Tokens stored in localStorage (XSS risk mitigation needed)
- Tokens automatically cleared on logout
- Tokens validated on each request

### 2. HTTPS Only
- Production API must use HTTPS
- Prevents token interception

### 3. CORS
- Backend must configure CORS properly
- Credentials included in requests

### 4. Input Validation
- Client-side validation before API calls
- Server-side validation is primary defense

## Testing Strategy

### Unit Tests
- Test error handling
- Test retry logic
- Test interceptors
- Test timeout behavior

### Integration Tests
- Test complete workflows
- Test authentication flow
- Test error scenarios

### Mock API
- Create mock API client for testing
- Use interceptors to mock responses

## Migration Path

### From Legacy API

```typescript
// Old
import { api } from '@/services/api';
await api.upload(file);

// New
import apiClient from '@/services/api';
await apiClient.upload.file(file);
```

### Backward Compatibility

Legacy export maintained for gradual migration:

```typescript
export const api = {
  upload: apiClient.upload.file,
};
```

## Future Enhancements

### Planned Features

1. **WebSocket Support**
   - Real-time updates for processing status
   - Live collaboration in workspaces

2. **Request Caching**
   - Client-side cache for GET requests
   - Configurable cache TTL

3. **Offline Support**
   - Queue requests when offline
   - Sync when connection restored

4. **Request Cancellation**
   - Cancel in-flight requests
   - Cleanup on component unmount

5. **GraphQL Support**
   - Alternative to REST endpoints
   - More efficient data fetching

6. **Metrics and Analytics**
   - Track API performance
   - Monitor error rates
   - Usage analytics

## Best Practices

### 1. Always Handle Errors

```typescript
try {
  const response = await apiClient.upload.file(file);
} catch (error) {
  if (error instanceof UploadError) {
    // Handle upload-specific error
  }
}
```

### 2. Use Type Safety

```typescript
import type { GenerateRequest, GenerateResponse } from '@/types/api';

const request: GenerateRequest = {
  jobId: 'job-123',
  platforms: ['youtube'],
};

const response: GenerateResponse = await apiClient.generate.create(request);
```

### 3. Provide User Feedback

```typescript
const [progress, setProgress] = useState(0);

await apiClient.upload.file(file, (progress) => {
  setProgress(progress);
});
```

### 4. Handle Loading States

```typescript
const [loading, setLoading] = useState(false);

setLoading(true);
try {
  await apiClient.process.start({ fileId });
} finally {
  setLoading(false);
}
```

### 5. Use Interceptors for Cross-Cutting Concerns

```typescript
// Logging
apiClient.addRequestInterceptor({
  onRequest: (config) => {
    console.log('Request:', config);
    return config;
  },
});

// Global error handling
apiClient.addResponseInterceptor({
  onError: (error) => {
    if (error instanceof AuthenticationError) {
      redirectToLogin();
    }
  },
});
```

## Conclusion

This API client provides a robust, type-safe, and production-ready solution for interacting with the Content Intelligence Platform backend. It handles all common scenarios including error handling, retries, authentication, and progress tracking, while maintaining clean and maintainable code.

The modular architecture allows for easy extension and customization, while the comprehensive type system ensures type safety throughout the application.

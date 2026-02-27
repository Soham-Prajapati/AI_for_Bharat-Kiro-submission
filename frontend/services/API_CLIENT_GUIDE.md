# API Client Documentation

## Overview

Production-ready, type-safe API client for the Content Intelligence Platform. Supports all 28+ backend routes with comprehensive error handling, request/response interceptors, and automatic retry logic.

## Features

- ✅ **Type-Safe**: Full TypeScript support with interfaces for all requests/responses
- ✅ **Error Handling**: Custom error classes with detailed error information
- ✅ **Retry Logic**: Automatic retry with exponential backoff for failed requests
- ✅ **Interceptors**: Request/response interceptors for logging, auth, and transformations
- ✅ **Progress Tracking**: Upload progress monitoring
- ✅ **Auth Management**: Automatic token persistence and injection
- ✅ **Timeout Control**: Configurable timeouts per request
- ✅ **Rate Limiting**: Intelligent handling of rate limit errors

## Installation

```typescript
import apiClient from '@/services/api';
// or
import { ApiClient } from '@/services/api';
```

## Quick Start

### Basic Usage

```typescript
// Upload a file
const file = document.querySelector('input[type="file"]').files[0];
const uploadResponse = await apiClient.upload.file(file, (progress) => {
  console.log(`Upload progress: ${progress}%`);
});

// Process the uploaded file
const processResponse = await apiClient.process.start({
  fileId: uploadResponse.fileId,
});

// Check processing status
const status = await apiClient.process.getStatus(processResponse.jobId);

// Generate content for multiple platforms
const generated = await apiClient.generate.create({
  jobId: processResponse.jobId,
  platforms: ['youtube', 'instagram', 'tiktok'],
  language: 'en',
  creatorMode: 'hybrid',
});
```

### Authentication

```typescript
// Register
const registerResponse = await apiClient.auth.register({
  email: 'user@example.com',
  password: 'securePassword123',
  name: 'John Doe',
});

// Login (automatically sets auth token)
const loginResponse = await apiClient.auth.login({
  email: 'user@example.com',
  password: 'securePassword123',
});

// Verify token
const verifyResponse = await apiClient.auth.verify({
  token: loginResponse.token,
});

// Logout (clears auth token)
apiClient.auth.logout();
```

## API Reference

### Upload API

```typescript
// Upload file with progress tracking
apiClient.upload.file(
  file: File,
  onProgress?: (progress: number) => void,
  userId?: string
): Promise<UploadResponse>
```

### Process API

```typescript
// Start transcription processing
apiClient.process.start(data: ProcessRequest): Promise<ProcessResponse>

// Get processing status
apiClient.process.getStatus(jobId: string): Promise<ProcessStatusResponse>
```

### Generate API

```typescript
// Generate platform-specific content
apiClient.generate.create(data: GenerateRequest): Promise<GenerateResponse>

// Get generation result
apiClient.generate.get(generationId: string): Promise<GenerateResponse>
```

### DNA Analysis API

```typescript
// Analyze creator's content DNA
apiClient.dna.analyze(data: DnaAnalyzeRequest): Promise<DnaAnalyzeResponse>
```

### Analytics API

```typescript
// Get cross-platform analytics
apiClient.analytics.get(userId: string): Promise<AnalyticsResponse>
```

### Viral Prediction API

```typescript
// Predict content virality
apiClient.viral.predict(data: ViralPredictRequest): Promise<ViralPredictResponse>
```

### Automation API

```typescript
// Create automation
apiClient.automation.create(data: CreateAutomationRequest): Promise<Automation>

// List user automations
apiClient.automation.list(userId: string): Promise<ListAutomationsResponse>

// Delete automation
apiClient.automation.delete(automationId: string): Promise<DeleteAutomationResponse>
```

### Community API

```typescript
// Posts
apiClient.community.createPost(data: CreatePostRequest)
apiClient.community.getPost(postId: string)
apiClient.community.getFeed(userId?: string, limit?: number, offset?: number)
apiClient.community.likePost(postId: string, userId: string)
apiClient.community.unlikePost(postId: string, userId: string)
apiClient.community.addComment(postId: string, userId: string, content: string)
apiClient.community.deletePost(postId: string, userId: string)

// Groups
apiClient.community.createGroup(data: CreateGroupRequest)
apiClient.community.getGroup(groupId: string)
apiClient.community.listGroups(limit?: number)
apiClient.community.joinGroup(groupId: string, userId: string)
apiClient.community.leaveGroup(groupId: string, userId: string)

// Users
apiClient.community.getUser(userId: string)
apiClient.community.followUser(userId: string, followeeId: string)
apiClient.community.unfollowUser(userId: string, followeeId: string)
```

### Trends API

```typescript
// Get current trends
apiClient.trends.current(): Promise<CurrentTrendsResponse>

// Predict upcoming trends
apiClient.trends.predict(): Promise<PredictTrendsResponse>
```

### Multiply API

```typescript
// Generate multiple content pieces
apiClient.multiply.generate(data: MultiplyGenerateRequest): Promise<MultiplyGenerateResponse>
```

### Workspace API

```typescript
// Create workspace
apiClient.workspace.create(data: CreateWorkspaceRequest)

// Get workspace
apiClient.workspace.get(workspaceId: string)

// Get workspace users
apiClient.workspace.getUsers(workspaceId: string)

// Delete workspace
apiClient.workspace.delete(workspaceId: string)
```

### Marketplace API

```typescript
// Create listing
apiClient.marketplace.createListing(data: CreateListingRequest)

// Purchase listing
apiClient.marketplace.purchase(data: PurchaseListingRequest)

// Get listings
apiClient.marketplace.getListings(type?: string, search?: string, limit?: number)
```

### Integrations API

```typescript
// Connect platform
apiClient.integrations.connect(data: ConnectPlatformRequest)

// Post to platform
apiClient.integrations.post(data: PostToPlatformRequest)

// List connections
apiClient.integrations.list(userId: string)
```

### ROI API

```typescript
// Calculate ROI
apiClient.roi.calculate(userId: string): Promise<RoiResponse>
```

### Creative Director API

```typescript
// Analyze content quality
apiClient.creativeDirector.analyze(data: AnalyzeContentRequest): Promise<AnalyzeContentResponse>
```

### Viral Analyzer API

```typescript
// Analyze viral content patterns
apiClient.viralAnalyzer.analyze(data: AnalyzeViralRequest): Promise<AnalyzeViralResponse>
```

## Error Handling

### Error Types

The API client provides custom error classes for different scenarios:

```typescript
import {
  ApiError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  RateLimitError,
  NetworkError,
  TimeoutError,
  UploadError,
} from '@/types/api';
```

### Error Handling Example

```typescript
try {
  const response = await apiClient.generate.create({
    jobId: 'job-123',
    platforms: ['youtube'],
  });
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Validation failed:', error.message, error.field);
  } else if (error instanceof AuthenticationError) {
    console.error('Authentication required:', error.message);
    // Redirect to login
  } else if (error instanceof RateLimitError) {
    console.error('Rate limited. Retry after:', error.retryAfter);
  } else if (error instanceof NetworkError) {
    console.error('Network error:', error.message);
  } else if (error instanceof TimeoutError) {
    console.error('Request timeout:', error.message);
  } else if (error instanceof ApiError) {
    console.error('API error:', error.statusCode, error.message);
  }
}
```

## Interceptors

### Request Interceptors

Add custom logic before requests are sent:

```typescript
apiClient.addRequestInterceptor({
  onRequest: async (config) => {
    // Modify request config
    config.headers = {
      ...config.headers,
      'X-Custom-Header': 'value',
    };
    return config;
  },
  onError: (error) => {
    // Handle request errors
    console.error('Request error:', error);
  },
});
```

### Response Interceptors

Add custom logic after responses are received:

```typescript
apiClient.addResponseInterceptor({
  onResponse: async (response) => {
    // Transform response
    return response;
  },
  onError: (error) => {
    // Handle response errors
    if (error instanceof AuthenticationError) {
      // Redirect to login
      window.location.href = '/login';
    }
  },
});
```

## Retry Logic

The API client automatically retries failed requests with exponential backoff:

- **Network errors**: Automatically retried
- **Timeout errors**: Automatically retried
- **5xx server errors**: Automatically retried
- **Rate limit errors**: Retried with respect to `Retry-After` header

### Configuration

```typescript
// Custom retry configuration
const response = await apiClient.request('/api/endpoint', {
  method: 'POST',
  body: data,
  retries: 5, // Max 5 retries (default: 3)
  retryDelay: 2000, // Base delay 2 seconds (default: 1 second)
});
```

## Timeout Configuration

Different endpoints have different timeout configurations:

- **Default**: 30 seconds
- **Upload**: 5 minutes
- **AI Generation**: 1-2 minutes

### Custom Timeout

```typescript
const response = await apiClient.request('/api/endpoint', {
  method: 'POST',
  body: data,
  timeout: 60000, // 1 minute
});
```

## Advanced Usage

### Custom API Client Instance

```typescript
import { ApiClient } from '@/services/api';

const customClient = new ApiClient('https://custom-api.example.com');

// Add custom interceptors
customClient.addRequestInterceptor({
  onRequest: (config) => {
    // Custom logic
    return config;
  },
});

// Use custom client
const response = await customClient.auth.login({
  email: 'user@example.com',
  password: 'password',
});
```

### Manual Token Management

```typescript
// Set auth token manually
apiClient.setAuthToken('your-jwt-token');

// Get current token
const token = apiClient.getAuthToken();

// Clear token
apiClient.setAuthToken(null);
```

## Best Practices

### 1. Error Handling

Always wrap API calls in try-catch blocks:

```typescript
try {
  const response = await apiClient.upload.file(file);
  // Handle success
} catch (error) {
  // Handle error
  if (error instanceof UploadError) {
    // Show user-friendly error message
  }
}
```

### 2. Progress Tracking

Provide user feedback during long operations:

```typescript
const [progress, setProgress] = useState(0);

const handleUpload = async (file: File) => {
  try {
    const response = await apiClient.upload.file(file, (progress) => {
      setProgress(progress);
    });
    // Handle success
  } catch (error) {
    // Handle error
  }
};
```

### 3. Loading States

Manage loading states for better UX:

```typescript
const [loading, setLoading] = useState(false);

const fetchData = async () => {
  setLoading(true);
  try {
    const response = await apiClient.analytics.get(userId);
    // Handle response
  } catch (error) {
    // Handle error
  } finally {
    setLoading(false);
  }
};
```

### 4. Type Safety

Leverage TypeScript types for better development experience:

```typescript
import type { GenerateRequest, GenerateResponse } from '@/types/api';

const generateContent = async (request: GenerateRequest): Promise<GenerateResponse> => {
  return await apiClient.generate.create(request);
};
```

## Environment Configuration

Configure the API URL using environment variables:

```env
# .env.local
NEXT_PUBLIC_API_URL=https://api.example.com
```

## Testing

### Mock API Client

```typescript
import { ApiClient } from '@/services/api';

// Create mock client for testing
const mockClient = new ApiClient('http://localhost:3001');

// Add test interceptors
mockClient.addResponseInterceptor({
  onResponse: async (response) => {
    // Mock response transformation
    return response;
  },
});
```

## Migration Guide

### From Legacy API

If you're migrating from the legacy `api.upload` function:

```typescript
// Old
import { api } from '@/services/api';
await api.upload(file, onProgress);

// New
import apiClient from '@/services/api';
await apiClient.upload.file(file, onProgress);
```

## Support

For issues or questions:
1. Check error messages and status codes
2. Review interceptor logs (development mode)
3. Verify network connectivity
4. Check authentication token validity

## Changelog

### v1.0.0
- Initial release
- Support for all 28+ backend routes
- Comprehensive error handling
- Request/response interceptors
- Automatic retry logic
- Progress tracking for uploads
- Type-safe API methods

# Error Handling Guide

## Overview

The Content Intelligence Platform uses a comprehensive error handling system with custom error classes, centralized middleware, and proper logging.

## Error Classes

All custom errors extend `AppError` base class:

### Base Error
```typescript
class AppError extends Error {
  statusCode: number;
  message: string;
  isOperational: boolean;
}
```

### Available Error Types

| Error Class | Status Code | Use Case |
|------------|-------------|----------|
| `ValidationError` | 400 | Invalid input data |
| `AuthenticationError` | 401 | Authentication failed |
| `AuthorizationError` | 403 | Access denied |
| `NotFoundError` | 404 | Resource not found |
| `ConflictError` | 409 | Resource already exists |
| `RateLimitError` | 429 | Too many requests |
| `AWSError` | 502 | AWS service error |
| `TimeoutError` | 504 | Operation timeout |
| `ServiceUnavailableError` | 503 | Service unavailable |
| `BadRequestError` | 400 | Bad request |

## Usage in Routes

```typescript
import { asyncHandler } from '../middleware/asyncHandler.middleware';
import { ValidationError, NotFoundError } from '../types/errors';

router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  if (!id) {
    throw new ValidationError('ID is required');
  }
  
  const resource = await findById(id);
  
  if (!resource) {
    throw new NotFoundError('Resource');
  }
  
  res.json(resource);
}));
```

## Usage in Services

```typescript
import { AWSError, ValidationError } from '../types/errors';

class MyService {
  async doSomething(input: string) {
    try {
      if (!input) {
        throw new ValidationError('Input is required');
      }
      
      // AWS operation
      const result = await awsClient.send(command);
      return result;
      
    } catch (error: any) {
      if (error instanceof ValidationError) throw error;
      throw new AWSError(error.message, 'ServiceName', error.code);
    }
  }
}
```

## Error Response Format

### Development Mode
```json
{
  "error": "Detailed error message",
  "requestId": "uuid-v4",
  "type": "ValidationError",
  "stack": "Error stack trace..."
}
```

### Production Mode
```json
{
  "error": "User-friendly error message",
  "requestId": "uuid-v4",
  "type": "ValidationError"
}
```

## Request ID Tracking

Every request gets a unique ID for tracking:

```typescript
// Automatically added by middleware
req.headers['x-request-id'] // UUID v4

// Included in all error responses
res.json({ error: '...', requestId: 'uuid' })
```

## AWS Error Handling

### S3 Errors
- `NoSuchKey` → 404 Not Found
- `AccessDenied` → 403 Forbidden
- Generic errors → 502 Bad Gateway

### Bedrock Errors
- `ThrottlingException` → 429 Rate Limit
- `TimeoutError` → 504 Gateway Timeout
- Generic errors → 502 Bad Gateway

### Transcribe Errors
- `ConflictException` → 409 Conflict
- `LimitExceededException` → 429 Rate Limit
- `BadRequestException` → 404 Not Found
- Generic errors → 502 Bad Gateway

## Validation Utilities

Use validation utilities for consistent error messages:

```typescript
import { validateRequired, validateString, validateEnum } from '../utils/validation';

// Validate required field
validateRequired(userId, 'userId');

// Validate string with length
validateString(name, 'name', 1, 100);

// Validate enum
validateEnum(platform, 'platform', ['youtube', 'instagram', 'linkedin']);
```

## Best Practices

1. **Always use asyncHandler** for async routes
2. **Throw specific error types** instead of generic Error
3. **Include field name** in ValidationError for better UX
4. **Catch and re-throw** in services to add context
5. **Never expose sensitive data** in error messages
6. **Log errors with request ID** for debugging
7. **Use validation utilities** for consistent validation

## Testing Errors

```typescript
import request from 'supertest';
import app from '../index';

describe('Error Handling', () => {
  it('should return 400 for validation error', async () => {
    const res = await request(app)
      .post('/api/upload')
      .send({});
    
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(res.body.requestId).toBeDefined();
  });
  
  it('should return 404 for not found', async () => {
    const res = await request(app)
      .get('/api/nonexistent');
    
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Route not found');
  });
});
```

## Security Considerations

1. **No stack traces in production** - Only in development
2. **No AWS credentials in errors** - Sanitized automatically
3. **No internal paths** - Generic messages only
4. **Rate limiting** - Prevent error-based enumeration
5. **Request ID tracking** - For audit trails

## Monitoring

All errors are logged with:
- Request ID
- Error message
- Stack trace (development only)
- Request path and method
- User ID (if available)
- Timestamp

Use CloudWatch or similar to monitor error rates and patterns.

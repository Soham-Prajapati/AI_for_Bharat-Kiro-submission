# Error Handling Guide

## Current State ✅

The Content Intelligence Platform has a solid foundation for error handling:

1. **Custom Error Classes** (`src/types/errors.ts`)
   - `AppError` - Base error class
   - `ValidationError` - 400 errors
   - `AuthenticationError` - 401 errors
   - `AuthorizationError` - 403 errors
   - `NotFoundError` - 404 errors
   - `ConflictError` - 409 errors
   - `RateLimitError` - 429 errors
   - `AWSError` - 502 errors (AWS service failures)
   - `TimeoutError` - 504 errors
   - `ServiceUnavailableError` - 503 errors

2. **AsyncHandler Middleware** (`src/middleware/asyncHandler.middleware.ts`)
   - Wraps async route handlers
   - Automatically catches and forwards errors to error middleware

3. **Error Middleware** (`src/middleware/error.middleware.ts`)
   - Basic error handling
   - Returns appropriate HTTP status codes

## Improvements Needed 🔧

### 1. Enhanced Error Middleware

**Current Implementation:**
```typescript
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  if (err.code === 'NoSuchKey') {
    return res.status(404).json({ error: 'File not found' });
  }

  if (err.code === 'AccessDenied') {
    return res.status(403).json({ error: 'Access denied' });
  }

  res.status(500).json({ error: 'Internal server error' });
};
```

**Recommended Implementation:**
```typescript
import { AppError } from '../types/errors';
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error details
  console.error('Error occurred:', {
    name: err.name,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // Handle custom AppError instances
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        name: err.name,
        message: err.message,
        statusCode: err.statusCode,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
      },
    });
  }

  // Handle Multer errors (file upload)
  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      error: {
        name: 'FileUploadError',
        message: err.message,
        statusCode: 400,
      },
    });
  }

  // Handle AWS SDK errors
  if (err.name === 'NoSuchKey' || err.name === 'NotFound') {
    return res.status(404).json({
      success: false,
      error: {
        name: 'NotFoundError',
        message: 'Resource not found',
        statusCode: 404,
      },
    });
  }

  if (err.name === 'AccessDenied' || err.name === 'Forbidden') {
    return res.status(403).json({
      success: false,
      error: {
        name: 'AccessDeniedError',
        message: 'Access denied',
        statusCode: 403,
      },
    });
  }

  // Handle JSON parsing errors
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: {
        name: 'InvalidJSONError',
        message: 'Invalid JSON in request body',
        statusCode: 400,
      },
    });
  }

  // Default to 500 Internal Server Error
  res.status(500).json({
    success: false,
    error: {
      name: 'InternalServerError',
      message: process.env.NODE_ENV === 'production' 
        ? 'An unexpected error occurred' 
        : err.message,
      statusCode: 500,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      name: 'NotFoundError',
      message: `Route ${req.method} ${req.path} not found`,
      statusCode: 404,
    },
  });
};
```

### 2. Structured Error Responses

All error responses should follow this format:

```typescript
{
  success: false,
  error: {
    name: string,        // Error type (e.g., "ValidationError")
    message: string,     // Human-readable message
    statusCode: number,  // HTTP status code
    field?: string,      // For validation errors
    code?: string,       // Error code for client handling
    details?: any,       // Additional context
    stack?: string       // Only in development
  }
}
```

### 3. Error Logging Strategy

**Development:**
- Log full error details to console
- Include stack traces
- Show detailed error messages to client

**Production:**
- Log to CloudWatch Logs
- Sanitize error messages (no sensitive data)
- Generic error messages to client
- Track error metrics (count, rate, types)

**Recommended Logger:**
```typescript
// src/utils/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    // In production, add CloudWatch transport
    ...(process.env.NODE_ENV === 'production' ? [
      new winston.transports.File({ 
        filename: 'error.log', 
        level: 'error' 
      }),
      new winston.transports.File({ 
        filename: 'combined.log' 
      }),
    ] : []),
  ],
});
```

### 4. Input Validation

Use a validation library like `joi` or `zod` for request validation:

```typescript
// src/middleware/validation.middleware.ts
import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../types/errors';

export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
        throw new ValidationError(messages.join(', '));
      }
      next(error);
    }
  };
};

// Usage in routes:
const uploadSchema = z.object({
  body: z.object({
    userId: z.string().optional(),
  }),
});

router.post('/', validate(uploadSchema), upload.single('file'), asyncHandler(async (req, res) => {
  // Route logic
}));
```

### 5. Error Monitoring & Alerting

**Metrics to Track:**
- Error rate (errors per minute)
- Error types distribution
- Failed requests by endpoint
- AWS service errors
- Response time percentiles

**Alerting Rules:**
- Error rate > 5% → Send email alert
- AWS service unavailable → Send SMS alert
- Critical error (500) → Slack notification
- Rate limit exceeded → Log warning

**Tools:**
- AWS CloudWatch for metrics
- CloudWatch Alarms for alerting
- Optional: Sentry for error tracking (if budget allows)

### 6. Graceful Degradation

When services fail, provide fallbacks:

```typescript
// Example: If Bedrock fails, use cached response
try {
  const result = await bedrockService.generateContent(transcript);
  return result;
} catch (error) {
  logger.warn('Bedrock unavailable, using cached response');
  const cached = await cacheService.get(`fallback-${hash(transcript)}`);
  if (cached) {
    return cached;
  }
  throw new ServiceUnavailableError('Content generation temporarily unavailable');
}
```

### 7. Timeout Handling

Add timeouts to prevent hanging requests:

```typescript
// src/middleware/timeout.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { TimeoutError } from '../types/errors';

export const timeout = (seconds: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const timer = setTimeout(() => {
      next(new TimeoutError(`Request exceeded ${seconds}s timeout`));
    }, seconds * 1000);

    res.on('finish', () => clearTimeout(timer));
    res.on('close', () => clearTimeout(timer));

    next();
  };
};

// Usage:
app.use('/api', timeout(30)); // 30 second timeout for all API routes
```

### 8. Circuit Breaker Pattern

Prevent cascading failures when external services are down:

```typescript
// src/utils/circuitBreaker.ts
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private threshold: number = 5,
    private timeout: number = 60000
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new ServiceUnavailableError('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
    }
  }
}

// Usage:
const bedrockCircuit = new CircuitBreaker(5, 60000);

async function generateContent(transcript: string) {
  return bedrockCircuit.execute(() => 
    bedrockService.generateContent(transcript)
  );
}
```

## Testing Error Handling 🧪

### Unit Tests

```typescript
// src/__tests__/middleware/error.test.ts
import { errorHandler } from '../../middleware/error.middleware';
import { ValidationError, NotFoundError } from '../../types/errors';

describe('Error Middleware', () => {
  it('should handle ValidationError', () => {
    const error = new ValidationError('Invalid input');
    const req = {} as any;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;
    const next = jest.fn();

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          name: 'ValidationError',
          message: 'Invalid input',
        }),
      })
    );
  });

  it('should handle NotFoundError', () => {
    const error = new NotFoundError('User');
    const req = {} as any;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;
    const next = jest.fn();

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});
```

### Integration Tests

```typescript
// src/__tests__/routes/upload.test.ts
import request from 'supertest';
import app from '../../index';

describe('POST /api/upload', () => {
  it('should return 400 if no file uploaded', async () => {
    const response = await request(app)
      .post('/api/upload')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.name).toBe('ValidationError');
  });

  it('should return 413 if file too large', async () => {
    const largeBuffer = Buffer.alloc(200 * 1024 * 1024); // 200MB

    const response = await request(app)
      .post('/api/upload')
      .attach('file', largeBuffer, 'large.mp4');

    expect(response.status).toBe(413);
  });
});
```

## Checklist for Production ✅

- [ ] All routes use `asyncHandler` wrapper
- [ ] All errors extend `AppError` or use custom error classes
- [ ] Error middleware handles all error types
- [ ] Structured error responses (consistent format)
- [ ] Input validation on all routes
- [ ] Timeout middleware on long-running operations
- [ ] Circuit breaker for external services
- [ ] Error logging to CloudWatch
- [ ] Error rate monitoring and alerts
- [ ] Graceful degradation for service failures
- [ ] Unit tests for error handling
- [ ] Integration tests for error scenarios
- [ ] Documentation for error codes

## Error Codes Reference

| Code | HTTP | Description | Action |
|------|------|-------------|--------|
| `VALIDATION_ERROR` | 400 | Invalid input | Fix request data |
| `AUTH_REQUIRED` | 401 | Not authenticated | Login required |
| `ACCESS_DENIED` | 403 | Not authorized | Check permissions |
| `NOT_FOUND` | 404 | Resource not found | Check resource ID |
| `CONFLICT` | 409 | Resource exists | Use different identifier |
| `RATE_LIMIT` | 429 | Too many requests | Wait and retry |
| `AWS_ERROR` | 502 | AWS service error | Retry or contact support |
| `SERVICE_UNAVAILABLE` | 503 | Service down | Retry later |
| `TIMEOUT` | 504 | Request timeout | Retry with smaller payload |
| `INTERNAL_ERROR` | 500 | Unexpected error | Contact support |

## Best Practices 📚

1. **Always use custom error classes** - Don't throw raw strings or generic Errors
2. **Provide context** - Include relevant details (resource ID, operation, etc.)
3. **Log before throwing** - Log errors at the source for better debugging
4. **Sanitize error messages** - Never expose sensitive data in error messages
5. **Test error paths** - Write tests for error scenarios, not just happy paths
6. **Monitor error rates** - Set up alerts for unusual error patterns
7. **Document error codes** - Help frontend developers handle errors correctly
8. **Use circuit breakers** - Prevent cascading failures
9. **Implement retries** - For transient failures (network, rate limits)
10. **Graceful degradation** - Provide fallbacks when possible

## Next Steps 🚀

1. **Immediate (Task 6.1b):**
   - Enhance error middleware with structured responses
   - Add comprehensive error logging
   - Test all error scenarios

2. **Short-term:**
   - Implement input validation with Zod
   - Add timeout middleware
   - Set up CloudWatch error metrics

3. **Long-term:**
   - Implement circuit breaker pattern
   - Add Sentry for error tracking (if budget allows)
   - Create error dashboard in CloudWatch
   - Set up automated alerts

---

**Last Updated:** 2026-02-27  
**Owner:** Shubh (Backend + AWS Lead)  
**Status:** Ready for implementation

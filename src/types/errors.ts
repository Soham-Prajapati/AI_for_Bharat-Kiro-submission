/**
 * Custom error classes for Content Intelligence Platform
 */

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public field?: string) {
    super(400, message);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(401, message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Access denied') {
    super(403, message);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(404, `${resource} not found`);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(409, message);
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests', public retryAfter?: number) {
    super(429, message);
    this.name = 'RateLimitError';
  }
}

export class AWSError extends AppError {
  constructor(message: string, public service: string, public awsCode?: string) {
    super(502, `AWS ${service} error: ${message}`);
    this.name = 'AWSError';
  }
}

export class TimeoutError extends AppError {
  constructor(operation: string = 'Operation') {
    super(504, `${operation} timed out`);
    this.name = 'TimeoutError';
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(service: string = 'Service') {
    super(503, `${service} temporarily unavailable`);
    this.name = 'ServiceUnavailableError';
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(400, message);
    this.name = 'BadRequestError';
  }
}

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types/errors';

const isDevelopment = process.env.NODE_ENV === 'development';

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.path,
    method: req.method,
    requestId: req.headers['x-request-id']
  });
};

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const requestId = req.headers['x-request-id'] || 'unknown';
  
  // Log error with context
  console.error(`[${requestId}] Error:`, {
    message: err.message,
    stack: isDevelopment ? err.stack : undefined,
    path: req.path,
    method: req.method,
    userId: req.body?.userId,
    timestamp: new Date().toISOString()
  });

  // Handle custom AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      requestId,
      ...(isDevelopment && { stack: err.stack })
    });
  }

  // Handle AWS SDK errors
  if (err.name === 'NoSuchKey' || err.code === 'NoSuchKey') {
    return res.status(404).json({ error: 'File not found', requestId });
  }

  if (err.name === 'AccessDenied' || err.code === 'AccessDenied') {
    return res.status(403).json({ error: 'Access denied', requestId });
  }

  if (err.name === 'ThrottlingException' || err.code === 'ThrottlingException') {
    return res.status(429).json({ error: 'Service temporarily unavailable, please retry', requestId });
  }

  if (err.name === 'ServiceUnavailable' || err.code === 'ServiceUnavailable') {
    return res.status(503).json({ error: 'Service temporarily unavailable', requestId });
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message, requestId });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token', requestId });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expired', requestId });
  }

  // Handle multer errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large (max 100MB)', requestId });
    }
    return res.status(400).json({ error: 'File upload error', requestId });
  }

  // Default 500 error - sanitize in production
  res.status(500).json({
    error: isDevelopment ? err.message : 'Internal server error',
    requestId,
    ...(isDevelopment && { stack: err.stack })
  });
};

/**
 * Error handling utilities
 */

import { Response } from 'express';
import { AppError } from '../types/errors';

/**
 * Check if error is operational (expected) vs programming error
 */
export const isOperationalError = (error: Error): boolean => {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
};

/**
 * Send error response with proper format
 */
export const sendErrorResponse = (res: Response, error: AppError, requestId?: string) => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  res.status(error.statusCode).json({
    error: error.message,
    requestId,
    ...(isDevelopment && { stack: error.stack }),
    ...(error instanceof Error && error.name && { type: error.name })
  });
};

/**
 * Wrap async route handlers to catch errors
 */
export const catchAsync = (fn: Function) => {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Handle unhandled promise rejections
 */
export const handleUnhandledRejection = () => {
  process.on('unhandledRejection', (reason: Error) => {
    console.error('UNHANDLED REJECTION! 💥 Shutting down...');
    console.error(reason);
    process.exit(1);
  });
};

/**
 * Handle uncaught exceptions
 */
export const handleUncaughtException = () => {
  process.on('uncaughtException', (error: Error) => {
    console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.error(error);
    process.exit(1);
  });
};

/**
 * Viral Analyzer Error Utilities
 * Maps API errors to user-friendly messages
 */

import { ApiError } from '@/types/api';
import {
  ViralAnalyzerError,
  ViralAnalyzerErrorCode,
} from '@/types/viral-analyzer';

/**
 * Map API error to ViralAnalyzerError with user-friendly messages
 * @param error - API error or generic error
 * @returns Structured error with user message
 */
export function mapApiError(error: any): ViralAnalyzerError {
  // Handle ApiError instances
  if (error instanceof ApiError) {
    return mapApiErrorInstance(error);
  }

  // Handle generic errors
  return {
    code: ViralAnalyzerErrorCode.UNKNOWN_ERROR,
    message: error?.message || 'An unexpected error occurred',
    userMessage: 'An unexpected error occurred. Please try again.',
    retryable: true,
    details: error,
  };
}

/**
 * Map ApiError instance to ViralAnalyzerError
 * @param error - ApiError instance
 * @returns Structured error
 */
function mapApiErrorInstance(error: ApiError): ViralAnalyzerError {
  // Network errors
  if (error.code === 'NETWORK_ERROR') {
    return {
      code: ViralAnalyzerErrorCode.NETWORK_ERROR,
      message: error.message,
      userMessage:
        'Unable to connect to the server. Please check your internet connection and try again.',
      retryable: true,
      details: error.details,
    };
  }

  // Timeout errors
  if (error.code === 'TIMEOUT_ERROR') {
    return {
      code: ViralAnalyzerErrorCode.TIMEOUT,
      message: error.message,
      userMessage:
        'The analysis is taking longer than expected. Please try again with a shorter video.',
      retryable: true,
      details: error.details,
    };
  }

  // Rate limit errors (429)
  if (error.statusCode === 429 || error.code === 'RATE_LIMIT_ERROR') {
    return {
      code: ViralAnalyzerErrorCode.RATE_LIMIT,
      message: error.message,
      userMessage:
        'Too many requests. Please wait a moment before trying again.',
      retryable: true,
      details: error.details,
    };
  }

  // Validation errors (400)
  if (error.statusCode === 400 || error.code === 'VALIDATION_ERROR') {
    return {
      code: ViralAnalyzerErrorCode.VALIDATION_ERROR,
      message: error.message,
      userMessage: getValidationErrorMessage(error),
      retryable: false,
      details: error.details,
    };
  }

  // Invalid URL
  if (error.code === 'INVALID_URL') {
    return {
      code: ViralAnalyzerErrorCode.INVALID_URL,
      message: error.message,
      userMessage:
        'Invalid video URL. Please enter a valid URL from YouTube, TikTok, Instagram, or other supported platforms.',
      retryable: false,
      details: error.details,
    };
  }

  // Authentication errors (401)
  if (error.statusCode === 401) {
    return {
      code: ViralAnalyzerErrorCode.VALIDATION_ERROR,
      message: error.message,
      userMessage: 'Authentication required. Please log in and try again.',
      retryable: false,
      details: error.details,
    };
  }

  // Authorization errors (403)
  if (error.statusCode === 403) {
    return {
      code: ViralAnalyzerErrorCode.VALIDATION_ERROR,
      message: error.message,
      userMessage:
        'You do not have permission to analyze this content. Please upgrade your plan.',
      retryable: false,
      details: error.details,
    };
  }

  // Not found errors (404)
  if (error.statusCode === 404) {
    return {
      code: ViralAnalyzerErrorCode.VALIDATION_ERROR,
      message: error.message,
      userMessage:
        'Video not found. Please check the URL and ensure the video is publicly accessible.',
      retryable: false,
      details: error.details,
    };
  }

  // Server errors (500+)
  if (error.statusCode >= 500) {
    return {
      code: ViralAnalyzerErrorCode.SERVER_ERROR,
      message: error.message,
      userMessage:
        'Server error occurred. Our team has been notified. Please try again later.',
      retryable: true,
      details: error.details,
    };
  }

  // Unknown errors
  return {
    code: ViralAnalyzerErrorCode.UNKNOWN_ERROR,
    message: error.message,
    userMessage: 'An unexpected error occurred. Please try again.',
    retryable: true,
    details: error.details,
  };
}

/**
 * Get user-friendly validation error message
 * @param error - API error
 * @returns User message
 */
function getValidationErrorMessage(error: ApiError): string {
  const message = error.message.toLowerCase();

  if (message.includes('url')) {
    return 'Invalid video URL. Please enter a valid URL.';
  }

  if (message.includes('video')) {
    return 'Unable to access the video. Please ensure it is publicly available.';
  }

  if (message.includes('platform')) {
    return 'This platform is not supported. Please use YouTube, TikTok, or Instagram.';
  }

  if (message.includes('duration') || message.includes('length')) {
    return 'Video is too long. Please use a video under 10 minutes.';
  }

  return error.message || 'Invalid input. Please check your data and try again.';
}

/**
 * Get error icon name based on error code
 * @param code - Error code
 * @returns Icon name
 */
export function getErrorIcon(code: ViralAnalyzerErrorCode): string {
  switch (code) {
    case ViralAnalyzerErrorCode.NETWORK_ERROR:
      return 'wifi-off';
    case ViralAnalyzerErrorCode.TIMEOUT:
      return 'clock';
    case ViralAnalyzerErrorCode.RATE_LIMIT:
      return 'alert-circle';
    case ViralAnalyzerErrorCode.INVALID_URL:
      return 'link-off';
    case ViralAnalyzerErrorCode.VALIDATION_ERROR:
      return 'alert-triangle';
    case ViralAnalyzerErrorCode.SERVER_ERROR:
      return 'server';
    default:
      return 'x-circle';
  }
}

/**
 * Get error color based on error code
 * @param code - Error code
 * @returns Color class
 */
export function getErrorColor(code: ViralAnalyzerErrorCode): string {
  switch (code) {
    case ViralAnalyzerErrorCode.NETWORK_ERROR:
    case ViralAnalyzerErrorCode.TIMEOUT:
      return 'text-amber-600';
    case ViralAnalyzerErrorCode.RATE_LIMIT:
      return 'text-orange-600';
    case ViralAnalyzerErrorCode.INVALID_URL:
    case ViralAnalyzerErrorCode.VALIDATION_ERROR:
      return 'text-red-600';
    case ViralAnalyzerErrorCode.SERVER_ERROR:
      return 'text-purple-600';
    default:
      return 'text-gray-600';
  }
}

/**
 * Check if error is retryable
 * @param error - Viral analyzer error
 * @returns True if retryable
 */
export function isRetryableError(error: ViralAnalyzerError): boolean {
  return error.retryable;
}

/**
 * Get retry delay in milliseconds based on error
 * @param error - Viral analyzer error
 * @param attemptNumber - Current retry attempt (0-indexed)
 * @returns Delay in milliseconds
 */
export function getRetryDelay(
  error: ViralAnalyzerError,
  attemptNumber: number
): number {
  // Rate limit errors: longer delay
  if (error.code === ViralAnalyzerErrorCode.RATE_LIMIT) {
    return 5000 + attemptNumber * 5000; // 5s, 10s, 15s...
  }

  // Network/timeout errors: exponential backoff
  if (
    error.code === ViralAnalyzerErrorCode.NETWORK_ERROR ||
    error.code === ViralAnalyzerErrorCode.TIMEOUT
  ) {
    return Math.min(1000 * Math.pow(2, attemptNumber), 30000); // Max 30s
  }

  // Default: 2 seconds
  return 2000;
}

/**
 * Format error for logging
 * @param error - Viral analyzer error
 * @returns Formatted error string
 */
export function formatErrorForLogging(error: ViralAnalyzerError): string {
  return JSON.stringify(
    {
      code: error.code,
      message: error.message,
      userMessage: error.userMessage,
      retryable: error.retryable,
      details: error.details,
      timestamp: new Date().toISOString(),
    },
    null,
    2
  );
}

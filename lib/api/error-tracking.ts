/**
 * Error tracking integration (Sentry, etc.)
 */

import { appLogger } from './logger';
import type { ErrorContext } from './types';

export interface ErrorTrackingConfig {
  dsn?: string;
  environment?: string;
  release?: string;
  enabled: boolean;
}

export class ErrorTracker {
  public config: ErrorTrackingConfig;
  
  constructor(config: ErrorTrackingConfig) {
    this.config = config;
  }
  
  captureError(error: Error, context?: ErrorContext): void {
    if (!this.config.enabled) {
      return;
    }
    
    // Log error locally
    appLogger.error('Error captured', {
      error: error.message,
      stack: error.stack,
      context,
    });
    
    // In production, this would send to Sentry/error tracking service
    if (this.config.dsn && typeof window !== 'undefined') {
      // Client-side error tracking
      this.captureClientError(error, context);
    } else if (this.config.dsn) {
      // Server-side error tracking
      this.captureServerError(error, context);
    }
  }
  
  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
    if (!this.config.enabled) {
      return;
    }
    
    if (level === 'info') {
      appLogger.info(message);
    } else if (level === 'warning') {
      appLogger.warn(message);
    } else {
      appLogger.error(message);
    }
    
    if (this.config.dsn) {
      // Send to error tracking service
      console.log(`[ErrorTracker] ${level}: ${message}`);
    }
  }
  
  setUser(user: { id: string; email?: string; name?: string }): void {
    if (!this.config.enabled) {
      return;
    }
    
    appLogger.info('User set for error tracking', { userId: user.id });
    
    if (this.config.dsn) {
      // Set user in error tracking service
      console.log(`[ErrorTracker] User set: ${user.id}`);
    }
  }
  
  private captureClientError(error: Error, context?: ErrorContext): void {
    // Client-side error tracking implementation
    // This would integrate with Sentry browser SDK
    console.error('Client error:', error, context);
    
    // Example Sentry integration:
    // if (window.Sentry) {
    //   window.Sentry.captureException(error, { extra: context });
    // }
  }
  
  private captureServerError(error: Error, context?: ErrorContext): void {
    // Server-side error tracking implementation
    // This would integrate with Sentry Node SDK
    console.error('Server error:', error, context);
    
    // Example Sentry integration:
    // const Sentry = require('@sentry/node');
    // Sentry.captureException(error, { extra: context });
  }
}

// Default error tracker instance
export const errorTracker = new ErrorTracker({
  enabled: process.env.NEXT_PUBLIC_SENTRY_DSN !== undefined,
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  release: process.env.APP_VERSION || '1.0.0',
});

// Initialize error tracking
export function initErrorTracking(config?: Partial<ErrorTrackingConfig>): void {
  if (config) {
    Object.assign(errorTracker.config, config);
  }
  
  if (errorTracker.config.enabled && errorTracker.config.dsn) {
    appLogger.info('Error tracking initialized', {
      environment: errorTracker.config.environment,
      release: errorTracker.config.release,
    });
  }
}

// Error boundary for React components
export class ErrorBoundary extends Error {
  constructor(
    message: string,
    public componentStack?: string,
    public error?: Error
  ) {
    super(message);
    this.name = 'ErrorBoundary';
  }
}

// Utility function to wrap async operations with error tracking
export function withErrorTracking<T>(
  fn: () => Promise<T>,
  context?: ErrorContext
): Promise<T> {
  return fn().catch(error => {
    errorTracker.captureError(error instanceof Error ? error : new Error(String(error)), context);
    throw error;
  });
}

// Common error types
export const ERRORS = {
  // Authentication errors
  AUTH_UNAUTHORIZED: 'User is not authenticated',
  AUTH_FORBIDDEN: 'User does not have permission',
  AUTH_EXPIRED: 'Authentication token expired',
  AUTH_INVALID: 'Invalid authentication credentials',
  
  // Validation errors
  VALIDATION_FAILED: 'Input validation failed',
  VALIDATION_REQUIRED: 'Required field is missing',
  VALIDATION_INVALID: 'Invalid field value',
  VALIDATION_UNIQUE: 'Value must be unique',
  
  // Database errors
  DB_CONNECTION: 'Database connection failed',
  DB_QUERY: 'Database query failed',
  DB_CONSTRAINT: 'Database constraint violation',
  DB_NOT_FOUND: 'Record not found',
  
  // API errors
  API_RATE_LIMIT: 'Rate limit exceeded',
  API_TIMEOUT: 'Request timeout',
  API_NETWORK: 'Network error',
  API_SERVER: 'Server error',
  
  // Payment errors
  PAYMENT_FAILED: 'Payment processing failed',
  PAYMENT_DECLINED: 'Payment was declined',
  PAYMENT_INSUFFICIENT: 'Insufficient funds',
  PAYMENT_EXPIRED: 'Payment method expired',
  
  // Business logic errors
  BOOKING_UNAVAILABLE: 'Booking is not available',
  BOOKING_CONFLICT: 'Booking time conflict',
  BOOKING_CANCELLED: 'Booking was cancelled',
  BOOKING_COMPLETED: 'Booking is already completed',
  
  // File upload errors
  FILE_TOO_LARGE: 'File size exceeds limit',
  FILE_INVALID_TYPE: 'Invalid file type',
  FILE_UPLOAD_FAILED: 'File upload failed',
  FILE_NOT_FOUND: 'File not found',
  
  // External service errors
  EXTERNAL_SERVICE: 'External service error',
  EXTERNAL_TIMEOUT: 'External service timeout',
  EXTERNAL_UNAVAILABLE: 'External service unavailable',
  
  // System errors
  SYSTEM_ERROR: 'Internal system error',
  SYSTEM_MAINTENANCE: 'System under maintenance',
  SYSTEM_OVERLOAD: 'System is overloaded',
} as const;

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Error classification
export function classifyError(error: Error | string): ErrorSeverity {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  if (errorMessage.includes('CRITICAL') || errorMessage.includes('fatal')) {
    return ErrorSeverity.CRITICAL;
  }
  
  if (
    errorMessage.includes('payment') ||
    errorMessage.includes('security') ||
    errorMessage.includes('authentication')
  ) {
    return ErrorSeverity.HIGH;
  }
  
  if (
    errorMessage.includes('validation') ||
    errorMessage.includes('database') ||
    errorMessage.includes('network')
  ) {
    return ErrorSeverity.MEDIUM;
  }
  
  return ErrorSeverity.LOW;
}

// Error response formatter
export function formatErrorResponse(
  error: Error | string,
  severity: ErrorSeverity = ErrorSeverity.MEDIUM
): {
  error: string;
  severity: ErrorSeverity;
  timestamp: string;
  code?: string;
} {
  return {
    error: typeof error === 'string' ? error : error.message,
    severity,
    timestamp: new Date().toISOString(),
    code: typeof error === 'object' && 'code' in error ? String(error.code) : undefined,
  };
}

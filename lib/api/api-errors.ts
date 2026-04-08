/**
 * API Error handling utilities
 */

import type { ApiErrorDetails, ZodErrorLike, FormattedZodError } from './types';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public details?: ApiErrorDetails | ApiErrorDetails[]
  ) {
    super(message);
    this.name = 'ApiError';
  }
  
  toJSON() {
    return {
      error: this.code || 'API_ERROR',
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
    };
  }
}

// Common API errors
export const ERRORS = {
  // 400 - Bad Request
  VALIDATION_ERROR: (details?: ApiErrorDetails | ApiErrorDetails[]) => 
    new ApiError(400, 'Validation failed', 'VALIDATION_ERROR', details),
  
  INVALID_INPUT: (message = 'Invalid input provided') =>
    new ApiError(400, message, 'INVALID_INPUT'),
  
  // 401 - Unauthorized
  UNAUTHORIZED: (message = 'Authentication required') =>
    new ApiError(401, message, 'UNAUTHORIZED'),
  
  INVALID_CREDENTIALS: () =>
    new ApiError(401, 'Invalid email or password', 'INVALID_CREDENTIALS'),
  
  INVALID_TOKEN: () =>
    new ApiError(401, 'Invalid or expired token', 'INVALID_TOKEN'),
  
  // 403 - Forbidden
  FORBIDDEN: (message = 'Insufficient permissions') =>
    new ApiError(403, message, 'FORBIDDEN'),
  
  // 404 - Not Found
  NOT_FOUND: (resource = 'Resource') =>
    new ApiError(404, `${resource} not found`, 'NOT_FOUND'),
  
  USER_NOT_FOUND: () =>
    new ApiError(404, 'User not found', 'USER_NOT_FOUND'),
  
  PET_NOT_FOUND: () =>
    new ApiError(404, 'Pet not found', 'PET_NOT_FOUND'),
  
  SITTER_NOT_FOUND: () =>
    new ApiError(404, 'Sitter not found', 'SITTER_NOT_FOUND'),
  
  BOOKING_NOT_FOUND: () =>
    new ApiError(404, 'Booking not found', 'BOOKING_NOT_FOUND'),
  
  // 409 - Conflict
  CONFLICT: (message = 'Resource conflict') =>
    new ApiError(409, message, 'CONFLICT'),
  
  USER_EXISTS: () =>
    new ApiError(409, 'User already exists', 'USER_EXISTS'),
  
  // 422 - Unprocessable Entity
  UNPROCESSABLE_ENTITY: (message = 'Unprocessable entity') =>
    new ApiError(422, message, 'UNPROCESSABLE_ENTITY'),
  
  // 429 - Too Many Requests
  RATE_LIMITED: (message = 'Too many requests') =>
    new ApiError(429, message, 'RATE_LIMITED'),
  
  // 500 - Internal Server Error
  INTERNAL_ERROR: (message = 'Internal server error') =>
    new ApiError(500, message, 'INTERNAL_ERROR'),
  
  DATABASE_ERROR: (message = 'Database error') =>
    new ApiError(500, message, 'DATABASE_ERROR'),
  
  EXTERNAL_SERVICE_ERROR: (service: string) =>
    new ApiError(500, `${service} service error`, 'EXTERNAL_SERVICE_ERROR'),
};

// Error handler for API routes
export function handleApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }
  
  if (error instanceof Error) {
    // Log unexpected errors
    console.error('Unexpected error:', error);
    return ERRORS.INTERNAL_ERROR(error.message);
  }
  
  return ERRORS.INTERNAL_ERROR(String(error));
}

// Zod error formatter
export function formatZodError(error: ZodErrorLike): FormattedZodError {
  if (error.errors) {
    return {
      fieldErrors: error.errors.reduce<Record<string, string>>((acc, err) => {
        const path = err.path.join('.');
        acc[path] = err.message;
        return acc;
      }, {}),
    };
  }
  return { fieldErrors: { general: error.message || 'Validation failed' } };
}

// Create error response
export function createErrorResponse(error: ApiError): Response {
  return new Response(
    JSON.stringify(error.toJSON()),
    {
      status: error.statusCode,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

// Error boundary for React components
export function withErrorBoundary<T extends React.ComponentType<Record<string, unknown>>>(
  Component: T,
  fallback?: React.ReactNode
): T {
  // In a real implementation, this would wrap with ErrorBoundary
  return Component;
}

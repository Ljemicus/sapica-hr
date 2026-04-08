// Barrel exports for API module
export * from './api-errors';
export * from './rate-limit';
export * from './upstash-rate-limit';
export * from './logger';
export { 
  ErrorTracker, 
  errorTracker, 
  initErrorTracking,
  ErrorBoundary,
  withErrorTracking,
  ErrorSeverity,
  classifyError,
  formatErrorResponse
} from './error-tracking';
export * from './analytics';
export * from './env-check';
export * from './env';
export * from './request-logger';
export * from './versioning';
export * from './openapi-generator';
export * from './cors';

// Export types
export type {
  AnalyticsProperties,
  AnalyticsTraits,
  ApiErrorDetails,
  ZodErrorLike,
  FormattedZodError,
  EnvValue,
  EnvValidationResult,
  ErrorContext,
  LogData,
  RequestHandler,
  ComponentWithChildren,
  OpenApiExample,
  OpenApiSchemaProperty,
  OpenApiSecurityScheme,
  OpenApiSpec,
} from './types';

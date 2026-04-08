/**
 * Shared type definitions for API module
 * Replaces generic `any` types with proper TypeScript definitions
 */

import { ReactNode } from 'react';

// ============================================================================
// Analytics Types
// ============================================================================

export interface AnalyticsProperties {
  [key: string]: string | number | boolean | null | undefined | Date | AnalyticsProperties | AnalyticsProperties[];
}

export interface AnalyticsTraits extends AnalyticsProperties {
  email?: string;
  name?: string;
  userId?: string;
  createdAt?: Date;
  plan?: string;
}

// ============================================================================
// Error Types
// ============================================================================

export interface ApiErrorDetails {
  field?: string;
  message: string;
  code?: string;
  path?: string[];
}

export interface ZodErrorIssue {
  path: (string | number)[];
  message: string;
  code: string;
}

export interface ZodErrorLike {
  errors: ZodErrorIssue[];
  message?: string;
}

export interface FormattedZodError {
  fieldErrors: Record<string, string>;
}

// ============================================================================
// Environment Types
// ============================================================================

export type EnvValue = string | number | boolean | string[] | Record<string, unknown>;

export interface EnvValidationResult {
  [key: string]: EnvValue;
}

// ============================================================================
// Error Tracking Types
// ============================================================================

export interface ErrorContext {
  userId?: string;
  action?: string;
  component?: string;
  metadata?: Record<string, unknown>;
  tags?: string[];
  level?: 'info' | 'warning' | 'error' | 'fatal';
}

// ============================================================================
// Logger Types
// ============================================================================

export type LogData = unknown;

// ============================================================================
// Request Logger Types
// ============================================================================

export type RequestHandler<T> = (req: Request, ...args: unknown[]) => Promise<T>;

// ============================================================================
// React Component Types
// ============================================================================

export type ComponentWithChildren<P = object> = React.ComponentType<P & { children?: ReactNode }>;

// ============================================================================
// OpenAPI Generator Types
// ============================================================================

export interface OpenApiExample {
  summary?: string;
  description?: string;
  value: unknown;
}

export interface OpenApiSchemaProperty {
  type?: string;
  format?: string;
  description?: string;
  example?: unknown;
  default?: unknown;
  enum?: unknown[];
  items?: OpenApiSchemaProperty;
  properties?: Record<string, OpenApiSchemaProperty>;
  required?: string[];
  $ref?: string;
}

export interface OpenApiSecurityScheme {
  type: 'http' | 'apiKey' | 'oauth2' | 'openIdConnect';
  scheme?: string;
  bearerFormat?: string;
  in?: 'query' | 'header' | 'cookie';
  name?: string;
  flows?: unknown;
  openIdConnectUrl?: string;
  description?: string;
}

export interface OpenApiSpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description?: string;
  };
  paths: Record<string, unknown>;
  components?: {
    schemas?: Record<string, unknown>;
    securitySchemes?: Record<string, OpenApiSecurityScheme>;
  };
  security?: Record<string, string[]>[];
}

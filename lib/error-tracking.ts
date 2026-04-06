import * as Sentry from '@sentry/nextjs';
import { appLogger } from './logger';

/**
 * Capture an error with Sentry and log it locally
 */
export function captureError(
  error: Error | string | unknown,
  context?: Record<string, unknown>
): string | null {
  // Log locally first
  const errorMessage = error instanceof Error ? error.message : String(error);
  appLogger.error('sentry', 'Error captured', { message: errorMessage, context });

  // Capture in Sentry
  if (error instanceof Error) {
    return Sentry.captureException(error, {
      contexts: context ? { extra: context } : undefined,
    });
  } else {
    return Sentry.captureMessage(String(error), {
      level: 'error',
      contexts: context ? { extra: context } : undefined,
    });
  }
}

/**
 * Capture a warning with Sentry
 */
export function captureWarning(
  message: string,
  context?: Record<string, unknown>
): string | null {
  appLogger.warn('sentry', message, context);
  
  return Sentry.captureMessage(message, {
    level: 'warning',
    contexts: context ? { extra: context } : undefined,
  });
}

/**
 * Set user context for Sentry
 */
export function setSentryUser(user: { id: string; email?: string; name?: string } | null): void {
  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.name,
    });
  } else {
    Sentry.setUser(null);
  }
}

/**
 * Add breadcrumb for tracking user actions
 */
export function addBreadcrumb(
  message: string,
  category: string,
  level: 'debug' | 'info' | 'warning' | 'error' = 'info'
): void {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
  });
}

/**
 * Capture API error with request context
 */
export function captureApiError(
  error: Error,
  request: {
    url: string;
    method: string;
    headers?: Record<string, string>;
  },
  userId?: string
): string | null {
  const sanitizedUrl = sanitizeUrl(request.url);
  
  return Sentry.captureException(error, {
    user: userId ? { id: userId } : undefined,
    contexts: {
      request: {
        url: sanitizedUrl,
        method: request.method,
      },
    },
    tags: {
      'api.endpoint': sanitizedUrl.split('?')[0],
      'api.method': request.method,
    },
  });
}

/**
 * Sanitize URL to remove sensitive query parameters
 */
function sanitizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const sensitiveParams = ['token', 'password', 'secret', 'api_key', 'apikey', 'code'];
    sensitiveParams.forEach(param => {
      if (urlObj.searchParams.has(param)) {
        urlObj.searchParams.set(param, '[FILTERED]');
      }
    });
    return urlObj.toString();
  } catch {
    return url;
  }
}

/**
 * Measure performance of a function
 */
export function withPerformanceTracking<T extends (...args: unknown[]) => unknown>(
  name: string,
  fn: T
): T {
  return ((...args: unknown[]) => {
    const start = performance.now();
    try {
      const result = fn(...args);
      
      if (result instanceof Promise) {
        return result
          .then((value) => {
            trackPerformance(name, start);
            return value;
          })
          .catch((error) => {
            trackPerformance(name, start, true);
            throw error;
          });
      } else {
        trackPerformance(name, start);
        return result;
      }
    } catch (error) {
      trackPerformance(name, start, true);
      throw error;
    }
  }) as T;
}

function trackPerformance(name: string, start: number, failed = false): void {
  const duration = performance.now() - start;
  
  Sentry.addBreadcrumb({
    category: 'performance',
    message: `${name} took ${duration.toFixed(2)}ms`,
    data: { duration, failed },
    level: failed ? 'error' : 'info',
  });
}

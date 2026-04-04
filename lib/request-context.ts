/**
 * Request-level observability: request ID generation and scoped logging.
 *
 * Usage in route handlers:
 *   const reqId = getRequestId(request);
 *   const log = createScopedLogger('payments.webhook', reqId);
 *   log.info('Processing checkout', { bookingId });
 *   log.error('DB write failed', { reason }, 'P1');
 */

import { appLogger, type Severity } from './logger';

/** Header name used to propagate request IDs. */
export const REQUEST_ID_HEADER = 'x-request-id';

/** Generate a short, collision-resistant request ID (no external deps). */
export function generateRequestId(): string {
  // Format: req_<timestamp-base36>_<random>  (~24 chars, sortable, greppable)
  const ts = Date.now().toString(36);
  const rand = crypto.randomUUID().slice(0, 8);
  return `req_${ts}_${rand}`;
}

/** Extract request ID from incoming request headers, or generate a new one. */
export function getRequestId(request: Request): string {
  return request.headers.get(REQUEST_ID_HEADER) || generateRequestId();
}

/**
 * Create a logger scoped to a specific request.
 * Every log call automatically includes `requestId` in context.
 */
export function createScopedLogger(scope: string, requestId: string) {
  function mergeCtx(context?: Record<string, unknown>): Record<string, unknown> {
    return { requestId, ...context };
  }

  return {
    debug(message: string, context?: Record<string, unknown>) {
      appLogger.debug(scope, message, mergeCtx(context));
    },
    info(message: string, context?: Record<string, unknown>) {
      appLogger.info(scope, message, mergeCtx(context));
    },
    warn(message: string, context?: Record<string, unknown>, severity?: Severity) {
      appLogger.warn(scope, message, mergeCtx(context), severity);
    },
    error(message: string, context?: Record<string, unknown>, severity?: Severity) {
      appLogger.error(scope, message, mergeCtx(context), severity);
    },
    fatal(message: string, context?: Record<string, unknown>) {
      appLogger.fatal(scope, message, mergeCtx(context));
    },
    /** The request ID for passing to downstream calls (alerts, audit logs, etc.) */
    requestId,
  };
}

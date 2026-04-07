import { checkRateLimit, RateLimits, type RateLimitConfig } from './upstash-rate-limit';

// Re-export from upstash-rate-limit for backward compatibility
export { checkRateLimit, RateLimits, type RateLimitConfig } from './upstash-rate-limit';

const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
let lastCleanup = Date.now();

let warnedAboutMemoryLimiter = false;

/**
 * Legacy in-memory rate limiter - kept for backward compatibility.
 * 
 * NOTE: Prefer using checkRateLimit() from upstash-rate-limit.ts for new code
 * as it supports Redis-backed rate limiting on production.
 * 
 * This function only works reliably on a single long-lived process.
 * On serverless / horizontally scaled deployments (e.g. Vercel), it is best-effort only.
 * 
 * @deprecated Use checkRateLimit() from './upstash-rate-limit' instead
 */
export function rateLimit(key: string, limit: number = 10, windowMs: number = 60000): boolean {
  if (!warnedAboutMemoryLimiter && process.env.NODE_ENV === 'production') {
    warnedAboutMemoryLimiter = true;
    console.warn(
      '[rate-limit] Using in-memory rate limiting in production. This is best-effort only on serverless deployments. Consider using checkRateLimit() from upstash-rate-limit.ts for Redis-backed rate limiting.'
    );
  }

  const now = Date.now();

  // Periodically evict expired entries to prevent unbounded memory growth
  if (now - lastCleanup > CLEANUP_INTERVAL_MS) {
    lastCleanup = now;
    for (const [k, v] of rateLimitMap) {
      if (now - v.lastReset > windowMs) rateLimitMap.delete(k);
    }
  }

  const entry = rateLimitMap.get(key);
  if (!entry || now - entry.lastReset > windowMs) {
    rateLimitMap.set(key, { count: 1, lastReset: now });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

let warnedAboutMemoryLimiter = false;

/**
 * Temporary in-memory limiter.
 *
 * NOTE: This only works reliably on a single long-lived process.
 * On serverless / horizontally scaled deployments (e.g. Vercel), it is best-effort only
 * and MUST be replaced with a shared store (Upstash Redis / Vercel KV / database-backed limiter)
 * for real abuse protection.
 */
export function rateLimit(key: string, limit: number = 10, windowMs: number = 60000): boolean {
  if (!warnedAboutMemoryLimiter && process.env.NODE_ENV === 'production') {
    warnedAboutMemoryLimiter = true;
    console.warn(
      '[rate-limit] Using in-memory rate limiting in production. This is best-effort only on serverless deployments and should be replaced with a shared backend.'
    );
  }

  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now - entry.lastReset > windowMs) {
    rateLimitMap.set(key, { count: 1, lastReset: now });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

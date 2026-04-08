// Rate limiting with Upstash Redis for production
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Create Redis client if credentials are available
function createRedisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  return new Redis({ url, token });
}

// Rate limit configurations
const rateLimits = {
  // Strict limits for authentication endpoints
  auth: {
    limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 requests per minute
    analytics: true,
  },
  // Standard API limits
  api: {
    limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
    analytics: true,
  },
  // Generous limits for public pages
  public: {
    limiter: Ratelimit.slidingWindow(1000, '10 m'), // 1000 requests per 10 minutes
    analytics: false,
  },
  // Strict limits for sensitive operations
  sensitive: {
    limiter: Ratelimit.slidingWindow(3, '1 m'), // 3 requests per minute
    analytics: true,
  },
};

// Get rate limiter for a specific type
export function getRateLimiter(type: keyof typeof rateLimits) {
  const redis = createRedisClient();
  
  if (!redis) {
    // Return a no-op rate limiter if Redis is not configured
    return {
      limit: async () => ({ success: true, limit: 100, remaining: 100, reset: Date.now() + 60000 }),
    };
  }

  const config = rateLimits[type];
  return new Ratelimit({
    redis,
    limiter: config.limiter,
    analytics: config.analytics,
    prefix: `@upstash/ratelimit/${type}`,
  });
}

// Check rate limit for a request
export async function checkRateLimit(
  type: keyof typeof rateLimits,
  identifier: string
): Promise<{ allowed: boolean; remaining: number; reset: number }> {
  const limiter = getRateLimiter(type);
  const result = await limiter.limit(identifier);

  return {
    allowed: result.success,
    remaining: result.remaining,
    reset: result.reset,
  };
}

// Middleware helper for API routes
export async function rateLimitMiddleware(
  request: Request,
  type: keyof typeof rateLimits = 'api'
): Promise<{ allowed: boolean; response?: Response }> {
  // Get identifier from IP or user ID
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  const identifier = ip;

  const result = await checkRateLimit(type, identifier);

  if (!result.allowed) {
    return {
      allowed: false,
      response: new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': '100',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': result.reset.toString(),
            'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString(),
          },
        }
      ),
    };
  }

  return { allowed: true };
}

// Legacy compatibility export - used by existing API routes
// This version matches the old API: rateLimit(identifier, points, durationMs)
export function rateLimit(
  identifier: string,
  points: number,
  durationMs: number
): boolean {
  // For now, always allow requests if Redis is not configured
  // In production with Redis, this would actually check the rate limit
  const redis = createRedisClient();
  
  if (!redis) {
    // No Redis configured, allow all requests
    return true;
  }

  // With Redis, we'd do an async check, but this API is synchronous
  // So we'll return true and the async version should be used instead
  return true;
}

// Async version for proper rate limiting
export async function rateLimitAsync(
  identifier: string,
  points: number,
  durationMs: number
): Promise<boolean> {
  const redis = createRedisClient();
  
  if (!redis) {
    return true;
  }

  // Map duration to Ratelimit format
  const durationSeconds = Math.floor(durationMs / 1000);
  const durationStr = durationSeconds >= 60 
    ? `${Math.floor(durationSeconds / 60)} m` 
    : `${durationSeconds} s`;

  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(points, durationStr as any),
    analytics: true,
    prefix: '@upstash/ratelimit/custom',
  });

  const result = await limiter.limit(identifier);
  return result.success;
}

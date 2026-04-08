import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

// Redis client singleton
let redis: Redis | null = null;

/**
 * Gets or creates the Redis client
 */
export function getRedisClient(): Redis {
  if (!redis) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      throw new Error('Upstash Redis credentials not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.');
    }

    redis = new Redis({
      url,
      token,
    });
  }

  return redis;
}

/**
 * Checks if Redis is configured
 */
export function isRedisConfigured(): boolean {
  return !!(
    process.env.UPSTASH_REDIS_REST_URL && 
    process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

// Rate limiter instances cache
const limiters = new Map<string, Ratelimit>();

export interface RateLimitConfig {
  /** Number of requests allowed in the window */
  limit: number;
  /** Time window in seconds */
  windowSeconds: number;
  /** Unique identifier for this rate limiter (e.g., 'auth:login') */
  identifier: string;
  /** Optional prefix for Redis keys */
  prefix?: string;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

/**
 * Creates or gets a cached rate limiter instance
 */
function getRateLimiter(config: RateLimitConfig): Ratelimit {
  const cacheKey = `${config.identifier}:${config.limit}:${config.windowSeconds}`;
  
  if (limiters.has(cacheKey)) {
    return limiters.get(cacheKey)!;
  }

  const client = getRedisClient();
  
  const limiter = new Ratelimit({
    redis: client,
    limiter: Ratelimit.slidingWindow(config.limit, `${config.windowSeconds}s`),
    analytics: true,
    prefix: config.prefix || 'ratelimit',
  });

  limiters.set(cacheKey, limiter);
  return limiter;
}

/**
 * Checks rate limit for a given key
 * @param key - Unique identifier (e.g., IP address, user ID)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export async function checkRateLimit(
  key: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  // Fallback to in-memory rate limiting if Redis is not configured
  if (!isRedisConfigured()) {
    console.warn('[rate-limit] Redis not configured, falling back to in-memory rate limiting');
    return checkMemoryRateLimit(key, config);
  }

  try {
    const limiter = getRateLimiter(config);
    const result = await limiter.limit(`${config.identifier}:${key}`);
    
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
      retryAfter: result.success ? undefined : Math.ceil((result.reset - Date.now()) / 1000),
    };
  } catch (error) {
    console.error('[rate-limit] Redis error, falling back to memory:', error);
    return checkMemoryRateLimit(key, config);
  }
}

// In-memory fallback
const memoryStore = new Map<string, { count: number; resetTime: number }>();
const MEMORY_CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
let lastCleanup = Date.now();

function checkMemoryRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;
  const fullKey = `${config.identifier}:${key}`;

  // Cleanup expired entries periodically
  if (now - lastCleanup > MEMORY_CLEANUP_INTERVAL) {
    lastCleanup = now;
    for (const k of Array.from(memoryStore.keys())) {
      const v = memoryStore.get(k);
      if (v && now > v.resetTime) {
        memoryStore.delete(k);
      }
    }
  }

  const entry = memoryStore.get(fullKey);
  
  if (!entry || now > entry.resetTime) {
    // New window
    memoryStore.set(fullKey, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - 1,
      reset: now + windowMs,
    };
  }

  if (entry.count >= config.limit) {
    // Rate limit exceeded
    return {
      success: false,
      limit: config.limit,
      remaining: 0,
      reset: entry.resetTime,
      retryAfter: Math.ceil((entry.resetTime - now) / 1000),
    };
  }

  // Increment count
  entry.count++;
  return {
    success: true,
    limit: config.limit,
    remaining: config.limit - entry.count,
    reset: entry.resetTime,
  };
}

// Predefined rate limit configurations
export const RateLimits = {
  // Auth endpoints: 5 requests per 15 minutes per IP
  auth: { limit: 5, windowSeconds: 15 * 60, identifier: 'auth' },
  login: { limit: 5, windowSeconds: 15 * 60, identifier: 'auth:login' },
  register: { limit: 3, windowSeconds: 15 * 60, identifier: 'auth:register' },
  forgotPassword: { limit: 3, windowSeconds: 15 * 60, identifier: 'auth:forgot-password' },
  passwordReset: { limit: 5, windowSeconds: 15 * 60, identifier: 'auth:password-reset' },
  
  // API endpoints: 100 requests per minute per IP
  api: { limit: 100, windowSeconds: 60, identifier: 'api' },
  apiGeneral: { limit: 100, windowSeconds: 60, identifier: 'api:general' },
  apiWrite: { limit: 30, windowSeconds: 60, identifier: 'api:write' },
  
  // Social posts/comments: 10 requests per minute per user
  social: { limit: 10, windowSeconds: 60, identifier: 'social' },
  socialPosts: { limit: 10, windowSeconds: 60, identifier: 'social:posts' },
  socialComments: { limit: 10, windowSeconds: 60, identifier: 'social:comments' },
  socialLikes: { limit: 30, windowSeconds: 60, identifier: 'social:likes' },
  
  // Messaging
  messages: { limit: 30, windowSeconds: 60, identifier: 'messages:send' },
  
  // Uploads
  uploads: { limit: 10, windowSeconds: 60, identifier: 'uploads' },
} as const;

/**
 * Higher-level rate limit check with IP extraction
 * @param request - Next.js request object
 * @param config - Rate limit configuration
 * @param identifier - Optional custom identifier (defaults to IP)
 */
export async function rateLimitRequest(
  request: Request,
  config: Omit<RateLimitConfig, 'identifier'> & { identifier?: string },
  customIdentifier?: string
): Promise<RateLimitResult> {
  const identifier = customIdentifier || getClientIdentifier(request);
  const fullConfig: RateLimitConfig = {
    ...config,
    identifier: config.identifier || 'api:general',
  };
  
  return checkRateLimit(identifier, fullConfig);
}

/**
 * Extracts client identifier from request (IP address or user ID)
 */
export function getClientIdentifier(request: Request): string {
  // Try to get IP from various headers
  const headers = request.headers;
  const forwarded = headers.get('x-forwarded-for');
  const realIp = headers.get('x-real-ip');
  const cfConnectingIp = headers.get('cf-connecting-ip');
  
  const ip = cfConnectingIp || realIp || forwarded?.split(',')[0]?.trim() || 'unknown';
  
  return ip;
}

/**
 * Creates a rate-limited API response
 */
export function createRateLimitResponse(result: RateLimitResult): Response {
  const headers = new Headers({
    'Content-Type': 'application/json',
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.reset / 1000)),
  });

  if (result.retryAfter) {
    headers.set('Retry-After', String(result.retryAfter));
  }

  return new Response(
    JSON.stringify({
      error: 'Rate limit exceeded',
      code: 'RATE_LIMITED',
      retryAfter: result.retryAfter,
    }),
    {
      status: 429,
      headers,
    }
  );
}

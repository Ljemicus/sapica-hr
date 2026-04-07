/**
 * Rate limiting utilities
 */

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  max: number; // Max requests per window
  message?: string;
  statusCode?: number;
  skipFailedRequests?: boolean;
  skipSuccessfulRequests?: boolean;
  keyGenerator?: (req: Request) => string;
  skip?: (req: Request) => boolean;
}

export const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests, please try again later.',
  statusCode: 429,
  skipFailedRequests: false,
  skipSuccessfulRequests: false,
};

// Simple in-memory rate limiter (for development)
export class RateLimiter {
  private hits = new Map<string, { count: number; resetTime: number }>();
  
  constructor(private config: RateLimitConfig = DEFAULT_RATE_LIMIT) {}
  
  check(key: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const windowMs = this.config.windowMs;
    
    // Clean up old entries
    this.cleanup(now);
    
    const entry = this.hits.get(key);
    
    if (!entry) {
      // First request
      this.hits.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      
      return {
        allowed: true,
        remaining: this.config.max - 1,
        resetTime: now + windowMs,
      };
    }
    
    if (now > entry.resetTime) {
      // Window expired, reset
      entry.count = 1;
      entry.resetTime = now + windowMs;
      
      return {
        allowed: true,
        remaining: this.config.max - 1,
        resetTime: now + windowMs,
      };
    }
    
    // Within window
    if (entry.count >= this.config.max) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
      };
    }
    
    // Increment count
    entry.count++;
    
    return {
      allowed: true,
      remaining: this.config.max - entry.count,
      resetTime: entry.resetTime,
    };
  }
  
  private cleanup(now: number): void {
    for (const [key, entry] of this.hits.entries()) {
      if (now > entry.resetTime) {
        this.hits.delete(key);
      }
    }
  }
  
  getHeaders(key: string): Record<string, string> {
    const result = this.check(key);
    
    return {
      'X-RateLimit-Limit': this.config.max.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString(),
    };
  }
}

// Default rate limiter instance
export const defaultRateLimiter = new RateLimiter();

// Rate limit middleware for API routes
export function rateLimitMiddleware(config?: Partial<RateLimitConfig>) {
  const fullConfig = { ...DEFAULT_RATE_LIMIT, ...config };
  const limiter = new RateLimiter(fullConfig);
  
  return async function rateLimitHandler(request: Request) {
    // Generate key (default: IP address)
    const key = fullConfig.keyGenerator 
      ? fullConfig.keyGenerator(request)
      : getClientIp(request);
    
    // Check if should skip
    if (fullConfig.skip && fullConfig.skip(request)) {
      return null;
    }
    
    const result = limiter.check(key);
    
    if (!result.allowed) {
      return new Response(
        JSON.stringify({
          error: 'RATE_LIMITED',
          message: fullConfig.message,
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
        }),
        {
          status: fullConfig.statusCode,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
            ...limiter.getHeaders(key),
          },
        }
      );
    }
    
    // Add rate limit headers to response
    const headers = limiter.getHeaders(key);
    
    return { headers };
  };
}

// Helper to get client IP from request
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  
  // Fallback to a default (in production, you'd want better handling)
  return 'unknown';
}

// Rate limit by user ID (for authenticated requests)
export function rateLimitByUserId(userId: string): string {
  return `user:${userId}`;
}

// Rate limit by API key
export function rateLimitByApiKey(apiKey: string): string {
  return `api_key:${apiKey}`;
}
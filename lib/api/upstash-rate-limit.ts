/**
 * Upstash Redis rate limiting (for production)
 */

import { Redis } from '@upstash/redis';

// Note: In a real implementation, you would configure Upstash Redis
// This is a placeholder implementation

export interface UpstashRateLimitConfig {
  redis: Redis;
  prefix?: string;
  windowMs: number;
  max: number;
}

export class UpstashRateLimiter {
  constructor(private config: UpstashRateLimitConfig) {}
  
  async check(key: string): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
  }> {
    const now = Date.now();
    const windowMs = this.config.windowMs;
    const resetTime = now + windowMs;
    
    const redisKey = `${this.config.prefix || 'ratelimit'}:${key}`;
    
    try {
      // Using Redis transactions for atomic operations
      const pipeline = this.config.redis.pipeline();
      
      // Get current count
      pipeline.get(redisKey);
      
      // Increment count (if key doesn't exist, set with expiry)
      pipeline.incr(redisKey);
      pipeline.pexpire(redisKey, windowMs);
      
      const results = await pipeline.exec();
      
      const currentCount = results[0] as number | null;
      const newCount = results[1] as number;
      
      // If key was just created, ensure expiry is set
      if (currentCount === null) {
        await this.config.redis.pexpire(redisKey, windowMs);
      }
      
      const remaining = Math.max(0, this.config.max - newCount);
      const allowed = newCount <= this.config.max;
      
      return {
        allowed,
        remaining,
        resetTime,
      };
    } catch (error) {
      console.error('Upstash rate limit error:', error);
      
      // Fail open - allow request if Redis is down
      return {
        allowed: true,
        remaining: this.config.max,
        resetTime,
      };
    }
  }
  
  async getHeaders(key: string): Promise<Record<string, string>> {
    const result = await this.check(key);
    
    return {
      'X-RateLimit-Limit': this.config.max.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString(),
    };
  }
}

// Factory function to create Upstash rate limiter
export function createUpstashRateLimiter(
  redisUrl: string,
  redisToken: string,
  config: Omit<UpstashRateLimitConfig, 'redis'>
): UpstashRateLimiter {
  const redis = new Redis({
    url: redisUrl,
    token: redisToken,
  });
  
  return new UpstashRateLimiter({
    ...config,
    redis,
  });
}

// Default configuration for different rate limit tiers
export const RATE_LIMIT_TIERS = {
  // Public API endpoints (strict)
  PUBLIC: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per 15 minutes
  },
  
  // Authenticated user endpoints (more generous)
  AUTHENTICATED: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // 1000 requests per 15 minutes
  },
  
  // API key endpoints (very generous)
  API_KEY: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10000, // 10,000 requests per hour
  },
  
  // Critical endpoints (very strict)
  CRITICAL: {
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 requests per minute
  },
};

// Helper to get rate limit tier based on endpoint
export function getRateLimitTier(path: string): keyof typeof RATE_LIMIT_TIERS {
  if (path.includes('/auth/')) {
    return 'CRITICAL'; // Authentication endpoints are critical
  }
  
  if (path.includes('/api/')) {
    // Check if it's a public API endpoint
    const publicEndpoints = [
      '/api/sitters',
      '/api/groomers',
      '/api/trainers',
      '/api/veterinarians',
    ];
    
    if (publicEndpoints.some(endpoint => path.startsWith(endpoint))) {
      return 'PUBLIC';
    }
    
    // Assume authenticated for other API endpoints
    return 'AUTHENTICATED';
  }
  
  // Default to public
  return 'PUBLIC';
}
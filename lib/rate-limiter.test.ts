import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  checkRateLimit,
  rateLimitRequest,
  getClientIdentifier,
  createRateLimitResponse,
  RateLimits,
  isRedisConfigured,
  type RateLimitConfig,
} from './rate-limiter';

// Mock environment variables
const originalEnv = process.env;

beforeEach(() => {
  // Reset environment before each test
  process.env = { ...originalEnv };
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  
  // Clear console warnings
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  process.env = originalEnv;
  vi.restoreAllMocks();
});

describe('isRedisConfigured', () => {
  it('should return false when Redis env vars are not set', () => {
    expect(isRedisConfigured()).toBe(false);
  });

  it('should return true when Redis env vars are set', () => {
    process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token';
    expect(isRedisConfigured()).toBe(true);
  });

  it('should return false when only URL is set', () => {
    process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io';
    expect(isRedisConfigured()).toBe(false);
  });

  it('should return false when only token is set', () => {
    process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token';
    expect(isRedisConfigured()).toBe(false);
  });
});

describe('checkRateLimit', () => {
  const config: RateLimitConfig = {
    limit: 5,
    windowSeconds: 60,
    identifier: 'test',
  };

  it('should allow requests within limit', async () => {
    const result = await checkRateLimit('test-key', config);
    expect(result.success).toBe(true);
    expect(result.limit).toBe(5);
    expect(result.remaining).toBe(4);
  });

  it('should track requests separately for different keys', async () => {
    const result1 = await checkRateLimit('key1', config);
    const result2 = await checkRateLimit('key2', config);
    
    expect(result1.success).toBe(true);
    expect(result2.success).toBe(true);
    expect(result1.remaining).toBe(4);
    expect(result2.remaining).toBe(4);
  });

  it('should block requests over limit', async () => {
    const key = 'limited-key';
    
    // Make 5 requests (the limit)
    for (let i = 0; i < 5; i++) {
      await checkRateLimit(key, config);
    }
    
    // 6th request should be blocked
    const result = await checkRateLimit(key, config);
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.retryAfter).toBeDefined();
    expect(result.retryAfter).toBeGreaterThan(0);
  });

  it('should return correct reset time', async () => {
    const before = Date.now();
    const result = await checkRateLimit('reset-test', config);
    const after = Date.now();
    
    expect(result.reset).toBeGreaterThanOrEqual(before + 60000);
    expect(result.reset).toBeLessThanOrEqual(after + 60000 + 1000); // Allow 1s buffer
  });

  it('should use in-memory fallback when Redis is not configured', async () => {
    const consoleSpy = vi.spyOn(console, 'warn');
    
    await checkRateLimit('fallback-test', config);
    
    expect(consoleSpy).toHaveBeenCalledWith(
      '[rate-limit] Redis not configured, falling back to in-memory rate limiting'
    );
  });
});

describe('RateLimits constants', () => {
  it('should have correct auth rate limits (5 req / 15 min)', () => {
    expect(RateLimits.auth.limit).toBe(5);
    expect(RateLimits.auth.windowSeconds).toBe(15 * 60);
    expect(RateLimits.login.limit).toBe(5);
    expect(RateLimits.login.windowSeconds).toBe(15 * 60);
  });

  it('should have correct API rate limits (100 req / min)', () => {
    expect(RateLimits.api.limit).toBe(100);
    expect(RateLimits.api.windowSeconds).toBe(60);
    expect(RateLimits.apiGeneral.limit).toBe(100);
    expect(RateLimits.apiGeneral.windowSeconds).toBe(60);
  });

  it('should have correct social rate limits (10 req / min)', () => {
    expect(RateLimits.social.limit).toBe(10);
    expect(RateLimits.social.windowSeconds).toBe(60);
    expect(RateLimits.socialPosts.limit).toBe(10);
    expect(RateLimits.socialPosts.windowSeconds).toBe(60);
    expect(RateLimits.socialComments.limit).toBe(10);
    expect(RateLimits.socialComments.windowSeconds).toBe(60);
  });
});

describe('getClientIdentifier', () => {
  it('should extract IP from x-forwarded-for header', () => {
    const request = new Request('http://localhost', {
      headers: { 'x-forwarded-for': '192.168.1.1, 10.0.0.1' },
    });
    expect(getClientIdentifier(request)).toBe('192.168.1.1');
  });

  it('should extract IP from x-real-ip header', () => {
    const request = new Request('http://localhost', {
      headers: { 'x-real-ip': '192.168.1.1' },
    });
    expect(getClientIdentifier(request)).toBe('192.168.1.1');
  });

  it('should extract IP from cf-connecting-ip header', () => {
    const request = new Request('http://localhost', {
      headers: { 'cf-connecting-ip': '192.168.1.1' },
    });
    expect(getClientIdentifier(request)).toBe('192.168.1.1');
  });

  it('should prefer cf-connecting-ip over other headers', () => {
    const request = new Request('http://localhost', {
      headers: {
        'cf-connecting-ip': '1.1.1.1',
        'x-real-ip': '192.168.1.1',
        'x-forwarded-for': '10.0.0.1',
      },
    });
    expect(getClientIdentifier(request)).toBe('1.1.1.1');
  });

  it('should return unknown when no IP headers present', () => {
    const request = new Request('http://localhost');
    expect(getClientIdentifier(request)).toBe('unknown');
  });

  it('should trim whitespace from forwarded-for IP', () => {
    const request = new Request('http://localhost', {
      headers: { 'x-forwarded-for': '  192.168.1.1  , 10.0.0.1' },
    });
    expect(getClientIdentifier(request)).toBe('192.168.1.1');
  });
});

describe('createRateLimitResponse', () => {
  it('should create response with correct status code', () => {
    const result = {
      success: false,
      limit: 5,
      remaining: 0,
      reset: Date.now() + 60000,
      retryAfter: 60,
    };
    
    const response = createRateLimitResponse(result);
    expect(response.status).toBe(429);
  });

  it('should include rate limit headers', () => {
    const result = {
      success: false,
      limit: 5,
      remaining: 0,
      reset: 1234567890,
      retryAfter: 60,
    };
    
    const response = createRateLimitResponse(result);
    expect(response.headers.get('X-RateLimit-Limit')).toBe('5');
    expect(response.headers.get('X-RateLimit-Remaining')).toBe('0');
    expect(response.headers.get('X-RateLimit-Reset')).toBe('1234568');
    expect(response.headers.get('Retry-After')).toBe('60');
  });

  it('should include correct error body', async () => {
    const result = {
      success: false,
      limit: 5,
      remaining: 0,
      reset: Date.now() + 60000,
      retryAfter: 60,
    };
    
    const response = createRateLimitResponse(result);
    const body = await response.json();
    
    expect(body.error).toBe('Rate limit exceeded');
    expect(body.code).toBe('RATE_LIMITED');
    expect(body.retryAfter).toBe(60);
  });

  it('should not include retry-after header when success is true', () => {
    const result = {
      success: true,
      limit: 100,
      remaining: 99,
      reset: Date.now() + 60000,
    };
    
    const response = createRateLimitResponse(result);
    expect(response.headers.get('Retry-After')).toBeNull();
  });
});

describe('rateLimitRequest', () => {
  it('should use custom identifier when provided', async () => {
    const request = new Request('http://localhost');
    const result = await rateLimitRequest(
      request,
      { limit: 5, windowSeconds: 60, identifier: 'custom' },
      'user-123'
    );
    
    expect(result.success).toBe(true);
    expect(result.limit).toBe(5);
  });

  it('should extract IP when no custom identifier provided', async () => {
    const request = new Request('http://localhost', {
      headers: { 'x-real-ip': '192.168.1.1' },
    });
    
    const result = await rateLimitRequest(request, {
      limit: 5,
      windowSeconds: 60,
      identifier: 'api:test',
    });
    
    expect(result.success).toBe(true);
  });
});

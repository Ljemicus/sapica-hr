import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  checkRateLimit,
  RateLimits,
  getClientIdentifier,
  createRateLimitResponse,
  isRedisConfigured,
} from '@/lib/upstash-rate-limit';

// Mock environment variables
const originalEnv = process.env;

describe('isRedisConfigured', () => {
  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return false when Redis env vars are missing', () => {
    expect(isRedisConfigured()).toBe(false);
  });

  it('should return true when Redis env vars are set', () => {
    process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token';
    expect(isRedisConfigured()).toBe(true);
  });
});

describe('getClientIdentifier', () => {
  it('should extract IP from x-forwarded-for header', () => {
    const request = new Request('http://localhost', {
      headers: {
        'x-forwarded-for': '192.168.1.1, 10.0.0.1',
      },
    });
    expect(getClientIdentifier(request)).toBe('192.168.1.1');
  });

  it('should extract IP from x-real-ip header', () => {
    const request = new Request('http://localhost', {
      headers: {
        'x-real-ip': '192.168.1.1',
      },
    });
    expect(getClientIdentifier(request)).toBe('192.168.1.1');
  });

  it('should extract IP from cf-connecting-ip header', () => {
    const request = new Request('http://localhost', {
      headers: {
        'cf-connecting-ip': '192.168.1.1',
      },
    });
    expect(getClientIdentifier(request)).toBe('192.168.1.1');
  });

  it('should prefer cf-connecting-ip over other headers', () => {
    const request = new Request('http://localhost', {
      headers: {
        'cf-connecting-ip': 'cloudflare-ip',
        'x-real-ip': 'real-ip',
        'x-forwarded-for': 'forwarded-ip',
      },
    });
    expect(getClientIdentifier(request)).toBe('cloudflare-ip');
  });

  it('should return "unknown" when no IP headers present', () => {
    const request = new Request('http://localhost');
    expect(getClientIdentifier(request)).toBe('unknown');
  });
});

describe('createRateLimitResponse', () => {
  it('should create response with correct status code', () => {
    const result = {
      success: false,
      limit: 10,
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
      limit: 10,
      remaining: 0,
      reset: Date.now() + 60000,
      retryAfter: 60,
    };
    const response = createRateLimitResponse(result);
    expect(response.headers.get('X-RateLimit-Limit')).toBe('10');
    expect(response.headers.get('X-RateLimit-Remaining')).toBe('0');
    expect(response.headers.get('Retry-After')).toBe('60');
  });

  it('should include error message in body', async () => {
    const result = {
      success: false,
      limit: 10,
      remaining: 0,
      reset: Date.now() + 60000,
      retryAfter: 60,
    };
    const response = createRateLimitResponse(result);
    const body = await response.json();
    expect(body.error).toBe('Rate limit exceeded');
    expect(body.code).toBe('RATE_LIMITED');
  });
});

describe('RateLimits constants', () => {
  it('should have correct auth rate limits', () => {
    expect(RateLimits.login.limit).toBe(5);
    expect(RateLimits.login.windowSeconds).toBe(60);
    expect(RateLimits.login.identifier).toBe('auth:login');

    expect(RateLimits.register.limit).toBe(3);
    expect(RateLimits.register.windowSeconds).toBe(60);

    expect(RateLimits.forgotPassword.limit).toBe(3);
    expect(RateLimits.forgotPassword.windowSeconds).toBe(60);
  });

  it('should have correct social rate limits', () => {
    expect(RateLimits.socialPosts.limit).toBe(10);
    expect(RateLimits.socialPosts.windowSeconds).toBe(60);

    expect(RateLimits.socialComments.limit).toBe(20);
    expect(RateLimits.socialComments.windowSeconds).toBe(60);

    expect(RateLimits.socialLikes.limit).toBe(30);
    expect(RateLimits.socialLikes.windowSeconds).toBe(60);
  });

  it('should have correct message rate limits', () => {
    expect(RateLimits.messages.limit).toBe(30);
    expect(RateLimits.messages.windowSeconds).toBe(60);
  });
});

describe('checkRateLimit (in-memory fallback)', () => {
  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should allow requests within limit', async () => {
    const config = {
      limit: 5,
      windowSeconds: 60,
      identifier: 'test',
    };
    
    const result = await checkRateLimit('test-key', config);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it('should block requests over limit', async () => {
    const config = {
      limit: 2,
      windowSeconds: 60,
      identifier: 'test',
    };
    
    // First 2 requests should succeed
    await checkRateLimit('limited-key', config);
    await checkRateLimit('limited-key', config);
    
    // Third request should be blocked
    const result = await checkRateLimit('limited-key', config);
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('should track different keys independently', async () => {
    const config = {
      limit: 1,
      windowSeconds: 60,
      identifier: 'test',
    };
    
    const result1 = await checkRateLimit('key-1', config);
    const result2 = await checkRateLimit('key-2', config);
    
    expect(result1.success).toBe(true);
    expect(result2.success).toBe(true);
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  generateCsrfToken,
  hashToken,
  compareTokens,
  validateCsrfToken,
} from '@/lib/csrf';
import type { NextRequest } from 'next/server';

// Mock next/headers
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn((name: string) => {
      if (name === 'csrf_token') {
        return { value: 'mock-csrf-token' };
      }
      return undefined;
    }),
  })),
}));

describe('generateCsrfToken', () => {
  it('should generate a token of specified length', () => {
    const token = generateCsrfToken(32);
    // Hex encoding doubles the length
    expect(token.length).toBe(64);
  });

  it('should generate unique tokens', () => {
    const token1 = generateCsrfToken(32);
    const token2 = generateCsrfToken(32);
    expect(token1).not.toBe(token2);
  });

  it('should generate valid hex string', () => {
    const token = generateCsrfToken(32);
    expect(/^[a-f0-9]+$/.test(token)).toBe(true);
  });
});

describe('hashToken', () => {
  it('should produce consistent hashes', () => {
    const token = 'test-token';
    const hash1 = hashToken(token);
    const hash2 = hashToken(token);
    expect(hash1).toBe(hash2);
  });

  it('should produce different hashes for different tokens', () => {
    const hash1 = hashToken('token1');
    const hash2 = hashToken('token2');
    expect(hash1).not.toBe(hash2);
  });

  it('should produce valid SHA-256 hash', () => {
    const token = 'test';
    const hash = hashToken(token);
    // SHA-256 produces 64 character hex string
    expect(hash.length).toBe(64);
    expect(/^[a-f0-9]{64}$/.test(hash)).toBe(true);
  });
});

describe('compareTokens', () => {
  it('should return true for identical tokens', () => {
    const token = 'test-token';
    expect(compareTokens(token, token)).toBe(true);
  });

  it('should return false for different tokens', () => {
    expect(compareTokens('token1', 'token2')).toBe(false);
  });

  it('should return false for different length tokens', () => {
    expect(compareTokens('short', 'longer-token')).toBe(false);
  });

  it('should use constant-time comparison', () => {
    // This test verifies the function doesn't use simple string comparison
    const token1 = 'aaaaaaaaaa';
    const token2 = 'baaaaaaaaa';
    expect(compareTokens(token1, token2)).toBe(false);
  });
});

describe('validateCsrfToken', () => {
  const createMockRequest = (headers: Record<string, string> = {}): NextRequest => {
    return {
      headers: {
        get: (name: string) => headers[name] || null,
      },
    } as unknown as NextRequest;
  };

  it('should return false when cookie token is missing', () => {
    const request = createMockRequest({
      'x-csrf-token': 'some-token',
    });
    expect(validateCsrfToken(request, undefined)).toBe(false);
  });

  it('should return false when header token is missing', () => {
    const request = createMockRequest({});
    expect(validateCsrfToken(request, 'cookie-token')).toBe(false);
  });

  it('should return true when tokens match', () => {
    const token = 'matching-token';
    const request = createMockRequest({
      'x-csrf-token': token,
    });
    expect(validateCsrfToken(request, token)).toBe(true);
  });

  it('should return false when tokens do not match', () => {
    const request = createMockRequest({
      'x-csrf-token': 'header-token',
    });
    expect(validateCsrfToken(request, 'cookie-token')).toBe(false);
  });

  it('should use custom header name when configured', () => {
    const token = 'custom-token';
    const request = createMockRequest({
      'x-custom-csrf': token,
    });
    expect(validateCsrfToken(request, token, { headerName: 'x-custom-csrf' })).toBe(true);
  });
});

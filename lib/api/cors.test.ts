import {
  getCorsHeaders,
  isOriginAllowed,
  logCorsViolation,
} from './cors';

// Mock logger
jest.mock('@/lib/logger', () => ({
  appLogger: {
    warn: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe('CORS Utils', () => {
  describe('isOriginAllowed', () => {
    it('should allow exact match', () => {
      expect(isOriginAllowed('https://petpark.hr', ['https://petpark.hr'])).toBe(true);
    });

    it('should reject non-matching origin', () => {
      expect(isOriginAllowed('https://evil.com', ['https://petpark.hr'])).toBe(false);
    });

    it('should allow wildcard subdomains', () => {
      expect(isOriginAllowed('https://app.petpark.hr', ['https://*.petpark.hr'])).toBe(true);
    });

    it('should allow null origin', () => {
      expect(isOriginAllowed('', ['https://petpark.hr'])).toBe(true);
    });
  });

  describe('getCorsHeaders', () => {
    it('should return CORS headers', () => {
      const request = new Request('https://petpark.hr', {
        headers: { origin: 'https://petpark.hr' },
      }) as unknown as import('next/server').NextRequest;
      
      const headers = getCorsHeaders(request);
      
      expect(headers['Access-Control-Allow-Methods']).toContain('GET');
      expect(headers['Access-Control-Allow-Methods']).toContain('POST');
      expect(headers['Access-Control-Allow-Headers']).toContain('Content-Type');
      expect(headers['Access-Control-Max-Age']).toBe('86400');
    });

    it('should include allowed origin', () => {
      const request = new Request('https://petpark.hr', {
        headers: { origin: 'https://petpark.hr' },
      }) as unknown as import('next/server').NextRequest;
      
      const headers = getCorsHeaders(request);
      
      expect(headers['Access-Control-Allow-Origin']).toBe('https://petpark.hr');
    });

    it('should include credentials header', () => {
      const request = new Request('https://petpark.hr') as unknown as import('next/server').NextRequest;
      
      const headers = getCorsHeaders(request);
      
      expect(headers['Access-Control-Allow-Credentials']).toBe('true');
    });
  });

  describe('logCorsViolation', () => {
    it('should log warning', () => {
      const { appLogger } = require('@/lib/logger');
      const request = new Request('https://evil.com', {
        headers: {
          origin: 'https://evil.com',
          'user-agent': 'test-agent',
        },
      }) as unknown as import('next/server').NextRequest;
      
      logCorsViolation(request);
      
      expect(appLogger.warn).toHaveBeenCalledWith(
        'security',
        'Potential CORS violation',
        expect.objectContaining({
          origin: 'https://evil.com',
          userAgent: 'test-agent',
        })
      );
    });
  });
});

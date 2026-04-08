import { NextRequest, NextResponse } from 'next/server';
import { appLogger } from '@/lib/logger';

export interface CorsConfig {
  allowedOrigins: string[];
  allowedMethods: string[];
  allowedHeaders: string[];
  allowCredentials: boolean;
  maxAge: number;
}

// Default CORS configuration
const defaultCorsConfig: CorsConfig = {
  allowedOrigins: [
    'https://petpark.hr',
    'https://www.petpark.hr',
    process.env.NEXT_PUBLIC_APP_URL || '',
  ].filter(Boolean),
  allowedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-CSRF-Token',
    'X-Requested-With',
    'Accept',
    'Accept-Version',
    'Content-Length',
    'Content-MD5',
    'Date',
    'X-Api-Version',
  ],
  allowCredentials: true,
  maxAge: 86400, // 24 hours
};

/**
 * Check if origin is allowed
 */
export function isOriginAllowed(origin: string, allowedOrigins: string[]): boolean {
  // Allow requests with no origin (mobile apps, curl, etc.)
  if (!origin) return true;
  
  // Check exact match
  if (allowedOrigins.includes(origin)) return true;
  
  // Check wildcard subdomains
  return allowedOrigins.some(allowed => {
    if (allowed.includes('*')) {
      const regex = new RegExp(allowed.replace('*', '.*'));
      return regex.test(origin);
    }
    return false;
  });
}

/**
 * Generate CORS headers
 */
export function getCorsHeaders(
  request: NextRequest,
  config: Partial<CorsConfig> = {}
): Record<string, string> {
  const mergedConfig = { ...defaultCorsConfig, ...config };
  const origin = request.headers.get('origin') || '';
  
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': mergedConfig.allowedMethods.join(', '),
    'Access-Control-Allow-Headers': mergedConfig.allowedHeaders.join(', '),
    'Access-Control-Max-Age': mergedConfig.maxAge.toString(),
  };

  // Only set allowed origin if it's in the whitelist
  if (isOriginAllowed(origin, mergedConfig.allowedOrigins)) {
    headers['Access-Control-Allow-Origin'] = origin || '*';
  }

  if (mergedConfig.allowCredentials) {
    headers['Access-Control-Allow-Credentials'] = 'true';
  }

  return headers;
}

/**
 * CORS middleware for API routes
 */
export function withCors(
  handler: (request: NextRequest) => Promise<NextResponse>,
  config: Partial<CorsConfig> = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      const headers = getCorsHeaders(request, config);
      return new NextResponse(null, {
        status: 204,
        headers,
      });
    }

    // Handle actual request
    const response = await handler(request);
    
    // Add CORS headers to response
    const corsHeaders = getCorsHeaders(request, config);
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  };
}

/**
 * Simple CORS wrapper for route handlers
 */
export function corsMiddleware(
  request: NextRequest,
  config: Partial<CorsConfig> = {}
): { headers: Record<string, string>; isPreflight: boolean } {
  const isPreflight = request.method === 'OPTIONS';
  const headers = getCorsHeaders(request, config);
  
  return { headers, isPreflight };
}

/**
 * Apply CORS headers to an existing response
 */
export function applyCorsHeaders(
  response: NextResponse,
  request: NextRequest,
  config: Partial<CorsConfig> = {}
): NextResponse {
  const headers = getCorsHeaders(request, config);
  
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

/**
 * Log CORS violations for security monitoring
 */
export function logCorsViolation(request: NextRequest): void {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const userAgent = request.headers.get('user-agent');
  
  appLogger.warn('security', 'Potential CORS violation', {
    origin,
    referer,
    userAgent,
    path: request.nextUrl.pathname,
    method: request.method,
    ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
  });
}

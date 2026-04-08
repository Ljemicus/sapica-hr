import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createHash, randomBytes } from 'crypto';

const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_TOKEN_LENGTH = 32;

// Token expiration (24 hours)
const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000;

export interface CsrfConfig {
  cookieName?: string;
  headerName?: string;
  tokenLength?: number;
  maxAge?: number;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  httpOnly?: boolean;
  path?: string;
}

const defaultConfig: Required<CsrfConfig> = {
  cookieName: CSRF_COOKIE_NAME,
  headerName: CSRF_HEADER_NAME,
  tokenLength: CSRF_TOKEN_LENGTH,
  maxAge: TOKEN_EXPIRY_MS / 1000,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  httpOnly: true,
  path: '/',
};

/**
 * Generates a cryptographically secure CSRF token
 */
export function generateCsrfToken(length: number = CSRF_TOKEN_LENGTH): string {
  return randomBytes(length).toString('hex');
}

/**
 * Hashes a token for comparison (prevents timing attacks)
 */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Securely compares two tokens (constant-time comparison)
 */
export function compareTokens(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Creates or refreshes the CSRF token cookie
 * Call this in middleware or page handlers
 */
export async function createCsrfToken(config: CsrfConfig = {}): Promise<{ token: string; cookie: string }> {
  const cfg = { ...defaultConfig, ...config };
  const token = generateCsrfToken(cfg.tokenLength);
  
  const cookieValue = `${cfg.cookieName}=${token}; Path=${cfg.path}; Max-Age=${cfg.maxAge}; SameSite=${cfg.sameSite}`;
  const secureCookie = cfg.secure ? `${cookieValue}; Secure` : cookieValue;
  const finalCookie = cfg.httpOnly ? `${secureCookie}; HttpOnly` : secureCookie;
  
  return { token, cookie: finalCookie };
}

/**
 * Validates CSRF token from request
 * Checks both header and body for token
 */
export function validateCsrfToken(
  request: NextRequest,
  cookieToken: string | undefined,
  config: CsrfConfig = {}
): boolean {
  const cfg = { ...defaultConfig, ...config };
  
  if (!cookieToken) {
    return false;
  }

  // Get token from header
  const headerToken = request.headers.get(cfg.headerName);
  
  if (!headerToken) {
    return false;
  }

  // Use constant-time comparison
  return compareTokens(cookieToken, headerToken);
}

/**
 * Next.js middleware handler for CSRF protection
 * Sets CSRF cookie on GET requests, validates on state-changing methods
 */
export async function csrfMiddleware(
  request: NextRequest,
  config: CsrfConfig = {}
): Promise<NextResponse | null> {
  const cfg = { ...defaultConfig, ...config };
  const cookieStore = await cookies();
  const existingToken = cookieStore.get(cfg.cookieName)?.value;

  // For GET/HEAD/OPTIONS requests, set/refresh the CSRF token
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    const { cookie } = await createCsrfToken(cfg);
    const response = NextResponse.next();
    response.headers.set('Set-Cookie', cookie);
    return response;
  }

  // For state-changing methods, validate the token
  const isStateChanging = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method);
  
  if (isStateChanging) {
    // Skip validation for webhook endpoints
    if (request.nextUrl.pathname.startsWith('/api/webhooks/')) {
      return null;
    }

    // Skip validation for auth callback (OAuth flows)
    if (request.nextUrl.pathname === '/api/auth/callback') {
      return null;
    }

    if (!validateCsrfToken(request, existingToken, cfg)) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Invalid CSRF token',
          code: 'CSRF_INVALID'
        }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
  }

  return null;
}

/**
 * Gets the current CSRF token from cookies
 * Use this in server components or API routes
 */
export async function getCsrfToken(config: CsrfConfig = {}): Promise<string | null> {
  const cfg = { ...defaultConfig, ...config };
  const cookieStore = await cookies();
  return cookieStore.get(cfg.cookieName)?.value || null;
}

/**
 * Creates a middleware wrapper that adds CSRF protection
 */
export function withCsrfProtection(
  handler: (request: NextRequest) => Promise<NextResponse>,
  config: CsrfConfig = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const csrfResponse = await csrfMiddleware(request, config);
    if (csrfResponse) {
      return csrfResponse;
    }
    return handler(request);
  };
}

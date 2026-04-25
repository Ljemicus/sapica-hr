/**
 * Content Security Policy utilities with nonce support
 */

import { randomBytes } from 'crypto';

export const CSP_NONCE_HEADER = 'X-CSP-Nonce';

export interface CSPConfig {
  nonce?: string;
  reportUri?: string;
  reportOnly?: boolean;
}

const allowedStyleHashes = [
  // Next route announcer and Sonner inject deterministic inline style/style tags.
  // Keep these narrow hashes instead of restoring `unsafe-inline`.
  "'unsafe-hashes'",
  "'sha256-t6oewASd7J1vBg5mQtX4hl8bg8FeegYFM3scKLIhYUc='",
  "'sha256-LwoYSIU7H7ALhCK8JF+HKTq2AdcpkrZ9eK1pLP9iv6U='",
  "'sha256-68ahHyH65aqS202beKyu22MkdAEr0fBCN3eHnbYX+wg='",
  "'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU='",
  "'sha256-CIxDM5jnsGiKqXs2v7NKCY5MzdR9gu6TtiMJrDw29AY='",
];

/**
 * Generate a cryptographically secure nonce
 */
export function generateNonce(): string {
  return randomBytes(16).toString('base64');
}

/**
 * Build CSP header value with nonce support
 */
export function buildCSPHeader(config: CSPConfig = {}): string {
  const { nonce, reportUri, reportOnly = false } = config;
  
  const nonceString = nonce ? `'nonce-${nonce}'` : "";
  
  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    // Next App Router still emits framework bootstrap/data inline scripts without our middleware nonce.
    // Do not include a script nonce here: browsers ignore 'unsafe-inline' when a nonce/hash is present.
    ["script-src 'self'", "'unsafe-inline'", "https://plausible.io"].join(" "),
    ["style-src 'self'", nonceString, ...allowedStyleHashes].filter(Boolean).join(" "),
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://plausible.io https://api.resend.com https://api.stripe.com",
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://checkout.stripe.com",
    "form-action 'self' https://checkout.stripe.com",
    "upgrade-insecure-requests",
  ];
  
  if (reportUri) {
    directives.push(`report-uri ${reportUri}`);
  }
  
  const headerValue = directives.join('; ');
  
  return headerValue;
}

/**
 * Get CSP header name based on configuration
 */
export function getCSPHeaderName(reportOnly = false): string {
  return reportOnly 
    ? 'Content-Security-Policy-Report-Only' 
    : 'Content-Security-Policy';
}

/**
 * Create CSP middleware for Next.js
 */
export function createCSPMiddleware(config: Omit<CSPConfig, 'nonce'> = {}) {
  return function cspMiddleware() {
    const nonce = generateNonce();
    const cspValue = buildCSPHeader({ ...config, nonce });
    const headerName = getCSPHeaderName(config.reportOnly);
    
    return {
      nonce,
      cspValue,
      headerName,
      headers: {
        [headerName]: cspValue,
      },
    };
  };
}

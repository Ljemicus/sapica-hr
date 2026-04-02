/**
 * Ensure a redirect target is a safe, relative path.
 * Rejects protocol-relative URLs, absolute URLs, and paths with embedded newlines.
 */
export function safeRedirectPath(raw: string | null | undefined, fallback = '/'): string {
  if (!raw) return fallback;
  const trimmed = raw.trim();
  // Block absolute URLs, protocol-relative URLs, and data/javascript URIs
  if (
    /^[a-z][a-z0-9+.-]*:/i.test(trimmed) ||
    trimmed.startsWith('//') ||
    trimmed.includes('\n') ||
    trimmed.includes('\r')
  ) {
    return fallback;
  }
  // Must start with /
  if (!trimmed.startsWith('/')) return fallback;
  return trimmed;
}

export function getAuthCallbackUrl(nextPath = '/', role?: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://petpark.hr';
  const callbackUrl = new URL('/api/auth/callback', baseUrl);

  callbackUrl.searchParams.set('next', nextPath || '/');

  if (role) {
    callbackUrl.searchParams.set('role', role);
  }

  return callbackUrl.toString();
}

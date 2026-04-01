export function getAuthCallbackUrl(nextPath = '/', role?: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://petpark.hr';
  const callbackUrl = new URL('/api/auth/callback', baseUrl);

  callbackUrl.searchParams.set('next', nextPath || '/');

  if (role) {
    callbackUrl.searchParams.set('role', role);
  }

  return callbackUrl.toString();
}

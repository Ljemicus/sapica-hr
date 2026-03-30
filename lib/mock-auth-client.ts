// Client-side ONLY mock auth — no next/headers import
// LEGACY: Only used as fallback when Supabase is NOT configured (!isSupabaseConfiguredClient()).
// Imported by contexts/auth-context.tsx. Safe to remove once mock auth is fully retired.

const MOCK_AUTH_COOKIE = 'mock_user_id';

export function getMockUserIdClient(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${MOCK_AUTH_COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function setMockUserClient(userId: string) {
  document.cookie = `${MOCK_AUTH_COOKIE}=${encodeURIComponent(userId)};path=/;max-age=${60 * 60 * 24 * 30};samesite=lax`;
}

export function clearMockUserClient() {
  document.cookie = `${MOCK_AUTH_COOKIE}=;path=/;max-age=0`;
}

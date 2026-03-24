import { cookies } from 'next/headers';
import { mockUsers } from './mock-data';
import type { User } from './types';

const MOCK_AUTH_COOKIE = 'mock_user_id';

/**
 * Server-side: get current mock user from cookie
 */
export async function getMockUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get(MOCK_AUTH_COOKIE)?.value;
  if (!userId) return null;
  return mockUsers.find(u => u.id === userId) || null;
}

/**
 * Server-side: set mock user cookie
 */
export async function setMockUser(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(MOCK_AUTH_COOKIE, userId, {
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    httpOnly: false, // readable by client JS
    sameSite: 'lax',
  });
}

/**
 * Server-side: clear mock user cookie
 */
export async function clearMockUser() {
  const cookieStore = await cookies();
  cookieStore.delete(MOCK_AUTH_COOKIE);
}

/**
 * Client-side: get mock user ID from cookie
 */
export function getMockUserIdClient(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${MOCK_AUTH_COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Client-side: set mock user cookie
 */
export function setMockUserClient(userId: string) {
  document.cookie = `${MOCK_AUTH_COOKIE}=${encodeURIComponent(userId)};path=/;max-age=${60 * 60 * 24 * 30};samesite=lax`;
}

/**
 * Client-side: clear mock user cookie
 */
export function clearMockUserClient() {
  document.cookie = `${MOCK_AUTH_COOKIE}=;path=/;max-age=0`;
}

import { getAuthUser } from '@/lib/auth';
import { apiError } from '@/lib/api-errors';
import type { User } from '@/lib/types';

type AdminGuardResult =
  | { ok: true; user: User }
  | { ok: false; response: ReturnType<typeof apiError> };

/**
 * Verify the current session belongs to an admin user.
 * Returns the admin User on success, or a 403 JSON response on failure.
 */
export async function requireAdmin(): Promise<AdminGuardResult> {
  const user = await getAuthUser();
  if (!user || user.role !== 'admin') {
    return {
      ok: false,
      response: apiError({ status: 403, code: 'FORBIDDEN', message: 'Admin access required' }),
    };
  }
  return { ok: true, user };
}

/**
 * Admin OR Vercel Cron auth.
 * Accepts a valid CRON_SECRET bearer token as an alternative to an admin session.
 */
export async function requireAdminOrCron(
  request: Request,
): Promise<AdminGuardResult> {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret && process.env.NODE_ENV === 'production') {
    const { appLogger } = await import('@/lib/logger');
    appLogger.warn('admin-guard', 'CRON_SECRET is not set — Vercel Cron requests will be rejected');
  }
  const authHeader = request.headers.get('authorization');
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    // Cron caller — return a synthetic actor so routes can still log an actor id
    return {
      ok: true,
      user: {
        id: 'system:cron',
        email: 'cron@petpark.internal',
        name: 'Vercel Cron',
        role: 'admin',
        avatar_url: null,
        phone: null,
        city: null,
        created_at: new Date().toISOString(),
      },
    };
  }
  return requireAdmin();
}

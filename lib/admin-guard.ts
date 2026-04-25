import { getAuthUser } from '@/lib/auth';
import { apiError } from '@/lib/api-errors';
import type { AuthUser } from '@/lib/auth';

type AdminGuardResult =
  | { ok: true; user: AuthUser }
  | { ok: false; response: ReturnType<typeof apiError> };

/**
 * Verify the current session belongs to an admin user.
 * Returns the admin user on success, or a 403 JSON response on failure.
 */
export async function requireAdmin(): Promise<AdminGuardResult> {
  const user = await getAuthUser();
  if (!user?.isAdmin) {
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
    return {
      ok: true,
      user: {
        id: 'system:cron',
        email: 'cron@petpark.internal',
        name: 'Vercel Cron',
        role: 'admin',
        roles: ['admin'],
        isAdmin: true,
        avatar_url: null,
        phone: null,
        city: null,
        created_at: new Date().toISOString(),
        profileFound: true,
        profileMissing: false,
      },
    };
  }
  return requireAdmin();
}

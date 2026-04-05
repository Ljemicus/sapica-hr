import { NextResponse } from 'next/server';
import { processLostPetExpiry } from '@/lib/db/lost-pets';
import { requireAdminOrCron } from '@/lib/admin-guard';

/**
 * GET /api/cron/lost-pets-expiry
 *
 * Cron-friendly endpoint that:
 *  1. Transitions overdue "lost" listings → "expired".
 *  2. Marks reminder_sent_at on listings expiring within the warn window.
 *
 * Secured by CRON_SECRET bearer token (for Vercel Cron) or admin session.
 */

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  const guard = await requireAdminOrCron(request);
  if (!guard.ok) return guard.response;

  const result = await processLostPetExpiry();

  return NextResponse.json({
    ok: result.errors.length === 0,
    ...result,
  });
}

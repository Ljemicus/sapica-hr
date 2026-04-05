import { NextResponse } from 'next/server';
import { processLostPetExpiry } from '@/lib/db/lost-pets';

/**
 * POST /api/cron/lost-pets-expiry
 *
 * Cron-friendly endpoint that:
 *  1. Transitions overdue "lost" listings → "expired".
 *  2. Marks reminder_sent_at on listings expiring within the warn window.
 *
 * Protected by a shared secret so only authorised schedulers can call it.
 * A downstream notification service can read newly-reminded listings
 * to dispatch emails/push notifications.
 */
export async function POST(request: Request) {
  const secret = request.headers.get('x-cron-secret');
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await processLostPetExpiry();

  return NextResponse.json({
    ok: result.errors.length === 0,
    ...result,
  });
}

import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';
import { requireAdminOrCron } from '@/lib/admin-guard';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  const guard = await requireAdminOrCron(request);
  if (!guard.ok) return guard.response;

  const admin = createAdminClient();
  const cutoff = new Date(Date.now() - 5 * 60 * 1000).toISOString();

  const { data: stuck, error } = await admin
    .from('stripe_events')
    .select('event_id,event_type,received_at')
    .is('processed_at', null)
    .lt('received_at', cutoff)
    .order('received_at', { ascending: true })
    .limit(25);

  if (error) {
    Sentry.captureException(error, {
      tags: { cron: 'webhook-health', table: 'stripe_events' },
    });
    return NextResponse.json(
      {
        ok: false,
        error: error.message,
        checked_at: new Date().toISOString(),
      },
      { status: 500, headers: { 'cache-control': 'no-store' } },
    );
  }

  const count = stuck?.length ?? 0;
  if (count > 0) {
    Sentry.captureMessage('Stuck stripe_events', {
      level: 'warning',
      tags: { cron: 'webhook-health' },
      extra: {
        count,
        cutoff,
        sample: stuck?.slice(0, 5),
      },
    });
  }

  return NextResponse.json(
    {
      ok: true,
      checked_at: new Date().toISOString(),
      cutoff,
      stuck_count: count,
      sample: stuck?.slice(0, 5) ?? [],
    },
    { headers: { 'cache-control': 'no-store' } },
  );
}

export async function POST(request: Request) {
  return GET(request);
}

import { NextResponse } from 'next/server';
import { requireAdminOrCron } from '@/lib/admin-guard';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type RetentionStep = {
  name: string;
  count?: number;
  error?: string;
};

function isoDaysAgo(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

function isoMonthsAgo(months: number): string {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  return date.toISOString();
}

function isoYearsAgo(years: number): string {
  const date = new Date();
  date.setFullYear(date.getFullYear() - years);
  return date.toISOString();
}

export async function POST(request: Request) {
  const guard = await requireAdminOrCron(request);
  if (!guard.ok) return guard.response;

  const admin = createAdminClient();
  const steps: RetentionStep[] = [];

  const oldMessages = await admin
    .from('messages')
    .delete({ count: 'exact' })
    .lt('created_at', isoMonthsAgo(24));
  steps.push({
    name: 'delete_messages_older_than_24_months',
    count: oldMessages.count ?? 0,
    ...(oldMessages.error ? { error: oldMessages.error.message } : {}),
  });

  const oldBookings = await admin
    .from('bookings')
    .update(
      {
        owner_note: null,
        provider_note: null,
        cancellation_reason: null,
        updated_at: new Date().toISOString(),
      },
      { count: 'exact' },
    )
    .lt('created_at', isoYearsAgo(7));
  steps.push({
    name: 'anonymize_booking_notes_older_than_7_years',
    count: oldBookings.count ?? 0,
    ...(oldBookings.error ? { error: oldBookings.error.message } : {}),
  });

  const abandonedProfiles = await admin
    .from('profiles')
    .delete({ count: 'exact' })
    .eq('onboarding_state', 'created')
    .lt('created_at', isoDaysAgo(30));
  steps.push({
    name: 'delete_abandoned_registrations_older_than_30_days',
    count: abandonedProfiles.count ?? 0,
    ...(abandonedProfiles.error ? { error: abandonedProfiles.error.message } : {}),
  });

  const deletedProfiles = await admin
    .from('profiles')
    .delete({ count: 'exact' })
    .lt('deleted_at', isoDaysAgo(30));
  steps.push({
    name: 'hard_delete_profiles_after_30_day_grace',
    count: deletedProfiles.count ?? 0,
    ...(deletedProfiles.error ? { error: deletedProfiles.error.message } : {}),
  });

  const ok = steps.every((step) => !step.error);
  return NextResponse.json(
    {
      ok,
      actor: guard.user.id,
      ran_at: new Date().toISOString(),
      steps,
    },
    { status: ok ? 200 : 207, headers: { 'cache-control': 'no-store' } },
  );
}

export async function GET(request: Request) {
  return POST(request);
}

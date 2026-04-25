import { NextResponse } from 'next/server';
import { GDPR_DELETE_RATE_LIMIT, getGdprAdminClient, requireFreshPasswordAndRateLimit } from '@/lib/gdpr';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  const guard = await requireFreshPasswordAndRateLimit(request, GDPR_DELETE_RATE_LIMIT);
  if (!guard.ok) return guard.response;

  const admin = getGdprAdminClient();
  const now = new Date().toISOString();

  const { error } = await admin
    .from('profiles')
    .update({
      status: 'deleted',
      deleted_at: now,
      updated_at: now,
    })
    .eq('id', guard.user.id);

  if (error) {
    return NextResponse.json(
      { error: { code: 'DELETE_REQUEST_FAILED', message: 'Zahtjev za brisanje računa nije uspio.' } },
      { status: 500, headers: { 'cache-control': 'no-store' } },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      deleted_at: now,
      grace_period_days: 30,
      message: 'Račun je označen za brisanje. Brisanje se dovršava nakon 30 dana grace perioda.',
    },
    { headers: { 'cache-control': 'no-store' } },
  );
}

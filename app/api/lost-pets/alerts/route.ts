import { NextResponse } from 'next/server';
import { apiError } from '@/lib/api-errors';
import { getAuthUser } from '@/lib/auth';
import { getUserAlerts, upsertAlert, deleteAlert } from '@/lib/db/lost-pet-alerts';
import { lostPetAlertSchema } from '@/lib/validations';

/**
 * GET /api/lost-pets/alerts
 * Returns the current user's alert subscriptions.
 */
export async function GET() {
  const user = await getAuthUser();
  if (!user) return apiError({ status: 401, code: 'UNAUTHORIZED', message: 'Unauthorized' });

  const alerts = await getUserAlerts(user.id);
  return NextResponse.json({ alerts });
}

/**
 * POST /api/lost-pets/alerts
 * Create or reactivate an alert subscription (city + species).
 */
export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return apiError({ status: 401, code: 'UNAUTHORIZED', message: 'Unauthorized' });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError({ status: 400, code: 'INVALID_JSON', message: 'Invalid JSON body' });
  }

  const parsed = lostPetAlertSchema.safeParse(body);
  if (!parsed.success) {
    return apiError({ status: 400, code: 'INVALID_INPUT', message: 'Neispravni podaci.', details: parsed.error.flatten() });
  }

  const alert = await upsertAlert(user.id, parsed.data);
  if (!alert) {
    return apiError({ status: 500, code: 'ALERT_CREATE_FAILED', message: 'Pretplata nije spremljena.' });
  }

  return NextResponse.json({ alert }, { status: 201 });
}

/**
 * DELETE /api/lost-pets/alerts
 * Remove an alert subscription by id (passed as ?id=...).
 */
export async function DELETE(request: Request) {
  const user = await getAuthUser();
  if (!user) return apiError({ status: 401, code: 'UNAUTHORIZED', message: 'Unauthorized' });

  const { searchParams } = new URL(request.url);
  const alertId = searchParams.get('id');

  if (!alertId) {
    return apiError({ status: 400, code: 'MISSING_ID', message: 'Alert ID is required.' });
  }

  const ok = await deleteAlert(user.id, alertId);
  if (!ok) {
    return apiError({ status: 500, code: 'ALERT_DELETE_FAILED', message: 'Pretplata nije obrisana.' });
  }

  return NextResponse.json({ ok: true });
}

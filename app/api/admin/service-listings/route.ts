import { NextResponse, type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { moderateServiceListing, type ServiceListingAdminAction } from '@/lib/petpark/service-listings/admin-moderation';

const allowedActions = new Set<ServiceListingAdminAction>(['approve', 'reject', 'pause', 'archive']);

export async function PATCH(request: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const payload = await request.json().catch(() => ({})) as { id?: unknown; action?: unknown };
  const action = typeof payload.action === 'string' && allowedActions.has(payload.action as ServiceListingAdminAction)
    ? payload.action as ServiceListingAdminAction
    : null;

  if (typeof payload.id !== 'string' || !action) {
    return NextResponse.json({ ok: false, reason: 'service_listings_validation_failed', message: 'Neispravna admin moderacijska akcija.' }, { status: 400 });
  }

  const result = await moderateServiceListing({ id: payload.id, action });
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}

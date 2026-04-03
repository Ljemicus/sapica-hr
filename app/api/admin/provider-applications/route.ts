import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { updateProviderApplicationStatus } from '@/lib/db/provider-applications';
import type { ProviderApplicationStatus } from '@/lib/types';

const ALLOWED_STATUSES = new Set<ProviderApplicationStatus>(['active', 'rejected', 'restricted', 'pending_verification']);

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const { applicationId, status, adminNotes } = (body || {}) as {
    applicationId?: string;
    status?: ProviderApplicationStatus;
    adminNotes?: string;
  };

  if (!applicationId || !status || !ALLOWED_STATUSES.has(status)) {
    return NextResponse.json({ error: 'Invalid request: applicationId and valid status required' }, { status: 400 });
  }

  const updated = await updateProviderApplicationStatus(applicationId, status, user.id, adminNotes);
  if (!updated) {
    return NextResponse.json({ error: 'Failed to update application' }, { status: 500 });
  }

  return NextResponse.json({ application: updated });
}

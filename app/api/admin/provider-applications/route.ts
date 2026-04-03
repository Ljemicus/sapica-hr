import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getProviderApplicationById, updateProviderApplicationStatus } from '@/lib/db/provider-applications';
import type { ProviderApplicationStatus } from '@/lib/types';

const ALLOWED_STATUSES = new Set<ProviderApplicationStatus>(['active', 'rejected', 'restricted', 'pending_verification']);

const ALLOWED_TRANSITIONS: Record<ProviderApplicationStatus, ProviderApplicationStatus[]> = {
  draft: ['pending_verification', 'rejected'],
  pending_verification: ['active', 'restricted', 'rejected'],
  restricted: ['pending_verification', 'active', 'rejected'],
  active: ['restricted'],
  rejected: ['pending_verification'],
};

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

  const cleanNotes = typeof adminNotes === 'string' ? adminNotes.trim().slice(0, 1000) : undefined;
  if (status === 'rejected' && !cleanNotes) {
    return NextResponse.json({ error: 'Admin note is required when rejecting an application' }, { status: 400 });
  }

  const existing = await getProviderApplicationById(applicationId);
  if (!existing) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 });
  }

  const allowedNext = ALLOWED_TRANSITIONS[existing.status] || [];
  if (!allowedNext.includes(status)) {
    return NextResponse.json({
      error: `Invalid status transition from ${existing.status} to ${status}`
    }, { status: 400 });
  }

  const updated = await updateProviderApplicationStatus(applicationId, status, user.id, cleanNotes);
  if (!updated) {
    return NextResponse.json({ error: 'Failed to update application' }, { status: 500 });
  }

  return NextResponse.json({ application: updated });
}

import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { apiError } from '@/lib/api-errors';
import { getProviderApplicationById, updateProviderPublicStatus } from '@/lib/db/provider-applications';
import { getProviderPublicGate } from '@/lib/trust/gate';
import { logAdminAction } from '@/lib/db/audit-logs';
import type { PublicStatus } from '@/lib/types/trust';

const ALLOWED_STATUSES = new Set<PublicStatus>(['pending_review', 'public', 'hidden', 'suspended']);

export async function POST(request: Request) {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== 'admin') {
      return apiError({ status: 403, code: 'FORBIDDEN', message: 'Admin access required' });
    }

    const body = await request.json().catch(() => null);
    const { applicationId, publicStatus, adminNotes } = (body || {}) as {
      applicationId?: string;
      publicStatus?: PublicStatus;
      adminNotes?: string;
    };

    if (!applicationId || !publicStatus || !ALLOWED_STATUSES.has(publicStatus)) {
      return apiError({ status: 400, code: 'INVALID_REQUEST', message: 'applicationId and valid publicStatus are required' });
    }

    const application = await getProviderApplicationById(applicationId);
    if (!application) {
      return apiError({ status: 404, code: 'NOT_FOUND', message: 'Provider application not found' });
    }

    if (publicStatus === 'public') {
      const gate = await getProviderPublicGate(applicationId);
      if (!gate.allowed && gate.reason !== 'not_public_status') {
        return apiError({
          status: 400,
          code: 'PUBLIC_GATE_BLOCKED',
          message: 'Provider ne može biti javno objavljen dok ne prođe trust gate.',
          details: {
            reason: gate.reason,
            missingFields: gate.missingFields ?? [],
          },
        });
      }
    }

    const updated = await updateProviderPublicStatus(
      applicationId,
      publicStatus,
      user.id,
      typeof adminNotes === 'string' ? adminNotes.trim().slice(0, 1000) : undefined
    );

    if (!updated) {
      return apiError({ status: 500, code: 'UPDATE_FAILED', message: 'Failed to update public status' });
    }

    if (publicStatus === 'hidden' || publicStatus === 'suspended') {
      await logAdminAction({
        actorUserId: user.id,
        targetType: 'provider_application',
        targetId: applicationId,
        action: 'provider_hidden',
        metadata: {
          previous_public_status: application.public_status,
          new_public_status: publicStatus,
        },
      });
    }

    if (publicStatus === 'public') {
      await logAdminAction({
        actorUserId: user.id,
        targetType: 'provider_application',
        targetId: applicationId,
        action: 'provider_restored',
        metadata: {
          previous_public_status: application.public_status,
          new_public_status: publicStatus,
        },
      });
    }

    return NextResponse.json({ application: updated });
  } catch (error) {
    return apiError({ status: 500, code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : 'Internal error' });
  }
}

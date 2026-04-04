import { NextResponse } from 'next/server';
import { dispatchAlert } from '@/lib/alerting';
import { getRequestId, createScopedLogger } from '@/lib/request-context';
import { requireAdmin } from '@/lib/admin-guard';
import { apiError } from '@/lib/api-errors';
import { getProviderApplicationById, updateProviderPublicStatus } from '@/lib/db/provider-applications';
import { getProviderPublicGate } from '@/lib/trust/gate';
import { logAdminAction } from '@/lib/db/audit-logs';
import type { PublicStatus } from '@/lib/types/trust';

const ALLOWED_STATUSES = new Set<PublicStatus>(['pending_review', 'public', 'hidden', 'suspended']);

export async function POST(request: Request) {
  const reqId = getRequestId(request);
  const log = createScopedLogger('admin.provider-public-status', reqId);
  try {
    const guard = await requireAdmin();
    if (!guard.ok) return guard.response;
    const { user } = guard;

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
      log.error( 'Public status update failed', {
        applicationId,
        targetStatus: publicStatus,
        adminId: user.id,
      });
      dispatchAlert({
        severity: 'P2',
        service: 'admin.provider-public-status',
        description: 'Provider public status update failed — admin action not persisted',
        value: `applicationId=${applicationId}, publicStatus=${publicStatus}`,
        owner: 'platform',
      });
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
    } else if (publicStatus === 'public') {
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
    } else {
      await logAdminAction({
        actorUserId: user.id,
        targetType: 'provider_application',
        targetId: applicationId,
        action: 'public_status_updated',
        metadata: {
          previous_public_status: application.public_status,
          new_public_status: publicStatus,
        },
      });
    }

    log.info( 'Public status updated', {
      applicationId,
      previousStatus: application.public_status,
      newStatus: publicStatus,
      adminId: user.id,
    });

    return NextResponse.json({ application: updated });
  } catch (error) {
    log.error( 'Public status update failed unexpectedly', {
      error: error instanceof Error ? error.message : 'unknown',
    });
    return apiError({ status: 500, code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : 'Internal error' });
  }
}

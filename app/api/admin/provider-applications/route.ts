import { NextResponse } from 'next/server';
import { dispatchAlert } from '@/lib/alerting';
import { getRequestId, createScopedLogger } from '@/lib/request-context';
import { requireAdmin } from '@/lib/admin-guard';
import { apiError } from '@/lib/api-errors';
import { getProviderApplicationById, updateProviderApplicationStatus } from '@/lib/db/provider-applications';
import { logAdminAction } from '@/lib/db/audit-logs';
import { promoteProviderApplication } from '@/lib/db/provider-promotion';
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
  const reqId = getRequestId(request);
  const log = createScopedLogger('admin.provider-applications', reqId);
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;
  const { user } = guard;

  const body = await request.json().catch(() => null);
  const { applicationId, status, adminNotes } = (body || {}) as {
    applicationId?: string;
    status?: ProviderApplicationStatus;
    adminNotes?: string;
  };

  if (!applicationId || !status || !ALLOWED_STATUSES.has(status)) {
    return apiError({ status: 400, code: 'INVALID_REQUEST', message: 'applicationId and valid status required' });
  }

  const cleanNotes = typeof adminNotes === 'string' ? adminNotes.trim().slice(0, 1000) : undefined;
  if (status === 'rejected' && !cleanNotes) {
    return apiError({ status: 400, code: 'MISSING_NOTES', message: 'Admin note is required when rejecting an application' });
  }

  const existing = await getProviderApplicationById(applicationId);
  if (!existing) {
    return apiError({ status: 404, code: 'NOT_FOUND', message: 'Application not found' });
  }

  const allowedNext = ALLOWED_TRANSITIONS[existing.status] || [];
  if (!allowedNext.includes(status)) {
    return apiError({ status: 400, code: 'INVALID_TRANSITION', message: `Invalid status transition from ${existing.status} to ${status}` });
  }

  const updated = await updateProviderApplicationStatus(applicationId, status, user.id, cleanNotes);
  if (!updated) {
    log.error( 'Application status update failed', {
      applicationId,
      targetStatus: status,
      adminId: user.id,
    });
    dispatchAlert({
      severity: 'P2',
      service: 'admin.provider-applications',
      description: 'Provider application status update failed — admin action not persisted',
      value: `applicationId=${applicationId}, status=${status}`,
      owner: 'platform',
    });
    return apiError({ status: 500, code: 'UPDATE_FAILED', message: 'Failed to update application' });
  }

  let promotionResult: Awaited<ReturnType<typeof promoteProviderApplication>> | null = null;
  if (status === 'active') {
    promotionResult = await promoteProviderApplication(applicationId);
    if (!promotionResult.ok) {
      log.error('Provider promotion failed after activation', {
        applicationId,
        adminId: user.id,
        errors: promotionResult.errors,
        warnings: promotionResult.warnings,
      });
      dispatchAlert({
        severity: 'P2',
        service: 'admin.provider-applications',
        description: 'Provider promotion failed after application activation',
        value: `applicationId=${applicationId}`,
        owner: 'platform',
      });
      return apiError({
        status: 500,
        code: 'PROMOTION_FAILED',
        message: 'Application activated, but provider live-model sync failed',
        details: {
          errors: promotionResult.errors,
          warnings: promotionResult.warnings,
        },
      });
    }
  }

  log.info( 'Application status updated', {
    applicationId,
    previousStatus: existing.status,
    newStatus: status,
    adminId: user.id,
    providerPromotion: promotionResult ? { ok: promotionResult.ok, providerId: promotionResult.providerId, providerKind: promotionResult.providerKind } : undefined,
  });

  await logAdminAction({
    actorUserId: user.id,
    targetType: 'provider_application',
    targetId: applicationId,
    action: 'application_status_updated',
    metadata: {
      previous_status: existing.status,
      new_status: status,
      ...(cleanNotes ? { admin_notes: cleanNotes } : {}),
      ...(promotionResult
        ? {
            provider_promotion: {
              ok: promotionResult.ok,
              provider_id: promotionResult.providerId,
              provider_kind: promotionResult.providerKind,
              warnings: promotionResult.warnings,
            },
          }
        : {}),
    },
  });

  return NextResponse.json({ application: updated, providerPromotion: promotionResult });
}

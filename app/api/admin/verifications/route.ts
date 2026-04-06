import { NextRequest, NextResponse } from 'next/server';
import { appLogger } from '@/lib/logger';
import { dispatchAlert } from '@/lib/alerting';
import { apiError } from '@/lib/api-errors';
import { requireAdmin } from '@/lib/admin-guard';
import { getVerificationById, updateVerificationReview, getAllVerifications } from '@/lib/db/provider-verifications';

import { getProviderApplicationById, updateProviderApplicationStatus } from '@/lib/db/provider-applications';
import { grantBadge, revokeBadge } from '@/lib/db/provider-badges';
import { logAdminAction } from '@/lib/db/audit-logs';
import type { VerificationStatus, AuditAction } from '@/lib/types/trust';

const ALLOWED_ACTIONS: Record<string, { status: VerificationStatus; auditAction: AuditAction }> = {
  approve: { status: 'approved', auditAction: 'verification_approved' },
  reject: { status: 'rejected', auditAction: 'verification_rejected' },
  request_resubmission: { status: 'resubmission_requested', auditAction: 'verification_resubmission_requested' },
};

export async function GET(request: NextRequest) {
  try {
    const guard = await requireAdmin();
    if (!guard.ok) return guard.response;
    const { user: _user } = guard;

    const statusFilter = request.nextUrl.searchParams.get('status') as VerificationStatus | null;
    const verifications = await getAllVerifications(statusFilter || undefined);

    // Enrich with provider application data
    const enriched = await Promise.all(
      verifications.map(async (v) => {
        const application = await getProviderApplicationById(v.provider_application_id);
        return {
          ...v,
          provider_display_name: application?.display_name || 'Nepoznato',
          provider_city: application?.city || null,
          provider_type: application?.provider_type || null,
        };
      })
    );

    return NextResponse.json({ verifications: enriched });
  } catch (err) {
    appLogger.error('admin.verifications', 'Failed to list verifications', { error: String(err) });
    return apiError({ status: 500, code: 'INTERNAL_ERROR', message: 'Internal error' });
  }
}

export async function POST(request: NextRequest) {
  try {
    const guard = await requireAdmin();
    if (!guard.ok) return guard.response;
    const { user } = guard;

    const body = await request.json();
    const { verificationId, action, rejectionReason, notesInternal } = body as {
      verificationId: string;
      action: string;
      rejectionReason?: string;
      notesInternal?: string;
    };

    if (!verificationId || !action) {
      return apiError({ status: 400, code: 'MISSING_FIELDS', message: 'verificationId and action are required' });
    }

    const actionConfig = ALLOWED_ACTIONS[action];
    if (!actionConfig) {
      return apiError({ status: 400, code: 'INVALID_ACTION', message: `Invalid action: ${action}. Allowed: ${Object.keys(ALLOWED_ACTIONS).join(', ')}` });
    }

    if (action === 'reject' && !rejectionReason?.trim()) {
      return apiError({ status: 400, code: 'MISSING_REASON', message: 'Razlog odbijanja je obavezan.' });
    }

    const verification = await getVerificationById(verificationId);
    if (!verification) {
      return apiError({ status: 404, code: 'NOT_FOUND', message: 'Verification not found' });
    }

    // Update verification status
    const updated = await updateVerificationReview(
      verificationId,
      actionConfig.status,
      user.id,
      rejectionReason,
      notesInternal
    );

    if (!updated) {
      appLogger.error('admin.verifications', 'Verification update returned null', {
        verificationId,
        action,
        adminId: user.id,
      });
      dispatchAlert({
        severity: 'P2',
        service: 'admin.verifications',
        description: 'Provider verification review update failed — admin action not persisted',
        value: `verification=${verificationId}, action=${action}`,
        owner: 'platform',
      });
      return apiError({ status: 500, code: 'UPDATE_FAILED', message: 'Failed to update verification' });
    }

    // Grant or revoke badge based on action
    if (action === 'approve' && verification.verification_type === 'identity') {
      await grantBadge(verification.provider_application_id, 'identity_verified');
    } else if (action === 'reject' && verification.verification_type === 'identity') {
      await revokeBadge(verification.provider_application_id, 'identity_verified');
    }

    const application = await getProviderApplicationById(verification.provider_application_id);
    if (application && action === 'approve') {
      await updateProviderApplicationStatus(application.id, application.status, user.id, application.admin_notes || undefined);
    }

    // Audit log
    await logAdminAction({
      actorUserId: user.id,
      targetType: 'provider_verification',
      targetId: verificationId,
      action: actionConfig.auditAction,
      metadata: {
        provider_application_id: verification.provider_application_id,
        verification_type: verification.verification_type,
        previous_status: verification.status,
        new_status: actionConfig.status,
        ...(rejectionReason ? { rejection_reason: rejectionReason } : {}),
      },
    });

    return NextResponse.json({ verification: updated, message: 'Verifikacija ažurirana.' });
  } catch (error) {
    appLogger.error('admin.verifications', 'Verification review failed', { error: String(error) });
    return apiError({ status: 500, code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : 'Internal error' });
  }
}

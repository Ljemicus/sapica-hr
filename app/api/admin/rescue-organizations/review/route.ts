import { NextResponse } from 'next/server';
import { dispatchAlert } from '@/lib/alerting';
import { apiError } from '@/lib/api-errors';
import { requireAdmin } from '@/lib/admin-guard';
import { logAdminAction } from '@/lib/db/audit-logs';
import {
  getRescueOrganization,
  getRescueVerificationDocuments,
  reviewRescueOrganization,
  reviewRescueVerificationDocument,
} from '@/lib/db';
import type {
  RescueDonationLinkStatus,
  RescueOrganizationStatus,
  RescueReviewState,
  RescueVerificationDocumentReviewStatus,
  RescueVerificationStatus,
} from '@/lib/types';

type EntityType = 'organization' | 'donation_link' | 'document';
type ReviewAction = 'approve' | 'reject' | 'mark_in_review';

const REVIEW_STATES: Record<ReviewAction, RescueReviewState> = {
  approve: 'approved',
  reject: 'changes_requested',
  mark_in_review: 'in_review',
};

export async function POST(request: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;
  const { user } = guard;

  const body = await request.json().catch(() => null);
  const {
    entityType,
    action,
    organizationId,
    documentId,
    adminNotes,
  } = (body || {}) as {
    entityType?: EntityType;
    action?: ReviewAction;
    organizationId?: string;
    documentId?: string;
    adminNotes?: string;
  };

  if (!entityType || !action || !organizationId || !['organization', 'donation_link', 'document'].includes(entityType)) {
    return apiError({ status: 400, code: 'INVALID_REQUEST', message: 'entityType, action and organizationId are required' });
  }

  if (!['approve', 'reject', 'mark_in_review'].includes(action)) {
    return apiError({ status: 400, code: 'INVALID_ACTION', message: 'Unsupported review action' });
  }

  const cleanNotes = typeof adminNotes === 'string' ? adminNotes.trim().slice(0, 2000) : '';
  if (action === 'reject' && !cleanNotes) {
    return apiError({ status: 400, code: 'MISSING_NOTES', message: 'Admin note is required when rejecting rescue review items' });
  }

  const organization = await getRescueOrganization(organizationId);
  if (!organization) {
    return apiError({ status: 404, code: 'NOT_FOUND', message: 'Rescue organization not found' });
  }

  try {
    if (entityType === 'document') {
      if (!documentId) {
        return apiError({ status: 400, code: 'MISSING_DOCUMENT_ID', message: 'documentId is required for document reviews' });
      }

      const nextStatus: RescueVerificationDocumentReviewStatus = action === 'approve'
        ? 'approved'
        : action === 'reject'
          ? 'rejected'
          : 'pending';

      const updatedDocument = await reviewRescueVerificationDocument(documentId, user.id, nextStatus, cleanNotes || null);
      if (!updatedDocument) {
        dispatchAlert({
          severity: 'P2',
          service: 'admin.rescue-organizations.review',
          description: 'Rescue verification document review failed',
          value: `organization=${organizationId}, document=${documentId}, action=${action}`,
          owner: 'platform',
        });
        return apiError({ status: 500, code: 'UPDATE_FAILED', message: 'Failed to update document review' });
      }

      const documents = await getRescueVerificationDocuments(organizationId);
      const approvedDocs = documents.filter((document) => document.id === documentId ? nextStatus === 'approved' : document.review_status === 'approved').length;
      const rejectedDocs = documents.filter((document) => document.id === documentId ? nextStatus === 'rejected' : document.review_status === 'rejected').length;
      const pendingDocs = documents.filter((document) => document.id === documentId ? nextStatus === 'pending' : document.review_status === 'pending').length;

      let verificationStatus: RescueVerificationStatus = organization.verification_status;
      let status: RescueOrganizationStatus = organization.status;
      let reviewState: RescueReviewState = organization.review_state;

      if (action === 'approve' && approvedDocs > 0 && pendingDocs === 0 && rejectedDocs === 0) {
        verificationStatus = 'approved';
        reviewState = organization.external_donation_url_status === 'approved' ? 'approved' : 'in_review';
        status = organization.external_donation_url_status === 'approved' ? 'active' : 'pending_review';
      } else if (action === 'reject') {
        verificationStatus = 'rejected';
        reviewState = 'changes_requested';
        status = 'draft';
      } else if (action === 'mark_in_review' || pendingDocs > 0) {
        verificationStatus = 'pending';
        reviewState = 'in_review';
        status = organization.status === 'active' ? 'active' : 'pending_review';
      }

      const updatedOrganization = await reviewRescueOrganization({
        organizationId,
        adminId: user.id,
        verificationStatus,
        status,
        reviewState,
        adminNotes: cleanNotes || organization.admin_notes,
      });

      await logAdminAction({
        actorUserId: user.id,
        targetType: 'rescue_verification_document',
        targetId: documentId,
        action: action === 'approve'
          ? 'verification_approved'
          : action === 'reject'
            ? 'verification_rejected'
            : 'application_status_updated',
        metadata: {
          organization_id: organizationId,
          document_review_status: nextStatus,
          organization_verification_status: updatedOrganization?.verification_status ?? verificationStatus,
          ...(cleanNotes ? { admin_notes: cleanNotes } : {}),
        },
      });

      return NextResponse.json({ document: updatedDocument, organization: updatedOrganization });
    }

    if (entityType === 'organization') {
      const verificationStatus: RescueVerificationStatus = action === 'approve'
        ? 'approved'
        : action === 'reject'
          ? 'rejected'
          : 'pending';
      const nextStatus: RescueOrganizationStatus = action === 'approve'
        ? (organization.external_donation_url_status === 'approved' ? 'active' : 'pending_review')
        : action === 'reject'
          ? 'draft'
          : 'pending_review';

      const updatedOrganization = await reviewRescueOrganization({
        organizationId,
        adminId: user.id,
        reviewState: REVIEW_STATES[action],
        verificationStatus,
        status: nextStatus,
        adminNotes: cleanNotes || null,
      });

      if (!updatedOrganization) {
        return apiError({ status: 500, code: 'UPDATE_FAILED', message: 'Failed to update rescue organization review' });
      }

      await logAdminAction({
        actorUserId: user.id,
        targetType: 'rescue_organization',
        targetId: organizationId,
        action: action === 'approve'
          ? 'verification_approved'
          : action === 'reject'
            ? 'verification_rejected'
            : 'application_status_updated',
        metadata: {
          entity_type: entityType,
          previous_status: organization.status,
          new_status: updatedOrganization.status,
          previous_verification_status: organization.verification_status,
          new_verification_status: updatedOrganization.verification_status,
          ...(cleanNotes ? { admin_notes: cleanNotes } : {}),
        },
      });

      return NextResponse.json({ organization: updatedOrganization });
    }

    const externalDonationUrlStatus: RescueDonationLinkStatus = action === 'approve'
      ? 'approved'
      : action === 'reject'
        ? 'rejected'
        : 'pending_review';
    const nextStatus: RescueOrganizationStatus = action === 'approve' && organization.verification_status === 'approved'
      ? 'active'
      : action === 'reject'
        ? 'draft'
        : organization.status === 'active'
          ? 'active'
          : 'pending_review';
    const reviewState: RescueReviewState = action === 'approve' && organization.verification_status === 'approved'
      ? 'approved'
      : REVIEW_STATES[action];

    const updatedOrganization = await reviewRescueOrganization({
      organizationId,
      adminId: user.id,
      reviewState,
      status: nextStatus,
      externalDonationUrlStatus,
      adminNotes: cleanNotes || null,
    });

    if (!updatedOrganization) {
      return apiError({ status: 500, code: 'UPDATE_FAILED', message: 'Failed to update donation link review' });
    }

    await logAdminAction({
      actorUserId: user.id,
      targetType: 'rescue_organization',
      targetId: organizationId,
      action: action === 'approve' ? 'application_status_updated' : 'verification_rejected',
      metadata: {
        entity_type: entityType,
        previous_donation_link_status: organization.external_donation_url_status,
        new_donation_link_status: updatedOrganization.external_donation_url_status,
        previous_status: organization.status,
        new_status: updatedOrganization.status,
        ...(cleanNotes ? { admin_notes: cleanNotes } : {}),
      },
    });

    return NextResponse.json({ organization: updatedOrganization });
  } catch (error) {
    dispatchAlert({
      severity: 'P2',
      service: 'admin.rescue-organizations.review',
      description: 'Unhandled rescue review failure',
      value: String(error),
      owner: 'platform',
    });
    return apiError({ status: 500, code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : 'Internal error' });
  }
}

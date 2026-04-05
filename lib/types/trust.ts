// ── Trust Domain Types ──
// Shared types for the provider trust / verification system.
// These map to tables created in migration 020_trust_foundation.sql (Lane A).

export type VerificationType = 'identity' | 'business' | 'qualification';

export type VerificationStatus =
  | 'not_submitted'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'resubmission_requested';

export type PublicStatus = 'draft' | 'pending_review' | 'public' | 'hidden' | 'suspended';

export type BadgeType =
  | 'identity_verified'
  | 'business_verified'
  | 'top_rated'
  | 'new_on_petpark';

export type DocumentType =
  | 'id_document'
  | 'selfie_with_document'
  | 'business_doc'
  | 'qualification_doc';

export type AuditAction =
  | 'verification_approved'
  | 'verification_rejected'
  | 'verification_resubmission_requested'
  | 'provider_hidden'
  | 'provider_restored'
  | 'application_status_updated'
  | 'sitter_verification_updated'
  | 'public_status_updated'
  | 'lost_pet_hidden'
  | 'lost_pet_unhidden'
  | 'lost_pet_deleted'
  | 'lost_pet_marked_found'
  | 'lost_pet_contact_revealed'
  | 'lost_pet_reported'
  | 'lost_pet_report_resolved'
  | 'forum_topic_hidden'
  | 'forum_topic_unhidden'
  | 'forum_topic_deleted'
  | 'forum_comment_hidden'
  | 'forum_comment_unhidden'
  | 'forum_comment_deleted';

// ── Lost Pet Report Types ──

export type LostPetReportReason =
  | 'spam'
  | 'fake_listing'
  | 'inappropriate_content'
  | 'wrong_contact_info'
  | 'duplicate'
  | 'other';

export type LostPetReportStatus = 'open' | 'reviewed' | 'dismissed';

export interface LostPetReport {
  id: string;
  lost_pet_id: string;
  reporter_user_id: string;
  reason: LostPetReportReason;
  details: string | null;
  status: LostPetReportStatus;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
}

export const LOST_PET_REPORT_REASON_LABELS: Record<LostPetReportReason, string> = {
  spam: 'Spam',
  fake_listing: 'Lažni oglas',
  inappropriate_content: 'Neprimjeren sadržaj',
  wrong_contact_info: 'Pogrešni kontakt podaci',
  duplicate: 'Duplikat',
  other: 'Ostalo',
};

export interface ProviderVerification {
  id: string;
  provider_application_id: string;
  verification_type: VerificationType;
  status: VerificationStatus;
  submitted_at: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  rejection_reason: string | null;
  notes_internal: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProviderDocument {
  id: string;
  provider_application_id: string;
  provider_verification_id: string;
  document_type: DocumentType;
  storage_bucket: string;
  storage_path: string;
  uploaded_by: string;
  created_at: string;
}

export interface ProviderBadge {
  id: string;
  provider_application_id: string;
  badge_type: BadgeType;
  active: boolean;
  granted_at: string;
  expires_at: string | null;
  metadata: Record<string, unknown> | null;
}

export interface AuditLog {
  id: string;
  actor_user_id: string;
  target_type: string;
  target_id: string;
  action: AuditAction;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

// ── UI Labels ──

export const VERIFICATION_STATUS_LABELS: Record<VerificationStatus, string> = {
  not_submitted: 'Nije poslano',
  pending: 'Na provjeri',
  approved: 'Odobreno',
  rejected: 'Odbijeno',
  resubmission_requested: 'Potrebna nadopuna',
};

export const VERIFICATION_STATUS_COLORS: Record<VerificationStatus, string> = {
  not_submitted: 'bg-gray-100 text-gray-700 border-gray-200',
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  approved: 'bg-green-100 text-green-700 border-green-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
  resubmission_requested: 'bg-orange-100 text-orange-700 border-orange-200',
};

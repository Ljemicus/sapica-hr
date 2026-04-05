export type RescueOrganizationStatus = 'draft' | 'pending_review' | 'active' | 'suspended' | 'archived';
export type RescueOrganizationKind = 'rescue' | 'shelter' | 'association' | 'sanctuary' | 'other';
export type RescueVerificationStatus = 'not_submitted' | 'pending' | 'approved' | 'rejected';
export type RescueDonationLinkStatus = 'not_provided' | 'pending_review' | 'approved' | 'rejected';
export type RescueReviewState = 'not_started' | 'pending' | 'in_review' | 'changes_requested' | 'approved';

export type AppealStatus = 'draft' | 'active' | 'funded' | 'closed' | 'cancelled';
export type AppealUrgency = 'low' | 'normal' | 'high' | 'critical';
export type AppealUpdateType = 'progress' | 'medical' | 'financial' | 'thank_you' | 'closure';
export type AppealDonationStatus = 'pending' | 'succeeded' | 'failed' | 'refunded' | 'cancelled';
export type RescueVerificationDocumentType = 'registration_certificate' | 'charity_proof' | 'bank_confirmation' | 'identity_document' | 'other';
export type RescueVerificationDocumentReviewStatus = 'pending' | 'approved' | 'rejected';

export interface RescueOrganization {
  id: string;
  owner_user_id: string;
  publisher_profile_id: string | null;
  status: RescueOrganizationStatus;
  kind: RescueOrganizationKind;
  verification_status: RescueVerificationStatus;
  review_state: RescueReviewState;
  legal_name: string;
  display_name: string;
  slug: string;
  description: string | null;
  city: string | null;
  country_code: string;
  email: string | null;
  phone: string | null;
  website_url: string | null;
  external_donation_url: string | null;
  external_donation_url_status: RescueDonationLinkStatus;
  donation_contact_name: string | null;
  bank_account_iban: string | null;
  stripe_account_id: string | null;
  verification_submitted_at: string | null;
  verified_at: string | null;
  verified_by: string | null;
  external_donation_url_verified_at: string | null;
  external_donation_url_verified_by: string | null;
  admin_notes: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface RescueAppeal {
  id: string;
  organization_id: string;
  status: AppealStatus;
  urgency: AppealUrgency;
  title: string;
  slug: string;
  summary: string;
  story: string | null;
  beneficiary_name: string | null;
  species: string | null;
  location_label: string | null;
  cover_image_url: string | null;
  target_amount_cents: number;
  currency: string;
  raised_amount_cents: number;
  donor_count: number;
  starts_at: string | null;
  ends_at: string | null;
  closed_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  organization?: RescueOrganization;
}

export interface RescueAppealUpdate {
  id: string;
  appeal_id: string;
  organization_id: string;
  update_type: AppealUpdateType;
  title: string | null;
  body: string;
  image_url: string | null;
  is_public: boolean;
  published_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface RescueAppealDonation {
  id: string;
  appeal_id: string;
  organization_id: string;
  donor_user_id: string | null;
  donor_name: string | null;
  donor_email: string | null;
  is_anonymous: boolean;
  amount_cents: number;
  currency: string;
  status: AppealDonationStatus;
  provider: string | null;
  provider_payment_intent_id: string | null;
  provider_checkout_session_id: string | null;
  message: string | null;
  paid_at: string | null;
  refunded_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface RescueVerificationDocument {
  id: string;
  organization_id: string;
  document_type: RescueVerificationDocumentType;
  storage_bucket: string;
  storage_path: string;
  original_filename: string | null;
  mime_type: string | null;
  file_size_bytes: number | null;
  review_status: RescueVerificationDocumentReviewStatus;
  document_notes: string | null;
  admin_notes: string | null;
  uploaded_by: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
}

export const RESCUE_ORGANIZATION_STATUS_LABELS: Record<RescueOrganizationStatus, string> = {
  draft: 'Skica',
  pending_review: 'Na provjeri',
  active: 'Aktivna',
  suspended: 'Suspendirana',
  archived: 'Arhivirana',
};

export const APPEAL_STATUS_LABELS: Record<AppealStatus, string> = {
  draft: 'Skica',
  active: 'Aktivna',
  funded: 'Financirana',
  closed: 'Zatvorena',
  cancelled: 'Otkazana',
};

export const RESCUE_VERIFICATION_STATUS_LABELS: Record<RescueVerificationStatus, string> = {
  not_submitted: 'Nije poslano',
  pending: 'Na provjeri',
  approved: 'Odobreno',
  rejected: 'Vraćeno na doradu',
};

export const RESCUE_DONATION_LINK_STATUS_LABELS: Record<RescueDonationLinkStatus, string> = {
  not_provided: 'Nije dodan',
  pending_review: 'Čeka provjeru',
  approved: 'Odobren',
  rejected: 'Odbijen',
};

export const RESCUE_REVIEW_STATE_LABELS: Record<RescueReviewState, string> = {
  not_started: 'Nije otvoreno',
  pending: 'Čeka review',
  in_review: 'U obradi',
  changes_requested: 'Traži doradu',
  approved: 'Odobreno',
};

export const RESCUE_VERIFICATION_DOCUMENT_TYPE_LABELS: Record<RescueVerificationDocumentType, string> = {
  registration_certificate: 'Rješenje / registracija',
  charity_proof: 'Dokaz o udruzi / charity statusu',
  bank_confirmation: 'Potvrda banke / IBAN-a',
  identity_document: 'Identifikacijski dokument',
  other: 'Ostali dokument',
};

export const RESCUE_VERIFICATION_DOCUMENT_REVIEW_STATUS_LABELS: Record<RescueVerificationDocumentReviewStatus, string> = {
  pending: 'Na provjeri',
  approved: 'Odobreno',
  rejected: 'Vraćeno',
};

export function getAppealProgressPct(appeal: Pick<RescueAppeal, 'target_amount_cents' | 'raised_amount_cents'>): number {
  if (appeal.target_amount_cents <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((appeal.raised_amount_cents / appeal.target_amount_cents) * 100)));
}

export function isAppealLive(appeal: Pick<RescueAppeal, 'status' | 'starts_at' | 'ends_at' | 'closed_at'>): boolean {
  if (appeal.status !== 'active') return false;
  const now = Date.now();
  if (appeal.closed_at) return false;
  if (appeal.starts_at && new Date(appeal.starts_at).getTime() > now) return false;
  if (appeal.ends_at && new Date(appeal.ends_at).getTime() < now) return false;
  return true;
}

export function canTransitionAppealStatus(current: AppealStatus, next: AppealStatus): boolean {
  const allowed: Record<AppealStatus, AppealStatus[]> = {
    draft: ['active', 'cancelled'],
    active: ['funded', 'closed', 'cancelled'],
    funded: ['closed'],
    closed: [],
    cancelled: [],
  };

  return allowed[current].includes(next);
}

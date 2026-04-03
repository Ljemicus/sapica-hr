-- ============================================================
-- 020 · Trust Foundation
-- ============================================================
-- Introduces the core trust layer tables and storage for the
-- provider verification / identity-gate system.
--
-- New tables:
--   provider_verifications   – per-type verification requests
--   provider_documents       – uploaded verification documents
--   provider_badges          – earned trust badges
--   provider_suspensions     – suspension records
--   audit_logs               – critical admin action trail
--
-- Altered tables:
--   provider_applications    – adds public_status, working_hours,
--                              profile_completeness_pct
--
-- Storage:
--   verification-docs bucket (private)

-- ── Helper: public_status type ──
CREATE TYPE provider_public_status AS ENUM (
  'draft',
  'pending_review',
  'public',
  'hidden',
  'suspended'
);

-- ── Helper: verification status type ──
CREATE TYPE verification_status AS ENUM (
  'not_submitted',
  'pending',
  'approved',
  'rejected',
  'resubmission_requested'
);

-- ════════════════════════════════════════════════════════════
-- 1. provider_verifications
-- ════════════════════════════════════════════════════════════
CREATE TABLE provider_verifications (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_application_id   uuid NOT NULL REFERENCES provider_applications(id) ON DELETE CASCADE,
  verification_type         text NOT NULL CHECK (verification_type IN ('identity', 'business', 'qualification')),
  status                    verification_status NOT NULL DEFAULT 'not_submitted',
  submitted_at              timestamptz,
  reviewed_at               timestamptz,
  reviewed_by               uuid REFERENCES auth.users(id),
  rejection_reason          text,
  notes_internal            text,
  created_at                timestamptz NOT NULL DEFAULT now(),
  updated_at                timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_provider_verifications_app
  ON provider_verifications(provider_application_id);
CREATE INDEX idx_provider_verifications_status
  ON provider_verifications(status);
CREATE INDEX idx_provider_verifications_type_status
  ON provider_verifications(verification_type, status);

-- RLS
ALTER TABLE provider_verifications ENABLE ROW LEVEL SECURITY;

-- Provider can read own verifications (via their application)
CREATE POLICY "Provider can view own verifications"
  ON provider_verifications FOR SELECT
  USING (
    provider_application_id IN (
      SELECT id FROM provider_applications WHERE user_id = auth.uid()
    )
  );

-- Provider can insert own verification request
CREATE POLICY "Provider can create own verification"
  ON provider_verifications FOR INSERT
  WITH CHECK (
    provider_application_id IN (
      SELECT id FROM provider_applications WHERE user_id = auth.uid()
    )
  );

-- Provider can update own verification (e.g. resubmission)
CREATE POLICY "Provider can update own verification"
  ON provider_verifications FOR UPDATE
  USING (
    provider_application_id IN (
      SELECT id FROM provider_applications WHERE user_id = auth.uid()
    )
    AND status IN ('not_submitted', 'rejected', 'resubmission_requested')
  );

-- Admin full access
CREATE POLICY "Admin full access to verifications"
  ON provider_verifications FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ════════════════════════════════════════════════════════════
-- 2. provider_documents
-- ════════════════════════════════════════════════════════════
CREATE TABLE provider_documents (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_application_id   uuid NOT NULL REFERENCES provider_applications(id) ON DELETE CASCADE,
  provider_verification_id  uuid NOT NULL REFERENCES provider_verifications(id) ON DELETE CASCADE,
  document_type             text NOT NULL CHECK (document_type IN ('id_document', 'selfie_with_document', 'business_doc', 'qualification_doc')),
  storage_bucket            text NOT NULL,
  storage_path              text NOT NULL,
  uploaded_by               uuid NOT NULL REFERENCES auth.users(id),
  created_at                timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_provider_documents_app
  ON provider_documents(provider_application_id);
CREATE INDEX idx_provider_documents_verification
  ON provider_documents(provider_verification_id);

-- RLS
ALTER TABLE provider_documents ENABLE ROW LEVEL SECURITY;

-- Provider can read own documents
CREATE POLICY "Provider can view own documents"
  ON provider_documents FOR SELECT
  USING (
    provider_application_id IN (
      SELECT id FROM provider_applications WHERE user_id = auth.uid()
    )
  );

-- Provider can insert own documents
CREATE POLICY "Provider can upload own documents"
  ON provider_documents FOR INSERT
  WITH CHECK (
    uploaded_by = auth.uid()
    AND provider_application_id IN (
      SELECT id FROM provider_applications WHERE user_id = auth.uid()
    )
  );

-- Admin full access
CREATE POLICY "Admin full access to documents"
  ON provider_documents FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ════════════════════════════════════════════════════════════
-- 3. provider_badges
-- ════════════════════════════════════════════════════════════
CREATE TABLE provider_badges (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_application_id   uuid NOT NULL REFERENCES provider_applications(id) ON DELETE CASCADE,
  badge_type                text NOT NULL CHECK (badge_type IN ('identity_verified', 'business_verified', 'top_rated', 'new_on_petpark')),
  active                    boolean NOT NULL DEFAULT true,
  granted_at                timestamptz NOT NULL DEFAULT now(),
  expires_at                timestamptz,
  metadata                  jsonb,
  created_at                timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_provider_badges_app
  ON provider_badges(provider_application_id);
CREATE INDEX idx_provider_badges_type
  ON provider_badges(badge_type);

-- RLS
ALTER TABLE provider_badges ENABLE ROW LEVEL SECURITY;

-- Public read for active badges (visible on public profiles)
CREATE POLICY "Anyone can view active badges"
  ON provider_badges FOR SELECT
  USING (active = true);

-- Admin write only
CREATE POLICY "Admin full access to badges"
  ON provider_badges FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ════════════════════════════════════════════════════════════
-- 4. provider_suspensions
-- ════════════════════════════════════════════════════════════
CREATE TABLE provider_suspensions (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_application_id   uuid NOT NULL REFERENCES provider_applications(id) ON DELETE CASCADE,
  suspension_type           text NOT NULL CHECK (suspension_type IN ('soft', 'hard')),
  reason                    text NOT NULL,
  created_by                uuid NOT NULL REFERENCES auth.users(id),
  created_at                timestamptz NOT NULL DEFAULT now(),
  resolved_at               timestamptz,
  resolution_note           text
);

CREATE INDEX idx_provider_suspensions_app
  ON provider_suspensions(provider_application_id);

-- RLS
ALTER TABLE provider_suspensions ENABLE ROW LEVEL SECURITY;

-- Provider can see own suspensions
CREATE POLICY "Provider can view own suspensions"
  ON provider_suspensions FOR SELECT
  USING (
    provider_application_id IN (
      SELECT id FROM provider_applications WHERE user_id = auth.uid()
    )
  );

-- Admin full access
CREATE POLICY "Admin full access to suspensions"
  ON provider_suspensions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ════════════════════════════════════════════════════════════
-- 5. audit_logs
-- ════════════════════════════════════════════════════════════
CREATE TABLE audit_logs (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id     uuid NOT NULL REFERENCES auth.users(id),
  target_type       text NOT NULL,
  target_id         uuid NOT NULL,
  action            text NOT NULL,
  metadata          jsonb,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_actor    ON audit_logs(actor_user_id);
CREATE INDEX idx_audit_logs_target   ON audit_logs(target_type, target_id);
CREATE INDEX idx_audit_logs_action   ON audit_logs(action);
CREATE INDEX idx_audit_logs_created  ON audit_logs(created_at DESC);

-- RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Admin read only
CREATE POLICY "Admin can view audit logs"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Server-side insert only (via service role key, bypasses RLS)
-- No insert policy needed for regular users.

-- ════════════════════════════════════════════════════════════
-- 6. Alter provider_applications
-- ════════════════════════════════════════════════════════════
ALTER TABLE provider_applications
  ADD COLUMN IF NOT EXISTS public_status provider_public_status NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS working_hours jsonb,
  ADD COLUMN IF NOT EXISTS profile_completeness_pct integer;

CREATE INDEX idx_provider_applications_public_status
  ON provider_applications(public_status);

-- ════════════════════════════════════════════════════════════
-- 7. Private storage bucket: verification-docs
-- ════════════════════════════════════════════════════════════
INSERT INTO storage.buckets (id, name, public)
VALUES ('verification-docs', 'verification-docs', false)
ON CONFLICT (id) DO NOTHING;

-- Provider can upload to own folder in verification-docs
CREATE POLICY "Provider can upload verification docs"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'verification-docs'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = 'users'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

-- Provider can view own verification docs
CREATE POLICY "Provider can view own verification docs"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'verification-docs'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = 'users'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

-- Admin can view all verification docs
CREATE POLICY "Admin can view all verification docs"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'verification-docs'
    AND EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

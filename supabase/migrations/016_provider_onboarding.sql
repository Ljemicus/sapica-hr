-- ============================================================
-- 016 · Provider Onboarding Applications
-- ============================================================
-- Stores the full provider application form including basic profile,
-- service info, legal/business info, payout info, and terms acceptance.
-- Status lifecycle: draft → pending_verification → active | restricted | rejected

-- ── Status enum ──
CREATE TYPE provider_application_status AS ENUM (
  'draft',
  'pending_verification',
  'restricted',
  'active',
  'rejected'
);

-- ── Main table ──
CREATE TABLE provider_applications (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  status        provider_application_status NOT NULL DEFAULT 'draft',

  -- Basic profile
  display_name  text NOT NULL DEFAULT '',
  bio           text,
  city          text,
  phone         text,
  avatar_url    text,

  -- Service info
  provider_type text NOT NULL DEFAULT 'čuvar',  -- matches PublisherProfileType
  services      text[] NOT NULL DEFAULT '{}',
  experience_years int NOT NULL DEFAULT 0,
  prices        jsonb NOT NULL DEFAULT '{}',

  -- Legal / business info
  business_name text,
  oib           text,               -- Croatian personal identification number (OIB)
  address       text,
  id_verified   boolean NOT NULL DEFAULT false,

  -- Payout info (Stripe Connect)
  stripe_account_id   text,
  stripe_onboarding_complete boolean NOT NULL DEFAULT false,
  payout_enabled       boolean NOT NULL DEFAULT false,

  -- Terms acceptance
  terms_accepted       boolean NOT NULL DEFAULT false,
  terms_accepted_at    timestamptz,
  privacy_accepted     boolean NOT NULL DEFAULT false,
  privacy_accepted_at  timestamptz,

  -- Admin notes (for rejections, restrictions)
  admin_notes   text,
  reviewed_by   uuid REFERENCES auth.users(id),
  reviewed_at   timestamptz,

  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT one_application_per_user UNIQUE (user_id)
);

-- ── Indexes ──
CREATE INDEX idx_provider_applications_status ON provider_applications(status);
CREATE INDEX idx_provider_applications_user   ON provider_applications(user_id);

-- ── RLS ──
ALTER TABLE provider_applications ENABLE ROW LEVEL SECURITY;

-- Users can read their own application
CREATE POLICY "Users can view own application"
  ON provider_applications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own application
CREATE POLICY "Users can create own application"
  ON provider_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own draft/rejected application
CREATE POLICY "Users can update own draft application"
  ON provider_applications FOR UPDATE
  USING (auth.uid() = user_id AND status IN ('draft', 'rejected'))
  WITH CHECK (auth.uid() = user_id);

-- Admins can read all applications
CREATE POLICY "Admins can view all applications"
  ON provider_applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update any application (for review/approval)
CREATE POLICY "Admins can update any application"
  ON provider_applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

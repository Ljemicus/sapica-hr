-- ============================================================
-- Lost Pet Reports v2 — upgrade to user-based flagging with
-- structured reasons and admin resolution flow.
-- ============================================================

-- Add structured columns
ALTER TABLE lost_pet_reports
  ADD COLUMN IF NOT EXISTS reporter_user_id uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS reason_code text CHECK (reason_code IN ('spam', 'fake_listing', 'inappropriate_content', 'wrong_contact_info', 'duplicate', 'other')),
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewed', 'dismissed')),
  ADD COLUMN IF NOT EXISTS resolved_by uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS resolved_at timestamptz;

-- Index for admin queue: open reports first
CREATE INDEX IF NOT EXISTS idx_lost_pet_reports_status
  ON lost_pet_reports(status);
CREATE INDEX IF NOT EXISTS idx_lost_pet_reports_created
  ON lost_pet_reports(created_at DESC);

-- One authenticated report per user per listing
CREATE UNIQUE INDEX IF NOT EXISTS idx_lost_pet_reports_user_pet
  ON lost_pet_reports(lost_pet_id, reporter_user_id)
  WHERE reporter_user_id IS NOT NULL;

-- RLS
ALTER TABLE lost_pet_reports ENABLE ROW LEVEL SECURITY;

-- Authenticated users can insert their own reports
DO $$ BEGIN
  CREATE POLICY "Authenticated users can report listings"
    ON lost_pet_reports FOR INSERT
    WITH CHECK (reporter_user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Users can view their own reports
DO $$ BEGIN
  CREATE POLICY "Users can view own reports"
    ON lost_pet_reports FOR SELECT
    USING (reporter_user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Admin full access
DO $$ BEGIN
  CREATE POLICY "Admin full access to reports"
    ON lost_pet_reports FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

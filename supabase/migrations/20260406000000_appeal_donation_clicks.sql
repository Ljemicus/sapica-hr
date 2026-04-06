-- Migration: Create appeal_donation_clicks table for tracking donation button clicks
-- Created: 2026-04-06

CREATE TABLE IF NOT EXISTS appeal_donation_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appeal_id UUID NOT NULL REFERENCES rescue_appeals(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES rescue_organizations(id) ON DELETE CASCADE,
  donor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  donor_email TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_appeal_donation_clicks_appeal_id ON appeal_donation_clicks(appeal_id);
CREATE INDEX IF NOT EXISTS idx_appeal_donation_clicks_organization_id ON appeal_donation_clicks(organization_id);
CREATE INDEX IF NOT EXISTS idx_appeal_donation_clicks_created_at ON appeal_donation_clicks(created_at);
CREATE INDEX IF NOT EXISTS idx_appeal_donation_clicks_donor_user_id ON appeal_donation_clicks(donor_user_id);

-- Row Level Security (RLS) policies
ALTER TABLE appeal_donation_clicks ENABLE ROW LEVEL SECURITY;

-- Organizations can see clicks for their appeals
CREATE POLICY "Organizations can view their own donation clicks"
  ON appeal_donation_clicks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM rescue_organizations
      WHERE rescue_organizations.id = appeal_donation_clicks.organization_id
      AND rescue_organizations.owner_user_id = auth.uid()
    )
  );

-- Admins can view all clicks
CREATE POLICY "Admins can view all donation clicks"
  ON appeal_donation_clicks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Allow inserts from authenticated users (for tracking)
CREATE POLICY "Authenticated users can create donation click records"
  ON appeal_donation_clicks
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Add comment explaining the table
COMMENT ON TABLE appeal_donation_clicks IS 'Tracks when users click the Donate button on rescue appeals. Used for sending email notifications to organizations and analytics.';

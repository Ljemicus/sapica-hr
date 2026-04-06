-- Scheduled emails table for email sequences
CREATE TABLE IF NOT EXISTS public.scheduled_emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  email_type VARCHAR(50) NOT NULL, -- 'welcome_sequence', 'booking_confirmation', 'review_request', etc.
  email_name VARCHAR(100) NOT NULL, -- 'owner_day3_profile', 'sitter_day7_verification', etc.
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  error TEXT,
  metadata JSONB DEFAULT '{}', -- For storing additional data like booking_id, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.scheduled_emails ENABLE ROW LEVEL SECURITY;

-- Users can view their own scheduled emails
CREATE POLICY "Users can view own scheduled emails"
  ON public.scheduled_emails FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role can insert/update scheduled emails
CREATE POLICY "Service role can manage scheduled emails"
  ON public.scheduled_emails FOR ALL
  USING (auth.role() = 'service_role');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_scheduled_emails_user ON public.scheduled_emails(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_emails_scheduled_for ON public.scheduled_emails(scheduled_for) WHERE sent_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_scheduled_emails_type ON public.scheduled_emails(email_type);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_scheduled_emails_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_scheduled_emails_updated_at ON public.scheduled_emails;
CREATE TRIGGER trigger_scheduled_emails_updated_at
  BEFORE UPDATE ON public.scheduled_emails
  FOR EACH ROW
  EXECUTE FUNCTION update_scheduled_emails_updated_at();

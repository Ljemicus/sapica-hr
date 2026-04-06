-- SMS notifications table
CREATE TABLE public.user_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  sms_enabled BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  phone_verification_code TEXT,
  phone_verification_expires_at TIMESTAMPTZ,
  booking_confirmed_sms BOOLEAN DEFAULT TRUE,
  booking_reminder_sms BOOLEAN DEFAULT TRUE,
  booking_cancelled_sms BOOLEAN DEFAULT TRUE,
  message_received_sms BOOLEAN DEFAULT TRUE,
  marketing_sms BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- SMS logs table
CREATE TABLE public.sms_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  phone TEXT NOT NULL,
  body TEXT NOT NULL,
  template TEXT,
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed', 'delivered', 'undelivered')),
  provider_message_id TEXT,
  error TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_user_notifications_user_id ON public.user_notifications(user_id);
CREATE INDEX idx_sms_logs_user_id ON public.sms_logs(user_id);
CREATE INDEX idx_sms_logs_status ON public.sms_logs(status);
CREATE INDEX idx_sms_logs_sent_at ON public.sms_logs(sent_at);

-- RLS policies
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_logs ENABLE ROW LEVEL SECURITY;

-- Users can read/update their own notification preferences
CREATE POLICY "Users can manage their own notification preferences"
  ON public.user_notifications
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can read their own SMS logs
CREATE POLICY "Users can view their own SMS logs"
  ON public.sms_logs
  FOR SELECT
  USING (user_id = auth.uid());

-- Admins can view all SMS logs
CREATE POLICY "Admins can view all SMS logs"
  ON public.sms_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Trigger to create default notification preferences for new users
CREATE OR REPLACE FUNCTION public.create_user_notifications()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_notifications (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_user_created_create_notifications
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_user_notifications();

-- Backfill existing users
INSERT INTO public.user_notifications (user_id)
SELECT id FROM public.users
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_notifications WHERE user_notifications.user_id = users.id
);

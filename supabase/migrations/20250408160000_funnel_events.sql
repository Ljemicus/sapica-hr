-- Create funnel_events table for tracking user journey
CREATE TABLE IF NOT EXISTS funnel_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_funnel_events_user_id ON funnel_events(user_id);
CREATE INDEX idx_funnel_events_event_type ON funnel_events(event_type);
CREATE INDEX idx_funnel_events_created_at ON funnel_events(created_at);

-- Add RLS policies
ALTER TABLE funnel_events ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own events
CREATE POLICY "Users can insert their own funnel events"
  ON funnel_events
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Allow users to view their own events
CREATE POLICY "Users can view their own funnel events"
  ON funnel_events
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Allow service role to manage all events
CREATE POLICY "Service role can manage all funnel events"
  ON funnel_events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

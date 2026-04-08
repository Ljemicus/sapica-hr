-- Create funnel_events table for tracking user journey
CREATE TABLE IF NOT EXISTS funnel_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_funnel_events_user_id ON funnel_events(user_id);
CREATE INDEX IF NOT EXISTS idx_funnel_events_event_type ON funnel_events(event_type);
CREATE INDEX IF NOT EXISTS idx_funnel_events_created_at ON funnel_events(created_at DESC);

-- Enable RLS
ALTER TABLE funnel_events ENABLE ROW LEVEL SECURITY;

-- Create policies (idempotent - drop if exists)
DROP POLICY IF EXISTS "Users can insert their own events" ON funnel_events;
DROP POLICY IF EXISTS "Users can view their own events" ON funnel_events;
DROP POLICY IF EXISTS "Service role can manage all events" ON funnel_events;

CREATE POLICY "Users can insert their own events"
  ON funnel_events FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own events"
  ON funnel_events FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage all events"
  ON funnel_events FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

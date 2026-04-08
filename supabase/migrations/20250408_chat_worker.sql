-- Chat Worker Database Trigger
-- Automatically triggers chat notification worker when new message is inserted

-- First, add notification_sent column if not exists
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS notification_sent BOOLEAN DEFAULT FALSE;

-- Add sender_name column for caching (optional, reduces joins)
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS sender_name TEXT;

-- Create function to trigger chat worker via HTTP
CREATE OR REPLACE FUNCTION trigger_chat_worker()
RETURNS TRIGGER AS $$
DECLARE
  payload JSONB;
  sender_record RECORD;
BEGIN
  -- Get sender name
  SELECT name INTO sender_record
  FROM users
  WHERE id = NEW.sender_id;

  -- Build payload
  payload = jsonb_build_object(
    'record', jsonb_build_object(
      'id', NEW.id,
      'sender_id', NEW.sender_id,
      'receiver_id', NEW.receiver_id,
      'content', NEW.content,
      'sender_name', sender_record.name,
      'notification_sent', NEW.notification_sent
    )
  );

  -- Trigger HTTP request to chat-trigger endpoint
  -- Note: This requires pg_net extension or supabase-edge-functions
  PERFORM net.http_post(
    url := COALESCE(
      current_setting('app.settings.chat_trigger_url', true),
      'https://petpark.hr/api/chat-trigger'
    ),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || COALESCE(current_setting('app.settings.webhook_secret', true), '')
    ),
    body := payload
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS chat_worker_trigger ON messages;

-- Create trigger on message insert
CREATE TRIGGER chat_worker_trigger
  AFTER INSERT ON messages
  FOR EACH ROW
  WHEN (NEW.notification_sent = FALSE)
  EXECUTE FUNCTION trigger_chat_worker();

-- Create index for faster notification queries
CREATE INDEX IF NOT EXISTS idx_messages_notification_sent 
ON messages(notification_sent) 
WHERE notification_sent = FALSE;

-- Create user_sessions table for online status tracking
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast online status checks
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_active 
ON user_sessions(user_id, last_active_at);

-- RLS for user_sessions
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own sessions"
  ON user_sessions
  FOR ALL
  USING (auth.uid() = user_id);

COMMENT ON FUNCTION trigger_chat_worker() IS 'Triggers chat notification worker when new message is inserted';

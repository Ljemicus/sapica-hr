-- ═══════════════════════════════════════════════════════════════════════════════
-- PetPark Calendar System — Additional Functions and Views
-- ═══════════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════════
-- VIEWS
-- ═══════════════════════════════════════════════════════════════════════════════

-- View: Upcoming bookings with client details
CREATE OR REPLACE VIEW public.upcoming_bookings AS
SELECT 
  b.*,
  u.name AS client_full_name,
  u.avatar_url AS client_avatar,
  p.name AS pet_full_name,
  p.photo_url AS pet_photo
FROM public.bookings b
LEFT JOIN auth.users u ON b.client_id = u.id
LEFT JOIN public.pets p ON b.pet_id = p.id
WHERE b.start_time >= CURRENT_DATE
  AND b.status IN ('pending', 'confirmed')
ORDER BY b.start_time ASC;

-- View: Provider calendar overview
CREATE OR REPLACE VIEW public.provider_calendar_overview AS
SELECT 
  b.provider_type,
  b.provider_id,
  DATE(b.start_time) AS booking_date,
  COUNT(*) AS total_bookings,
  COUNT(*) FILTER (WHERE b.status = 'pending') AS pending_count,
  COUNT(*) FILTER (WHERE b.status = 'confirmed') AS confirmed_count,
  COUNT(*) FILTER (WHERE b.status = 'completed') AS completed_count,
  COUNT(*) FILTER (WHERE b.status = 'cancelled') AS cancelled_count,
  SUM(b.price) FILTER (WHERE b.status = 'completed') AS total_revenue
FROM public.bookings b
GROUP BY b.provider_type, b.provider_id, DATE(b.start_time)
ORDER BY booking_date DESC;

-- ═══════════════════════════════════════════════════════════════════════════════
-- FUNCTIONS
-- ═══════════════════════════════════════════════════════════════════════════════

-- Function: Get bookings for calendar display
CREATE OR REPLACE FUNCTION public.get_calendar_bookings(
  p_provider_type TEXT,
  p_provider_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  status TEXT,
  client_name TEXT,
  pet_name TEXT,
  services JSONB,
  color TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.title,
    b.start_time,
    b.end_time,
    b.status,
    b.client_name,
    b.pet_name,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'name', bs.service_name,
          'type', bs.service_type,
          'duration', bs.duration_minutes
        )
      ) FILTER (WHERE bs.id IS NOT NULL),
      '[]'::jsonb
    ) AS services,
    CASE b.status
      WHEN 'confirmed' THEN '#22c55e'
      WHEN 'pending' THEN '#f59e0b'
      WHEN 'completed' THEN '#3b82f6'
      WHEN 'cancelled' THEN '#ef4444'
      ELSE '#6b7280'
    END AS color
  FROM public.bookings b
  LEFT JOIN public.booking_services bs ON b.id = bs.booking_id
  WHERE b.provider_type = p_provider_type
    AND b.provider_id = p_provider_id
    AND DATE(b.start_time) BETWEEN p_start_date AND p_end_date
  GROUP BY b.id, b.title, b.start_time, b.end_time, b.status, b.client_name, b.pet_name
  ORDER BY b.start_time;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get daily availability with booking status
CREATE OR REPLACE FUNCTION public.get_daily_availability(
  p_provider_type TEXT,
  p_provider_id UUID,
  p_date DATE
)
RETURNS TABLE (
  time_slot TIME,
  is_available BOOLEAN,
  booking_id UUID,
  booking_title TEXT,
  booking_status TEXT
) AS $$
DECLARE
  v_slot_duration INTEGER := 60; -- Default 60 min slots
  v_start_time TIME := '08:00';
  v_end_time TIME := '20:00';
BEGIN
  -- Get provider's slot duration from availability settings
  SELECT slot_duration_minutes INTO v_slot_duration
  FROM public.availability_slots
  WHERE provider_type = p_provider_type
    AND provider_id = p_provider_id
    AND (slot_type = 'recurring' AND day_of_week = EXTRACT(DOW FROM p_date)
         OR slot_type = 'one_time' AND specific_date = p_date)
  LIMIT 1;
  
  -- Default to 60 if not found
  IF v_slot_duration IS NULL THEN
    v_slot_duration := 60;
  END IF;

  RETURN QUERY
  WITH time_slots AS (
    SELECT generate_series(
      p_date + v_start_time,
      p_date + v_end_time,
      (v_slot_duration || ' minutes')::INTERVAL
    )::TIME AS slot_time
  ),
  bookings_on_date AS (
    SELECT 
      b.id,
      b.title,
      b.status,
      b.start_time::TIME AS booking_start,
      b.end_time::TIME AS booking_end
    FROM public.bookings b
    WHERE b.provider_type = p_provider_type
      AND b.provider_id = p_provider_id
      AND DATE(b.start_time) = p_date
      AND b.status IN ('pending', 'confirmed')
  )
  SELECT 
    ts.slot_time,
    NOT EXISTS (
      SELECT 1 FROM bookings_on_date bod
      WHERE ts.slot_time >= bod.booking_start 
        AND ts.slot_time < bod.booking_end
    ) AS is_available,
    bod.id AS booking_id,
    bod.title AS booking_title,
    bod.status AS booking_status
  FROM time_slots ts
  LEFT JOIN bookings_on_date bod ON (
    ts.slot_time >= bod.booking_start 
    AND ts.slot_time < bod.booking_end
  )
  ORDER BY ts.slot_time;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Create recurring availability pattern
CREATE OR REPLACE FUNCTION public.create_recurring_availability(
  p_provider_type TEXT,
  p_provider_id UUID,
  p_day_of_week INTEGER,
  p_start_time TIME,
  p_end_time TIME,
  p_slot_duration_minutes INTEGER DEFAULT 60,
  p_effective_from DATE DEFAULT CURRENT_DATE,
  p_effective_until DATE DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_slot_id UUID;
BEGIN
  INSERT INTO public.availability_slots (
    provider_type,
    provider_id,
    slot_type,
    day_of_week,
    start_time,
    end_time,
    slot_duration_minutes,
    effective_from,
    effective_until
  ) VALUES (
    p_provider_type,
    p_provider_id,
    'recurring',
    p_day_of_week,
    p_start_time,
    p_end_time,
    p_slot_duration_minutes,
    p_effective_from,
    p_effective_until
  )
  RETURNING id INTO v_slot_id;
  
  RETURN v_slot_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Bulk create availability from working hours JSON
CREATE OR REPLACE FUNCTION public.set_working_hours(
  p_provider_type TEXT,
  p_provider_id UUID,
  p_working_hours JSONB
)
RETURNS VOID AS $$
DECLARE
  day_mapping JSONB := '{
    "pon": 1, "uto": 2, "sri": 3, "cet": 4, "pet": 5, "sub": 6, "ned": 0
  }'::jsonb;
  day_key TEXT;
  day_num INTEGER;
  start_time TEXT;
  end_time TEXT;
BEGIN
  -- First, deactivate existing recurring slots
  UPDATE public.availability_slots
  SET is_available = FALSE
  WHERE provider_type = p_provider_type
    AND provider_id = p_provider_id
    AND slot_type = 'recurring';
  
  -- Create new slots from working hours
  FOR day_key, day_num IN SELECT * FROM jsonb_each_text(day_mapping)
  LOOP
    IF p_working_hours ? day_key THEN
      start_time := p_working_hours->day_key->>'start';
      end_time := p_working_hours->day_key->>'end';
      
      IF start_time IS NOT NULL AND end_time IS NOT NULL THEN
        INSERT INTO public.availability_slots (
          provider_type,
          provider_id,
          slot_type,
          day_of_week,
          start_time,
          end_time
        ) VALUES (
          p_provider_type,
          p_provider_id,
          'recurring',
          day_num::INTEGER,
          start_time::TIME,
          end_time::TIME
        )
        ON CONFLICT DO NOTHING;
      END IF;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get booking statistics for provider
CREATE OR REPLACE FUNCTION public.get_booking_statistics(
  p_provider_type TEXT,
  p_provider_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  total_bookings BIGINT,
  pending_bookings BIGINT,
  confirmed_bookings BIGINT,
  completed_bookings BIGINT,
  cancelled_bookings BIGINT,
  total_revenue DECIMAL,
  average_booking_value DECIMAL,
  most_popular_service TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH booking_stats AS (
    SELECT 
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE status = 'pending') AS pending,
      COUNT(*) FILTER (WHERE status = 'confirmed') AS confirmed,
      COUNT(*) FILTER (WHERE status = 'completed') AS completed,
      COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled,
      COALESCE(SUM(price) FILTER (WHERE status = 'completed'), 0) AS revenue
    FROM public.bookings
    WHERE provider_type = p_provider_type
      AND provider_id = p_provider_id
      AND DATE(start_time) BETWEEN p_start_date AND p_end_date
  ),
  service_stats AS (
    SELECT service_name, COUNT(*) as service_count
    FROM public.booking_services bs
    JOIN public.bookings b ON bs.booking_id = b.id
    WHERE b.provider_type = p_provider_type
      AND b.provider_id = p_provider_id
      AND DATE(b.start_time) BETWEEN p_start_date AND p_end_date
    GROUP BY service_name
    ORDER BY service_count DESC
    LIMIT 1
  )
  SELECT 
    bs.total,
    bs.pending,
    bs.confirmed,
    bs.completed,
    bs.cancelled,
    bs.revenue,
    CASE WHEN bs.completed > 0 THEN bs.revenue / bs.completed ELSE 0 END,
    ss.service_name
  FROM booking_stats bs
  LEFT JOIN service_stats ss ON true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Reschedule booking
CREATE OR REPLACE FUNCTION public.reschedule_booking(
  p_booking_id UUID,
  p_new_start_time TIMESTAMPTZ,
  p_new_end_time TIMESTAMPTZ,
  p_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_booking RECORD;
  v_has_conflict BOOLEAN;
BEGIN
  -- Get booking details
  SELECT * INTO v_booking FROM public.bookings WHERE id = p_booking_id;
  
  IF v_booking IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check for conflicts
  SELECT public.check_booking_conflict(
    v_booking.provider_type,
    v_booking.provider_id,
    p_new_start_time,
    p_new_end_time,
    p_booking_id
  ) INTO v_has_conflict;
  
  IF v_has_conflict THEN
    RAISE EXCEPTION 'Time slot is already booked';
  END IF;
  
  -- Update booking
  UPDATE public.bookings
  SET 
    start_time = p_new_start_time,
    end_time = p_new_end_time,
    internal_notes = COALESCE(internal_notes, '') || E'\nRescheduled: ' || p_reason
  WHERE id = p_booking_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Cancel booking with reason
CREATE OR REPLACE FUNCTION public.cancel_booking(
  p_booking_id UUID,
  p_cancelled_by TEXT, -- 'provider' or 'client'
  p_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.bookings
  SET 
    status = 'cancelled',
    internal_notes = COALESCE(internal_notes, '') || E'\nCancelled by ' || p_cancelled_by || ': ' || COALESCE(p_reason, 'No reason provided')
  WHERE id = p_booking_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get iCal feed data
CREATE OR REPLACE FUNCTION public.get_ical_feed_data(p_feed_token TEXT)
RETURNS TABLE (
  provider_type TEXT,
  provider_id UUID,
  include_statuses TEXT[],
  include_client_details BOOLEAN,
  include_internal_notes BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.provider_type,
    f.provider_id,
    f.include_statuses,
    f.include_client_details,
    f.include_internal_notes
  FROM public.ical_feeds f
  WHERE f.feed_token = p_feed_token
    AND (f.is_public = TRUE OR EXISTS (
      SELECT 1 FROM auth.users WHERE id = auth.uid()
    ));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Update last accessed for iCal feed
CREATE OR REPLACE FUNCTION public.update_ical_feed_access(p_feed_token TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.ical_feeds
  SET 
    last_accessed_at = NOW(),
    access_count = access_count + 1
  WHERE feed_token = p_feed_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════════════════════
-- NOTIFICATION TRIGGERS
-- ═══════════════════════════════════════════════════════════════════════════════

-- Trigger function for booking status changes
CREATE OR REPLACE FUNCTION public.on_booking_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only proceed if status changed
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;
  
  -- Insert notification record (processed by edge function or webhook)
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    data,
    read
  ) VALUES (
    CASE 
      WHEN NEW.status IN ('confirmed', 'completed', 'cancelled') THEN NEW.client_id
      ELSE NEW.created_by
    END,
    'booking_' || NEW.status,
    CASE NEW.status
      WHEN 'confirmed' THEN 'Booking Confirmed'
      WHEN 'completed' THEN 'Booking Completed'
      WHEN 'cancelled' THEN 'Booking Cancelled'
      ELSE 'Booking Updated'
    END,
    'Your booking for ' || NEW.title || ' has been ' || NEW.status,
    jsonb_build_object(
      'booking_id', NEW.id,
      'provider_type', NEW.provider_type,
      'start_time', NEW.start_time
    ),
    FALSE
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(user_id, read);

-- Apply trigger
DROP TRIGGER IF EXISTS booking_status_change ON public.bookings;
CREATE TRIGGER booking_status_change
  AFTER UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.on_booking_status_change();

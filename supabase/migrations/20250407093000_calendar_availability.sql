-- PetPark Calendar System — Additional Functions and Views
-- MODIFIED: Skip views if bookings table doesn't have new structure yet

-- Only create views if bookings has the new structure (client_id column)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'client_id'
    ) THEN
        RAISE NOTICE 'Bookings table does not have new structure yet, skipping view creation';
        RETURN;
    END IF;

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
END $$;

-- Functions that don't depend on bookings structure
-- Function: Generate time slots for a date
CREATE OR REPLACE FUNCTION public.generate_time_slots(
  p_date DATE,
  p_start_time TIME,
  p_end_time TIME,
  p_slot_duration_minutes INTEGER DEFAULT 60
)
RETURNS TABLE (
  slot_start TIMESTAMPTZ,
  slot_end TIMESTAMPTZ
) AS $$
DECLARE
  v_current_time TIME;
BEGIN
  v_current_time := p_start_time;
  
  WHILE v_current_time < p_end_time LOOP
    slot_start := (p_date + v_current_time)::TIMESTAMPTZ;
    slot_end := (p_date + (v_current_time + (p_slot_duration_minutes || ' minutes')::INTERVAL))::TIMESTAMPTZ;
    RETURN NEXT;
    v_current_time := v_current_time + (p_slot_duration_minutes || ' minutes')::INTERVAL;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Check if a time slot is available
CREATE OR REPLACE FUNCTION public.is_slot_available(
  p_provider_type TEXT,
  p_provider_id UUID,
  p_date DATE,
  p_start_time TIME,
  p_duration_minutes INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  v_slot_start TIMESTAMPTZ;
  v_slot_end TIMESTAMPTZ;
  v_is_available BOOLEAN;
BEGIN
  v_slot_start := (p_date + p_start_time)::TIMESTAMPTZ;
  v_slot_end := v_slot_start + (p_duration_minutes || ' minutes')::INTERVAL;
  
  -- Check if slot is within availability
  SELECT EXISTS (
    SELECT 1 FROM public.availability_slots a
    WHERE a.provider_type = p_provider_type
      AND a.provider_id = p_provider_id
      AND (
        (a.slot_type = 'recurring' AND a.day_of_week = EXTRACT(DOW FROM p_date))
        OR (a.slot_type = 'one_time' AND a.specific_date = p_date)
      )
      AND a.start_time <= p_start_time
      AND a.end_time >= (p_start_time + (p_duration_minutes || ' minutes')::INTERVAL)
      AND a.is_available = TRUE
  ) INTO v_is_available;
  
  IF NOT v_is_available THEN
    RETURN FALSE;
  END IF;
  
  -- Check for conflicts with existing bookings (only if bookings has new structure)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'provider_id'
  ) THEN
    SELECT NOT EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.provider_type = p_provider_type
        AND b.provider_id = p_provider_id
        AND b.status IN ('pending', 'confirmed')
        AND (b.start_time, b.end_time) OVERLAPS (v_slot_start, v_slot_end)
    ) INTO v_is_available;
  END IF;
  
  RETURN v_is_available;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

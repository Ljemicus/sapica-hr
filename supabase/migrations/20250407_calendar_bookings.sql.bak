-- ═══════════════════════════════════════════════════════════════════════════════
-- PetPark Professional Calendar System
-- Unified bookings, availability, and calendar sync for groomers, trainers, sitters
-- ═══════════════════════════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. BOOKINGS TABLE — Unified appointments for all provider types
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Provider reference (polymorphic via provider_type + provider_id)
  provider_type TEXT NOT NULL CHECK (provider_type IN ('sitter', 'groomer', 'trainer')),
  provider_id UUID NOT NULL,
  
  -- Client reference
  client_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  
  -- Pet information
  pet_id UUID REFERENCES public.pets(id) ON DELETE SET NULL,
  pet_name TEXT,
  pet_type TEXT, -- 'dog', 'cat', 'other'
  
  -- Booking details
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
  
  -- Date and time
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  timezone TEXT DEFAULT 'Europe/Zagreb',
  
  -- Pricing
  price DECIMAL(10,2),
  currency TEXT DEFAULT 'EUR',
  
  -- Location
  location_type TEXT DEFAULT 'provider' CHECK (location_type IN ('provider', 'client', 'other')),
  location_address TEXT,
  
  -- Internal notes
  internal_notes TEXT,
  client_notes TEXT,
  
  -- Reminders
  reminder_sent_24h BOOLEAN DEFAULT FALSE,
  reminder_sent_1h BOOLEAN DEFAULT FALSE,
  
  -- Source tracking
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'client_booking', 'google_calendar', 'ical_import', 'api')),
  external_id TEXT, -- ID from external calendar (Google, etc.)
  
  -- Metadata
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_pattern_id UUID,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Ensure end_time is after start_time
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Indexes for bookings
CREATE INDEX IF NOT EXISTS idx_bookings_provider ON public.bookings(provider_type, provider_id);
CREATE INDEX IF NOT EXISTS idx_bookings_client ON public.bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date_range ON public.bookings(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_bookings_provider_date ON public.bookings(provider_type, provider_id, start_time);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_external ON public.bookings(external_id) WHERE external_id IS NOT NULL;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. BOOKING_SERVICES — Junction table for services per booking
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.booking_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  
  -- Service reference (can link to existing service or be custom)
  service_id UUID, -- Optional reference to groomer_services, training_programs, etc.
  service_type TEXT NOT NULL, -- 'grooming', 'training', 'sitting', 'walking', 'daycare', etc.
  service_name TEXT NOT NULL,
  
  -- Service details
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  price DECIMAL(10,2),
  
  -- Custom fields for flexibility
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_booking_services_booking ON public.booking_services(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_services_type ON public.booking_services(service_type);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. AVAILABILITY_SLOTS — Recurring and one-time availability
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.availability_slots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Provider reference
  provider_type TEXT NOT NULL CHECK (provider_type IN ('sitter', 'groomer', 'trainer')),
  provider_id UUID NOT NULL,
  
  -- Slot type
  slot_type TEXT NOT NULL DEFAULT 'one_time' CHECK (slot_type IN ('one_time', 'recurring')),
  
  -- For one-time slots
  specific_date DATE,
  
  -- For recurring slots
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Sunday, 6 = Saturday
  
  -- Time range
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  
  -- Date range for recurring slots
  effective_from DATE DEFAULT CURRENT_DATE,
  effective_until DATE,
  
  -- Slot configuration
  slot_duration_minutes INTEGER DEFAULT 60,
  buffer_minutes INTEGER DEFAULT 0, -- Buffer between appointments
  max_bookings_per_slot INTEGER DEFAULT 1,
  
  -- Status
  is_available BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_slot_time_range CHECK (end_time > start_time),
  CONSTRAINT valid_recurring CHECK (
    (slot_type = 'one_time' AND specific_date IS NOT NULL AND day_of_week IS NULL) OR
    (slot_type = 'recurring' AND day_of_week IS NOT NULL AND specific_date IS NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_availability_provider ON public.availability_slots(provider_type, provider_id);
CREATE INDEX IF NOT EXISTS idx_availability_recurring ON public.availability_slots(slot_type, day_of_week) WHERE slot_type = 'recurring';
CREATE INDEX IF NOT EXISTS idx_availability_date ON public.availability_slots(specific_date) WHERE slot_type = 'one_time';
CREATE INDEX IF NOT EXISTS idx_availability_effective ON public.availability_slots(effective_from, effective_until);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. BLOCKED_DATES — Time off, vacation, holidays
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.blocked_dates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Provider reference
  provider_type TEXT NOT NULL CHECK (provider_type IN ('sitter', 'groomer', 'trainer')),
  provider_id UUID NOT NULL,
  
  -- Block type
  block_type TEXT NOT NULL DEFAULT 'time_off' CHECK (block_type IN ('time_off', 'vacation', 'holiday', 'sick_leave', 'personal', 'other')),
  
  -- Date range
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  
  -- Optional time range (for partial day blocks)
  start_time TIME,
  end_time TIME,
  
  -- Details
  title TEXT,
  reason TEXT,
  
  -- Recurring yearly (for holidays)
  is_recurring_yearly BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_date_range CHECK (end_date >= start_date),
  CONSTRAINT valid_time_range CHECK (start_time IS NULL OR end_time IS NULL OR end_time > start_time)
);

CREATE INDEX IF NOT EXISTS idx_blocked_dates_provider ON public.blocked_dates(provider_type, provider_id);
CREATE INDEX IF NOT EXISTS idx_blocked_dates_range ON public.blocked_dates(start_date, end_date);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 5. CALENDAR_SYNC_TOKENS — Google Calendar integration
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.calendar_sync_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- User reference
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Provider reference (optional - sync can be user-wide or provider-specific)
  provider_type TEXT CHECK (provider_type IN ('sitter', 'groomer', 'trainer')),
  provider_id UUID,
  
  -- Google OAuth tokens
  google_calendar_id TEXT,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ NOT NULL,
  
  -- Sync settings
  sync_direction TEXT DEFAULT 'bidirectional' CHECK (sync_direction IN ('to_google', 'from_google', 'bidirectional')),
  sync_enabled BOOLEAN DEFAULT TRUE,
  last_sync_at TIMESTAMPTZ,
  next_sync_token TEXT, -- Google Calendar API sync token
  
  -- Calendar settings
  default_reminder_minutes INTEGER DEFAULT 60,
  color_code TEXT, -- Color for PetPark events in Google Calendar
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, provider_type, provider_id)
);

CREATE INDEX IF NOT EXISTS idx_calendar_sync_user ON public.calendar_sync_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_sync_provider ON public.calendar_sync_tokens(provider_type, provider_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 6. ICAL_FEEDS — Public/private iCal feed configuration
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.ical_feeds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Provider reference
  provider_type TEXT NOT NULL CHECK (provider_type IN ('sitter', 'groomer', 'trainer')),
  provider_id UUID NOT NULL,
  
  -- Feed configuration
  feed_token TEXT NOT NULL UNIQUE, -- Random token for URL
  feed_name TEXT DEFAULT 'My Calendar',
  
  -- Visibility
  is_public BOOLEAN DEFAULT FALSE,
  
  -- Filters
  include_statuses TEXT[] DEFAULT ARRAY['confirmed', 'completed'],
  exclude_services TEXT[] DEFAULT ARRAY[],
  
  -- Feed settings
  include_client_details BOOLEAN DEFAULT FALSE,
  include_internal_notes BOOLEAN DEFAULT FALSE,
  
  -- Access tracking
  last_accessed_at TIMESTAMPTZ,
  access_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(provider_type, provider_id, feed_token)
);

CREATE INDEX IF NOT EXISTS idx_ical_feeds_token ON public.ical_feeds(feed_token);
CREATE INDEX IF NOT EXISTS idx_ical_feeds_provider ON public.ical_feeds(provider_type, provider_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_sync_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ical_feeds ENABLE ROW LEVEL SECURITY;

-- Bookings policies
CREATE POLICY "bookings_provider_select" ON public.bookings
  FOR SELECT USING (
    (provider_type = 'sitter' AND provider_id IN (SELECT id FROM public.sitter_profiles WHERE user_id = auth.uid())) OR
    (provider_type = 'groomer' AND provider_id IN (SELECT id FROM public.groomers WHERE user_id = auth.uid())) OR
    (provider_type = 'trainer' AND provider_id IN (SELECT id FROM public.trainers WHERE user_id = auth.uid())) OR
    client_id = auth.uid()
  );

CREATE POLICY "bookings_provider_insert" ON public.bookings
  FOR INSERT WITH CHECK (
    (provider_type = 'sitter' AND provider_id IN (SELECT id FROM public.sitter_profiles WHERE user_id = auth.uid())) OR
    (provider_type = 'groomer' AND provider_id IN (SELECT id FROM public.groomers WHERE user_id = auth.uid())) OR
    (provider_type = 'trainer' AND provider_id IN (SELECT id FROM public.trainers WHERE user_id = auth.uid())) OR
    client_id = auth.uid()
  );

CREATE POLICY "bookings_provider_update" ON public.bookings
  FOR UPDATE USING (
    (provider_type = 'sitter' AND provider_id IN (SELECT id FROM public.sitter_profiles WHERE user_id = auth.uid())) OR
    (provider_type = 'groomer' AND provider_id IN (SELECT id FROM public.groomers WHERE user_id = auth.uid())) OR
    (provider_type = 'trainer' AND provider_id IN (SELECT id FROM public.trainers WHERE user_id = auth.uid())) OR
    client_id = auth.uid()
  );

CREATE POLICY "bookings_provider_delete" ON public.bookings
  FOR DELETE USING (
    (provider_type = 'sitter' AND provider_id IN (SELECT id FROM public.sitter_profiles WHERE user_id = auth.uid())) OR
    (provider_type = 'groomer' AND provider_id IN (SELECT id FROM public.groomers WHERE user_id = auth.uid())) OR
    (provider_type = 'trainer' AND provider_id IN (SELECT id FROM public.trainers WHERE user_id = auth.uid()))
  );

-- Booking services policies (cascade from bookings)
CREATE POLICY "booking_services_select" ON public.booking_services
  FOR SELECT USING (
    booking_id IN (SELECT id FROM public.bookings WHERE 
      (provider_type = 'sitter' AND provider_id IN (SELECT id FROM public.sitter_profiles WHERE user_id = auth.uid())) OR
      (provider_type = 'groomer' AND provider_id IN (SELECT id FROM public.groomers WHERE user_id = auth.uid())) OR
      (provider_type = 'trainer' AND provider_id IN (SELECT id FROM public.trainers WHERE user_id = auth.uid())) OR
      client_id = auth.uid()
    )
  );

CREATE POLICY "booking_services_modify" ON public.booking_services
  FOR ALL USING (
    booking_id IN (SELECT id FROM public.bookings WHERE 
      (provider_type = 'sitter' AND provider_id IN (SELECT id FROM public.sitter_profiles WHERE user_id = auth.uid())) OR
      (provider_type = 'groomer' AND provider_id IN (SELECT id FROM public.groomers WHERE user_id = auth.uid())) OR
      (provider_type = 'trainer' AND provider_id IN (SELECT id FROM public.trainers WHERE user_id = auth.uid()))
    )
  );

-- Availability slots policies
CREATE POLICY "availability_public_select" ON public.availability_slots
  FOR SELECT USING (true);

CREATE POLICY "availability_provider_modify" ON public.availability_slots
  FOR ALL USING (
    (provider_type = 'sitter' AND provider_id IN (SELECT id FROM public.sitter_profiles WHERE user_id = auth.uid())) OR
    (provider_type = 'groomer' AND provider_id IN (SELECT id FROM public.groomers WHERE user_id = auth.uid())) OR
    (provider_type = 'trainer' AND provider_id IN (SELECT id FROM public.trainers WHERE user_id = auth.uid()))
  );

-- Blocked dates policies
CREATE POLICY "blocked_dates_provider_select" ON public.blocked_dates
  FOR SELECT USING (
    (provider_type = 'sitter' AND provider_id IN (SELECT id FROM public.sitter_profiles WHERE user_id = auth.uid())) OR
    (provider_type = 'groomer' AND provider_id IN (SELECT id FROM public.groomers WHERE user_id = auth.uid())) OR
    (provider_type = 'trainer' AND provider_id IN (SELECT id FROM public.trainers WHERE user_id = auth.uid()))
  );

CREATE POLICY "blocked_dates_provider_modify" ON public.blocked_dates
  FOR ALL USING (
    (provider_type = 'sitter' AND provider_id IN (SELECT id FROM public.sitter_profiles WHERE user_id = auth.uid())) OR
    (provider_type = 'groomer' AND provider_id IN (SELECT id FROM public.groomers WHERE user_id = auth.uid())) OR
    (provider_type = 'trainer' AND provider_id IN (SELECT id FROM public.trainers WHERE user_id = auth.uid()))
  );

-- Calendar sync tokens policies (user only)
CREATE POLICY "calendar_sync_user_select" ON public.calendar_sync_tokens
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "calendar_sync_user_modify" ON public.calendar_sync_tokens
  FOR ALL USING (user_id = auth.uid());

-- iCal feeds policies
CREATE POLICY "ical_feeds_provider_select" ON public.ical_feeds
  FOR SELECT USING (
    (provider_type = 'sitter' AND provider_id IN (SELECT id FROM public.sitter_profiles WHERE user_id = auth.uid())) OR
    (provider_type = 'groomer' AND provider_id IN (SELECT id FROM public.groomers WHERE user_id = auth.uid())) OR
    (provider_type = 'trainer' AND provider_id IN (SELECT id FROM public.trainers WHERE user_id = auth.uid()))
  );

CREATE POLICY "ical_feeds_provider_modify" ON public.ical_feeds
  FOR ALL USING (
    (provider_type = 'sitter' AND provider_id IN (SELECT id FROM public.sitter_profiles WHERE user_id = auth.uid())) OR
    (provider_type = 'groomer' AND provider_id IN (SELECT id FROM public.groomers WHERE user_id = auth.uid())) OR
    (provider_type = 'trainer' AND provider_id IN (SELECT id FROM public.trainers WHERE user_id = auth.uid()))
  );

-- ═══════════════════════════════════════════════════════════════════════════════
-- FUNCTIONS AND TRIGGERS
-- ═══════════════════════════════════════════════════════════════════════════════

-- Update timestamps trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_availability_slots_updated_at BEFORE UPDATE ON public.availability_slots
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blocked_dates_updated_at BEFORE UPDATE ON public.blocked_dates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_calendar_sync_tokens_updated_at BEFORE UPDATE ON public.calendar_sync_tokens
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ical_feeds_updated_at BEFORE UPDATE ON public.ical_feeds
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to check for booking conflicts
CREATE OR REPLACE FUNCTION public.check_booking_conflict(
  p_provider_type TEXT,
  p_provider_id UUID,
  p_start_time TIMESTAMPTZ,
  p_end_time TIMESTAMPTZ,
  p_exclude_booking_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  conflict_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO conflict_count
  FROM public.bookings
  WHERE provider_type = p_provider_type
    AND provider_id = p_provider_id
    AND status IN ('pending', 'confirmed')
    AND (
      (start_time, end_time) OVERLAPS (p_start_time, p_end_time)
    )
    AND (p_exclude_booking_id IS NULL OR id != p_exclude_booking_id);
  
  RETURN conflict_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get available slots for a date range
CREATE OR REPLACE FUNCTION public.get_available_slots(
  p_provider_type TEXT,
  p_provider_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  slot_date DATE,
  start_time TIME,
  end_time TIME,
  is_available BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  WITH date_range AS (
    SELECT generate_series(p_start_date, p_end_date, INTERVAL '1 day')::DATE AS dt
  ),
  recurring_slots AS (
    SELECT 
      dr.dt AS slot_date,
      av.start_time,
      av.end_time,
      av.is_available
    FROM date_range dr
    JOIN public.availability_slots av ON av.day_of_week = EXTRACT(DOW FROM dr.dt)
    WHERE av.slot_type = 'recurring'
      AND av.provider_type = p_provider_type
      AND av.provider_id = p_provider_id
      AND dr.dt BETWEEN av.effective_from AND COALESCE(av.effective_until, '2099-12-31')
  ),
  one_time_slots AS (
    SELECT 
      av.specific_date AS slot_date,
      av.start_time,
      av.end_time,
      av.is_available
    FROM public.availability_slots av
    WHERE av.slot_type = 'one_time'
      AND av.provider_type = p_provider_type
      AND av.provider_id = p_provider_id
      AND av.specific_date BETWEEN p_start_date AND p_end_date
  )
  SELECT * FROM recurring_slots
  UNION ALL
  SELECT * FROM one_time_slots
  ORDER BY slot_date, start_time;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate iCal feed token
CREATE OR REPLACE FUNCTION public.generate_ical_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Calendar Bookings System Migration
-- Created: 2025-04-07

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. BOOKINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Provider info (sitter, groomer, or trainer)
    provider_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider_type TEXT NOT NULL CHECK (provider_type IN ('sitter', 'groomer', 'trainer')),
    
    -- Client info
    client_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    client_name TEXT NOT NULL,
    client_email TEXT,
    client_phone TEXT,
    
    -- Booking details
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
    
    -- Date/Time
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    timezone TEXT DEFAULT 'Europe/Zagreb',
    
    -- Location
    location_type TEXT DEFAULT 'client_home' CHECK (location_type IN ('client_home', 'provider_location', 'other')),
    location_address TEXT,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    
    -- Pricing
    total_price DECIMAL(10, 2),
    currency TEXT DEFAULT 'EUR',
    
    -- Pet details (JSON for flexibility)
    pets JSONB DEFAULT '[]'::jsonb,
    -- Example: [{"name": "Rex", "type": "dog", "breed": "Golden Retriever", "notes": "Friendly"}]
    
    -- Internal notes
    internal_notes TEXT,
    client_notes TEXT,
    
    -- Reminders
    reminder_sent BOOLEAN DEFAULT FALSE,
    reminder_sent_at TIMESTAMPTZ,
    
    -- Google Calendar sync
    google_event_id TEXT,
    google_calendar_id TEXT,
    last_synced_at TIMESTAMPTZ,
    
    -- Metadata
    source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'client_booking', 'api', 'import')),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_time_range CHECK (end_time > start_time),
    CONSTRAINT future_booking CHECK (start_time > NOW() - INTERVAL '1 day')
);

-- Indexes for bookings
CREATE INDEX IF NOT EXISTS idx_bookings_provider ON bookings(provider_id, provider_type);
CREATE INDEX IF NOT EXISTS idx_bookings_date_range ON bookings(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_client ON bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_bookings_google_event ON bookings(google_event_id) WHERE google_event_id IS NOT NULL;

-- ============================================
-- 2. AVAILABILITY SLOTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS availability_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_type TEXT NOT NULL CHECK (user_type IN ('sitter', 'groomer', 'trainer')),
    
    -- Slot type: recurring (weekly pattern) or one-time
    slot_type TEXT NOT NULL DEFAULT 'recurring' CHECK (slot_type IN ('recurring', 'one_time')),
    
    -- For recurring: day of week (0=Sunday, 6=Saturday)
    day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
    
    -- Time (for recurring)
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    
    -- For one-time specific dates
    specific_date DATE,
    specific_start_time TIMESTAMPTZ,
    specific_end_time TIMESTAMPTZ,
    
    -- Constraints based on slot_type
    CONSTRAINT recurring_requires_day CHECK (
        (slot_type = 'recurring' AND day_of_week IS NOT NULL AND specific_date IS NULL) OR
        (slot_type = 'one_time' AND specific_date IS NOT NULL AND day_of_week IS NULL)
    ),
    CONSTRAINT valid_slot_time_range CHECK (end_time > start_time),
    
    -- Is this slot available or blocked?
    is_available BOOLEAN DEFAULT TRUE,
    
    -- Optional: max bookings per slot
    max_bookings INTEGER DEFAULT 1,
    
    -- Metadata
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for availability
CREATE INDEX IF NOT EXISTS idx_availability_user ON availability_slots(user_id, user_type);
CREATE INDEX IF NOT EXISTS idx_availability_recurring ON availability_slots(user_id, day_of_week) WHERE slot_type = 'recurring';
CREATE INDEX IF NOT EXISTS idx_availability_onetime ON availability_slots(specific_date) WHERE slot_type = 'one_time';

-- ============================================
-- 3. BLOCKED DATES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS blocked_dates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_type TEXT NOT NULL CHECK (user_type IN ('sitter', 'groomer', 'trainer')),
    
    -- Date range
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    
    -- Optional: specific time range within the day
    start_time TIME,
    end_time TIME,
    
    -- Reason
    reason TEXT,
    reason_type TEXT DEFAULT 'time_off' CHECK (reason_type IN ('time_off', 'vacation', 'sick', 'personal', 'other')),
    
    -- Is this a full day block?
    is_full_day BOOLEAN DEFAULT TRUE,
    
    -- Recurring yearly (e.g., birthday)
    is_recurring_yearly BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- Indexes for blocked dates
CREATE INDEX IF NOT EXISTS idx_blocked_dates_user ON blocked_dates(user_id, user_type);
CREATE INDEX IF NOT EXISTS idx_blocked_dates_range ON blocked_dates(start_date, end_date);

-- ============================================
-- 4. BOOKING SERVICES JUNCTION TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS booking_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    
    -- Service details (denormalized for flexibility)
    service_name TEXT NOT NULL,
    service_type TEXT NOT NULL,
    service_duration INTEGER, -- in minutes
    service_price DECIMAL(10, 2),
    
    -- Optional: link to actual service if exists
    service_id UUID,
    
    -- Quantity
    quantity INTEGER DEFAULT 1,
    
    -- Notes for this service
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_booking_services_booking ON booking_services(booking_id);

-- ============================================
-- 5. CALENDAR SYNC TOKENS (Google Calendar)
-- ============================================
CREATE TABLE IF NOT EXISTS calendar_sync_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_type TEXT NOT NULL CHECK (user_type IN ('sitter', 'groomer', 'trainer')),
    
    -- Provider
    provider TEXT NOT NULL DEFAULT 'google',
    
    -- OAuth tokens
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    token_expires_at TIMESTAMPTZ NOT NULL,
    
    -- Calendar info
    calendar_id TEXT,
    calendar_name TEXT,
    
    -- Sync settings
    sync_enabled BOOLEAN DEFAULT TRUE,
    two_way_sync BOOLEAN DEFAULT TRUE,
    last_sync_at TIMESTAMPTZ,
    next_sync_token TEXT, -- Google Calendar sync token for incremental sync
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_calendar_sync_user ON calendar_sync_tokens(user_id, user_type);
CREATE INDEX IF NOT EXISTS idx_calendar_sync_provider ON calendar_sync_tokens(provider);

-- ============================================
-- 6. BOOKING REMINDERS LOG
-- ============================================
CREATE TABLE IF NOT EXISTS booking_reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    
    -- Reminder details
    reminder_type TEXT NOT NULL CHECK (reminder_type IN ('email', 'sms', 'push')),
    scheduled_for TIMESTAMPTZ NOT NULL,
    sent_at TIMESTAMPTZ,
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
    
    -- Content
    subject TEXT,
    content TEXT,
    
    -- Error info
    error_message TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_booking_reminders_booking ON booking_reminders(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_reminders_pending ON booking_reminders(status, scheduled_for) WHERE status = 'pending';

-- ============================================
-- 7. FUNCTIONS & TRIGGERS
-- ============================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update trigger to all tables
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_availability_slots_updated_at BEFORE UPDATE ON availability_slots
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blocked_dates_updated_at BEFORE UPDATE ON blocked_dates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_sync_tokens_updated_at BEFORE UPDATE ON calendar_sync_tokens
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 8. CONFLICT DETECTION FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION check_booking_conflict(
    p_provider_id UUID,
    p_start_time TIMESTAMPTZ,
    p_end_time TIMESTAMPTZ,
    p_exclude_booking_id UUID DEFAULT NULL
)
RETURNS TABLE (
    has_conflict BOOLEAN,
    conflicting_booking_id UUID,
    conflict_reason TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        TRUE as has_conflict,
        b.id as conflicting_booking_id,
        'Overlapping booking exists'::TEXT as conflict_reason
    FROM bookings b
    WHERE b.provider_id = p_provider_id
        AND b.status NOT IN ('cancelled', 'no_show')
        AND b.id IS DISTINCT FROM p_exclude_booking_id
        AND (
            (b.start_time, b.end_time) OVERLAPS (p_start_time, p_end_time)
        )
    LIMIT 1;
    
    -- If no conflicts found
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, NULL::TEXT;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 9. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_sync_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_reminders ENABLE ROW LEVEL SECURITY;

-- Bookings policies
CREATE POLICY "Users can view their own bookings as provider" ON bookings
    FOR SELECT USING (provider_id = auth.uid());

CREATE POLICY "Users can view their own bookings as client" ON bookings
    FOR SELECT USING (client_id = auth.uid());

CREATE POLICY "Providers can create bookings" ON bookings
    FOR INSERT WITH CHECK (provider_id = auth.uid());

CREATE POLICY "Providers can update their own bookings" ON bookings
    FOR UPDATE USING (provider_id = auth.uid());

CREATE POLICY "Providers can delete their own bookings" ON bookings
    FOR DELETE USING (provider_id = auth.uid());

-- Availability slots policies
CREATE POLICY "Users can view their own availability" ON availability_slots
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own availability" ON availability_slots
    FOR ALL USING (user_id = auth.uid());

-- Blocked dates policies
CREATE POLICY "Users can view their own blocked dates" ON blocked_dates
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own blocked dates" ON blocked_dates
    FOR ALL USING (user_id = auth.uid());

-- Booking services policies
CREATE POLICY "Users can view booking services for their bookings" ON booking_services
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM bookings b 
            WHERE b.id = booking_services.booking_id 
            AND (b.provider_id = auth.uid() OR b.client_id = auth.uid())
        )
    );

CREATE POLICY "Providers can manage booking services" ON booking_services
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM bookings b 
            WHERE b.id = booking_services.booking_id 
            AND b.provider_id = auth.uid()
        )
    );

-- Calendar sync tokens policies
CREATE POLICY "Users can view their own sync tokens" ON calendar_sync_tokens
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own sync tokens" ON calendar_sync_tokens
    FOR ALL USING (user_id = auth.uid());

-- Booking reminders policies
CREATE POLICY "Users can view reminders for their bookings" ON booking_reminders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM bookings b 
            WHERE b.id = booking_reminders.booking_id 
            AND (b.provider_id = auth.uid() OR b.client_id = auth.uid())
        )
    );

-- ============================================
-- 10. SEED DATA (Optional)
-- ============================================

-- Add comment to document the schema
COMMENT ON TABLE bookings IS 'Main bookings/appointments table for sitters, groomers, and trainers';
COMMENT ON TABLE availability_slots IS 'Recurring and one-time availability slots';
COMMENT ON TABLE blocked_dates IS 'Time off, vacation, and blocked time periods';
COMMENT ON TABLE booking_services IS 'Services included in each booking';
COMMENT ON TABLE calendar_sync_tokens IS 'OAuth tokens for Google Calendar integration';
COMMENT ON TABLE booking_reminders IS 'Scheduled and sent reminders for bookings';
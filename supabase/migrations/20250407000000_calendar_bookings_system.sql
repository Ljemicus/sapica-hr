-- Calendar Bookings System Migration
-- Created: 2025-04-07
-- MODIFIED: Skip if bookings table already exists with provider_id column

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Skip entire migration if bookings table with provider_id already exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'bookings'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'provider_id'
    ) THEN
        RAISE NOTICE 'Bookings table with new structure already exists, skipping migration';
        RETURN;
    END IF;
END $$;

-- Only proceed if we haven't returned above
-- This migration creates tables only if they don't exist
-- The actual table creation is skipped by IF NOT EXISTS

-- Indexes for bookings - only create if table has our structure
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'provider_id'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_bookings_provider ON bookings(provider_id, provider_type);
        CREATE INDEX IF NOT EXISTS idx_bookings_date_range ON bookings(start_time, end_time);
        CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
        CREATE INDEX IF NOT EXISTS idx_bookings_client ON bookings(client_id);
        CREATE INDEX IF NOT EXISTS idx_bookings_google_event ON bookings(google_event_id) WHERE google_event_id IS NOT NULL;
    END IF;
END $$;

-- Other tables from this migration are skipped since 20250407_calendar_bookings.sql handles them

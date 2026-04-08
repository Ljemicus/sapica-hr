-- Fix bookings table conflict
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'bookings'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'provider_id'
    ) THEN
        ALTER TABLE public.bookings RENAME TO sitter_bookings;
        RAISE NOTICE 'Renamed old bookings to sitter_bookings';
    END IF;
END $$;

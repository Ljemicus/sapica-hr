-- Migration: Add geo-fencing support to lost_pet_alerts
-- Allows radius-based alerts with location picker

-- First add the geo columns if they don't exist
ALTER TABLE public.lost_pet_alerts
  ADD COLUMN IF NOT EXISTS location_lat DECIMAL,
  ADD COLUMN IF NOT EXISTS location_lng DECIMAL,
  ADD COLUMN IF NOT EXISTS radius_km INTEGER DEFAULT 10,
  ADD COLUMN IF NOT EXISTS use_radius BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS address TEXT;

-- Add check constraints for valid coordinates (only if columns exist and constraints don't)
DO $$
BEGIN
  -- Check and add latitude constraint
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE constraint_name = 'chk_lost_pet_alerts_lat'
  ) THEN
    ALTER TABLE public.lost_pet_alerts
      ADD CONSTRAINT chk_lost_pet_alerts_lat 
      CHECK (location_lat IS NULL OR (location_lat >= -90 AND location_lat <= 90));
  END IF;

  -- Check and add longitude constraint
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE constraint_name = 'chk_lost_pet_alerts_lng'
  ) THEN
    ALTER TABLE public.lost_pet_alerts
      ADD CONSTRAINT chk_lost_pet_alerts_lng 
      CHECK (location_lng IS NULL OR (location_lng >= -180 AND location_lng <= 180));
  END IF;

  -- Check and add radius constraint
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE constraint_name = 'chk_lost_pet_alerts_radius'
  ) THEN
    ALTER TABLE public.lost_pet_alerts
      ADD CONSTRAINT chk_lost_pet_alerts_radius 
      CHECK (radius_km IS NULL OR (radius_km >= 1 AND radius_km <= 100));
  END IF;
END $$;

-- Add index for geo queries if not exists
CREATE INDEX IF NOT EXISTS idx_lost_pet_alerts_location 
  ON public.lost_pet_alerts (location_lat, location_lng) 
  WHERE location_lat IS NOT NULL AND location_lng IS NOT NULL;

COMMENT ON COLUMN public.lost_pet_alerts.address IS 'Human-readable address for display purposes';

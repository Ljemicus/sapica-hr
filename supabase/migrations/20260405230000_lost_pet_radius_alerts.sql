-- Radius-based geo-fencing alerts for lost pets
-- Extends city/species matching with radius-based matching using haversine distance

-- ── Add geolocation columns to alert subscriptions ──

ALTER TABLE public.lost_pet_alerts
  ADD COLUMN IF NOT EXISTS location_lat DECIMAL,
  ADD COLUMN IF NOT EXISTS location_lng DECIMAL,
  ADD COLUMN IF NOT EXISTS radius_km INTEGER CHECK (radius_km > 0 AND radius_km <= 500),
  ADD COLUMN IF NOT EXISTS use_radius BOOLEAN NOT NULL DEFAULT FALSE;

-- ── Index for efficient geo queries ──

CREATE INDEX IF NOT EXISTS idx_lost_pet_alerts_geo 
  ON public.lost_pet_alerts (location_lat, location_lng) 
  WHERE use_radius = TRUE AND active = TRUE;

CREATE INDEX IF NOT EXISTS idx_lost_pet_alerts_radius_active 
  ON public.lost_pet_alerts (use_radius, active) 
  WHERE use_radius = TRUE AND active = TRUE;

-- ── Haversine distance function for PostgreSQL ──
-- Returns distance in kilometers between two lat/lng points

CREATE OR REPLACE FUNCTION public.haversine_distance(
  lat1 DECIMAL,
  lng1 DECIMAL,
  lat2 DECIMAL,
  lng2 DECIMAL
)
RETURNS DECIMAL
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  R DECIMAL := 6371; -- Earth radius in kilometers
  dlat DECIMAL;
  dlng DECIMAL;
  a DECIMAL;
  c DECIMAL;
BEGIN
  -- Convert degrees to radians
  dlat := RADIANS(lat2 - lat1);
  dlng := RADIANS(lng2 - lng1);
  
  a := SIN(dlat / 2) * SIN(dlat / 2) +
       COS(RADIANS(lat1)) * COS(RADIANS(lat2)) *
       SIN(dlng / 2) * SIN(dlng / 2);
  
  c := 2 * ATAN2(SQRT(a), SQRT(1 - a));
  
  RETURN R * c;
END;
$$;

COMMENT ON FUNCTION public.haversine_distance IS 'Calculate great-circle distance between two lat/lng points in kilometers';

-- ── Function to find subscribers within radius of a point ──

CREATE OR REPLACE FUNCTION public.get_subscribers_within_radius(
  p_lat DECIMAL,
  p_lng DECIMAL,
  p_species TEXT,
  p_exclude_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  alert_id UUID,
  user_id UUID,
  email TEXT,
  name TEXT,
  distance_km DECIMAL
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id AS alert_id,
    a.user_id,
    u.email,
    u.name,
    public.haversine_distance(p_lat, p_lng, a.location_lat, a.location_lng) AS distance_km
  FROM public.lost_pet_alerts a
  JOIN public.users u ON u.id = a.user_id
  WHERE a.active = TRUE
    AND a.use_radius = TRUE
    AND a.location_lat IS NOT NULL
    AND a.location_lng IS NOT NULL
    AND a.radius_km IS NOT NULL
    AND (p_exclude_user_id IS NULL OR a.user_id != p_exclude_user_id)
    AND (a.species = p_species OR a.species = 'sve')
    AND public.haversine_distance(p_lat, p_lng, a.location_lat, a.location_lng) <= a.radius_km
  ORDER BY distance_km;
END;
$$;

COMMENT ON FUNCTION public.get_subscribers_within_radius IS 'Find all active radius-based alert subscribers within range of given coordinates';

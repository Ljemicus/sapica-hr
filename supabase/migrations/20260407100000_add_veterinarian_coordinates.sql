-- Add latitude and longitude columns to veterinarians table
ALTER TABLE public.veterinarians 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Add index for geospatial queries
CREATE INDEX IF NOT EXISTS idx_veterinarians_coordinates 
ON public.veterinarians(latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Add comment explaining the columns
COMMENT ON COLUMN public.veterinarians.latitude IS 'Geographic latitude for map display';
COMMENT ON COLUMN public.veterinarians.longitude IS 'Geographic longitude for map display';
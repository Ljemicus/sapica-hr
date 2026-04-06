-- Add instant_booking flag to sitter_profiles
ALTER TABLE sitter_profiles ADD COLUMN IF NOT EXISTS instant_booking BOOLEAN DEFAULT FALSE;

-- Add comment explaining the feature
COMMENT ON COLUMN sitter_profiles.instant_booking IS 'When TRUE, owners can book and pay immediately without waiting for sitter approval';

-- Create index for filtering instant booking sitters
CREATE INDEX IF NOT EXISTS idx_sitter_profiles_instant_booking ON sitter_profiles(instant_booking) WHERE instant_booking = TRUE;

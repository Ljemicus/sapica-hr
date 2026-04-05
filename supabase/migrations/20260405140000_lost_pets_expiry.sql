-- Lost pet listings expire after 30 days to keep the board fresh.
-- Owners can renew (extend) their listing before or after expiry.

ALTER TABLE lost_pets
  ADD COLUMN expires_at TIMESTAMPTZ,
  ADD COLUMN reminder_sent_at TIMESTAMPTZ;

-- Back-fill: existing "lost" listings get 30 days from created_at
UPDATE lost_pets
  SET expires_at = created_at + INTERVAL '30 days'
  WHERE status = 'lost' AND expires_at IS NULL;

-- "found" listings don't need expiry, leave NULL

-- Extend status CHECK to allow 'expired' for lifecycle management
ALTER TABLE lost_pets DROP CONSTRAINT IF EXISTS lost_pets_status_check;
ALTER TABLE lost_pets ADD CONSTRAINT lost_pets_status_check CHECK (status IN ('lost', 'found', 'expired'));

CREATE INDEX idx_lost_pets_expires_at ON lost_pets (expires_at);

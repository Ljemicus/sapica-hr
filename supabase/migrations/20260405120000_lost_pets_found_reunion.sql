-- Enrich "mark as found" with reunion details

ALTER TABLE public.lost_pets
  ADD COLUMN found_at TIMESTAMPTZ,
  ADD COLUMN found_method TEXT CHECK (found_method IN ('sighting', 'returned_home', 'shelter', 'other')),
  ADD COLUMN reunion_message TEXT;

-- Backfill: any already-found pets get found_at = created_at (best available approximation)
UPDATE public.lost_pets
  SET found_at = created_at
  WHERE status = 'found' AND found_at IS NULL;

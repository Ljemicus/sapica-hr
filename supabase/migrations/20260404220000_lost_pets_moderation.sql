-- Add moderation support to lost_pets: hidden flag + admin policies

-- 1. Add hidden column (default false, not visible to public)
ALTER TABLE public.lost_pets
  ADD COLUMN hidden BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Index for filtering
CREATE INDEX idx_lost_pets_hidden ON public.lost_pets(hidden);

-- 3. Allow admins to update any lost_pet (for hide/unhide)
CREATE POLICY "Admins can update any lost pet"
  ON public.lost_pets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 4. Allow admins to delete lost pets
CREATE POLICY "Admins can delete lost pets"
  ON public.lost_pets FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

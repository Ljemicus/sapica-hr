-- Add is_demo column to sitter_bookings_old for seed data compatibility
ALTER TABLE public.sitter_bookings_old
  ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_sitter_bookings_old_is_demo ON public.sitter_bookings_old(is_demo);

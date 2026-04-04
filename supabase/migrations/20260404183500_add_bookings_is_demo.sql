ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE public.bookings
SET is_demo = TRUE
WHERE id IN (
  '00004444-4444-4444-4444-444444444444',
  'book1111-1111-1111-1111-111111111111',
  'book2222-2222-2222-2222-222222222222',
  'bookffff-ffff-ffff-ffff-ffffffffffff'
);

CREATE INDEX IF NOT EXISTS idx_bookings_is_demo ON public.bookings(is_demo);

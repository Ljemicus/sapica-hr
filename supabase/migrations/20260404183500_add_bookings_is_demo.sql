ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE public.bookings
SET is_demo = TRUE
WHERE id = '00004444-4444-4444-4444-444444444444';

CREATE INDEX IF NOT EXISTS idx_bookings_is_demo ON public.bookings(is_demo);

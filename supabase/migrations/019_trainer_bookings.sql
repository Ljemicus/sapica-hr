-- 019_trainer_bookings.sql
-- Minimal trainer bookings table for slot-conflict awareness (Phase 5).
-- Full booking UX (create / cancel / status management) is Phase 6.

CREATE TABLE IF NOT EXISTS public.trainer_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id UUID NOT NULL REFERENCES public.trainers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_id UUID REFERENCES public.training_programs(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'rejected', 'completed', 'cancelled')),
  pet_name TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trainer_bookings_trainer
  ON public.trainer_bookings(trainer_id);
CREATE INDEX IF NOT EXISTS idx_trainer_bookings_trainer_date
  ON public.trainer_bookings(trainer_id, date);
CREATE INDEX IF NOT EXISTS idx_trainer_bookings_user
  ON public.trainer_bookings(user_id);

-- RLS
ALTER TABLE public.trainer_bookings ENABLE ROW LEVEL SECURITY;

-- Public read so the availability query can filter booked slots for any viewer
CREATE POLICY "trainer_bookings_public_read"
  ON public.trainer_bookings FOR SELECT
  USING (true);

-- Only the booking owner can insert
CREATE POLICY "trainer_bookings_auth_insert"
  ON public.trainer_bookings FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Trainer or booking owner can update (status changes)
CREATE POLICY "trainer_bookings_auth_update"
  ON public.trainer_bookings FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR trainer_id IN (SELECT id FROM public.trainers WHERE user_id = auth.uid())
  );

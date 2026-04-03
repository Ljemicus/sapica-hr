-- 018_trainer_availability.sql
-- Adds time-slot availability for trainers, mirroring the groomer availability model.

CREATE TABLE IF NOT EXISTS public.trainer_availability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id UUID NOT NULL REFERENCES public.trainers(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(trainer_id, date, start_time)
);

CREATE INDEX IF NOT EXISTS idx_trainer_availability_trainer
  ON public.trainer_availability(trainer_id);
CREATE INDEX IF NOT EXISTS idx_trainer_availability_date
  ON public.trainer_availability(trainer_id, date);

-- RLS
ALTER TABLE public.trainer_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trainer_availability_public_read"
  ON public.trainer_availability FOR SELECT
  USING (true);

CREATE POLICY "trainer_availability_auth_insert"
  ON public.trainer_availability FOR INSERT
  TO authenticated
  WITH CHECK (
    trainer_id IN (SELECT id FROM public.trainers WHERE user_id = auth.uid())
  );

CREATE POLICY "trainer_availability_auth_update"
  ON public.trainer_availability FOR UPDATE
  TO authenticated
  USING (
    trainer_id IN (SELECT id FROM public.trainers WHERE user_id = auth.uid())
  );

CREATE POLICY "trainer_availability_auth_delete"
  ON public.trainer_availability FOR DELETE
  TO authenticated
  USING (
    trainer_id IN (SELECT id FROM public.trainers WHERE user_id = auth.uid())
  );

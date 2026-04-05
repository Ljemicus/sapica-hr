-- Community alerts: users subscribe to new lost-pet listings by city + species.
-- A cron job matches new listings against subscriptions and dispatches emails.

-- ── Subscription table ──

CREATE TABLE public.lost_pet_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  city TEXT NOT NULL,
  species TEXT NOT NULL CHECK (species IN ('pas', 'macka', 'ostalo', 'sve')),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (user_id, city, species)
);

CREATE INDEX idx_lost_pet_alerts_active ON public.lost_pet_alerts (city, species) WHERE active = TRUE;

ALTER TABLE public.lost_pet_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own alert subscriptions"
  ON public.lost_pet_alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert alert subscriptions"
  ON public.lost_pet_alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own alert subscriptions"
  ON public.lost_pet_alerts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own alert subscriptions"
  ON public.lost_pet_alerts FOR DELETE
  USING (auth.uid() = user_id);

-- ── Track which listings have had alerts dispatched ──

ALTER TABLE public.lost_pets
  ADD COLUMN alerts_dispatched_at TIMESTAMPTZ;

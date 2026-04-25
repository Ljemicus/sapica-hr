-- Cycle 22 GDPR soft-delete support.
-- Adds the canonical grace-period marker used by /api/account/delete and /api/cron/retention.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

CREATE INDEX IF NOT EXISTS profiles_deleted_at_idx
  ON public.profiles (deleted_at)
  WHERE deleted_at IS NOT NULL;

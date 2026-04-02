-- ════════════════════════════════════════════════════════
-- Trainer Linking Support
-- Add user_id, phone, email, address to trainers table
-- (mirrors what 010 did for groomers)
-- ════════════════════════════════════════════════════════

ALTER TABLE public.trainers ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.trainers ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.trainers ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.trainers ADD COLUMN IF NOT EXISTS address TEXT;

-- Index for user_id lookups
CREATE INDEX IF NOT EXISTS idx_trainers_user_id ON public.trainers(user_id);

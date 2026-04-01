ALTER TABLE public.veterinarians
  ADD COLUMN IF NOT EXISTS emergency_mode TEXT CHECK (emergency_mode IN ('open_24h', 'on_call', 'emergency_contact', 'emergency_intake')),
  ADD COLUMN IF NOT EXISTS emergency_phone TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS emergency_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS emergency_source_note TEXT DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_veterinarians_emergency_verified ON public.veterinarians(emergency_verified);
CREATE INDEX IF NOT EXISTS idx_veterinarians_emergency_city ON public.veterinarians(city) WHERE emergency_verified = TRUE;

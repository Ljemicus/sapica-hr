CREATE TABLE IF NOT EXISTS public.veterinarians (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  organization_name TEXT DEFAULT '',
  branch_name TEXT DEFAULT '',
  type TEXT NOT NULL DEFAULT 'veterinarska_ambulanta' CHECK (type IN ('veterinarska_stanica', 'veterinarska_ambulanta')),
  official_type TEXT DEFAULT '',
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT DEFAULT '',
  county TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  website TEXT DEFAULT '',
  oib TEXT DEFAULT '',
  source_registry_no TEXT DEFAULT '',
  source TEXT DEFAULT '',
  status TEXT DEFAULT 'active',
  verified BOOLEAN DEFAULT TRUE,
  emergency_mode TEXT CHECK (emergency_mode IN ('open_24h', 'on_call', 'emergency_contact', 'emergency_intake')),
  emergency_phone TEXT DEFAULT '',
  emergency_verified BOOLEAN DEFAULT FALSE,
  emergency_source_note TEXT DEFAULT '',
  review_count INTEGER DEFAULT 0,
  rating DECIMAL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.veterinarians ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read veterinarians" ON public.veterinarians;
CREATE POLICY "Public read veterinarians" ON public.veterinarians FOR SELECT USING (true);

CREATE INDEX IF NOT EXISTS idx_veterinarians_city ON public.veterinarians(city);
CREATE INDEX IF NOT EXISTS idx_veterinarians_type ON public.veterinarians(type);
CREATE INDEX IF NOT EXISTS idx_veterinarians_slug ON public.veterinarians(slug);
CREATE INDEX IF NOT EXISTS idx_veterinarians_emergency_verified ON public.veterinarians(emergency_verified);
CREATE INDEX IF NOT EXISTS idx_veterinarians_emergency_city ON public.veterinarians(city) WHERE emergency_verified = TRUE;

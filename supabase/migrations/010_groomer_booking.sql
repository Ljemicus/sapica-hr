-- ════════════════════════════════════════════════════════
-- Groomer Booking System
-- Real availability slots + booking management
-- ════════════════════════════════════════════════════════

-- Groomer availability: time slots per day
CREATE TABLE IF NOT EXISTS public.groomer_availability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  groomer_id UUID NOT NULL REFERENCES public.groomers(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_duration_minutes INTEGER DEFAULT 60,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(groomer_id, date, start_time)
);

-- Groomer bookings
CREATE TABLE IF NOT EXISTS public.groomer_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  groomer_id UUID NOT NULL REFERENCES public.groomers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service TEXT NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  price DECIMAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected', 'completed', 'cancelled')),
  pet_name TEXT,
  pet_type TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Extend groomers table
ALTER TABLE public.groomers ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.groomers ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.groomers ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.groomers ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.groomers ADD COLUMN IF NOT EXISTS working_hours JSONB DEFAULT '{"pon": {"start": "09:00", "end": "17:00"}, "uto": {"start": "09:00", "end": "17:00"}, "sri": {"start": "09:00", "end": "17:00"}, "cet": {"start": "09:00", "end": "17:00"}, "pet": {"start": "09:00", "end": "17:00"}}';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ga_groomer ON public.groomer_availability(groomer_id);
CREATE INDEX IF NOT EXISTS idx_ga_date ON public.groomer_availability(groomer_id, date);
CREATE INDEX IF NOT EXISTS idx_gb_groomer ON public.groomer_bookings(groomer_id);
CREATE INDEX IF NOT EXISTS idx_gb_user ON public.groomer_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_gb_date ON public.groomer_bookings(groomer_id, date);

-- RLS
ALTER TABLE public.groomer_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groomer_bookings ENABLE ROW LEVEL SECURITY;

-- Availability: public read
CREATE POLICY "Public read groomer_availability" ON public.groomer_availability FOR SELECT USING (true);

-- Availability: groomer owner manages
CREATE POLICY "Groomer manages own availability" ON public.groomer_availability FOR ALL USING (
  groomer_id IN (SELECT id FROM public.groomers WHERE user_id = auth.uid())
);

-- Bookings: user sees own
CREATE POLICY "User sees own groomer_bookings" ON public.groomer_bookings FOR SELECT USING (user_id = auth.uid());

-- Bookings: groomer sees own shop's bookings
CREATE POLICY "Groomer sees own bookings" ON public.groomer_bookings FOR SELECT USING (
  groomer_id IN (SELECT id FROM public.groomers WHERE user_id = auth.uid())
);

-- Bookings: authenticated user can create
CREATE POLICY "User creates groomer_booking" ON public.groomer_bookings FOR INSERT WITH CHECK (user_id = auth.uid());

-- Bookings: groomer can update status
CREATE POLICY "Groomer updates booking status" ON public.groomer_bookings FOR UPDATE USING (
  groomer_id IN (SELECT id FROM public.groomers WHERE user_id = auth.uid())
);

-- Bookings: user can cancel own
CREATE POLICY "User cancels own booking" ON public.groomer_bookings FOR UPDATE USING (user_id = auth.uid());

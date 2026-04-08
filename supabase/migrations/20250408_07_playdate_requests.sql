-- Playdate requests (nearby pet matching)
CREATE TABLE public.playdate_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE NOT NULL,
  target_pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE NOT NULL,
  requester_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  target_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
  message TEXT,
  proposed_date DATE,
  proposed_location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lost Pets table
CREATE TABLE public.lost_pets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  species TEXT NOT NULL CHECK (species IN ('pas', 'macka', 'ostalo')),
  breed TEXT,
  color TEXT NOT NULL,
  gender TEXT CHECK (gender IN ('muško', 'žensko')),
  description TEXT,
  special_marks TEXT,
  last_seen_location TEXT, -- neighborhood/street
  last_seen_city TEXT NOT NULL,
  last_seen_date DATE NOT NULL,
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_email TEXT,
  has_microchip BOOLEAN DEFAULT FALSE,
  has_collar BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'lost' CHECK (status IN ('lost', 'found')),
  images TEXT[] DEFAULT '{}',
  lat DECIMAL,
  lng DECIMAL,
  share_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lost Pet Sightings table
CREATE TABLE public.lost_pet_sightings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lost_pet_id UUID REFERENCES public.lost_pets(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  location TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.lost_pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lost_pet_sightings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lost_pets
-- Everyone can read
CREATE POLICY "Lost pets are viewable by everyone"
  ON public.lost_pets FOR SELECT USING (true);

-- Authenticated users can insert
CREATE POLICY "Authenticated users can insert lost pets"
  ON public.lost_pets FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Owners can update their own
CREATE POLICY "Users can update own lost pets"
  ON public.lost_pets FOR UPDATE
  USING (auth.uid() = user_id);

-- Owners can delete their own
CREATE POLICY "Users can delete own lost pets"
  ON public.lost_pets FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for lost_pet_sightings
-- Everyone can read
CREATE POLICY "Lost pet sightings are viewable by everyone"
  ON public.lost_pet_sightings FOR SELECT USING (true);

-- Authenticated users can insert
CREATE POLICY "Authenticated users can insert sightings"
  ON public.lost_pet_sightings FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Indexes
CREATE INDEX idx_lost_pets_city ON public.lost_pets(last_seen_city);
CREATE INDEX idx_lost_pets_status ON public.lost_pets(status);
CREATE INDEX idx_lost_pets_species ON public.lost_pets(species);
CREATE INDEX idx_lost_pets_created ON public.lost_pets(created_at DESC);
CREATE INDEX idx_lost_pet_sightings_pet ON public.lost_pet_sightings(lost_pet_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_lost_pet_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_lost_pet_updated
  BEFORE UPDATE ON public.lost_pets
  FOR EACH ROW
  EXECUTE FUNCTION update_lost_pet_updated_at();

-- Storage bucket for lost pet images
INSERT INTO storage.buckets (id, name, public)
VALUES ('lost-pet-images', 'lost-pet-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can view lost pet images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'lost-pet-images');

CREATE POLICY "Authenticated users can upload lost pet images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'lost-pet-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete own lost pet images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'lost-pet-images' AND auth.uid()::text = (storage.foldername(name))[1]);

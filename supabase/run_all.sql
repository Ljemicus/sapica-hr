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

-- SEED DATA

-- Seed data for lost_pets table
-- Run after creating the tables

INSERT INTO public.lost_pets (id, name, species, breed, color, gender, description, special_marks, last_seen_location, last_seen_city, last_seen_date, contact_name, contact_phone, contact_email, has_microchip, has_collar, status, images, lat, lng, share_count) VALUES

('a1b2c3d4-1111-4000-8000-000000000001', 'Rex', 'pas', 'Njemački ovčar', 'Crno-smeđi', 'muško',
 'Rex je pobjegao iz dvorišta tijekom oluje. Vrlo je prijazan ali može biti plašljiv s nepoznatim ljudima. Reagira na ime. Zadnji put viđen kako trči prema parku.',
 'Ožiljak na lijevom uhu, crna mrlja na leđima',
 'Maksimir', 'Zagreb', '2026-03-20',
 'Marko Horvat', '+385 91 234 5678', 'marko.horvat@email.hr',
 true, true, 'lost',
 ARRAY['https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=800'],
 45.8281, 16.0121, 47),

('a1b2c3d4-2222-4000-8000-000000000002', 'Mia', 'macka', 'Perzijska', 'Bijela', 'žensko',
 'Mia je nestala s balkona drugog kata. Unutrašnja mačka, nije naviknuta na vanjski prostor. Vrlo mirna i tiha, vjerojatno se skriva negdje u blizini.',
 'Zelene oči, dugačka bijela dlaka, ružičasti nosić',
 'Trešnjevka', 'Zagreb', '2026-03-18',
 'Ana Kovačević', '+385 92 345 6789', 'ana.kovacevic@email.hr',
 true, false, 'lost',
 ARRAY['https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=800'],
 45.7980, 15.9490, 92),

('a1b2c3d4-3333-4000-8000-000000000003', 'Bruno', 'pas', 'Zlatni retriver', 'Zlatni', 'muško',
 'Bruno se izgubio tijekom šetnje u parku. Nosi plavu ogrlicu s imenom i brojem telefona. Jako prijateljski nastrojen, voli ljude i djecu.',
 'Nosi plavu ogrlicu s privjeskom u obliku kosti',
 'Spinut', 'Split', '2026-03-22',
 'Ivan Jurić', '+385 95 456 7890', 'ivan.juric@email.hr',
 true, true, 'lost',
 ARRAY['https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=800'],
 43.5147, 16.4435, 128),

('a1b2c3d4-4444-4000-8000-000000000004', 'Luna', 'macka', 'Domaća kratkodlaka', 'Crno-bijela', 'žensko',
 'Luna je pronađena na parkiralištu trgovačkog centra. Ima crvenu ogrlicu ali bez podataka za kontakt. Vrlo gladna i uplašena ali dopušta da je se dotakne.',
 'Crno-bijeli uzorak, crvena ogrlica bez privjeska',
 'Kantrida', 'Rijeka', '2026-03-15',
 'Petra Novak', '+385 99 567 8901', 'petra.novak@email.hr',
 false, true, 'found',
 ARRAY['https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=800'],
 45.3351, 14.3979, 65),

('a1b2c3d4-5555-4000-8000-000000000005', 'Charlie', 'pas', 'Beagle', 'Trokolor', 'muško',
 'Charlie je pobjegao iz auta na benzinskoj stanici. Ima GPS ogrlicu ali baterija se ispraznila. Reagira na zvuk vrećice s hranom.',
 'Specifičan uzorak na glavi, mala bijela mrlja na prsima',
 'Trstenik', 'Split', '2026-03-21',
 'Tomislav Babić', '+385 91 678 9012', 'tomislav.babic@email.hr',
 true, true, 'lost',
 ARRAY['https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=800'],
 43.5050, 16.4650, 84),

('a1b2c3d4-6666-4000-8000-000000000006', 'Whiskers', 'macka', 'Maine Coon', 'Smeđe-sivi tabby', 'muško',
 'Whiskers je pronađen u podrumu zgrade. Veliki mačak, oko 7kg, veoma prijazan. Traži se vlasnik!',
 'Izuzetno velika mačka, čupave šape, dugačak rep',
 'Centar', 'Osijek', '2026-03-19',
 'Maja Vuković', '+385 98 789 0123', 'maja.vukovic@email.hr',
 false, false, 'found',
 ARRAY['https://images.unsplash.com/photo-1615497001839-b0a0eac3274c?w=800'],
 45.5550, 18.6955, 33);

-- Seed sightings
INSERT INTO public.lost_pet_sightings (lost_pet_id, location, description) VALUES
('a1b2c3d4-1111-4000-8000-000000000001', 'Maksimirska cesta kod broja 120', 'Vidio sam psa koji odgovara opisu kako trči prema parku oko 18h.'),
('a1b2c3d4-1111-4000-8000-000000000001', 'Park Maksimir, kod 5. jezera', 'Mislim da sam vidio ovog psa kako pije vodu kod jezera jutros oko 7h.'),
('a1b2c3d4-2222-4000-8000-000000000002', 'Voltino, iza Kauflanda', 'Bijela mačka viđena na kontejneru, nije se dala prići.'),
('a1b2c3d4-3333-4000-8000-000000000003', 'Plaža Bačvice', 'Zlatni retriver bez vlasnika šetao plažom, pokušao sam ga uhvatiti ali je pobjegao prema gradu.'),
('a1b2c3d4-5555-4000-8000-000000000005', 'Marjan, šumska staza', 'Beagle viđen kako njuška po stazi na Marjanu, izgledao je izgubljeno.');

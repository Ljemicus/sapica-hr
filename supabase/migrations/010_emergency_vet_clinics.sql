-- Emergency Vet Clinics table
CREATE TABLE public.emergency_vet_clinics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  website TEXT,
  is_24h BOOLEAN DEFAULT FALSE,
  services TEXT[] DEFAULT '{}',
  coordinates JSONB, -- { lat: number, lng: number }
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for city filtering
CREATE INDEX idx_emergency_vet_clinics_city ON public.emergency_vet_clinics(city);
CREATE INDEX idx_emergency_vet_clinics_active ON public.emergency_vet_clinics(is_active);

-- RLS policies
ALTER TABLE public.emergency_vet_clinics ENABLE ROW LEVEL SECURITY;

-- Everyone can read active clinics
CREATE POLICY "Anyone can view active emergency vet clinics"
  ON public.emergency_vet_clinics
  FOR SELECT
  USING (is_active = TRUE);

-- Only admins can modify
CREATE POLICY "Only admins can modify emergency vet clinics"
  ON public.emergency_vet_clinics
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Seed data for Croatia emergency vet clinics
INSERT INTO public.emergency_vet_clinics (name, address, city, phone, email, website, is_24h, services, coordinates) VALUES
-- Zagreb
('Veterinarska stanica Zagreb - Hitna pomoć', 'Heinzelova 60', 'Zagreb', '+385 1 4611 222', 'hitna@vszagreb.hr', 'https://www.vszagreb.hr', true, ARRAY['Hitna pomoć', 'Interna medicina', 'Kirurgija', 'Dijagnostika'], '{"lat": 45.815, "lng": 15.9819}'),
('Vet Centar Pantovčak', 'Pantovčak 207', 'Zagreb', '+385 1 4588 444', 'info@vetcentar.hr', 'https://www.vetcentar.hr', true, ARRAY['Hitna pomoć', 'Oftalmologija', 'Ortopedija', 'Kardiologija'], '{"lat": 45.8144, "lng": 15.978}'),
('Veterinarska ambulanta Slavonska', 'Slavonska avenija 2', 'Zagreb', '+385 1 6129 999', 'slavonska@vet-ambulanta.hr', NULL, false, ARRAY['Hitna pomoć', 'Vakcinacija', 'Pregledi'], '{"lat": 45.8006, "lng": 16.0022}'),
-- Rijeka
('Veterinarska stanica Rijeka - Hitna pomoć', 'Žabica 12', 'Rijeka', '+385 51 337 777', 'hitna@vet-rijeka.hr', 'https://www.vet-rijeka.hr', true, ARRAY['Hitna pomoć', 'Kirurgija', 'Interna medicina', 'Dijagnostika'], '{"lat": 45.3271, "lng": 14.4422}'),
('Vet Centar Rijeka', 'Martinkovac 10', 'Rijeka', '+385 51 311 555', 'info@vetcentar-rijeka.hr', NULL, true, ARRAY['Hitna pomoć', 'Stomatologija', 'Dermatologija', 'Oftalmologija'], '{"lat": 45.3433, "lng": 14.4092}'),
('Veterinarska ambulanta Kantrida', 'Kumičićeva 5', 'Rijeka', '+385 51 674 333', 'kantrida@vet-amb.hr', NULL, false, ARRAY['Pregledi', 'Vakcinacija', 'Hitna pomoć'], '{"lat": 45.3333, "lng": 14.3833}'),
-- Split
('Veterinarska stanica Split - Hitna pomoć', 'Vukovarska 100', 'Split', '+385 21 345 678', 'hitna@vetsplit.hr', 'https://www.vetsplit.hr', true, ARRAY['Hitna pomoć', 'Kirurgija', 'Interna medicina'], '{"lat": 43.5081, "lng": 16.4402}'),
('Vet Centar Split', 'Put Brodarice 12', 'Split', '+385 21 399 888', 'info@vetcentar-split.hr', NULL, false, ARRAY['Hitna pomoć', 'Dijagnostika', 'Vakcinacija'], '{"lat": 43.5147, "lng": 16.4435}'),
-- Osijek
('Veterinarska stanica Osijek - Hitna pomoć', 'Sjenjak 45', 'Osijek', '+385 31 205 555', 'hitna@vetosijek.hr', NULL, true, ARRAY['Hitna pomoć', 'Kirurgija', 'Interna medicina'], '{"lat": 45.5511, "lng": 18.6939}'),
-- Pula
('Veterinarska ambulanta Pula - Hitna pomoć', 'Scalierova 12', 'Pula', '+385 52 211 333', 'hitna@vetpula.hr', NULL, true, ARRAY['Hitna pomoć', 'Pregledi', 'Vakcinacija'], '{"lat": 44.8666, "lng": 13.8496}'),
-- Zadar
('Vet Centar Zadar', 'Obala kralja Petra Krešimira IV 12', 'Zadar', '+385 23 251 999', 'info@vetzadar.hr', NULL, false, ARRAY['Hitna pomoć', 'Dijagnostika', 'Kirurgija'], '{"lat": 44.1194, "lng": 15.2314}'),
-- Dubrovnik
('Veterinarska stanica Dubrovnik', 'Pera Čingrije 12', 'Dubrovnik', '+385 20 423 333', 'info@vetdubrovnik.hr', NULL, false, ARRAY['Hitna pomoć', 'Pregledi', 'Vakcinacija'], '{"lat": 42.6507, "lng": 18.0944}');

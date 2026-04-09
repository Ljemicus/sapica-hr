-- Testni izgubljeni ljubimac za PetPark
-- Pokreni ovo u Supabase SQL Editoru

-- Prvo provjeri postoji li testni korisnik (koristi postojećeg admin korisnika)
-- Zamijeni USER_ID s tvojim stvarnim user ID-jem iz auth.users tablice

INSERT INTO public.lost_pets (
  user_id,
  name,
  species,
  breed,
  color,
  sex,
  image_url,
  city,
  neighborhood,
  date_lost,
  status,
  description,
  special_marks,
  has_microchip,
  has_collar,
  contact_name,
  contact_phone,
  contact_email
) VALUES (
  '00000000-0000-0000-0000-000000000000', -- Zamijeni s pravim user_id
  'Max',
  'pas',
  'Zlatni retriver',
  'Zlatna',
  'muško',
  'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&q=80',
  'Rijeka',
  'Trsat',
  NOW() - INTERVAL '3 days',
  'lost',
  'Max je nestao tijekom šetnje kod Trsatskih stuba. Odgovara na svoje ime, vrlo je druželjubiv. Nosio je crvenu ogrlicu s metalnom pločicom.',
  'Mali ožiljak na lijevom uhu, crvena ogrlica',
  true,
  true,
  'Ivan Horvat',
  '+385 91 234 5678',
  'ivan.horvat@email.com'
);

-- Dodaj još jednog - mačku
INSERT INTO public.lost_pets (
  user_id,
  name,
  species,
  breed,
  color,
  sex,
  image_url,
  city,
  neighborhood,
  date_lost,
  status,
  description,
  special_marks,
  has_microchip,
  has_collar,
  contact_name,
  contact_phone,
  contact_email
) VALUES (
  '00000000-0000-0000-0000-000000000000', -- Zamijeni s pravim user_id
  'Mica',
  'macka',
  'Europska kratkodlaka',
  'Siva s bijelim šapama',
  'žensko',
  'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&q=80',
  'Zagreb',
  'Maksimir',
  NOW() - INTERVAL '5 days',
  'lost',
  'Mica je nestala iz dvorišta kod Maksimirske šume. Plašljiva je prema strancima. Ima bijele šape koje izgledaju kao čarape.',
  'Bijele "čarape" na svim šapama, zelena ogrlica',
  true,
  true,
  'Ana Kovač',
  '+385 92 876 5432',
  'ana.kovac@email.com'
);

SELECT 'Testni izgubljeni ljubimci dodani!' AS result;

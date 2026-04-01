-- Temporarily disable FK checks for seeding
SET session_replication_role = replica;

-- Note: In production, users are created via Supabase Auth.
-- This seed data is for development/demo purposes.
-- Run after creating test users via the Supabase dashboard or auth API.

-- For demo purposes, we'll use fixed UUIDs
-- These would match auth.users entries created separately

-- Demo Users
INSERT INTO public.users (id, email, name, role, avatar_url, phone, city) VALUES
('11111111-1111-1111-1111-111111111111', 'ana@demo.hr', 'Ana Horvat', 'sitter', '/images/sitters/ana.jpg', '+385 91 234 5678', 'Rijeka'),
('22222222-2222-2222-2222-222222222222', 'marko@demo.hr', 'Marko Novak', 'sitter', '/images/sitters/marko.jpg', '+385 92 345 6789', 'Rijeka'),
('33333333-3333-3333-3333-333333333333', 'ivana@demo.hr', 'Ivana Babić', 'sitter', '/images/sitters/ivana.jpg', '+385 93 456 7890', 'Rijeka'),
('44444444-4444-4444-4444-444444444444', 'luka@demo.hr', 'Luka Jurić', 'sitter', '/images/sitters/luka.jpg', '+385 94 567 8901', 'Rijeka'),
('55555555-5555-5555-5555-555555555555', 'petra@demo.hr', 'Petra Kovačević', 'sitter', '/images/sitters/petra.jpg', '+385 95 678 9012', 'Rijeka'),
('66666666-6666-6666-6666-666666666666', 'filip@demo.hr', 'Filip Matić', 'sitter', '/images/sitters/filip.jpg', '+385 96 789 0123', 'Zagreb'),
('77777777-7777-7777-7777-777777777777', 'maja@demo.hr', 'Maja Perić', 'sitter', '/images/sitters/maja.jpg', '+385 97 890 1234', 'Zagreb'),
('88888888-8888-8888-8888-888888888888', 'ivan@demo.hr', 'Ivan Knežević', 'sitter', '/images/sitters/ivan.jpg', '+385 98 901 2345', 'Zagreb'),
('99999999-9999-9999-9999-999999999999', 'tomislav@demo.hr', 'Tomislav Bašić', 'owner', '/images/owners/tomislav.jpg', '+385 91 012 3456', 'Rijeka'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'nina@demo.hr', 'Nina Šimunović', 'owner', '/images/owners/nina.jpg', '+385 92 123 4567', 'Zagreb'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'admin@petpark.hr', 'Admin PetPark', 'admin', NULL, NULL, 'Zagreb'),
('00111111-1111-1111-1111-111111111111', 'katarina@demo.hr', 'Katarina Tomić', 'sitter', NULL, '+385 91 111 2233', 'Osijek'),
('00222222-2222-2222-2222-222222222222', 'ante@demo.hr', 'Ante Pavlović', 'sitter', NULL, '+385 92 222 3344', 'Split'),
('00333333-3333-3333-3333-333333333333', 'lucija@demo.hr', 'Lucija Vuković', 'sitter', NULL, '+385 93 333 4455', 'Pula'),
('00444444-4444-4444-4444-444444444444', 'matej@demo.hr', 'Matej Šarić', 'sitter', NULL, '+385 94 444 5566', 'Zadar');

-- Sitter Profiles
INSERT INTO public.sitter_profiles (user_id, bio, experience_years, services, prices, verified, superhost, response_time, rating_avg, review_count, location_lat, location_lng, city, photos) VALUES
('11111111-1111-1111-1111-111111111111',
 'Obožavam životinje od malih nogu! Imam veliku kuću s ograđenim dvorištem u Rijeci. Specijalizirana sam za pse svih veličina. Vaš ljubimac će uživati u šetnjama uz more i bezbroj maženja!',
 5, '["boarding", "walking", "daycare"]'::jsonb,
 '{"boarding": 25, "walking": 10, "daycare": 20}'::jsonb,
 true, true, 'unutar 1 sata', 4.9, 23, 45.3271, 14.4422, 'Rijeka',
 '["/images/gallery/ana1.jpg", "/images/gallery/ana2.jpg"]'::jsonb),

('22222222-2222-2222-2222-222222222222',
 'Veterinarski tehničar s 3 godine iskustva u čuvanju kućnih ljubimaca. Mogu brinuti o životinjama s posebnim potrebama i davati lijekove. Živim u centru Rijeke u stanu prilagođenom za ljubimce.',
 3, '["boarding", "house-sitting", "drop-in"]'::jsonb,
 '{"boarding": 30, "house-sitting": 35, "drop-in": 15}'::jsonb,
 true, false, 'unutar 2 sata', 4.7, 15, 45.3289, 14.4380, 'Rijeka',
 '["/images/gallery/marko1.jpg"]'::jsonb),

('33333333-3333-3333-3333-333333333333',
 'Studentica biologije i velika ljubiteljica životinja. Imam iskustva s psima, mačkama i malim životinjama. Fleksibilna sam s rasporedom i uvijek dostupna za vaše ljubimce!',
 2, '["walking", "drop-in", "daycare"]'::jsonb,
 '{"walking": 8, "drop-in": 12, "daycare": 18}'::jsonb,
 true, false, 'unutar 30 minuta', 4.8, 19, 45.3310, 14.4500, 'Rijeka',
 '["/images/gallery/ivana1.jpg", "/images/gallery/ivana2.jpg"]'::jsonb),

('44444444-4444-4444-4444-444444444444',
 'Umirovljeni vatrogasac koji sada uživa čuvajući ljubimce. Imam veliku kuću na Trsatu s vrtom savršenim za trčanje. Posebno volim velike pse ali prihvaćam sve!',
 7, '["boarding", "walking", "house-sitting", "daycare"]'::jsonb,
 '{"boarding": 22, "walking": 8, "house-sitting": 30, "daycare": 18}'::jsonb,
 true, true, 'unutar 1 sata', 4.6, 31, 45.3350, 14.4550, 'Rijeka',
 '["/images/gallery/luka1.jpg"]'::jsonb),

('55555555-5555-5555-5555-555555555555',
 'Profesionalna trenerica pasa s certifikatom. Nudim i trening tijekom čuvanja! Vaš ljubimac će se vratiti kući sretniji i poslušniji. Specijalizirana za štence i mlade pse.',
 4, '["boarding", "walking", "daycare"]'::jsonb,
 '{"boarding": 28, "walking": 12, "daycare": 22}'::jsonb,
 true, false, 'unutar 2 sata', 4.5, 12, 45.3400, 14.4300, 'Rijeka',
 '["/images/gallery/petra1.jpg"]'::jsonb),

('66666666-6666-6666-6666-666666666666',
 'Živim u kući s velikim vrtom na rubu Zagreba. Imam dva vlastita psa koji obožavaju društvo. Idealno za ljubimce koji vole igru i druženje s drugim psima.',
 3, '["boarding", "walking", "daycare"]'::jsonb,
 '{"boarding": 27, "walking": 10, "daycare": 20}'::jsonb,
 true, false, 'unutar 1 sata', 4.8, 18, 45.8150, 15.9819, 'Zagreb',
 '["/images/gallery/filip1.jpg"]'::jsonb),

('77777777-7777-7777-7777-777777777777',
 'Radim od doma pa sam cijeli dan dostupna za vaše ljubimce. Imam iskustva s mačkama i psima malih pasmina. Stan je u centru Zagreba, blizu parka Maksimir.',
 2, '["house-sitting", "drop-in", "daycare"]'::jsonb,
 '{"house-sitting": 32, "drop-in": 14, "daycare": 19}'::jsonb,
 false, false, 'unutar 3 sata', 4.4, 8, 45.8200, 15.9900, 'Zagreb',
 '[]'::jsonb),

('88888888-8888-8888-8888-888888888888',
 'Iskusni čuvar ljubimaca s fokusom na starije pse i pse s posebnim potrebama. Imam mirnu kuću savršenu za ljubimce koji trebaju dodatnu njegu i pažnju.',
 6, '["boarding", "house-sitting", "drop-in"]'::jsonb,
 '{"boarding": 32, "house-sitting": 38, "drop-in": 16}'::jsonb,
 true, true, 'unutar 1 sata', 4.9, 27, 45.8100, 15.9700, 'Zagreb',
 '["/images/gallery/ivan1.jpg"]'::jsonb),

('00111111-1111-1111-1111-111111111111',
 'Odrasla sam na farmi i obožavam sve životinje. U Osijeku imam kuću s velikim dvorištem. Posebno sam iskusna s velikim pasminama pasa i egzotičnim kućnim ljubimcima.',
 4, '["boarding", "walking", "daycare", "drop-in"]'::jsonb,
 '{"boarding": 20, "walking": 7, "daycare": 15, "drop-in": 10}'::jsonb,
 true, false, 'unutar 1 sata', 4.7, 14, 45.5550, 18.6955, 'Osijek',
 '[]'::jsonb),

('00222222-2222-2222-2222-222222222222',
 'Bivši policijski trener pasa, sada u mirovini. Živim u kući blizu Marjana, savršeno za dugačke šetnje. Iskusan s agresivnim i plašljivim psima.',
 10, '["boarding", "walking", "house-sitting"]'::jsonb,
 '{"boarding": 30, "walking": 12, "house-sitting": 35}'::jsonb,
 true, true, 'unutar 30 minuta', 4.9, 35, 43.5147, 16.4435, 'Split',
 '[]'::jsonb),

('00333333-3333-3333-3333-333333333333',
 'Studentica veterine na 4. godini. Živim u Puli blizu Arene s malim ali ugodnim stanom. Specijalizirana za mačke i male pse. Nudim i osnovnu njegu (kupanje, četkanje).',
 3, '["drop-in", "daycare", "house-sitting"]'::jsonb,
 '{"drop-in": 10, "daycare": 16, "house-sitting": 28}'::jsonb,
 true, false, 'unutar 2 sata', 4.6, 11, 44.8666, 13.8496, 'Pula',
 '[]'::jsonb),

('00444444-4444-4444-4444-444444444444',
 'Radim kao fotograf pa imam fleksibilan raspored. Obožavam pse i imam tri vlastita. Kuća s dvorištem u mirnom dijelu Zadra, 5 minuta od plaže.',
 2, '["boarding", "walking", "daycare"]'::jsonb,
 '{"boarding": 24, "walking": 9, "daycare": 17}'::jsonb,
 true, false, 'unutar 1 sata', 4.5, 9, 44.1194, 15.2314, 'Zadar',
 '[]'::jsonb);

-- Pets
INSERT INTO public.pets (id, owner_id, name, species, breed, age, weight, special_needs, photo_url) VALUES
('00011111-1111-1111-1111-111111111111', '99999999-9999-9999-9999-999999999999', 'Rex', 'dog', 'Njemački ovčar', 5, 35.0, 'Treba redovitu šetnju, alergičan na piletinu', '/images/pets/rex.jpg'),
('00022222-2222-2222-2222-222222222222', '99999999-9999-9999-9999-999999999999', 'Mila', 'cat', 'Perzijska', 3, 4.5, NULL, '/images/pets/mila.jpg'),
('00033333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Luna', 'dog', 'Labrador', 2, 28.0, NULL, '/images/pets/luna.jpg'),
('00044444-4444-4444-4444-444444444444', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Whiskers', 'cat', 'Domaća kratkodlaka', 7, 5.0, 'Dijabetes - treba inzulin 2x dnevno', '/images/pets/whiskers.jpg'),
('00055555-5555-5555-5555-555555555555', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Buddy', 'dog', 'Zlatni retriver', 4, 32.0, NULL, '/images/pets/buddy.jpg');

-- Bookings
INSERT INTO public.bookings (id, owner_id, sitter_id, pet_id, service_type, start_date, end_date, status, total_price, note) VALUES
('00001111-1111-1111-1111-111111111111', '99999999-9999-9999-9999-999999999999', '11111111-1111-1111-1111-111111111111', '00011111-1111-1111-1111-111111111111', 'boarding', '2026-03-20', '2026-03-25', 'completed', 125.00, 'Rex voli šetnje ujutro'),
('00002222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', '00033333-3333-3333-3333-333333333333', 'boarding', '2026-03-28', '2026-04-02', 'accepted', 150.00, NULL),
('00003333-3333-3333-3333-333333333333', '99999999-9999-9999-9999-999999999999', '33333333-3333-3333-3333-333333333333', '00011111-1111-1111-1111-111111111111', 'walking', '2026-03-22', '2026-03-22', 'completed', 8.00, NULL),
('00004444-4444-4444-4444-444444444444', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '66666666-6666-6666-6666-666666666666', '00055555-5555-5555-5555-555555555555', 'daycare', '2026-04-01', '2026-04-01', 'pending', 20.00, 'Buddy se dobro slaže s drugim psima');

-- Reviews
INSERT INTO public.reviews (booking_id, reviewer_id, reviewee_id, rating, comment) VALUES
('00001111-1111-1111-1111-111111111111', '99999999-9999-9999-9999-999999999999', '11111111-1111-1111-1111-111111111111', 5, 'Ana je fantastična! Rex se vratio sretan i zadovoljan. Dvorište je savršeno za njega. Definitivno ćemo se vratiti!'),
('00003333-3333-3333-3333-333333333333', '99999999-9999-9999-9999-999999999999', '33333333-3333-3333-3333-333333333333', 5, 'Ivana je odlična šetačica! Rex je bio umoran i sretan nakon šetnje. Preporučujem svima!');

-- Add more reviews with generated booking IDs for completeness
INSERT INTO public.bookings (id, owner_id, sitter_id, pet_id, service_type, start_date, end_date, status, total_price) VALUES
('00005555-5555-5555-5555-555555555555', '99999999-9999-9999-9999-999999999999', '44444444-4444-4444-4444-444444444444', '00011111-1111-1111-1111-111111111111', 'boarding', '2026-02-10', '2026-02-15', 'completed', 110.00),
('00006666-6666-6666-6666-666666666666', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444444', '00033333-3333-3333-3333-333333333333', 'walking', '2026-02-20', '2026-02-20', 'completed', 8.00),
('00007777-7777-7777-7777-777777777777', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', '00055555-5555-5555-5555-555555555555', 'daycare', '2026-01-15', '2026-01-15', 'completed', 20.00),
('00008888-8888-8888-8888-888888888888', '99999999-9999-9999-9999-999999999999', '66666666-6666-6666-6666-666666666666', '00022222-2222-2222-2222-222222222222', 'house-sitting', '2026-01-20', '2026-01-25', 'completed', 160.00),
('00009999-9999-9999-9999-999999999999', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', '00044444-4444-4444-4444-444444444444', 'drop-in', '2026-02-01', '2026-02-01', 'completed', 15.00),
('b00caaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '99999999-9999-9999-9999-999999999999', '88888888-8888-8888-8888-888888888888', '00011111-1111-1111-1111-111111111111', 'boarding', '2026-02-05', '2026-02-10', 'completed', 160.00),
('b00cbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '55555555-5555-5555-5555-555555555555', '00033333-3333-3333-3333-333333333333', 'walking', '2026-03-01', '2026-03-01', 'completed', 12.00),
('b00ccccc-cccc-cccc-cccc-cccccccccccc', '99999999-9999-9999-9999-999999999999', '77777777-7777-7777-7777-777777777777', '00022222-2222-2222-2222-222222222222', 'drop-in', '2026-03-05', '2026-03-05', 'completed', 14.00);

INSERT INTO public.reviews (booking_id, reviewer_id, reviewee_id, rating, comment) VALUES
('00005555-5555-5555-5555-555555555555', '99999999-9999-9999-9999-999999999999', '44444444-4444-4444-4444-444444444444', 4, 'Luka je odličan! Kuća na Trsatu je savršena za Rex-a. Jedini minus je što je malo daleko od centra.'),
('00006666-6666-6666-6666-666666666666', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444444', 5, 'Luna je obožavala šetnju s Lukom! Vrlo pažljiv i iskusan.'),
('00007777-7777-7777-7777-777777777777', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 5, 'Buddy se odlično proveo kod Ane. Slali su nam fotke cijeli dan!'),
('00008888-8888-8888-8888-888888888888', '99999999-9999-9999-9999-999999999999', '66666666-6666-6666-6666-666666666666', 5, 'Filip je savršen čuvar! Mila je bila u odličnim rukama. Kuća je čista i sigurna.'),
('00009999-9999-9999-9999-999999999999', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 4, 'Marko je bio vrlo profesionalan. Whiskers je dobio lijekove na vrijeme. Preporučujem!'),
('b00caaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '99999999-9999-9999-9999-999999999999', '88888888-8888-8888-8888-888888888888', 5, 'Ivan je nevjerojatan! Rex s posebnim potrebama zahtijeva puno pažnje i Ivan je bio savršen.'),
('b00cbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '55555555-5555-5555-5555-555555555555', 4, 'Petra je odlična šetačica. Luna je bila sretna. Jedino bi mogla slati više fotki.'),
('b00ccccc-cccc-cccc-cccc-cccccccccccc', '99999999-9999-9999-9999-999999999999', '77777777-7777-7777-7777-777777777777', 4, 'Maja je bila super za Milu! Stan je u dobrom kvartu blizu parka.');

-- Availability (next 30 days for sitters)
INSERT INTO public.availability (sitter_id, date, available)
SELECT '11111111-1111-1111-1111-111111111111', d::date, true
FROM generate_series(CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', '1 day') d;

INSERT INTO public.availability (sitter_id, date, available)
SELECT '22222222-2222-2222-2222-222222222222', d::date,
  CASE WHEN EXTRACT(DOW FROM d) IN (0, 6) THEN false ELSE true END
FROM generate_series(CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', '1 day') d;

INSERT INTO public.availability (sitter_id, date, available)
SELECT '33333333-3333-3333-3333-333333333333', d::date, true
FROM generate_series(CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', '1 day') d;

INSERT INTO public.availability (sitter_id, date, available)
SELECT '44444444-4444-4444-4444-444444444444', d::date, true
FROM generate_series(CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', '1 day') d;

INSERT INTO public.availability (sitter_id, date, available)
SELECT '66666666-6666-6666-6666-666666666666', d::date, true
FROM generate_series(CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', '1 day') d;

INSERT INTO public.availability (sitter_id, date, available)
SELECT '88888888-8888-8888-8888-888888888888', d::date,
  CASE WHEN EXTRACT(DOW FROM d) = 0 THEN false ELSE true END
FROM generate_series(CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', '1 day') d;

-- Messages
INSERT INTO public.messages (sender_id, receiver_id, booking_id, content, read, created_at) VALUES
('99999999-9999-9999-9999-999999999999', '11111111-1111-1111-1111-111111111111', '00001111-1111-1111-1111-111111111111', 'Bok Ana! Zanima me mogu li dovesti Rex-a sljedeći tjedan?', true, NOW() - INTERVAL '5 days'),
('11111111-1111-1111-1111-111111111111', '99999999-9999-9999-9999-999999999999', '00001111-1111-1111-1111-111111111111', 'Bok Tomislave! Naravno, rado ću čuvati Rex-a. Koji datumi vam odgovaraju?', true, NOW() - INTERVAL '5 days' + INTERVAL '30 minutes'),
('99999999-9999-9999-9999-999999999999', '11111111-1111-1111-1111-111111111111', '00001111-1111-1111-1111-111111111111', 'Od 20. do 25. ožujka. Ima li mjesta?', true, NOW() - INTERVAL '4 days'),
('11111111-1111-1111-1111-111111111111', '99999999-9999-9999-9999-999999999999', '00001111-1111-1111-1111-111111111111', 'Savršeno, ti datumi mi odgovaraju! Samo napravite rezervaciju kroz aplikaciju. 🐾', true, NOW() - INTERVAL '4 days' + INTERVAL '1 hour');


-- ════════════════════════════════════════════════════════
-- Products (Shop)
-- ════════════════════════════════════════════════════════

INSERT INTO public.products (id, slug, name, category, price, original_price, description, emoji, brand, rating, review_count, in_stock, variants, specs) VALUES
('01000001-0001-0001-0001-000000000001', 'premium-suha-hrana-piletina', 'Premium suha hrana — piletina', 'hrana', 42.99, 49.99, 'Visokokvalitetna suha hrana za odrasle pse s piletinom i rižom. Bez umjetnih boja i konzervansa.', '🍖', 'PetLux', 4.8, 34, true, '[{"label":"Težina","value":"2 kg"},{"label":"Težina","value":"5 kg","priceModifier":25},{"label":"Težina","value":"12 kg","priceModifier":58}]'::jsonb, '{"Protein":"28%","Masti":"16%","Vlakna":"3%","Glavni sastojak":"Piletina"}'::jsonb),
('01000001-0001-0001-0001-000000000002', 'mokra-hrana-govedina', 'Mokra hrana — govedina i povrće', 'hrana', 3.49, NULL, 'Sočna mokra hrana za pse s govedinom, mrkvom i graškom. Bez žitarica.', '🥩', 'NaturPet', 4.6, 21, true, '[{"label":"Pakiranje","value":"400g"},{"label":"Pakiranje","value":"6x400g","priceModifier":14}]'::jsonb, '{"Protein":"10%","Masti":"6%","Vlaga":"78%","Bez žitarica":"Da"}'::jsonb),
('01000001-0001-0001-0001-000000000003', 'hrana-macke-tuna', 'Hrana za mačke — tuna i losos', 'hrana', 38.99, NULL, 'Premium suha hrana za mačke s tunom i lososom. Podržava zdravlje urinarnog trakta.', '🐟', 'FeliGourmet', 4.7, 19, true, '[{"label":"Težina","value":"1.5 kg"},{"label":"Težina","value":"4 kg","priceModifier":32}]'::jsonb, '{"Protein":"34%","Masti":"14%","Taurin":"0.15%","Omega-3":"Da"}'::jsonb),
('01000001-0001-0001-0001-000000000004', 'hrana-stenci-janjetina', 'Hrana za štence — janjetina', 'hrana', 45.99, 52.00, 'Specijalizirana hrana za štence do 12 mjeseci. S janjetinom i batatom za zdrav rast.', '🐕', 'PetLux', 4.9, 28, true, '[{"label":"Težina","value":"2 kg"},{"label":"Težina","value":"7 kg","priceModifier":35}]'::jsonb, '{"Protein":"30%","Kalcij":"1.2%","DHA":"Da","Za dob":"0-12 mjeseci"}'::jsonb),
('01000001-0001-0001-0001-000000000005', 'gumena-lopta-neunistiva', 'Gumena lopta — neuništiva', 'igracke', 9.99, NULL, 'Super izdržljiva gumena lopta za pse koji vole žvakati. Odskače visoko, savršena za igru donesi.', '🎾', 'ToughPlay', 4.5, 42, true, '[{"label":"Veličina","value":"S"},{"label":"Veličina","value":"M"},{"label":"Veličina","value":"L","priceModifier":3}]'::jsonb, '{"Materijal":"Prirodna guma","Promjer":"6-10 cm","Vodootporno":"Da"}'::jsonb),
('01000001-0001-0001-0001-000000000006', 'pliš-igracka-medvjedic', 'Plišani medvjedić s pištaljkom', 'igracke', 12.99, 15.99, 'Mekani plišani medvjedić s ugrađenom pištaljkom. Savršen za manje pse i štence.', '🧸', 'SoftPaws', 4.3, 17, true, '[{"label":"Boja","value":"Smeđa"},{"label":"Boja","value":"Bijela"},{"label":"Boja","value":"Siva"}]'::jsonb, '{"Materijal":"Eko pliš","Veličina":"25 cm","Periva":"Da"}'::jsonb),
('01000001-0001-0001-0001-000000000007', 'interaktivna-igracka-puzzle', 'Interaktivna puzzle igračka', 'igracke', 24.99, NULL, 'Puzzle igračka za mentalni trening pasa. Sakrijte poslastice i gledajte kako ih pas pronalazi.', '🧩', 'BrainPet', 4.7, 31, true, '[{"label":"Težina","value":"Početnik"},{"label":"Težina","value":"Napredni","priceModifier":5}]'::jsonb, '{"Materijal":"ABS plastika","Razina":"2 razine","BPA free":"Da"}'::jsonb),
('01000001-0001-0001-0001-000000000008', 'uze-igracka-zubi', 'Uže za zubiće — pamučno', 'igracke', 7.49, NULL, 'Pamučno uže za igru i čišćenje zuba. Prirodna vlakna masiraju desni.', '🪢', 'DentaPlay', 4.4, 23, true, '[{"label":"Veličina","value":"S"},{"label":"Veličina","value":"L","priceModifier":4}]'::jsonb, '{"Materijal":"100% pamuk","Dužina":"30-45 cm"}'::jsonb),
('01000001-0001-0001-0001-000000000009', 'povodac-reflektirajuci', 'Reflektirajući povodac', 'povodci', 18.99, 22.99, 'Najlonski povodac s reflektirajućim nitima za sigurne noćne šetnje. Ergonomska drška.', '🦮', 'SafeWalk', 4.6, 38, true, '[{"label":"Dužina","value":"1.2 m"},{"label":"Dužina","value":"1.8 m","priceModifier":4},{"label":"Dužina","value":"3 m","priceModifier":8}]'::jsonb, '{"Materijal":"Najlon + refleksija","Nosivost":"do 50 kg","Karabiner":"Metalni"}'::jsonb),
('01000001-0001-0001-0001-000000000010', 'povodac-automatski', 'Automatski povodac — 5m', 'povodci', 29.99, NULL, 'Automatski uvlačivi povodac dužine 5 metara. Ergonomski dizajn s kočnicom.', '🔄', 'FlexiPet', 4.4, 26, true, '[{"label":"Nosivost","value":"do 20 kg"},{"label":"Nosivost","value":"do 50 kg","priceModifier":10}]'::jsonb, '{"Dužina":"5 m","Materijal":"Traka","Kočnica":"Jednostruka"}'::jsonb),
('01000001-0001-0001-0001-000000000011', 'am-kožni-premium', 'Premium kožni am', 'povodci', 34.99, 39.99, 'Ručno rađen kožni am od prave kože. Mekan i udoban za svakodnevno nošenje.', '🐕‍🦺', 'LeatherPet', 4.8, 15, true, '[{"label":"Veličina","value":"S"},{"label":"Veličina","value":"M"},{"label":"Veličina","value":"L"},{"label":"Veličina","value":"XL","priceModifier":8}]'::jsonb, '{"Materijal":"Prava koža","Podstava":"Neopren","Ručni rad":"Da"}'::jsonb),
('01000001-0001-0001-0001-000000000012', 'krevet-ortopedski-memorijska', 'Ortopedski krevet — memorijska pjena', 'krevetici', 69.99, 89.99, 'Ortopedski krevet s memorijskom pjenom za starije pse i pse s problemima zglobova.', '🛏️', 'ComfyPet', 4.9, 44, true, '[{"label":"Veličina","value":"M (60x50)"},{"label":"Veličina","value":"L (80x65)","priceModifier":25},{"label":"Veličina","value":"XL (100x80)","priceModifier":45}]'::jsonb, '{"Punjenje":"Memorijska pjena","Navlaka":"Periva","Protuklizna dna":"Da"}'::jsonb),
('01000001-0001-0001-0001-000000000013', 'krevet-pelus-okrugli', 'Okrugli pelušasti krevet', 'krevetici', 39.99, NULL, 'Mekani okrugli krevet s visokim rubovima. Savršen za mačke i male pse koji se vole sklupčati.', '🐱', 'CozyCat', 4.7, 29, true, '[{"label":"Promjer","value":"50 cm"},{"label":"Promjer","value":"70 cm","priceModifier":15}]'::jsonb, '{"Materijal":"Mikro pliš","Periva":"Da na 30°C","Boja":"Siva"}'::jsonb),
('01000001-0001-0001-0001-000000000014', 'krevet-kucica-macke', 'Kućica za mačke — zatvoreni krevet', 'krevetici', 44.99, NULL, 'Zatvoreni krevet u obliku kućice. Mačke obožavaju privatnost i toplinu.', '🏠', 'CozyCat', 4.6, 18, true, '[{"label":"Veličina","value":"S"},{"label":"Veličina","value":"M","priceModifier":10}]'::jsonb, '{"Materijal":"Filc + pliš","Ulaz":"Okrugli","Periva":"Da"}'::jsonb),
('01000001-0001-0001-0001-000000000015', 'posuda-inox-dvostruka', 'Dvostruka inox posuda na stalku', 'posude', 19.99, NULL, 'Set od dvije inox posude na stabilnom stalku. Protiv klizanja, lako se čisti.', '🥣', 'DinePet', 4.5, 33, true, '[{"label":"Volumen","value":"2x350 ml"},{"label":"Volumen","value":"2x750 ml","priceModifier":8}]'::jsonb, '{"Materijal":"Nehrđajući čelik","Stalak":"Bambus","Protiv klizanja":"Da"}'::jsonb),
('01000001-0001-0001-0001-000000000016', 'sampon-prirodni-lavanda', 'Prirodni šampon — lavanda', 'njega', 14.99, NULL, 'Biljni šampon s lavandom za osjetljivu kožu. Bez parabena i sulfata. Umiruje i vlaži.', '🧴', 'BioGroom', 4.6, 27, true, '[{"label":"Volumen","value":"250 ml"},{"label":"Volumen","value":"500 ml","priceModifier":9}]'::jsonb, '{"Sastojci":"Prirodni","Bez parabena":"Da","Za":"Osjetljivu kožu"}'::jsonb),
('01000001-0001-0001-0001-000000000017', 'cetka-za-cesljanje', 'Profesionalna četka za češljanje', 'njega', 16.99, 19.99, 'Ergonomska četka za uklanjanje poddlake. Smanjuje linjanje do 90%. Za sve tipove dlake.', '✨', 'FurMaster', 4.8, 52, true, '[{"label":"Tip","value":"Kratka dlaka"},{"label":"Tip","value":"Duga dlaka"}]'::jsonb, '{"Materijal":"Čelik + silikon","Za":"Sve pasmine","Samočišćenje":"Da"}'::jsonb),
('01000001-0001-0001-0001-000000000018', 'kabanica-za-pse', 'Vodootporna kabanica za pse', 'odjeca', 22.99, 27.99, 'Lagana vodootporna kabanica s kapuljačom. Reflektirajuće trake za vidljivost.', '🌧️', 'RainPaws', 4.4, 16, true, '[{"label":"Veličina","value":"S"},{"label":"Veličina","value":"M"},{"label":"Veličina","value":"L","priceModifier":5},{"label":"Veličina","value":"XL","priceModifier":8}]'::jsonb, '{"Materijal":"Poliester","Vodootpornost":"10.000 mm","Refleksija":"Da"}'::jsonb),
('01000001-0001-0001-0001-000000000019', 'grickalice-dental-sticks', 'Dentalni štapići — svježi dah', 'grickalice', 8.99, NULL, 'Dentalni štapići koji čiste zube i osvježavaju dah. S klorofilom i mentom.', '🦴', 'DentaSnack', 4.5, 39, true, '[{"label":"Pakiranje","value":"7 kom"},{"label":"Pakiranje","value":"28 kom","priceModifier":18}]'::jsonb, '{"Veličina psa":"Srednji/Veliki","Kalorije":"85 kcal/kom","Bez šećera":"Da"}'::jsonb),
('01000001-0001-0001-0001-000000000020', 'grickalice-suseno-meso', 'Sušeno pileće meso — poslastice', 'grickalice', 11.99, 14.99, '100% prirodne poslastice od sušenog pilećeg mesa. Bez aditiva, idealne za trening.', '🍗', 'NaturTreat', 4.8, 45, true, '[{"label":"Težina","value":"100g"},{"label":"Težina","value":"250g","priceModifier":12}]'::jsonb, '{"Sastav":"100% piletina","Bez aditiva":"Da","Za trening":"Da"}'::jsonb);

-- ════════════════════════════════════════════════════════
-- Groomers
-- ════════════════════════════════════════════════════════

INSERT INTO public.groomers (id, name, city, services, prices, rating, review_count, bio, verified, specialization) VALUES
('01000001-0001-0001-0001-000000000001', 'Salon PetPark Glam', 'Zagreb', '["sisanje","kupanje","trimanje","nokti","spa"]'::jsonb, '{"sisanje":35,"kupanje":25,"trimanje":40,"nokti":10,"spa":60}'::jsonb, 4.9, 47, 'Najmoderniji salon za uljepšavanje ljubimaca u Zagrebu. 10 godina iskustva s svim pasminama.', true, 'oba'),
('01000001-0001-0001-0001-000000000002', 'PetStyle Rijeka', 'Rijeka', '["sisanje","kupanje","trimanje","nokti"]'::jsonb, '{"sisanje":30,"kupanje":20,"trimanje":35,"nokti":8}'::jsonb, 4.7, 32, 'Profesionalni grooming salon u srcu Rijeke. Koristimo samo prirodnu kozmetiku.', true, 'psi'),
('01000001-0001-0001-0001-000000000003', 'Mačji Raj', 'Zagreb', '["kupanje","trimanje","nokti","spa"]'::jsonb, '{"kupanje":30,"trimanje":45,"nokti":12,"spa":55}'::jsonb, 4.8, 23, 'Specijalizirani salon za mačke. Tiha atmosfera i nježan pristup vašoj maci.', true, 'macke'),
('01000001-0001-0001-0001-000000000004', 'Grooming Studio Split', 'Split', '["sisanje","kupanje","trimanje","nokti"]'::jsonb, '{"sisanje":28,"kupanje":18,"trimanje":32,"nokti":8}'::jsonb, 4.6, 19, 'Moderni studio za njegu pasa i mačaka u Splitu. Specijalizirani za show grooming.', true, 'oba'),
('01000001-0001-0001-0001-000000000005', 'Puffy Salon', 'Osijek', '["sisanje","kupanje","nokti"]'::jsonb, '{"sisanje":25,"kupanje":18,"nokti":7}'::jsonb, 4.5, 14, 'Obiteljski salon za njegu ljubimaca u Osijeku. Pristupačne cijene i topla atmosfera.', false, 'psi'),
('01000001-0001-0001-0001-000000000006', 'Bella Pets', 'Pula', '["sisanje","kupanje","trimanje","spa"]'::jsonb, '{"sisanje":32,"kupanje":22,"trimanje":38,"spa":50}'::jsonb, 4.7, 21, 'Luksuzni salon za kućne ljubimce u Puli. Spa tretmani s aromaterapijom.', true, 'oba'),
('01000001-0001-0001-0001-000000000007', 'ZagrebPet Care', 'Zagreb', '["sisanje","kupanje","trimanje","nokti","spa"]'::jsonb, '{"sisanje":38,"kupanje":28,"trimanje":42,"nokti":10,"spa":65}'::jsonb, 4.9, 56, 'Vrhunski salon s award-winning groomerima. Mobilni grooming dostupan.', true, 'oba'),
('01000001-0001-0001-0001-000000000008', 'Čisti Šapci', 'Zadar', '["kupanje","nokti","trimanje"]'::jsonb, '{"kupanje":20,"nokti":8,"trimanje":30}'::jsonb, 4.4, 11, 'Salon za njegu ljubimaca u centru Zadra. Blizu mora — kombinacija kupanja i šetnje!', false, 'psi');

-- Groomer Reviews
INSERT INTO public.groomer_reviews (groomer_id, author_name, author_initial, rating, comment, created_at) VALUES
('01000001-0001-0001-0001-000000000001', 'Ana M.', 'A', 5, 'Fantastičan salon! Moj maltezić izgleda prekrasno nakon svakog posjeta.', '2026-03-15T10:00:00Z'),
('01000001-0001-0001-0001-000000000001', 'Marko K.', 'M', 5, 'Profesionalni tim, čisti prostor, pas uvijek sretan. Preporučujem!', '2026-03-10T14:00:00Z'),
('01000001-0001-0001-0001-000000000002', 'Ivana P.', 'I', 5, 'Koristim njihove usluge već 3 godine. Prirodna kozmetika je super za osjetljivu kožu mog psa.', '2026-03-12T09:30:00Z'),
('01000001-0001-0001-0001-000000000003', 'Petra S.', 'P', 5, 'Jedini salon gdje se moja mačka ne boji! Nježni i strpljivi.', '2026-03-08T16:00:00Z'),
('01000001-0001-0001-0001-000000000003', 'Filip D.', 'F', 4, 'Odlična usluga za mačke. Malo skuplje, ali vrijedi svake kune.', '2026-02-28T11:00:00Z'),
('01000001-0001-0001-0001-000000000004', 'Luka T.', 'L', 5, 'Pripremili su mog pudla za izložbu. Izgledao je savršeno!', '2026-03-05T13:00:00Z'),
('01000001-0001-0001-0001-000000000006', 'Nina B.', 'N', 4, 'Spa tretman za mog zlatnog retrivera — vratio se kao novi!', '2026-03-01T15:00:00Z'),
('01000001-0001-0001-0001-000000000007', 'Tomislav R.', 'T', 5, 'Najbolji salon u Zagrebu. Mobilni grooming je savršen za starije pse.', '2026-03-18T10:30:00Z'),
('01000001-0001-0001-0001-000000000007', 'Maja L.', 'M', 5, 'Vrhunska usluga! Moj šnaucer nikad nije izgledao bolje.', '2026-03-14T12:00:00Z'),
('01000001-0001-0001-0001-000000000005', 'Ivan G.', 'I', 4, 'Pristupačne cijene i ljubazno osoblje. Moj bokser obožava dolaziti ovdje.', '2026-02-25T14:30:00Z');

-- ════════════════════════════════════════════════════════
-- Trainers
-- ════════════════════════════════════════════════════════

INSERT INTO public.trainers (id, name, city, specializations, price_per_hour, certificates, rating, review_count, bio, certified) VALUES
('01000001-0001-0001-0001-000000000001', 'Bruno Horvat', 'Zagreb', '["osnovna","napredna","ponasanje"]'::jsonb, 40, '["CPDT-KA","Karen Pryor Academy"]'::jsonb, 4.9, 38, 'Certificirani trener s 12 godina iskustva. Specijalist za pozitivnu dresuru i korekciju ponašanja.', true),
('01000001-0001-0001-0001-000000000002', 'Martina Kovač', 'Zagreb', '["osnovna","agility","stenci"]'::jsonb, 35, '["FCI Agility Judge","CPDT-KA"]'::jsonb, 4.8, 29, 'Profesionalna trenerica i agility sutkinja. Radim s psima svih dobi od štenca do veterana.', true),
('01000001-0001-0001-0001-000000000003', 'Davor Perić', 'Rijeka', '["osnovna","napredna","ponasanje"]'::jsonb, 35, '["CPDT-KA"]'::jsonb, 4.7, 22, 'Trener u Rijeci s fokusom na pozitivno potkrepljenje. Grupni i individualni treninzi uz more.', true),
('01000001-0001-0001-0001-000000000004', 'Jelena Tomić', 'Split', '["osnovna","stenci","ponasanje"]'::jsonb, 30, '["Canine Behaviour Certificate"]'::jsonb, 4.6, 17, 'Specijalistkinja za štence i rane probleme ponašanja. Kućni posjeti u Splitu i okolici.', true),
('01000001-0001-0001-0001-000000000005', 'Nikola Babić', 'Osijek', '["osnovna","napredna","agility"]'::jsonb, 28, '["CPDT-KA"]'::jsonb, 4.5, 13, 'Mladi trener s modernim pristupom dresuri. Agility trening na profesionalnom terenu u Osijeku.', true),
('01000001-0001-0001-0001-000000000006', 'Iva Matić', 'Zagreb', '["stenci","osnovna","ponasanje"]'::jsonb, 38, '["Victoria Stilwell Academy","CPDT-KA"]'::jsonb, 4.9, 41, 'Trenerica s posebnim fokusom na štence i socijalizaciju. Autorica bloga o dresuri.', true);

-- Training Programs
INSERT INTO public.training_programs (id, trainer_id, name, type, duration_weeks, sessions, price, description) VALUES
('01000001-0001-0001-0001-000000000001', '01000001-0001-0001-0001-000000000001', 'Osnovna poslušnost', 'osnovna', 6, 12, 350, 'Program osnovne poslušnosti: sjedni, lezi, ostani, dolazi, hod uz nogu. Za pse starije od 6 mjeseci.'),
('01000001-0001-0001-0001-000000000002', '01000001-0001-0001-0001-000000000001', 'Korekcija agresije', 'ponasanje', 8, 16, 520, 'Individualni program za pse s problemima agresije. Detaljna procjena i plan rada.'),
('01000001-0001-0001-0001-000000000003', '01000001-0001-0001-0001-000000000002', 'Agility za početnike', 'agility', 8, 16, 400, 'Uvod u agility sport — prepreke, tuneli, slalom. Zabavno za psa i vlasnika!'),
('01000001-0001-0001-0001-000000000004', '01000001-0001-0001-0001-000000000002', 'Škola za štence', 'stenci', 4, 8, 240, 'Rana socijalizacija i osnovne komande za štence od 8 tjedana do 6 mjeseci.'),
('01000001-0001-0001-0001-000000000005', '01000001-0001-0001-0001-000000000003', 'Osnove dresure — Rijeka', 'osnovna', 6, 12, 320, 'Grupni treninzi osnovne poslušnosti u Rijeci. Maksimalno 6 pasa po grupi.'),
('01000001-0001-0001-0001-000000000006', '01000001-0001-0001-0001-000000000004', 'Štenci bez stresa', 'stenci', 4, 8, 220, 'Nježan program za štence. Socijalizacija, osnove i rješavanje straha.'),
('01000001-0001-0001-0001-000000000007', '01000001-0001-0001-0001-000000000005', 'Agility natjecanje', 'agility', 12, 24, 600, 'Priprema za agility natjecanja. Za pse koji već poznaju osnove agility sporta.'),
('01000001-0001-0001-0001-000000000008', '01000001-0001-0001-0001-000000000006', 'Puppy Start', 'stenci', 4, 8, 280, 'Premium program za štence — socijalizacija, komande, rješavanje grizenja i skakanja.');

-- Trainer Reviews
INSERT INTO public.trainer_reviews (trainer_id, author_name, author_initial, rating, comment, created_at) VALUES
('01000001-0001-0001-0001-000000000001', 'Marko N.', 'M', 5, 'Bruno je transformirao našeg psa! Od kaotičnog šetača do poslušnog ljubimca.', '2026-03-16T10:00:00Z'),
('01000001-0001-0001-0001-000000000001', 'Ana K.', 'A', 5, 'Nevjerojatno strpljiv i stručan. Naš pas više ne vuče na povodcu.', '2026-03-10T14:00:00Z'),
('01000001-0001-0001-0001-000000000002', 'Petra V.', 'P', 5, 'Agility treninzi su fantastični! Moj border collie i ja obožavamo dolaziti.', '2026-03-12T09:30:00Z'),
('01000001-0001-0001-0001-000000000002', 'Filip M.', 'F', 4, 'Škola za štence bila je savršen start. Naš štenac je brzo naučio osnove.', '2026-03-05T16:00:00Z'),
('01000001-0001-0001-0001-000000000003', 'Ivana T.', 'I', 5, 'Grupni treninzi uz more su prekrasni. Davor zna motivirati i psa i vlasnika.', '2026-03-08T11:00:00Z'),
('01000001-0001-0001-0001-000000000004', 'Luka S.', 'L', 4, 'Jelena je pomogla našem štenciću da se navikne na gradsku buku. Hvala!', '2026-02-28T13:00:00Z'),
('01000001-0001-0001-0001-000000000005', 'Nina P.', 'N', 5, 'Agility teren u Osijeku je super. Nikola je pun energije i znanja.', '2026-03-01T15:00:00Z'),
('01000001-0001-0001-0001-000000000006', 'Tomislav B.', 'T', 5, 'Iva je čarobna s štencima. Naš mali je za tjedan dana naučio sjediti i čekati.', '2026-03-18T10:30:00Z');

-- ════════════════════════════════════════════════════════
-- Forum Categories
-- ════════════════════════════════════════════════════════

INSERT INTO public.forum_categories (slug, name, emoji, description, color, topic_count, post_count) VALUES
('pitanja', 'Pitanja', '❓', 'Postavite bilo koje pitanje o kućnim ljubimcima', 'bg-blue-100 text-blue-700', 15, 45),
('savjeti', 'Savjeti', '💡', 'Podijelite korisne savjete s zajednicom', 'bg-green-100 text-green-700', 12, 38),
('price', 'Priče', '📖', 'Ispričajte priču o svom ljubimcu', 'bg-purple-100 text-purple-700', 8, 22),
('izgubljeni', 'Izgubljeni', '🔍', 'Pomozite pronaći izgubljene ljubimce', 'bg-red-100 text-red-700', 5, 15),
('slobodna', 'Slobodna tema', '💬', 'Razgovor o svemu i svačemu', 'bg-orange-100 text-orange-700', 10, 30)
ON CONFLICT (slug) DO NOTHING;

-- ════════════════════════════════════════════════════════
-- Forum Topics
-- ════════════════════════════════════════════════════════

INSERT INTO public.forum_topics (id, category_slug, title, author_name, author_initial, author_gradient, created_at, comment_count, likes, is_pinned, is_hot) VALUES
('6d000001-0001-0001-0001-000000000001', 'pitanja', 'Koliko puta dnevno treba šetati štenaca?', 'Marko N.', 'M', 'from-blue-400 to-cyan-300', '2026-03-24T08:00:00Z', 5, 12, false, true),
('6d000001-0001-0001-0001-000000000002', 'savjeti', 'Najbolja hrana za pse s osjetljivim želucem', 'Ana K.', 'A', 'from-green-400 to-emerald-300', '2026-03-23T10:00:00Z', 4, 18, true, false),
('6d000001-0001-0001-0001-000000000003', 'price', 'Kako je Rex naučio plivati — naša priča', 'Tomislav B.', 'T', 'from-purple-400 to-pink-300', '2026-03-22T14:00:00Z', 3, 24, false, true),
('6d000001-0001-0001-0001-000000000004', 'pitanja', 'Preporuka za veterinara u Zagrebu?', 'Nina S.', 'N', 'from-orange-400 to-amber-300', '2026-03-21T16:00:00Z', 6, 8, false, false),
('6d000001-0001-0001-0001-000000000005', 'savjeti', 'Kako navići mačku na putovanje autom', 'Petra V.', 'P', 'from-rose-400 to-orange-300', '2026-03-20T09:00:00Z', 3, 15, false, false),
('6d000001-0001-0001-0001-000000000006', 'izgubljeni', 'Nestao pas — zlatni retriver, Maksimir', 'Ivan G.', 'I', 'from-red-400 to-rose-300', '2026-03-24T07:00:00Z', 4, 31, true, true),
('6d000001-0001-0001-0001-000000000007', 'slobodna', 'Najsmješnije navike vaših ljubimaca', 'Maja L.', 'M', 'from-teal-400 to-cyan-300', '2026-03-19T11:00:00Z', 7, 42, false, true),
('6d000001-0001-0001-0001-000000000008', 'pitanja', 'Kada početi s dresura štenaca?', 'Filip D.', 'F', 'from-indigo-400 to-blue-300', '2026-03-18T15:00:00Z', 3, 9, false, false),
('6d000001-0001-0001-0001-000000000009', 'savjeti', 'DIY igračke za pse od kućnih materijala', 'Lucija V.', 'L', 'from-amber-400 to-yellow-300', '2026-03-17T12:00:00Z', 2, 20, false, false),
('6d000001-0001-0001-0001-000000000010', 'price', 'Udomili smo stariju mačku — najbolja odluka', 'Katarina T.', 'K', 'from-pink-400 to-rose-300', '2026-03-16T10:00:00Z', 4, 35, false, true);

-- ════════════════════════════════════════════════════════
-- Forum Comments
-- ════════════════════════════════════════════════════════

INSERT INTO public.forum_comments (topic_id, author_name, author_initial, author_gradient, content, created_at, likes) VALUES
('6d000001-0001-0001-0001-000000000001', 'Ana K.', 'A', 'from-green-400 to-emerald-300', 'Za štence do 4 mjeseca preporučujem 4-5 kratkih šetnji dnevno, po 10-15 minuta.', '2026-03-24T08:30:00Z', 5),
('6d000001-0001-0001-0001-000000000001', 'Bruno H.', 'B', 'from-blue-400 to-indigo-300', 'Slažem se s Anom. Kratke ali česte šetnje su ključ. I ne zaboravite — štenci ne smiju previše trčati dok im se zglobovi ne razviju.', '2026-03-24T09:00:00Z', 8),
('6d000001-0001-0001-0001-000000000001', 'Petra V.', 'P', 'from-rose-400 to-orange-300', 'Moj štenac voli 3 šetnje po 20 minuta. Najvažnije je da ima dovoljno socijalizacije.', '2026-03-24T09:30:00Z', 3),
('6d000001-0001-0001-0001-000000000002', 'Marko N.', 'M', 'from-blue-400 to-cyan-300', 'Probali smo NaturPet bez žitarica i rezultati su fenomenalni. Više nema problema.', '2026-03-23T10:30:00Z', 6),
('6d000001-0001-0001-0001-000000000002', 'Nina S.', 'N', 'from-orange-400 to-amber-300', 'Mi koristimo PetLux s janjetinom. Veterinar nam je preporučio i rezultati su super.', '2026-03-23T11:00:00Z', 4),
('6d000001-0001-0001-0001-000000000003', 'Maja L.', 'M', 'from-teal-400 to-cyan-300', 'Prekrasna priča! 🥰 Naš pas je isto naučio plivati prošlo ljeto u Rijeci.', '2026-03-22T15:00:00Z', 7),
('6d000001-0001-0001-0001-000000000003', 'Filip D.', 'F', 'from-indigo-400 to-blue-300', 'Koji more ste koristili? Tražimo dog-friendly plažu.', '2026-03-22T16:00:00Z', 2),
('6d000001-0001-0001-0001-000000000004', 'Ana K.', 'A', 'from-green-400 to-emerald-300', 'Veterinarska ambulanta Marulić u Prečkom je odlična. Dr. Novak je fantastičan.', '2026-03-21T16:30:00Z', 4),
('6d000001-0001-0001-0001-000000000004', 'Tomislav B.', 'T', 'from-purple-400 to-pink-300', 'Mi idemo u Cliniku za male životinje na Heinzelovoj. Toplo preporučujem.', '2026-03-21T17:00:00Z', 3),
('6d000001-0001-0001-0001-000000000005', 'Ivan G.', 'I', 'from-red-400 to-rose-300', 'Počnite s kratkim vožnjama oko bloka i nagradite mačku poslasticama. Postupno produžujte.', '2026-03-20T10:00:00Z', 5),
('6d000001-0001-0001-0001-000000000006', 'Marko N.', 'M', 'from-blue-400 to-cyan-300', 'Podijelio sam na društvenim mrežama! Nadam se da ćete ga pronaći.', '2026-03-24T07:30:00Z', 12),
('6d000001-0001-0001-0001-000000000006', 'Petra V.', 'P', 'from-rose-400 to-orange-300', 'Provjerite udrugu za zaštitu životinja, često tamo završe pronađeni psi.', '2026-03-24T08:00:00Z', 9),
('6d000001-0001-0001-0001-000000000007', 'Tomislav B.', 'T', 'from-purple-400 to-pink-300', 'Naš Rex svaki dan u 18h donese svoju igračku i stavi je u cipelu. Svaki dan istu cipelu! 😂', '2026-03-19T11:30:00Z', 15),
('6d000001-0001-0001-0001-000000000007', 'Nina S.', 'N', 'from-orange-400 to-amber-300', 'Naša mačka svako jutro u 5h pjeva operu. Nismo sigurni je li talent ili sabotaža. 😹', '2026-03-19T12:00:00Z', 22),
('6d000001-0001-0001-0001-000000000007', 'Ana K.', 'A', 'from-green-400 to-emerald-300', 'Naš pas leži na leđima samo kad gleda TV. Specifično — samo kad je na ekranu pas. 🐕‍🦺📺', '2026-03-19T13:00:00Z', 18),
('6d000001-0001-0001-0001-000000000008', 'Bruno H.', 'B', 'from-blue-400 to-indigo-300', 'Možete početi već s 8 tjedana! Kratke sesije od 5 minuta, fokus na ime i sjedni.', '2026-03-18T15:30:00Z', 6),
('6d000001-0001-0001-0001-000000000009', 'Maja L.', 'M', 'from-teal-400 to-cyan-300', 'Napravila sam uže od starih majica — moj pas je oduševljen! Jednostavno, a besplatno.', '2026-03-17T12:30:00Z', 8),
('6d000001-0001-0001-0001-000000000009', 'Filip D.', 'F', 'from-indigo-400 to-blue-300', 'Plastična boca s grickalicama unutra — zabava zagarantirana! 🎉', '2026-03-17T13:00:00Z', 11),
('6d000001-0001-0001-0001-000000000010', 'Ana K.', 'A', 'from-green-400 to-emerald-300', 'Divno! Starije mačke su često zahvalnije od mladih. Naša udomljena mačka je najnježniji stvor.', '2026-03-16T10:30:00Z', 9),
('6d000001-0001-0001-0001-000000000010', 'Marko N.', 'M', 'from-blue-400 to-cyan-300', 'Svaka čast! Udomljavanje starijih životinja je najplemenitija stvar. ❤️', '2026-03-16T11:00:00Z', 14);

-- ════════════════════════════════════════════════════════
-- Blog Articles
-- ════════════════════════════════════════════════════════

INSERT INTO public.articles (slug, title, excerpt, body, author, date, category, emoji) VALUES
('5-znakova-da-vas-pas-treba-veterinara', '5 znakova da vaš pas treba veterinara', 'Naučite prepoznati simptome koji zahtijevaju hitnu veterinarsku pomoć.', 'Svaki vlasnik psa trebao bi znati prepoznati znakove koji zahtijevaju posjet veterinaru. Evo pet najvažnijih: 1. Gubitak apetita duži od 24 sata, 2. Letargija i neobična tromnost, 3. Povraćanje ili proljev koji traju više od jednog dana, 4. Otežano disanje ili kašalj, 5. Nagle promjene u ponašanju. Ako primijetite bilo koji od ovih simptoma, ne čekajte — posjetite veterinara što prije.', 'Dr. Ana Novak', '2026-03-20', 'zdravlje', '🏥'),
('kako-odabrati-pravu-hranu-za-psa', 'Kako odabrati pravu hranu za psa', 'Vodič kroz vrste hrane, sastojke i nutritivne potrebe vašeg psa.', 'Izbor prave hrane za psa može biti zbunjujući s toliko opcija na tržištu. Prvo, razmislite o dobi vašeg psa — štenac, odrasli ili stariji pas imaju različite nutritivne potrebe. Provjerite da je prvi sastojak pravi izvor proteina (piletina, govedina, riba). Izbjegavajte hranu s previše punila poput kukuruznog brašna. Konzultirajte veterinara o specifičnim potrebama vaše pasmine.', 'Marko Jurić, nutricionista', '2026-03-18', 'prehrana', '🍖'),
('osnove-dresure-stenci', 'Osnove dresure: od čega početi sa štencem', 'Praktični savjeti za prve korake u dresuri vašeg štenčića.', 'Dresura štenaca trebala bi početi čim dođu u vaš dom. Počnite s osnovama: naučite ga svoje ime, zatim ''sjedni'' i ''ostani''. Uvijek koristite pozitivno potkrepljenje — poslastice i pohvale. Sesije neka budu kratke (5-10 minuta) jer štenčići imaju kratku pažnju. Budite dosljedni i strpljivi. Socijalizacija je jednako važna kao i komande — izložite štenča različitim zvukovima, ljudima i životinjama.', 'Bruno Horvat, CPDT-KA', '2026-03-15', 'dresura', '🎓'),
('putovanje-s-psom-u-hrvatsku', 'Putovanje s psom po Hrvatskoj — vodič', 'Sve što trebate znati za bezbrižno putovanje s ljubimcem po HR.', 'Hrvatska je sve više pet-friendly destinacija! Za putovanje trebate: putovnicu za kućne ljubimce, mikročip i dokaz o vakcinaciji. Na Jadranu postoji sve više dog-friendly plaža — Crikvenica, Premantura i Lošinj su popularni izbori. Za smještaj, provjerite apartmane koji primaju životinje. U automobilu, pas mora biti osiguran pojasom ili u transporteru. Ponijite dovoljno vode i hrane za cijeli put.', 'Lucija Matić', '2026-03-12', 'putovanje', '✈️'),
('kako-se-nositi-s-anksioznoscu-pasa', 'Kako se nositi s anksioznošću pasa', 'Razumijevanje i liječenje separacijske anksioznosti kod pasa.', 'Separacijska anksioznost pogađa mnoge pse. Simptomi uključuju destruktivno ponašanje, pretjerano lajanje i nečistoću kad su sami. Rješenja: postupno navikavajte psa na vaš odlazak, ostavite mu interaktivne igračke, stvorite sigurno mjesto u kući. U težim slučajevima, konzultirajte veterinarskog biheviorista. CBD ulja i umirujuća muzika mogu pomoći, ali nisu zamjena za profesionalnu pomoć.', 'Dr. Jelena Tomić', '2026-03-10', 'zdravlje', '🧠'),
('recept-domaci-keksici-za-pse', 'Recept: domaći keksići za pse', 'Jednostavan i zdrav recept za domaće poslastice za vašeg ljubimca.', 'Napravite zdrave keksiće kod kuće! Sastojci: 2 šalice integralnog brašna, 1 šalica zobenih pahuljica, 1/3 šalice kikiriki maslaca (bez xilitola!), 1 jaje, 1/2 šalice vode. Pomiješajte sve sastojke, razvaljajte tijesto na 0.5 cm debljine, izrežite oblike i pecite na 175°C 25 minuta. Čuvajte u zatvorenoj posudi do 2 tjedna. Vaš pas će ih obožavati!', 'Petra Kovačević', '2026-03-08', 'prehrana', '🍪'),
('agility-sport-za-pse-i-vlasnike', 'Agility — sport za pse i vlasnike', 'Sve o agility sportu: kako početi, što trebate i zašto je sjajan.', 'Agility je fantastičan sport koji jača vezu između psa i vlasnika. Pas prolazi kroz parcours s preprekama, tunelima, slalomom i skokovima, a vlasnik ga vodi. Možete početi s 12 mjeseci starosti (za veće pasmine čekajte duže). Počnite s tečajem za početnike — naučit ćete osnove i vidjeti uživa li vaš pas u tome. Oprema za početak nije skupa, a klubovi nude sve potrebno.', 'Martina Kovač, FCI sudac', '2026-03-05', 'dresura', '🏃'),
('zasto-je-socijalizacija-macaka-vazna', 'Zašto je socijalizacija mačaka važna', 'Mačke nisu samotnjaci — evo zašto i kako socijalizirati mačku.', 'Unatoč uvriježenom mišljenju, mačke su socijalne životinje koje trebaju interakciju. Socijalizacija je najvažnija između 2. i 7. tjedna života, ali nikad nije kasno. Izložite mačku različitim zvukovima, teksturama i ljudima. Igra je ključna — koristite igračke s perjem, laser pointere i puzzle feedere. Ako imate više mačaka, osigurajte svakoj vlastiti prostor za hranjenje i litter box. Socijalizirana mačka je sretnija i zdravija mačka.', 'Dr. Nina Šimunović', '2026-03-01', 'zdravlje', '🐱')
ON CONFLICT (slug) DO NOTHING;

-- ════════════════════════════════════════════════════════
-- Veterinarians (Official Registry)
-- ════════════════════════════════════════════════════════

\i ./seed-veterinari.sql

-- Re-enable FK checks
SET session_replication_role = DEFAULT;

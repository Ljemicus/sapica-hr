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
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'admin@sapica.hr', 'Admin Šapica', 'admin', NULL, NULL, 'Zagreb'),
('cc111111-1111-1111-1111-111111111111', 'katarina@demo.hr', 'Katarina Tomić', 'sitter', NULL, '+385 91 111 2233', 'Osijek'),
('cc222222-2222-2222-2222-222222222222', 'ante@demo.hr', 'Ante Pavlović', 'sitter', NULL, '+385 92 222 3344', 'Split'),
('cc333333-3333-3333-3333-333333333333', 'lucija@demo.hr', 'Lucija Vuković', 'sitter', NULL, '+385 93 333 4455', 'Pula'),
('cc444444-4444-4444-4444-444444444444', 'matej@demo.hr', 'Matej Šarić', 'sitter', NULL, '+385 94 444 5566', 'Zadar');

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

('cc111111-1111-1111-1111-111111111111',
 'Odrasla sam na farmi i obožavam sve životinje. U Osijeku imam kuću s velikim dvorištem. Posebno sam iskusna s velikim pasminama pasa i egzotičnim kućnim ljubimcima.',
 4, '["boarding", "walking", "daycare", "drop-in"]'::jsonb,
 '{"boarding": 20, "walking": 7, "daycare": 15, "drop-in": 10}'::jsonb,
 true, false, 'unutar 1 sata', 4.7, 14, 45.5550, 18.6955, 'Osijek',
 '[]'::jsonb),

('cc222222-2222-2222-2222-222222222222',
 'Bivši policijski trener pasa, sada u mirovini. Živim u kući blizu Marjana, savršeno za dugačke šetnje. Iskusan s agresivnim i plašljivim psima.',
 10, '["boarding", "walking", "house-sitting"]'::jsonb,
 '{"boarding": 30, "walking": 12, "house-sitting": 35}'::jsonb,
 true, true, 'unutar 30 minuta', 4.9, 35, 43.5147, 16.4435, 'Split',
 '[]'::jsonb),

('cc333333-3333-3333-3333-333333333333',
 'Studentica veterine na 4. godini. Živim u Puli blizu Arene s malim ali ugodnim stanom. Specijalizirana za mačke i male pse. Nudim i osnovnu njegu (kupanje, četkanje).',
 3, '["drop-in", "daycare", "house-sitting"]'::jsonb,
 '{"drop-in": 10, "daycare": 16, "house-sitting": 28}'::jsonb,
 true, false, 'unutar 2 sata', 4.6, 11, 44.8666, 13.8496, 'Pula',
 '[]'::jsonb),

('cc444444-4444-4444-4444-444444444444',
 'Radim kao fotograf pa imam fleksibilan raspored. Obožavam pse i imam tri vlastita. Kuća s dvorištem u mirnom dijelu Zadra, 5 minuta od plaže.',
 2, '["boarding", "walking", "daycare"]'::jsonb,
 '{"boarding": 24, "walking": 9, "daycare": 17}'::jsonb,
 true, false, 'unutar 1 sata', 4.5, 9, 44.1194, 15.2314, 'Zadar',
 '[]'::jsonb);

-- Pets
INSERT INTO public.pets (id, owner_id, name, species, breed, age, weight, special_needs, photo_url) VALUES
('pet11111-1111-1111-1111-111111111111', '99999999-9999-9999-9999-999999999999', 'Rex', 'dog', 'Njemački ovčar', 5, 35.0, 'Treba redovitu šetnju, alergičan na piletinu', '/images/pets/rex.jpg'),
('pet22222-2222-2222-2222-222222222222', '99999999-9999-9999-9999-999999999999', 'Mila', 'cat', 'Perzijska', 3, 4.5, NULL, '/images/pets/mila.jpg'),
('pet33333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Luna', 'dog', 'Labrador', 2, 28.0, NULL, '/images/pets/luna.jpg'),
('pet44444-4444-4444-4444-444444444444', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Whiskers', 'cat', 'Domaća kratkodlaka', 7, 5.0, 'Dijabetes - treba inzulin 2x dnevno', '/images/pets/whiskers.jpg'),
('pet55555-5555-5555-5555-555555555555', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Buddy', 'dog', 'Zlatni retriver', 4, 32.0, NULL, '/images/pets/buddy.jpg');

-- Bookings
INSERT INTO public.bookings (id, owner_id, sitter_id, pet_id, service_type, start_date, end_date, status, total_price, note) VALUES
('book1111-1111-1111-1111-111111111111', '99999999-9999-9999-9999-999999999999', '11111111-1111-1111-1111-111111111111', 'pet11111-1111-1111-1111-111111111111', 'boarding', '2026-03-20', '2026-03-25', 'completed', 125.00, 'Rex voli šetnje ujutro'),
('book2222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'pet33333-3333-3333-3333-333333333333', 'boarding', '2026-03-28', '2026-04-02', 'accepted', 150.00, NULL),
('book3333-3333-3333-3333-333333333333', '99999999-9999-9999-9999-999999999999', '33333333-3333-3333-3333-333333333333', 'pet11111-1111-1111-1111-111111111111', 'walking', '2026-03-22', '2026-03-22', 'completed', 8.00, NULL),
('book4444-4444-4444-4444-444444444444', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '66666666-6666-6666-6666-666666666666', 'pet55555-5555-5555-5555-555555555555', 'daycare', '2026-04-01', '2026-04-01', 'pending', 20.00, 'Buddy se dobro slaže s drugim psima');

-- Reviews
INSERT INTO public.reviews (booking_id, reviewer_id, reviewee_id, rating, comment) VALUES
('book1111-1111-1111-1111-111111111111', '99999999-9999-9999-9999-999999999999', '11111111-1111-1111-1111-111111111111', 5, 'Ana je fantastična! Rex se vratio sretan i zadovoljan. Dvorište je savršeno za njega. Definitivno ćemo se vratiti!'),
('book3333-3333-3333-3333-333333333333', '99999999-9999-9999-9999-999999999999', '33333333-3333-3333-3333-333333333333', 5, 'Ivana je odlična šetačica! Rex je bio umoran i sretan nakon šetnje. Preporučujem svima!');

-- Add more reviews with generated booking IDs for completeness
INSERT INTO public.bookings (id, owner_id, sitter_id, pet_id, service_type, start_date, end_date, status, total_price) VALUES
('book5555-5555-5555-5555-555555555555', '99999999-9999-9999-9999-999999999999', '44444444-4444-4444-4444-444444444444', 'pet11111-1111-1111-1111-111111111111', 'boarding', '2026-02-10', '2026-02-15', 'completed', 110.00),
('book6666-6666-6666-6666-666666666666', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444444', 'pet33333-3333-3333-3333-333333333333', 'walking', '2026-02-20', '2026-02-20', 'completed', 8.00),
('book7777-7777-7777-7777-777777777777', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'pet55555-5555-5555-5555-555555555555', 'daycare', '2026-01-15', '2026-01-15', 'completed', 20.00),
('book8888-8888-8888-8888-888888888888', '99999999-9999-9999-9999-999999999999', '66666666-6666-6666-6666-666666666666', 'pet22222-2222-2222-2222-222222222222', 'house-sitting', '2026-01-20', '2026-01-25', 'completed', 160.00),
('book9999-9999-9999-9999-999999999999', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'pet44444-4444-4444-4444-444444444444', 'drop-in', '2026-02-01', '2026-02-01', 'completed', 15.00),
('bookaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '99999999-9999-9999-9999-999999999999', '88888888-8888-8888-8888-888888888888', 'pet11111-1111-1111-1111-111111111111', 'boarding', '2026-02-05', '2026-02-10', 'completed', 160.00),
('bookbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '55555555-5555-5555-5555-555555555555', 'pet33333-3333-3333-3333-333333333333', 'walking', '2026-03-01', '2026-03-01', 'completed', 12.00),
('bookcccc-cccc-cccc-cccc-cccccccccccc', '99999999-9999-9999-9999-999999999999', '77777777-7777-7777-7777-777777777777', 'pet22222-2222-2222-2222-222222222222', 'drop-in', '2026-03-05', '2026-03-05', 'completed', 14.00);

INSERT INTO public.reviews (booking_id, reviewer_id, reviewee_id, rating, comment) VALUES
('book5555-5555-5555-5555-555555555555', '99999999-9999-9999-9999-999999999999', '44444444-4444-4444-4444-444444444444', 4, 'Luka je odličan! Kuća na Trsatu je savršena za Rex-a. Jedini minus je što je malo daleko od centra.'),
('book6666-6666-6666-6666-666666666666', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444444', 5, 'Luna je obožavala šetnju s Lukom! Vrlo pažljiv i iskusan.'),
('book7777-7777-7777-7777-777777777777', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 5, 'Buddy se odlično proveo kod Ane. Slali su nam fotke cijeli dan!'),
('book8888-8888-8888-8888-888888888888', '99999999-9999-9999-9999-999999999999', '66666666-6666-6666-6666-666666666666', 5, 'Filip je savršen čuvar! Mila je bila u odličnim rukama. Kuća je čista i sigurna.'),
('book9999-9999-9999-9999-999999999999', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 4, 'Marko je bio vrlo profesionalan. Whiskers je dobio lijekove na vrijeme. Preporučujem!'),
('bookaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '99999999-9999-9999-9999-999999999999', '88888888-8888-8888-8888-888888888888', 5, 'Ivan je nevjerojatan! Rex s posebnim potrebama zahtijeva puno pažnje i Ivan je bio savršen.'),
('bookbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '55555555-5555-5555-5555-555555555555', 4, 'Petra je odlična šetačica. Luna je bila sretna. Jedino bi mogla slati više fotki.'),
('bookcccc-cccc-cccc-cccc-cccccccccccc', '99999999-9999-9999-9999-999999999999', '77777777-7777-7777-7777-777777777777', 4, 'Maja je bila super za Milu! Stan je u dobrom kvartu blizu parka.');

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
('99999999-9999-9999-9999-999999999999', '11111111-1111-1111-1111-111111111111', 'book1111-1111-1111-1111-111111111111', 'Bok Ana! Zanima me mogu li dovesti Rex-a sljedeći tjedan?', true, NOW() - INTERVAL '5 days'),
('11111111-1111-1111-1111-111111111111', '99999999-9999-9999-9999-999999999999', 'book1111-1111-1111-1111-111111111111', 'Bok Tomislave! Naravno, rado ću čuvati Rex-a. Koji datumi vam odgovaraju?', true, NOW() - INTERVAL '5 days' + INTERVAL '30 minutes'),
('99999999-9999-9999-9999-999999999999', '11111111-1111-1111-1111-111111111111', 'book1111-1111-1111-1111-111111111111', 'Od 20. do 25. ožujka. Ima li mjesta?', true, NOW() - INTERVAL '4 days'),
('11111111-1111-1111-1111-111111111111', '99999999-9999-9999-9999-999999999999', 'book1111-1111-1111-1111-111111111111', 'Savršeno, ti datumi mi odgovaraju! Samo napravite rezervaciju kroz aplikaciju. 🐾', true, NOW() - INTERVAL '4 days' + INTERVAL '1 hour');

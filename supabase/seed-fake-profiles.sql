-- ============================================================
-- SEED: Fake profiles for Šapica demo
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- Temporarily disable FK constraint on users table
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- ── OWNERS (5 vlasnika) ──
INSERT INTO public.users (id, email, full_name, role, phone, city, created_at, updated_at) VALUES
  ('c1111111-1111-1111-1111-111111111111', 'tea.markovic@demo.hr', 'Tea Marković', 'owner', '+385912345001', 'Rijeka', NOW() - INTERVAL '60 days', NOW()),
  ('c2222222-2222-2222-2222-222222222222', 'ante.perko@demo.hr', 'Ante Perko', 'owner', '+385912345002', 'Zagreb', NOW() - INTERVAL '45 days', NOW()),
  ('c3333333-3333-3333-3333-333333333333', 'marina.simic@demo.hr', 'Marina Šimić', 'owner', '+385912345003', 'Split', NOW() - INTERVAL '30 days', NOW()),
  ('c4444444-4444-4444-4444-444444444444', 'josip.boric@demo.hr', 'Josip Borić', 'owner', '+385912345004', 'Rijeka', NOW() - INTERVAL '50 days', NOW()),
  ('c5555555-5555-5555-5555-555555555555', 'karla.vukovic@demo.hr', 'Karla Vuković', 'owner', '+385912345005', 'Zagreb', NOW() - INTERVAL '20 days', NOW())
ON CONFLICT (id) DO NOTHING;

-- ── MORE SITTERS (dopuna, bolji bios) ──
UPDATE public.users SET bio = 'Mama dvoje djece i troje pasa. Naša kuća je uvijek puna ljubavi i šapa!' WHERE id = 'a1111111-1111-1111-1111-111111111111';
UPDATE public.users SET bio = 'Veterinar po struci, životinje su moja strast i profesija.' WHERE id = 'a2222222-2222-2222-2222-222222222222';
UPDATE public.users SET bio = 'Studentica biologije, slobodno vrijeme provodim šetajući pse po Korzu!' WHERE id = 'a3333333-3333-3333-3333-333333333333';
UPDATE public.users SET bio = 'Umirovljeni vatrogasac s velikom kućom na Trsatu. Dvorište savršeno za pse!' WHERE id = 'a4444444-4444-4444-4444-444444444444';
UPDATE public.users SET bio = 'Profesionalna trenerica pasa. Vaš ljubimac se vraća sretniji i poslušniji!' WHERE id = 'a5555555-5555-5555-5555-555555555555';
UPDATE public.users SET bio = 'IT-jevac koji radi od kuće. Uvijek tu za vaše ljubimce!' WHERE id = 'a6666666-6666-6666-6666-666666666666';
UPDATE public.users SET bio = 'Obožavam more i pse - šetnje uz plažu su naša specijalnost! 🏖️' WHERE id = 'a7777777-7777-7777-7777-777777777777';
UPDATE public.users SET bio = 'Velika kuća s vrtom na rubu Zagreba. Idealno za pse koji vole trčati!' WHERE id = 'a8888888-8888-8888-8888-888888888888';
UPDATE public.users SET bio = 'Ljubiteljica svih životinja, posebno mačaka. Imam 3 vlastite mace 🐱' WHERE id = 'a9999999-9999-9999-9999-999999999999';

-- Make some sitters verified
UPDATE public.sitter_profiles SET verified = true WHERE user_id IN (
  'a1111111-1111-1111-1111-111111111111',
  'a3333333-3333-3333-3333-333333333333',
  'a4444444-4444-4444-4444-444444444444',
  'a8888888-8888-8888-8888-888888888888',
  'b1111111-1111-1111-1111-111111111111'
);

-- ── PETS (10 ljubimaca s Unsplash slikama) ──
INSERT INTO public.pets (id, owner_id, name, species, breed, age_years, size, notes, photos, created_at) VALUES
  ('d1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Rex', 'dog', 'Njemački ovčar', 4, 'large', 'Jako poslušan, voli šetnje ujutro i navečer. Zna sve osnovne komande.', '["https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400"]', NOW() - INTERVAL '55 days'),
  ('d2222222-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111', 'Mici', 'cat', 'Perzijska', 3, 'small', 'Osjetljiv želudac - samo Royal Canin Indoor. Voli se maziti ali ne voli druge mačke.', '["https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400"]', NOW() - INTERVAL '55 days'),
  ('d3333333-3333-3333-3333-333333333333', 'c2222222-2222-2222-2222-222222222222', 'Luna', 'dog', 'Zlatni retriver', 2, 'large', 'Prijateljska i vesela, obožava djecu i druge pse. Zna plivati!', '["https://images.unsplash.com/photo-1552053831-71594a27632d?w=400"]', NOW() - INTERVAL '40 days'),
  ('d4444444-4444-4444-4444-444444444444', 'c2222222-2222-2222-2222-222222222222', 'Čarli', 'dog', 'Francuski buldog', 5, 'small', 'Problemi s disanjem po vrućini - izbjegavati napor kad je vruće. Lijek za alergije 1x dnevno.', '["https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400"]', NOW() - INTERVAL '40 days'),
  ('d5555555-5555-5555-5555-555555555555', 'c3333333-3333-3333-3333-333333333333', 'Bella', 'dog', 'Labrador', 6, 'large', 'Najmirnija kujica na svijetu. Voli ležati na suncu i jesti. Obožava djecu.', '["https://images.unsplash.com/photo-1579296774624-9e82ef705092?w=400"]', NOW() - INTERVAL '25 days'),
  ('d6666666-6666-6666-6666-666666666666', 'c3333333-3333-3333-3333-333333333333', 'Whiskers', 'cat', 'Britanska kratkodlaka', 4, 'medium', 'Tih i miran mačak. Voli gledati kroz prozor i hvatati muhe.', '["https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400"]', NOW() - INTERVAL '25 days'),
  ('d7777777-7777-7777-7777-777777777777', 'c4444444-4444-4444-4444-444444444444', 'Max', 'dog', 'Border koli', 3, 'medium', 'Hiperaktivan! Treba minimalno 2 sata šetnje dnevno inače će pojesti cipele. Izuzetno pametan.', '["https://images.unsplash.com/photo-1503256207526-0d5d80fa2f47?w=400"]', NOW() - INTERVAL '45 days'),
  ('d8888888-8888-8888-8888-888888888888', 'c4444444-4444-4444-4444-444444444444', 'Bubi', 'dog', 'Maltežanac', 7, 'small', 'Stariji psić, lijek za srce 2x dnevno. Jako umiljat, voli biti u naručju.', '["https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400"]', NOW() - INTERVAL '45 days'),
  ('d9999999-9999-9999-9999-999999999999', 'c5555555-5555-5555-5555-555555555555', 'Rocky', 'dog', 'Sibirski husky', 3, 'large', 'Treba klimatizirani prostor ljeti! Voli trčati i zavijati. Nije za male stanove.', '["https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=400"]', NOW() - INTERVAL '15 days'),
  ('da111111-1111-1111-1111-111111111111', 'c5555555-5555-5555-5555-555555555555', 'Nala', 'cat', 'Maine Coon', 2, 'large', 'Velika mačka s velikim srcem. Voli se igrati s igračkama i loviti laser.', '["https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=400"]', NOW() - INTERVAL '15 days')
ON CONFLICT (id) DO NOTHING;

-- ── BOOKINGS (8 bookinga - mix statusa) ──
INSERT INTO public.bookings (id, owner_id, sitter_id, pet_id, service_type, start_date, end_date, status, total_price, notes, created_at, updated_at) VALUES
  ('e1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'a3333333-3333-3333-3333-333333333333', 'd1111111-1111-1111-1111-111111111111', 'boarding', '2026-03-15', '2026-03-18', 'completed', 150.00, 'Rex voli šetnje ujutro i navečer, min. 30 min svaka', NOW() - INTERVAL '12 days', NOW() - INTERVAL '7 days'),
  ('e2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 'a1111111-1111-1111-1111-111111111111', 'd3333333-3333-3333-3333-333333333333', 'walking', '2026-03-20', '2026-03-20', 'completed', 20.00, 'Luna obožava park Maksimir, ako može tamo', NOW() - INTERVAL '7 days', NOW() - INTERVAL '5 days'),
  ('e3333333-3333-3333-3333-333333333333', 'c3333333-3333-3333-3333-333333333333', 'b1111111-1111-1111-1111-111111111111', 'd5555555-5555-5555-5555-555555555555', 'daycare', '2026-03-22', '2026-03-22', 'completed', 35.00, NULL, NOW() - INTERVAL '5 days', NOW() - INTERVAL '3 days'),
  ('e4444444-4444-4444-4444-444444444444', 'c4444444-4444-4444-4444-444444444444', 'a4444444-4444-4444-4444-444444444444', 'd7777777-7777-7777-7777-777777777777', 'walking', '2026-03-25', '2026-03-25', 'accepted', 15.00, 'Max treba duže šetnje, minimalno sat vremena. Rječina ili park.', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days'),
  ('e5555555-5555-5555-5555-555555555555', 'c1111111-1111-1111-1111-111111111111', 'a3333333-3333-3333-3333-333333333333', 'd2222222-2222-2222-2222-222222222222', 'house-sitting', '2026-03-28', '2026-04-02', 'pending', 250.00, 'Mici jede samo Royal Canin Indoor, 2x dnevno. Osjetljiv želudac!', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
  ('e6666666-6666-6666-6666-666666666666', 'c5555555-5555-5555-5555-555555555555', 'a8888888-8888-8888-8888-888888888888', 'd9999999-9999-9999-9999-999999999999', 'boarding', '2026-04-05', '2026-04-10', 'pending', 350.00, 'Rocky MORA imati klimatizirani prostor. Šetnje rano ujutro i kasno navečer.', NOW() - INTERVAL '1 day', NOW()),
  ('e7777777-7777-7777-7777-777777777777', 'c2222222-2222-2222-2222-222222222222', 'a5555555-5555-5555-5555-555555555555', 'd4444444-4444-4444-4444-444444444444', 'drop-in', '2026-03-23', '2026-03-23', 'completed', 15.00, 'Čarli treba lijek za alergije u 14h, tableticu u hrani sakriti', NOW() - INTERVAL '4 days', NOW() - INTERVAL '2 days'),
  ('e8888888-8888-8888-8888-888888888888', 'c3333333-3333-3333-3333-333333333333', 'b2222222-2222-2222-2222-222222222222', 'd6666666-6666-6666-6666-666666666666', 'boarding', '2026-04-01', '2026-04-03', 'accepted', 120.00, 'Whiskers je tih ali voli maženje. Donijeti ću njegovu omiljenu dekicu.', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

-- ── REVIEWS (10 recenzija) ──
INSERT INTO public.reviews (id, booking_id, reviewer_id, reviewee_id, rating, text, created_at) VALUES
  ('f1111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'a3333333-3333-3333-3333-333333333333', 5, 'Ivana je fantastična! Rex se vratio sretan i zadovoljan. Slala mi je slike svaki dan. Apsolutno preporučam!', NOW() - INTERVAL '7 days'),
  ('f2222222-2222-2222-2222-222222222222', 'e2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 'a1111111-1111-1111-1111-111111111111', 5, 'Ana je predivna s Lunom. Profesionalna, pouzdana i očito voli životinje. Top!', NOW() - INTERVAL '5 days'),
  ('f3333333-3333-3333-3333-333333333333', 'e3333333-3333-3333-3333-333333333333', 'c3333333-3333-3333-3333-333333333333', 'b1111111-1111-1111-1111-111111111111', 4, 'Tomislav je super, Bella se zabavila. Jedino malo kasno odgovara na poruke ali inače sve pet.', NOW() - INTERVAL '3 days'),
  ('f4444444-4444-4444-4444-444444444444', 'e7777777-7777-7777-7777-777777777777', 'c2222222-2222-2222-2222-222222222222', 'a5555555-5555-5555-5555-555555555555', 5, 'Maja je točno u minut došla, dala lijek Čarliju i poslala video. Jako profesionalno!', NOW() - INTERVAL '2 days'),
  ('f5555555-5555-5555-5555-555555555555', 'e1111111-1111-1111-1111-111111111111', 'c4444444-4444-4444-4444-444444444444', 'a3333333-3333-3333-3333-333333333333', 5, 'Drugi put kod Ivane i opet savršeno. Max je obožava, vuče me prema njenoj kući kad idemo u šetnju 😂', NOW() - INTERVAL '6 days'),
  ('f6666666-6666-6666-6666-666666666666', 'e2222222-2222-2222-2222-222222222222', 'c5555555-5555-5555-5555-555555555555', 'a1111111-1111-1111-1111-111111111111', 4, 'Ana je odlična, Rocky je bio sretan. Malo mala kuća za velikog psa ali se snašla super.', NOW() - INTERVAL '4 days'),
  ('f7777777-7777-7777-7777-777777777777', 'e1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'a4444444-4444-4444-4444-444444444444', 5, 'Luka je odličan! Rex se s njim super slaže. Šetnje uz more su Rexov omiljeni dio.', NOW() - INTERVAL '8 days'),
  ('f8888888-8888-8888-8888-888888888888', 'e3333333-3333-3333-3333-333333333333', 'c3333333-3333-3333-3333-333333333333', 'b1111111-1111-1111-1111-111111111111', 5, 'Tomislav je pravi profesionalac, Bella ga obožava. Uvijek pošalje fotke i update kako je.', NOW() - INTERVAL '3 days'),
  ('f9999999-9999-9999-9999-999999999999', 'e1111111-1111-1111-1111-111111111111', 'c4444444-4444-4444-4444-444444444444', 'a8888888-8888-8888-8888-888888888888', 4, 'Ivan je super čuvar, kuća mu je čista i prostrana. Bubi se dobro osjećao. Preporučam!', NOW() - INTERVAL '5 days'),
  ('fa111111-1111-1111-1111-111111111111', 'e2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 'a5555555-5555-5555-5555-555555555555', 5, 'Maja je nešto posebno. Luna joj se odmah dala u naručje. Preporučam svima!', NOW() - INTERVAL '4 days')
ON CONFLICT (id) DO NOTHING;

-- ── MESSAGES (12 poruka u 3 razgovora) ──
INSERT INTO public.messages (sender_id, receiver_id, booking_id, text, read, created_at) VALUES
  ('c1111111-1111-1111-1111-111111111111', 'a3333333-3333-3333-3333-333333333333', 'e5555555-5555-5555-5555-555555555555', 'Bok Ivana! Zanima me je li još uvijek slobodna za čuvanje Mici od 28.3. do 2.4.?', true, NOW() - INTERVAL '26 hours'),
  ('a3333333-3333-3333-3333-333333333333', 'c1111111-1111-1111-1111-111111111111', 'e5555555-5555-5555-5555-555555555555', 'Bok Tea! Da, slobodna sam 😊 Koliko puta dnevno jede Mici i ima li neki poseban režim?', true, NOW() - INTERVAL '25 hours'),
  ('c1111111-1111-1111-1111-111111111111', 'a3333333-3333-3333-3333-333333333333', 'e5555555-5555-5555-5555-555555555555', 'Super! Jede 2x dnevno, ujutro i navečer. Royal Canin Indoor, donijeti ću hranu. Osjetljiv joj je želudac pa neka ne dobiva ništa drugo.', true, NOW() - INTERVAL '24 hours'),
  ('a3333333-3333-3333-3333-333333333333', 'c1111111-1111-1111-1111-111111111111', 'e5555555-5555-5555-5555-555555555555', 'Razumijem, sve ću zapisati. Imate li broj veterinara za svaki slučaj?', false, NOW() - INTERVAL '23 hours'),

  ('c4444444-4444-4444-4444-444444444444', 'a4444444-4444-4444-4444-444444444444', 'e4444444-4444-4444-4444-444444444444', 'Ej Luka, Max je spreman za šetnju danas! Može oko 16h?', true, NOW() - INTERVAL '6 hours'),
  ('a4444444-4444-4444-4444-444444444444', 'c4444444-4444-4444-4444-444444444444', 'e4444444-4444-4444-4444-444444444444', 'Može, dolazim u 16h! Idem li s njim uz Rječinu ili preferiraš park?', true, NOW() - INTERVAL '5 hours'),
  ('c4444444-4444-4444-4444-444444444444', 'a4444444-4444-4444-4444-444444444444', 'e4444444-4444-4444-4444-444444444444', 'Rječina bi bila super, voli vodu! Samo pazi da ga ne pustiš s povodca blizu ceste, zna potegnuti kad vidi mačku 😅', true, NOW() - INTERVAL '4 hours'),
  ('a4444444-4444-4444-4444-444444444444', 'c4444444-4444-4444-4444-444444444444', 'e4444444-4444-4444-4444-444444444444', 'Haha, klasični border koli! Naravno, uvijek je na povodcu dok ne dođemo do travnate površine. Vidimo se!', false, NOW() - INTERVAL '3 hours'),

  ('c5555555-5555-5555-5555-555555555555', 'a8888888-8888-8888-8888-888888888888', 'e6666666-6666-6666-6666-666666666666', 'Hej Ivan, vidjela sam da nudiš smještaj za veće pse. Imam huskyja, Rocky, 25kg. Imate li klimu?', true, NOW() - INTERVAL '28 hours'),
  ('a8888888-8888-8888-8888-888888888888', 'c5555555-5555-5555-5555-555555555555', 'e6666666-6666-6666-6666-666666666666', 'Bok Karla! Da, imam klimatizirani prostor i veliki dvorište. Rocky bi uživao! Od kad do kad trebate?', true, NOW() - INTERVAL '27 hours'),
  ('c5555555-5555-5555-5555-555555555555', 'a8888888-8888-8888-8888-888888888888', 'e6666666-6666-6666-6666-666666666666', '5.-10. travnja. Idemo na put i nemamo kome ostaviti. Koliko bi izašlo za 5 noći?', true, NOW() - INTERVAL '26 hours'),
  ('a8888888-8888-8888-8888-888888888888', 'c5555555-5555-5555-5555-555555555555', 'e6666666-6666-6666-6666-666666666666', 'Za 5 noći bi bilo 350€, uključuje šetnje 2x dnevno i hranjenje. Slati ću vam fotke svaki dan! 📸', false, NOW() - INTERVAL '25 hours')
;

-- ── Update sitter ratings based on actual reviews ──
UPDATE public.sitter_profiles sp SET
  rating_avg = COALESCE(sub.avg_rating, sp.rating_avg),
  review_count = COALESCE(sub.cnt, sp.review_count)
FROM (
  SELECT reviewee_id, AVG(rating) as avg_rating, COUNT(*) as cnt
  FROM public.reviews
  GROUP BY reviewee_id
) sub
WHERE sp.user_id = sub.reviewee_id;

-- Done!
-- Total: 5 owners, 10 pets, 8 bookings, 10 reviews, 12 messages
-- Sitter bios updated, some verified, ratings recalculated

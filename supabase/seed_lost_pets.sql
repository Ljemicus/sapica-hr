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

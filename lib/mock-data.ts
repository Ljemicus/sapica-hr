import type { User, Pet, SitterProfile, Booking, Review, Message, Availability, ServiceType, Walk, PetUpdate, PetPassport } from './types';

// ============================================================
// USERS
// ============================================================

export const mockUsers: User[] = [
  // SITTERS
  { id: '11111111-1111-1111-1111-111111111111', email: 'ana@demo.hr', name: 'Ana Horvat', role: 'sitter', avatar_url: null, phone: '+385 91 234 5678', city: 'Rijeka', created_at: '2025-06-15T10:00:00Z' },
  { id: '22222222-2222-2222-2222-222222222222', email: 'marko@demo.hr', name: 'Marko Novak', role: 'sitter', avatar_url: null, phone: '+385 92 345 6789', city: 'Rijeka', created_at: '2025-07-01T10:00:00Z' },
  { id: '33333333-3333-3333-3333-333333333333', email: 'ivana@demo.hr', name: 'Ivana Babić', role: 'sitter', avatar_url: null, phone: '+385 93 456 7890', city: 'Rijeka', created_at: '2025-08-10T10:00:00Z' },
  { id: '44444444-4444-4444-4444-444444444444', email: 'luka@demo.hr', name: 'Luka Jurić', role: 'sitter', avatar_url: null, phone: '+385 94 567 8901', city: 'Rijeka', created_at: '2025-05-20T10:00:00Z' },
  { id: '55555555-5555-5555-5555-555555555555', email: 'petra@demo.hr', name: 'Petra Kovačević', role: 'sitter', avatar_url: null, phone: '+385 95 678 9012', city: 'Split', created_at: '2025-09-01T10:00:00Z' },
  { id: '66666666-6666-6666-6666-666666666666', email: 'filip@demo.hr', name: 'Filip Matić', role: 'sitter', avatar_url: null, phone: '+385 96 789 0123', city: 'Zagreb', created_at: '2025-06-01T10:00:00Z' },
  { id: '77777777-7777-7777-7777-777777777777', email: 'maja@demo.hr', name: 'Maja Perić', role: 'sitter', avatar_url: null, phone: '+385 97 890 1234', city: 'Zagreb', created_at: '2025-10-15T10:00:00Z' },
  { id: '88888888-8888-8888-8888-888888888888', email: 'ivan@demo.hr', name: 'Ivan Knežević', role: 'sitter', avatar_url: null, phone: '+385 98 901 2345', city: 'Zagreb', created_at: '2025-04-10T10:00:00Z' },
  { id: 'cc111111-1111-1111-1111-111111111111', email: 'katarina@demo.hr', name: 'Katarina Tomić', role: 'sitter', avatar_url: null, phone: '+385 91 111 2233', city: 'Osijek', created_at: '2025-07-20T10:00:00Z' },
  { id: 'cc222222-2222-2222-2222-222222222222', email: 'ante@demo.hr', name: 'Ante Pavlović', role: 'sitter', avatar_url: null, phone: '+385 92 222 3344', city: 'Split', created_at: '2025-08-05T10:00:00Z' },
  { id: 'cc333333-3333-3333-3333-333333333333', email: 'lucija@demo.hr', name: 'Lucija Vuković', role: 'sitter', avatar_url: null, phone: '+385 93 333 4455', city: 'Pula', created_at: '2025-09-12T10:00:00Z' },
  { id: 'cc444444-4444-4444-4444-444444444444', email: 'matej@demo.hr', name: 'Matej Šarić', role: 'sitter', avatar_url: null, phone: '+385 94 444 5566', city: 'Zadar', created_at: '2025-10-01T10:00:00Z' },
  // OWNERS
  { id: '99999999-9999-9999-9999-999999999999', email: 'tomislav@demo.hr', name: 'Tomislav Bašić', role: 'owner', avatar_url: null, phone: '+385 91 012 3456', city: 'Rijeka', created_at: '2025-06-01T10:00:00Z' },
  { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', email: 'nina@demo.hr', name: 'Nina Šimunović', role: 'owner', avatar_url: null, phone: '+385 92 123 4567', city: 'Zagreb', created_at: '2025-07-15T10:00:00Z' },
  // ADMIN
  { id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', email: 'admin@sapica.hr', name: 'Admin Šapica', role: 'admin', avatar_url: null, phone: null, city: 'Zagreb', created_at: '2025-01-01T10:00:00Z' },
];

// ============================================================
// SITTER PROFILES
// ============================================================

export const mockSitterProfiles: (SitterProfile & { user: User })[] = [
  {
    user_id: '11111111-1111-1111-1111-111111111111',
    bio: 'Obožavam životinje od malih nogu! Imam veliku kuću s ograđenim dvorištem u Rijeci. Specijalizirana sam za pse svih veličina. Vaš ljubimac će uživati u šetnjama uz more i bezbroj maženja!',
    experience_years: 5, services: ['boarding', 'walking', 'daycare'],
    prices: { boarding: 25, walking: 10, daycare: 20, 'house-sitting': 0, 'drop-in': 0 } as Record<ServiceType, number>,
    verified: true, superhost: true, response_time: 'unutar 1 sata',
    rating_avg: 4.9, review_count: 23,
    location_lat: 45.3271, location_lng: 14.4422, city: 'Rijeka',
    photos: [], created_at: '2025-06-15T10:00:00Z',
    user: mockUsers[0],
  },
  {
    user_id: '22222222-2222-2222-2222-222222222222',
    bio: 'Veterinarski tehničar s 3 godine iskustva u čuvanju kućnih ljubimaca. Mogu brinuti o životinjama s posebnim potrebama i davati lijekove. Živim u centru Rijeke u stanu prilagođenom za ljubimce.',
    experience_years: 3, services: ['boarding', 'house-sitting', 'drop-in'],
    prices: { boarding: 30, 'house-sitting': 35, 'drop-in': 15, walking: 0, daycare: 0 } as Record<ServiceType, number>,
    verified: true, superhost: false, response_time: 'unutar 2 sata',
    rating_avg: 4.7, review_count: 15,
    location_lat: 45.3289, location_lng: 14.4380, city: 'Rijeka',
    photos: [], created_at: '2025-07-01T10:00:00Z',
    user: mockUsers[1],
  },
  {
    user_id: '33333333-3333-3333-3333-333333333333',
    bio: 'Studentica biologije i velika ljubiteljica životinja. Imam iskustva s psima, mačkama i malim životinjama. Fleksibilna sam s rasporedom i uvijek dostupna za vaše ljubimce!',
    experience_years: 2, services: ['walking', 'drop-in', 'daycare'],
    prices: { walking: 8, 'drop-in': 12, daycare: 18, boarding: 0, 'house-sitting': 0 } as Record<ServiceType, number>,
    verified: true, superhost: false, response_time: 'unutar 30 minuta',
    rating_avg: 4.8, review_count: 19,
    location_lat: 45.3310, location_lng: 14.4500, city: 'Rijeka',
    photos: [], created_at: '2025-08-10T10:00:00Z',
    user: mockUsers[2],
  },
  {
    user_id: '44444444-4444-4444-4444-444444444444',
    bio: 'Umirovljeni vatrogasac koji sada uživa čuvajući ljubimce. Imam veliku kuću na Trsatu s vrtom savršenim za trčanje. Posebno volim velike pse ali prihvaćam sve!',
    experience_years: 7, services: ['boarding', 'walking', 'house-sitting', 'daycare'],
    prices: { boarding: 22, walking: 8, 'house-sitting': 30, daycare: 18, 'drop-in': 0 } as Record<ServiceType, number>,
    verified: true, superhost: true, response_time: 'unutar 1 sata',
    rating_avg: 4.6, review_count: 31,
    location_lat: 45.3350, location_lng: 14.4550, city: 'Rijeka',
    photos: [], created_at: '2025-05-20T10:00:00Z',
    user: mockUsers[3],
  },
  {
    user_id: '55555555-5555-5555-5555-555555555555',
    bio: 'Profesionalna trenerica pasa s certifikatom. Nudim i trening tijekom čuvanja! Vaš ljubimac će se vratiti kući sretniji i poslušniji. Specijalizirana za štence i mlade pse.',
    experience_years: 4, services: ['boarding', 'walking', 'daycare'],
    prices: { boarding: 28, walking: 12, daycare: 22, 'house-sitting': 0, 'drop-in': 0 } as Record<ServiceType, number>,
    verified: true, superhost: false, response_time: 'unutar 2 sata',
    rating_avg: 4.5, review_count: 12,
    location_lat: 43.5081, location_lng: 16.4402, city: 'Split',
    photos: [], created_at: '2025-09-01T10:00:00Z',
    user: mockUsers[4],
  },
  {
    user_id: '66666666-6666-6666-6666-666666666666',
    bio: 'Živim u kući s velikim vrtom na rubu Zagreba. Imam dva vlastita psa koji obožavaju društvo. Idealno za ljubimce koji vole igru i druženje s drugim psima.',
    experience_years: 3, services: ['boarding', 'walking', 'daycare'],
    prices: { boarding: 27, walking: 10, daycare: 20, 'house-sitting': 0, 'drop-in': 0 } as Record<ServiceType, number>,
    verified: true, superhost: false, response_time: 'unutar 1 sata',
    rating_avg: 4.8, review_count: 18,
    location_lat: 45.8150, location_lng: 15.9819, city: 'Zagreb',
    photos: [], created_at: '2025-06-01T10:00:00Z',
    user: mockUsers[5],
  },
  {
    user_id: '77777777-7777-7777-7777-777777777777',
    bio: 'Radim od doma pa sam cijeli dan dostupna za vaše ljubimce. Imam iskustva s mačkama i psima malih pasmina. Stan je u centru Zagreba, blizu parka Maksimir.',
    experience_years: 2, services: ['house-sitting', 'drop-in', 'daycare'],
    prices: { 'house-sitting': 32, 'drop-in': 14, daycare: 19, boarding: 0, walking: 0 } as Record<ServiceType, number>,
    verified: false, superhost: false, response_time: 'unutar 3 sata',
    rating_avg: 4.4, review_count: 8,
    location_lat: 45.8200, location_lng: 15.9900, city: 'Zagreb',
    photos: [], created_at: '2025-10-15T10:00:00Z',
    user: mockUsers[6],
  },
  {
    user_id: '88888888-8888-8888-8888-888888888888',
    bio: 'Iskusni čuvar ljubimaca s fokusom na starije pse i pse s posebnim potrebama. Imam mirnu kuću savršenu za ljubimce koji trebaju dodatnu njegu i pažnju.',
    experience_years: 6, services: ['boarding', 'house-sitting', 'drop-in'],
    prices: { boarding: 32, 'house-sitting': 38, 'drop-in': 16, walking: 0, daycare: 0 } as Record<ServiceType, number>,
    verified: true, superhost: true, response_time: 'unutar 1 sata',
    rating_avg: 4.9, review_count: 27,
    location_lat: 45.8100, location_lng: 15.9700, city: 'Zagreb',
    photos: [], created_at: '2025-04-10T10:00:00Z',
    user: mockUsers[7],
  },
  {
    user_id: 'cc111111-1111-1111-1111-111111111111',
    bio: 'Odrasla sam na farmi i obožavam sve životinje. U Osijeku imam kuću s velikim dvorištem. Posebno sam iskusna s velikim pasminama pasa i egzotičnim kućnim ljubimcima.',
    experience_years: 4, services: ['boarding', 'walking', 'daycare', 'drop-in'],
    prices: { boarding: 20, walking: 7, daycare: 15, 'drop-in': 10, 'house-sitting': 0 } as Record<ServiceType, number>,
    verified: true, superhost: false, response_time: 'unutar 1 sata',
    rating_avg: 4.7, review_count: 14,
    location_lat: 45.5550, location_lng: 18.6955, city: 'Osijek',
    photos: [], created_at: '2025-07-20T10:00:00Z',
    user: mockUsers[8],
  },
  {
    user_id: 'cc222222-2222-2222-2222-222222222222',
    bio: 'Bivši policijski trener pasa, sada u mirovini. Živim u kući blizu Marjana, savršeno za dugačke šetnje. Iskusan s agresivnim i plašljivim psima.',
    experience_years: 10, services: ['boarding', 'walking', 'house-sitting'],
    prices: { boarding: 30, walking: 12, 'house-sitting': 35, daycare: 0, 'drop-in': 0 } as Record<ServiceType, number>,
    verified: true, superhost: true, response_time: 'unutar 30 minuta',
    rating_avg: 4.9, review_count: 35,
    location_lat: 43.5147, location_lng: 16.4435, city: 'Split',
    photos: [], created_at: '2025-08-05T10:00:00Z',
    user: mockUsers[9],
  },
  {
    user_id: 'cc333333-3333-3333-3333-333333333333',
    bio: 'Studentica veterine na 4. godini. Živim u Puli blizu Arene s malim ali ugodnim stanom. Specijalizirana za mačke i male pse. Nudim i osnovnu njegu (kupanje, četkanje).',
    experience_years: 3, services: ['drop-in', 'daycare', 'house-sitting'],
    prices: { 'drop-in': 10, daycare: 16, 'house-sitting': 28, boarding: 0, walking: 0 } as Record<ServiceType, number>,
    verified: true, superhost: false, response_time: 'unutar 2 sata',
    rating_avg: 4.6, review_count: 11,
    location_lat: 44.8666, location_lng: 13.8496, city: 'Pula',
    photos: [], created_at: '2025-09-12T10:00:00Z',
    user: mockUsers[10],
  },
  {
    user_id: 'cc444444-4444-4444-4444-444444444444',
    bio: 'Radim kao fotograf pa imam fleksibilan raspored. Obožavam pse i imam tri vlastita. Kuća s dvorištem u mirnom dijelu Zadra, 5 minuta od plaže.',
    experience_years: 2, services: ['boarding', 'walking', 'daycare'],
    prices: { boarding: 24, walking: 9, daycare: 17, 'house-sitting': 0, 'drop-in': 0 } as Record<ServiceType, number>,
    verified: true, superhost: false, response_time: 'unutar 1 sata',
    rating_avg: 4.5, review_count: 9,
    location_lat: 44.1194, location_lng: 15.2314, city: 'Zadar',
    photos: [], created_at: '2025-10-01T10:00:00Z',
    user: mockUsers[11],
  },
];

// ============================================================
// PETS
// ============================================================

export const mockPets: Pet[] = [
  { id: 'pet11111-1111-1111-1111-111111111111', owner_id: '99999999-9999-9999-9999-999999999999', name: 'Rex', species: 'dog', breed: 'Njemački ovčar', age: 5, weight: 35.0, special_needs: 'Treba redovitu šetnju, alergičan na piletinu', photo_url: null, created_at: '2025-06-01T10:00:00Z' },
  { id: 'pet22222-2222-2222-2222-222222222222', owner_id: '99999999-9999-9999-9999-999999999999', name: 'Mila', species: 'cat', breed: 'Perzijska', age: 3, weight: 4.5, special_needs: null, photo_url: null, created_at: '2025-06-02T10:00:00Z' },
  { id: 'pet33333-3333-3333-3333-333333333333', owner_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', name: 'Luna', species: 'dog', breed: 'Labrador', age: 2, weight: 28.0, special_needs: null, photo_url: null, created_at: '2025-07-15T10:00:00Z' },
  { id: 'pet44444-4444-4444-4444-444444444444', owner_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', name: 'Whiskers', species: 'cat', breed: 'Domaća kratkodlaka', age: 7, weight: 5.0, special_needs: 'Dijabetes - treba inzulin 2x dnevno', photo_url: null, created_at: '2025-07-16T10:00:00Z' },
  { id: 'pet55555-5555-5555-5555-555555555555', owner_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', name: 'Buddy', species: 'dog', breed: 'Zlatni retriver', age: 4, weight: 32.0, special_needs: null, photo_url: null, created_at: '2025-07-17T10:00:00Z' },
  { id: 'pet66666-6666-6666-6666-666666666666', owner_id: '99999999-9999-9999-9999-999999999999', name: 'Coco', species: 'dog', breed: 'Pudlica', age: 1, weight: 6.0, special_needs: null, photo_url: null, created_at: '2025-11-01T10:00:00Z' },
  { id: 'pet77777-7777-7777-7777-777777777777', owner_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', name: 'Felix', species: 'cat', breed: 'Britanska kratkodlaka', age: 5, weight: 6.5, special_needs: null, photo_url: null, created_at: '2025-08-01T10:00:00Z' },
  { id: 'pet88888-8888-8888-8888-888888888888', owner_id: '99999999-9999-9999-9999-999999999999', name: 'Žuja', species: 'other', breed: 'Papiga', age: 2, weight: 0.3, special_needs: 'Treba posebnu hranu za papige', photo_url: null, created_at: '2025-12-01T10:00:00Z' },
];

// ============================================================
// BOOKINGS
// ============================================================

export const mockBookings: Booking[] = [
  // Completed
  { id: 'book1111-1111-1111-1111-111111111111', owner_id: '99999999-9999-9999-9999-999999999999', sitter_id: '11111111-1111-1111-1111-111111111111', pet_id: 'pet11111-1111-1111-1111-111111111111', service_type: 'boarding', start_date: '2026-03-01', end_date: '2026-03-06', status: 'completed', total_price: 125.00, note: 'Rex voli šetnje ujutro', created_at: '2026-02-25T10:00:00Z' },
  { id: 'book3333-3333-3333-3333-333333333333', owner_id: '99999999-9999-9999-9999-999999999999', sitter_id: '33333333-3333-3333-3333-333333333333', pet_id: 'pet11111-1111-1111-1111-111111111111', service_type: 'walking', start_date: '2026-03-10', end_date: '2026-03-10', status: 'completed', total_price: 8.00, note: null, created_at: '2026-03-09T10:00:00Z' },
  { id: 'book5555-5555-5555-5555-555555555555', owner_id: '99999999-9999-9999-9999-999999999999', sitter_id: '44444444-4444-4444-4444-444444444444', pet_id: 'pet11111-1111-1111-1111-111111111111', service_type: 'boarding', start_date: '2026-02-10', end_date: '2026-02-15', status: 'completed', total_price: 110.00, note: null, created_at: '2026-02-08T10:00:00Z' },
  { id: 'book6666-6666-6666-6666-666666666666', owner_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', sitter_id: '44444444-4444-4444-4444-444444444444', pet_id: 'pet33333-3333-3333-3333-333333333333', service_type: 'walking', start_date: '2026-02-20', end_date: '2026-02-20', status: 'completed', total_price: 8.00, note: null, created_at: '2026-02-19T10:00:00Z' },
  { id: 'book7777-7777-7777-7777-777777777777', owner_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', sitter_id: '11111111-1111-1111-1111-111111111111', pet_id: 'pet55555-5555-5555-5555-555555555555', service_type: 'daycare', start_date: '2026-01-15', end_date: '2026-01-15', status: 'completed', total_price: 20.00, note: null, created_at: '2026-01-14T10:00:00Z' },
  { id: 'book8888-8888-8888-8888-888888888888', owner_id: '99999999-9999-9999-9999-999999999999', sitter_id: '66666666-6666-6666-6666-666666666666', pet_id: 'pet22222-2222-2222-2222-222222222222', service_type: 'house-sitting', start_date: '2026-01-20', end_date: '2026-01-25', status: 'completed', total_price: 160.00, note: null, created_at: '2026-01-18T10:00:00Z' },
  { id: 'book9999-9999-9999-9999-999999999999', owner_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', sitter_id: '22222222-2222-2222-2222-222222222222', pet_id: 'pet44444-4444-4444-4444-444444444444', service_type: 'drop-in', start_date: '2026-02-01', end_date: '2026-02-01', status: 'completed', total_price: 15.00, note: null, created_at: '2026-01-30T10:00:00Z' },
  { id: 'bookaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', owner_id: '99999999-9999-9999-9999-999999999999', sitter_id: '88888888-8888-8888-8888-888888888888', pet_id: 'pet11111-1111-1111-1111-111111111111', service_type: 'boarding', start_date: '2026-02-05', end_date: '2026-02-10', status: 'completed', total_price: 160.00, note: null, created_at: '2026-02-03T10:00:00Z' },
  { id: 'bookbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', owner_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', sitter_id: '55555555-5555-5555-5555-555555555555', pet_id: 'pet33333-3333-3333-3333-333333333333', service_type: 'walking', start_date: '2026-03-01', end_date: '2026-03-01', status: 'completed', total_price: 12.00, note: null, created_at: '2026-02-28T10:00:00Z' },
  { id: 'bookcccc-cccc-cccc-cccc-cccccccccccc', owner_id: '99999999-9999-9999-9999-999999999999', sitter_id: '77777777-7777-7777-7777-777777777777', pet_id: 'pet22222-2222-2222-2222-222222222222', service_type: 'drop-in', start_date: '2026-03-05', end_date: '2026-03-05', status: 'completed', total_price: 14.00, note: null, created_at: '2026-03-04T10:00:00Z' },
  { id: 'bookdddd-dddd-dddd-dddd-dddddddddddd', owner_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', sitter_id: 'cc111111-1111-1111-1111-111111111111', pet_id: 'pet55555-5555-5555-5555-555555555555', service_type: 'boarding', start_date: '2026-02-15', end_date: '2026-02-18', status: 'completed', total_price: 60.00, note: null, created_at: '2026-02-13T10:00:00Z' },
  { id: 'bookeeee-eeee-eeee-eeee-eeeeeeeeeeee', owner_id: '99999999-9999-9999-9999-999999999999', sitter_id: 'cc222222-2222-2222-2222-222222222222', pet_id: 'pet11111-1111-1111-1111-111111111111', service_type: 'walking', start_date: '2026-03-08', end_date: '2026-03-08', status: 'completed', total_price: 12.00, note: null, created_at: '2026-03-07T10:00:00Z' },
  // Accepted
  { id: 'book2222-2222-2222-2222-222222222222', owner_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', sitter_id: '22222222-2222-2222-2222-222222222222', pet_id: 'pet33333-3333-3333-3333-333333333333', service_type: 'boarding', start_date: '2026-03-28', end_date: '2026-04-02', status: 'accepted', total_price: 150.00, note: null, created_at: '2026-03-20T10:00:00Z' },
  { id: 'bookffff-ffff-ffff-ffff-ffffffffffff', owner_id: '99999999-9999-9999-9999-999999999999', sitter_id: '11111111-1111-1111-1111-111111111111', pet_id: 'pet66666-6666-6666-6666-666666666666', service_type: 'daycare', start_date: '2026-04-01', end_date: '2026-04-01', status: 'accepted', total_price: 20.00, note: 'Coco je štene, puno energije', created_at: '2026-03-22T10:00:00Z' },
  // Pending
  { id: 'book4444-4444-4444-4444-444444444444', owner_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', sitter_id: '66666666-6666-6666-6666-666666666666', pet_id: 'pet55555-5555-5555-5555-555555555555', service_type: 'daycare', start_date: '2026-04-01', end_date: '2026-04-01', status: 'pending', total_price: 20.00, note: 'Buddy se dobro slaže s drugim psima', created_at: '2026-03-23T10:00:00Z' },
  { id: 'bookgg11-1111-1111-1111-111111111111', owner_id: '99999999-9999-9999-9999-999999999999', sitter_id: '44444444-4444-4444-4444-444444444444', pet_id: 'pet11111-1111-1111-1111-111111111111', service_type: 'boarding', start_date: '2026-04-05', end_date: '2026-04-10', status: 'pending', total_price: 110.00, note: 'Rex treba posebnu hranu', created_at: '2026-03-24T10:00:00Z' },
  { id: 'bookgg22-2222-2222-2222-222222222222', owner_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', sitter_id: '88888888-8888-8888-8888-888888888888', pet_id: 'pet44444-4444-4444-4444-444444444444', service_type: 'house-sitting', start_date: '2026-04-08', end_date: '2026-04-12', status: 'pending', total_price: 152.00, note: 'Whiskers treba inzulin!', created_at: '2026-03-24T11:00:00Z' },
  // Cancelled / Rejected
  { id: 'bookgg33-3333-3333-3333-333333333333', owner_id: '99999999-9999-9999-9999-999999999999', sitter_id: '77777777-7777-7777-7777-777777777777', pet_id: 'pet22222-2222-2222-2222-222222222222', service_type: 'daycare', start_date: '2026-03-15', end_date: '2026-03-15', status: 'cancelled', total_price: 19.00, note: null, created_at: '2026-03-12T10:00:00Z' },
  { id: 'bookgg44-4444-4444-4444-444444444444', owner_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', sitter_id: '33333333-3333-3333-3333-333333333333', pet_id: 'pet33333-3333-3333-3333-333333333333', service_type: 'walking', start_date: '2026-03-18', end_date: '2026-03-18', status: 'rejected', total_price: 8.00, note: null, created_at: '2026-03-16T10:00:00Z' },
];

// ============================================================
// REVIEWS
// ============================================================

export const mockReviews: (Review & { reviewer: User; booking: Booking })[] = [
  { id: 'rev11111-1111-1111-1111-111111111111', booking_id: 'book1111-1111-1111-1111-111111111111', reviewer_id: '99999999-9999-9999-9999-999999999999', reviewee_id: '11111111-1111-1111-1111-111111111111', rating: 5, comment: 'Ana je fantastična! Rex se vratio sretan i zadovoljan. Dvorište je savršeno za njega. Definitivno ćemo se vratiti!', created_at: '2026-03-07T10:00:00Z', reviewer: mockUsers.find(u => u.id === '99999999-9999-9999-9999-999999999999')!, booking: mockBookings[0] },
  { id: 'rev22222-2222-2222-2222-222222222222', booking_id: 'book3333-3333-3333-3333-333333333333', reviewer_id: '99999999-9999-9999-9999-999999999999', reviewee_id: '33333333-3333-3333-3333-333333333333', rating: 5, comment: 'Ivana je odlična šetačica! Rex je bio umoran i sretan nakon šetnje. Preporučujem svima!', created_at: '2026-03-11T10:00:00Z', reviewer: mockUsers.find(u => u.id === '99999999-9999-9999-9999-999999999999')!, booking: mockBookings[1] },
  { id: 'rev33333-3333-3333-3333-333333333333', booking_id: 'book5555-5555-5555-5555-555555555555', reviewer_id: '99999999-9999-9999-9999-999999999999', reviewee_id: '44444444-4444-4444-4444-444444444444', rating: 4, comment: 'Luka je odličan! Kuća na Trsatu je savršena za Rex-a. Jedini minus je što je malo daleko od centra.', created_at: '2026-02-16T10:00:00Z', reviewer: mockUsers.find(u => u.id === '99999999-9999-9999-9999-999999999999')!, booking: mockBookings[2] },
  { id: 'rev44444-4444-4444-4444-444444444444', booking_id: 'book6666-6666-6666-6666-666666666666', reviewer_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', reviewee_id: '44444444-4444-4444-4444-444444444444', rating: 5, comment: 'Luna je obožavala šetnju s Lukom! Vrlo pažljiv i iskusan.', created_at: '2026-02-21T10:00:00Z', reviewer: mockUsers.find(u => u.id === 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')!, booking: mockBookings[3] },
  { id: 'rev55555-5555-5555-5555-555555555555', booking_id: 'book7777-7777-7777-7777-777777777777', reviewer_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', reviewee_id: '11111111-1111-1111-1111-111111111111', rating: 5, comment: 'Buddy se odlično proveo kod Ane. Slali su nam fotke cijeli dan!', created_at: '2026-01-16T10:00:00Z', reviewer: mockUsers.find(u => u.id === 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')!, booking: mockBookings[4] },
  { id: 'rev66666-6666-6666-6666-666666666666', booking_id: 'book8888-8888-8888-8888-888888888888', reviewer_id: '99999999-9999-9999-9999-999999999999', reviewee_id: '66666666-6666-6666-6666-666666666666', rating: 5, comment: 'Filip je savršen čuvar! Mila je bila u odličnim rukama. Kuća je čista i sigurna.', created_at: '2026-01-26T10:00:00Z', reviewer: mockUsers.find(u => u.id === '99999999-9999-9999-9999-999999999999')!, booking: mockBookings[5] },
  { id: 'rev77777-7777-7777-7777-777777777777', booking_id: 'book9999-9999-9999-9999-999999999999', reviewer_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', reviewee_id: '22222222-2222-2222-2222-222222222222', rating: 4, comment: 'Marko je bio vrlo profesionalan. Whiskers je dobio lijekove na vrijeme. Preporučujem!', created_at: '2026-02-02T10:00:00Z', reviewer: mockUsers.find(u => u.id === 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')!, booking: mockBookings[6] },
  { id: 'rev88888-8888-8888-8888-888888888888', booking_id: 'bookaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', reviewer_id: '99999999-9999-9999-9999-999999999999', reviewee_id: '88888888-8888-8888-8888-888888888888', rating: 5, comment: 'Ivan je nevjerojatan! Rex s posebnim potrebama zahtijeva puno pažnje i Ivan je bio savršen.', created_at: '2026-02-11T10:00:00Z', reviewer: mockUsers.find(u => u.id === '99999999-9999-9999-9999-999999999999')!, booking: mockBookings[7] },
  { id: 'rev99999-9999-9999-9999-999999999999', booking_id: 'bookbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', reviewer_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', reviewee_id: '55555555-5555-5555-5555-555555555555', rating: 4, comment: 'Petra je odlična šetačica. Luna je bila sretna. Jedino bi mogla slati više fotki.', created_at: '2026-03-02T10:00:00Z', reviewer: mockUsers.find(u => u.id === 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')!, booking: mockBookings[8] },
  { id: 'revaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', booking_id: 'bookcccc-cccc-cccc-cccc-cccccccccccc', reviewer_id: '99999999-9999-9999-9999-999999999999', reviewee_id: '77777777-7777-7777-7777-777777777777', rating: 4, comment: 'Maja je bila super za Milu! Stan je u dobrom kvartu blizu parka.', created_at: '2026-03-06T10:00:00Z', reviewer: mockUsers.find(u => u.id === '99999999-9999-9999-9999-999999999999')!, booking: mockBookings[9] },
  { id: 'revbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', booking_id: 'bookdddd-dddd-dddd-dddd-dddddddddddd', reviewer_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', reviewee_id: 'cc111111-1111-1111-1111-111111111111', rating: 5, comment: 'Katarina je bila prekrasna! Buddy se osjećao kao kod kuće. Veliko dvorište je idealno za njega.', created_at: '2026-02-19T10:00:00Z', reviewer: mockUsers.find(u => u.id === 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')!, booking: mockBookings[10] },
  { id: 'revccccc-cccc-cccc-cccc-cccccccccccc', booking_id: 'bookeeee-eeee-eeee-eeee-eeeeeeeeeeee', reviewer_id: '99999999-9999-9999-9999-999999999999', reviewee_id: 'cc222222-2222-2222-2222-222222222222', rating: 5, comment: 'Ante je pravi profesionalac! Rex ga je odmah zavolio. Šetnja pokraj Marjana je bila savršena.', created_at: '2026-03-09T10:00:00Z', reviewer: mockUsers.find(u => u.id === '99999999-9999-9999-9999-999999999999')!, booking: mockBookings[11] },
  { id: 'revddddd-dddd-dddd-dddd-dddddddddddd', booking_id: 'book1111-1111-1111-1111-111111111111', reviewer_id: '99999999-9999-9999-9999-999999999999', reviewee_id: '11111111-1111-1111-1111-111111111111', rating: 5, comment: 'Drugi put kod Ane i opet savršeno iskustvo. Rex jedva čeka sljedeći put!', created_at: '2026-03-15T10:00:00Z', reviewer: mockUsers.find(u => u.id === '99999999-9999-9999-9999-999999999999')!, booking: mockBookings[0] },
  { id: 'reveeeee-eeee-eeee-eeee-eeeeeeeeeeee', booking_id: 'book8888-8888-8888-8888-888888888888', reviewer_id: '99999999-9999-9999-9999-999999999999', reviewee_id: '66666666-6666-6666-6666-666666666666', rating: 4, comment: 'Opet super iskustvo kod Filipa. Mila je obožavala njegov vrt.', created_at: '2026-03-18T10:00:00Z', reviewer: mockUsers.find(u => u.id === '99999999-9999-9999-9999-999999999999')!, booking: mockBookings[5] },
  { id: 'revfffff-ffff-ffff-ffff-ffffffffffff', booking_id: 'book9999-9999-9999-9999-999999999999', reviewer_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', reviewee_id: '22222222-2222-2222-2222-222222222222', rating: 5, comment: 'Marko je opet bio odličan s Whiskersem. Svi lijekovi dani na vrijeme, profesionalno kao uvijek.', created_at: '2026-03-20T10:00:00Z', reviewer: mockUsers.find(u => u.id === 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')!, booking: mockBookings[6] },
];

// ============================================================
// MESSAGES
// ============================================================

export const mockMessages: (Message & { sender: User })[] = [
  // Conversation: Tomislav <-> Ana
  { id: 'msg11111-1111-1111-1111-111111111111', sender_id: '99999999-9999-9999-9999-999999999999', receiver_id: '11111111-1111-1111-1111-111111111111', booking_id: 'book1111-1111-1111-1111-111111111111', content: 'Bok Ana! Zanima me mogu li dovesti Rex-a sljedeći tjedan?', image_url: null, read: true, created_at: '2026-03-19T09:00:00Z', sender: mockUsers.find(u => u.id === '99999999-9999-9999-9999-999999999999')! },
  { id: 'msg22222-2222-2222-2222-222222222222', sender_id: '11111111-1111-1111-1111-111111111111', receiver_id: '99999999-9999-9999-9999-999999999999', booking_id: 'book1111-1111-1111-1111-111111111111', content: 'Bok Tomislave! Naravno, rado ću čuvati Rex-a. Koji datumi vam odgovaraju?', image_url: null, read: true, created_at: '2026-03-19T09:30:00Z', sender: mockUsers.find(u => u.id === '11111111-1111-1111-1111-111111111111')! },
  { id: 'msg33333-3333-3333-3333-333333333333', sender_id: '99999999-9999-9999-9999-999999999999', receiver_id: '11111111-1111-1111-1111-111111111111', booking_id: 'book1111-1111-1111-1111-111111111111', content: 'Od 1. do 6. travnja. Ima li mjesta?', image_url: null, read: true, created_at: '2026-03-20T08:00:00Z', sender: mockUsers.find(u => u.id === '99999999-9999-9999-9999-999999999999')! },
  { id: 'msg44444-4444-4444-4444-444444444444', sender_id: '11111111-1111-1111-1111-111111111111', receiver_id: '99999999-9999-9999-9999-999999999999', booking_id: 'book1111-1111-1111-1111-111111111111', content: 'Savršeno, ti datumi mi odgovaraju! Samo napravite rezervaciju kroz aplikaciju. 🐾', image_url: null, read: true, created_at: '2026-03-20T09:00:00Z', sender: mockUsers.find(u => u.id === '11111111-1111-1111-1111-111111111111')! },
  { id: 'msg55555-5555-5555-5555-555555555555', sender_id: '99999999-9999-9999-9999-999999999999', receiver_id: '11111111-1111-1111-1111-111111111111', booking_id: null, content: 'Super, hvala! Upravo sam poslao rezervaciju. Rex se veseli! 😊', image_url: null, read: true, created_at: '2026-03-20T09:15:00Z', sender: mockUsers.find(u => u.id === '99999999-9999-9999-9999-999999999999')! },
  // Conversation: Nina <-> Marko
  { id: 'msg66666-6666-6666-6666-666666666666', sender_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', receiver_id: '22222222-2222-2222-2222-222222222222', booking_id: 'book9999-9999-9999-9999-999999999999', content: 'Bok Marko! Whiskers treba nekoga tko mu može dati inzulin. Imate li iskustva s tim?', image_url: null, read: true, created_at: '2026-01-28T14:00:00Z', sender: mockUsers.find(u => u.id === 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')! },
  { id: 'msg77777-7777-7777-7777-777777777777', sender_id: '22222222-2222-2222-2222-222222222222', receiver_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', booking_id: 'book9999-9999-9999-9999-999999999999', content: 'Bok Nina! Da, kao vet. tehničar redovito dajem injekcije. Nema brige, Whiskers će biti u dobrim rukama!', image_url: null, read: true, created_at: '2026-01-28T14:30:00Z', sender: mockUsers.find(u => u.id === '22222222-2222-2222-2222-222222222222')! },
  { id: 'msg88888-8888-8888-8888-888888888888', sender_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', receiver_id: '22222222-2222-2222-2222-222222222222', booking_id: null, content: 'Odlično, to me jako umiruje! Poslat ću vam rezervaciju odmah.', image_url: null, read: true, created_at: '2026-01-28T15:00:00Z', sender: mockUsers.find(u => u.id === 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')! },
  // Conversation: Tomislav <-> Filip
  { id: 'msg99999-9999-9999-9999-999999999999', sender_id: '99999999-9999-9999-9999-999999999999', receiver_id: '66666666-6666-6666-6666-666666666666', booking_id: 'book8888-8888-8888-8888-888888888888', content: 'Bok Filip! Mila je mačka koja ne voli glasne zvukove. Je li vaša kuća mirna?', image_url: null, read: true, created_at: '2026-01-17T10:00:00Z', sender: mockUsers.find(u => u.id === '99999999-9999-9999-9999-999999999999')! },
  { id: 'msgaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', sender_id: '66666666-6666-6666-6666-666666666666', receiver_id: '99999999-9999-9999-9999-999999999999', booking_id: 'book8888-8888-8888-8888-888888888888', content: 'Bok Tomislave! Da, živimo u mirnom kvartu. Moji psi su mirni i navikli na mačke. Mila će se osjećati kao doma!', image_url: null, read: true, created_at: '2026-01-17T10:30:00Z', sender: mockUsers.find(u => u.id === '66666666-6666-6666-6666-666666666666')! },
  { id: 'msgbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', sender_id: '99999999-9999-9999-9999-999999999999', receiver_id: '66666666-6666-6666-6666-666666666666', booking_id: null, content: 'Hvala na informaciji! Šaljem rezervaciju za 20.-25. siječnja.', image_url: null, read: false, created_at: '2026-01-17T11:00:00Z', sender: mockUsers.find(u => u.id === '99999999-9999-9999-9999-999999999999')! },
  // Conversation: Nina <-> Filip
  { id: 'msgccccc-cccc-cccc-cccc-cccccccccccc', sender_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', receiver_id: '66666666-6666-6666-6666-666666666666', booking_id: 'book4444-4444-4444-4444-444444444444', content: 'Bok Filip! Buddy je jako društven i voli se igrati. Koliko pasa trenutno imate na čuvanju?', image_url: null, read: true, created_at: '2026-03-23T12:00:00Z', sender: mockUsers.find(u => u.id === 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')! },
  { id: 'msgddddd-dddd-dddd-dddd-dddddddddddd', sender_id: '66666666-6666-6666-6666-666666666666', receiver_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', booking_id: 'book4444-4444-4444-4444-444444444444', content: 'Bok Nina! Trenutno imam samo svoja dva psa. Buddy će imati puno prostora za igru! Vrt je velik i ograđen.', image_url: null, read: false, created_at: '2026-03-23T12:30:00Z', sender: mockUsers.find(u => u.id === '66666666-6666-6666-6666-666666666666')! },
];

// ============================================================
// AVAILABILITY (next 30 days for all sitters)
// ============================================================

function generateAvailability(): Availability[] {
  const result: Availability[] = [];
  const today = new Date();
  let counter = 1;

  const sitterConfigs: { id: string; weekendOff: boolean; randomOff: number[] }[] = [
    { id: '11111111-1111-1111-1111-111111111111', weekendOff: false, randomOff: [5, 12, 20] },
    { id: '22222222-2222-2222-2222-222222222222', weekendOff: true, randomOff: [] },
    { id: '33333333-3333-3333-3333-333333333333', weekendOff: false, randomOff: [3, 7, 15, 22] },
    { id: '44444444-4444-4444-4444-444444444444', weekendOff: false, randomOff: [10, 25] },
    { id: '55555555-5555-5555-5555-555555555555', weekendOff: false, randomOff: [2, 8, 14, 19, 26] },
    { id: '66666666-6666-6666-6666-666666666666', weekendOff: false, randomOff: [4, 11] },
    { id: '77777777-7777-7777-7777-777777777777', weekendOff: false, randomOff: [1, 6, 9, 13, 17, 21, 28] },
    { id: '88888888-8888-8888-8888-888888888888', weekendOff: false, randomOff: [7] },
    { id: 'cc111111-1111-1111-1111-111111111111', weekendOff: false, randomOff: [3, 10, 18] },
    { id: 'cc222222-2222-2222-2222-222222222222', weekendOff: false, randomOff: [5, 15] },
    { id: 'cc333333-3333-3333-3333-333333333333', weekendOff: true, randomOff: [8] },
    { id: 'cc444444-4444-4444-4444-444444444444', weekendOff: false, randomOff: [2, 12, 22] },
  ];

  for (const config of sitterConfigs) {
    for (let i = 0; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const available = !(config.weekendOff && isWeekend) && !config.randomOff.includes(i);
      result.push({
        id: `avail-${config.id.slice(0, 8)}-${String(counter++).padStart(4, '0')}`,
        sitter_id: config.id,
        date: dateStr,
        available,
      });
    }
  }

  return result;
}

export const mockAvailability: Availability[] = generateAvailability();

// ============================================================
// WALKS (GPS Tracking)
// ============================================================

export const mockWalks: Walk[] = [
  {
    id: 'walk1111-1111-1111-1111-111111111111',
    sitter_id: '33333333-3333-3333-3333-333333333333',
    pet_id: 'pet11111-1111-1111-1111-111111111111',
    booking_id: 'book3333-3333-3333-3333-333333333333',
    start_time: '2026-03-24T08:00:00Z',
    end_time: null,
    status: 'u_tijeku',
    distance_km: 2.1,
    route: [
      { lat: 45.32710, lng: 14.44220 }, // Korzo - start
      { lat: 45.32750, lng: 14.44100 },
      { lat: 45.32800, lng: 14.43950 },
      { lat: 45.32830, lng: 14.43800 },
      { lat: 45.32780, lng: 14.43650 },
      { lat: 45.32700, lng: 14.43500 },
      { lat: 45.32650, lng: 14.43350 }, // Riva
      { lat: 45.32600, lng: 14.43200 },
      { lat: 45.32580, lng: 14.43050 },
      { lat: 45.32620, lng: 14.42900 },
      { lat: 45.32700, lng: 14.42800 },
      { lat: 45.32800, lng: 14.42750 },
      { lat: 45.32900, lng: 14.42800 }, // Brajda
      { lat: 45.33000, lng: 14.42900 },
      { lat: 45.33100, lng: 14.43050 },
      { lat: 45.33200, lng: 14.43200 },
      { lat: 45.33300, lng: 14.43400 },
      { lat: 45.33400, lng: 14.43600 },
      { lat: 45.33500, lng: 14.43800 },
      { lat: 45.33600, lng: 14.44000 },
      { lat: 45.33700, lng: 14.44200 },
      { lat: 45.33800, lng: 14.44400 },
      { lat: 45.33900, lng: 14.44600 },
      { lat: 45.34000, lng: 14.44800 }, // prema Trsatu
      { lat: 45.34100, lng: 14.45000 },
    ],
    checkpoints: [
      { time: '2026-03-24T08:00:00Z', label: 'Početak šetnje - Korzo', emoji: '🚶', lat: 45.32710, lng: 14.44220 },
      { time: '2026-03-24T08:15:00Z', label: 'Riva - odmor uz more', emoji: '🌊', lat: 45.32650, lng: 14.43350 },
      { time: '2026-03-24T08:30:00Z', label: 'Park Brajda - igra', emoji: '🌳', lat: 45.32900, lng: 14.42800 },
      { time: '2026-03-24T08:50:00Z', label: 'Uspon prema Trsatu', emoji: '⛰️', lat: 45.34100, lng: 14.45000 },
    ],
  },
  {
    id: 'walk2222-2222-2222-2222-222222222222',
    sitter_id: '11111111-1111-1111-1111-111111111111',
    pet_id: 'pet66666-6666-6666-6666-666666666666',
    booking_id: 'bookffff-ffff-ffff-ffff-ffffffffffff',
    start_time: '2026-03-24T07:30:00Z',
    end_time: null,
    status: 'u_tijeku',
    distance_km: 1.5,
    route: [
      { lat: 45.32710, lng: 14.44220 },
      { lat: 45.32680, lng: 14.44100 },
      { lat: 45.32650, lng: 14.43950 },
      { lat: 45.32620, lng: 14.43800 },
      { lat: 45.32600, lng: 14.43650 },
      { lat: 45.32580, lng: 14.43500 },
      { lat: 45.32560, lng: 14.43350 },
      { lat: 45.32550, lng: 14.43200 },
      { lat: 45.32570, lng: 14.43050 },
      { lat: 45.32600, lng: 14.42900 },
      { lat: 45.32650, lng: 14.42800 },
      { lat: 45.32700, lng: 14.42750 },
      { lat: 45.32750, lng: 14.42700 },
      { lat: 45.32800, lng: 14.42680 },
      { lat: 45.32850, lng: 14.42700 },
      { lat: 45.32900, lng: 14.42750 },
      { lat: 45.32950, lng: 14.42800 },
      { lat: 45.33000, lng: 14.42900 },
      { lat: 45.33050, lng: 14.43050 },
      { lat: 45.33100, lng: 14.43200 },
    ],
    checkpoints: [
      { time: '2026-03-24T07:30:00Z', label: 'Početak - centar', emoji: '🚶', lat: 45.32710, lng: 14.44220 },
      { time: '2026-03-24T07:45:00Z', label: 'Riva - šetnja uz obalu', emoji: '🌊', lat: 45.32580, lng: 14.43500 },
      { time: '2026-03-24T08:00:00Z', label: 'Park - igra s loptom', emoji: '⚽', lat: 45.32800, lng: 14.42680 },
    ],
  },
  {
    id: 'walk3333-3333-3333-3333-333333333333',
    sitter_id: '44444444-4444-4444-4444-444444444444',
    pet_id: 'pet11111-1111-1111-1111-111111111111',
    booking_id: 'book5555-5555-5555-5555-555555555555',
    start_time: '2026-02-12T09:00:00Z',
    end_time: '2026-02-12T09:45:00Z',
    status: 'zavrsena',
    distance_km: 3.2,
    route: [
      { lat: 45.33500, lng: 14.45500 }, // Trsat
      { lat: 45.33400, lng: 14.45300 },
      { lat: 45.33300, lng: 14.45100 },
      { lat: 45.33200, lng: 14.44900 },
      { lat: 45.33100, lng: 14.44700 },
      { lat: 45.33000, lng: 14.44500 },
      { lat: 45.32900, lng: 14.44300 },
      { lat: 45.32800, lng: 14.44100 },
      { lat: 45.32710, lng: 14.44220 }, // Korzo
      { lat: 45.32650, lng: 14.43800 },
      { lat: 45.32600, lng: 14.43500 },
      { lat: 45.32550, lng: 14.43200 }, // Riva
      { lat: 45.32500, lng: 14.42900 },
      { lat: 45.32480, lng: 14.42600 },
      { lat: 45.32500, lng: 14.42300 },
      { lat: 45.32550, lng: 14.42100 },
      { lat: 45.32600, lng: 14.41900 },
      { lat: 45.32700, lng: 14.41800 },
      { lat: 45.32800, lng: 14.41900 },
      { lat: 45.32900, lng: 14.42100 },
      { lat: 45.33000, lng: 14.42300 },
      { lat: 45.33100, lng: 14.42500 },
      { lat: 45.33200, lng: 14.42700 },
      { lat: 45.33300, lng: 14.42900 },
      { lat: 45.33400, lng: 14.43100 },
    ],
    checkpoints: [
      { time: '2026-02-12T09:00:00Z', label: 'Početak - Trsat', emoji: '🏰', lat: 45.33500, lng: 14.45500 },
      { time: '2026-02-12T09:10:00Z', label: 'Korzo - kratki odmor', emoji: '☕', lat: 45.32710, lng: 14.44220 },
      { time: '2026-02-12T09:25:00Z', label: 'Plaža Sablićevo', emoji: '🏖️', lat: 45.32480, lng: 14.42600 },
      { time: '2026-02-12T09:45:00Z', label: 'Kraj šetnje - Brajda', emoji: '🏁', lat: 45.33400, lng: 14.43100 },
    ],
  },
  {
    id: 'walk4444-4444-4444-4444-444444444444',
    sitter_id: '11111111-1111-1111-1111-111111111111',
    pet_id: 'pet11111-1111-1111-1111-111111111111',
    booking_id: 'book1111-1111-1111-1111-111111111111',
    start_time: '2026-03-03T16:00:00Z',
    end_time: '2026-03-03T16:50:00Z',
    status: 'zavrsena',
    distance_km: 2.8,
    route: [
      { lat: 45.32710, lng: 14.44220 },
      { lat: 45.32800, lng: 14.44100 },
      { lat: 45.32900, lng: 14.43950 },
      { lat: 45.33000, lng: 14.43800 },
      { lat: 45.33100, lng: 14.43650 },
      { lat: 45.33200, lng: 14.43500 },
      { lat: 45.33300, lng: 14.43350 },
      { lat: 45.33400, lng: 14.43200 },
      { lat: 45.33500, lng: 14.43050 },
      { lat: 45.33400, lng: 14.42900 },
      { lat: 45.33300, lng: 14.42800 },
      { lat: 45.33200, lng: 14.42700 },
      { lat: 45.33100, lng: 14.42600 },
      { lat: 45.33000, lng: 14.42500 },
      { lat: 45.32900, lng: 14.42600 },
      { lat: 45.32800, lng: 14.42700 },
      { lat: 45.32750, lng: 14.42850 },
      { lat: 45.32710, lng: 14.43000 },
      { lat: 45.32700, lng: 14.43200 },
      { lat: 45.32710, lng: 14.43400 },
      { lat: 45.32710, lng: 14.43600 },
      { lat: 45.32710, lng: 14.43800 },
      { lat: 45.32710, lng: 14.44000 },
      { lat: 45.32710, lng: 14.44220 },
    ],
    checkpoints: [
      { time: '2026-03-03T16:00:00Z', label: 'Početak - Korzo', emoji: '🚶', lat: 45.32710, lng: 14.44220 },
      { time: '2026-03-03T16:15:00Z', label: 'Park Mlaka', emoji: '🌳', lat: 45.33500, lng: 14.43050 },
      { time: '2026-03-03T16:30:00Z', label: 'Igralište - trčanje', emoji: '🐕', lat: 45.33000, lng: 14.42500 },
      { time: '2026-03-03T16:50:00Z', label: 'Povratak na Korzo', emoji: '🏁', lat: 45.32710, lng: 14.44220 },
    ],
  },
  {
    id: 'walk5555-5555-5555-5555-555555555555',
    sitter_id: '33333333-3333-3333-3333-333333333333',
    pet_id: 'pet33333-3333-3333-3333-333333333333',
    booking_id: 'bookgg44-4444-4444-4444-444444444444',
    start_time: '2026-03-18T10:00:00Z',
    end_time: '2026-03-18T10:40:00Z',
    status: 'zavrsena',
    distance_km: 1.9,
    route: [
      { lat: 45.33100, lng: 14.45000 },
      { lat: 45.33000, lng: 14.44800 },
      { lat: 45.32900, lng: 14.44600 },
      { lat: 45.32800, lng: 14.44400 },
      { lat: 45.32710, lng: 14.44220 },
      { lat: 45.32650, lng: 14.44050 },
      { lat: 45.32600, lng: 14.43900 },
      { lat: 45.32550, lng: 14.43750 },
      { lat: 45.32500, lng: 14.43600 },
      { lat: 45.32480, lng: 14.43450 },
      { lat: 45.32500, lng: 14.43300 },
      { lat: 45.32550, lng: 14.43150 },
      { lat: 45.32600, lng: 14.43000 },
      { lat: 45.32680, lng: 14.42900 },
      { lat: 45.32750, lng: 14.42850 },
      { lat: 45.32830, lng: 14.42900 },
      { lat: 45.32900, lng: 14.43000 },
      { lat: 45.32950, lng: 14.43150 },
      { lat: 45.33000, lng: 14.43300 },
      { lat: 45.33050, lng: 14.43500 },
    ],
    checkpoints: [
      { time: '2026-03-18T10:00:00Z', label: 'Početak - Sušak', emoji: '🚶', lat: 45.33100, lng: 14.45000 },
      { time: '2026-03-18T10:12:00Z', label: 'Korzo - prolaz', emoji: '🏙️', lat: 45.32710, lng: 14.44220 },
      { time: '2026-03-18T10:25:00Z', label: 'Riva - voda za psa', emoji: '💧', lat: 45.32480, lng: 14.43450 },
      { time: '2026-03-18T10:40:00Z', label: 'Kraj - Brajda', emoji: '🏁', lat: 45.33050, lng: 14.43500 },
    ],
  },
];

// ============================================================
// PET UPDATES (Photo/Video Feed)
// ============================================================

export const mockUpdates: PetUpdate[] = [
  // Updates for booking book1111 (Rex kod Ane, 1-6 Mar)
  { id: 'upd01', booking_id: 'book1111-1111-1111-1111-111111111111', sitter_id: '11111111-1111-1111-1111-111111111111', type: 'photo', emoji: '🐕', caption: 'Rex je stigao i već istražuje dvorište! Odmah je pronašao svoju omiljenu loptu.', created_at: '2026-03-01T09:00:00Z' },
  { id: 'upd02', booking_id: 'book1111-1111-1111-1111-111111111111', sitter_id: '11111111-1111-1111-1111-111111111111', type: 'photo', emoji: '🌳', caption: 'Jutarnja šetnja kroz park. Rex je uživao u svježem zraku!', created_at: '2026-03-01T14:00:00Z' },
  { id: 'upd03', booking_id: 'book1111-1111-1111-1111-111111111111', sitter_id: '11111111-1111-1111-1111-111111111111', type: 'text', emoji: '😴', caption: 'Rex upravo spava nakon duge šetnje. Pojeo je cijelu porciju i pije dovoljno vode.', created_at: '2026-03-01T20:00:00Z' },
  { id: 'upd04', booking_id: 'book1111-1111-1111-1111-111111111111', sitter_id: '11111111-1111-1111-1111-111111111111', type: 'photo', emoji: '🦴', caption: 'Jutarnji ritual - Rex i njegova omiljena kost za žvakanje.', created_at: '2026-03-02T08:30:00Z' },
  { id: 'upd05', booking_id: 'book1111-1111-1111-1111-111111111111', sitter_id: '11111111-1111-1111-1111-111111111111', type: 'video', emoji: '🏖️', caption: 'Šetnja uz Rivu! Rex obožava more, pogledajte kako trči po plaži! 🌊', created_at: '2026-03-02T15:00:00Z' },
  { id: 'upd06', booking_id: 'book1111-1111-1111-1111-111111111111', sitter_id: '11111111-1111-1111-1111-111111111111', type: 'photo', emoji: '🐕', caption: 'Popodnevni odmor u hladu. Rex voli ležati na trijemu.', created_at: '2026-03-03T13:00:00Z' },
  { id: 'upd07', booking_id: 'book1111-1111-1111-1111-111111111111', sitter_id: '11111111-1111-1111-1111-111111111111', type: 'text', emoji: '💊', caption: 'Rex je dobio svoju večernju porciju hrane bez piletine, kako ste naglasili. Sve je u redu!', created_at: '2026-03-03T19:00:00Z' },
  { id: 'upd08', booking_id: 'book1111-1111-1111-1111-111111111111', sitter_id: '11111111-1111-1111-1111-111111111111', type: 'photo', emoji: '🌳', caption: 'Igra u dvorištu s mojim psom Mikijem. Postali su najbolji prijatelji!', created_at: '2026-03-04T10:00:00Z' },
  { id: 'upd09', booking_id: 'book1111-1111-1111-1111-111111111111', sitter_id: '11111111-1111-1111-1111-111111111111', type: 'video', emoji: '🐕', caption: 'Rex zna sjediti na komandu! Vježbali smo malo danas.', created_at: '2026-03-04T16:00:00Z' },
  { id: 'upd10', booking_id: 'book1111-1111-1111-1111-111111111111', sitter_id: '11111111-1111-1111-1111-111111111111', type: 'photo', emoji: '😴', caption: 'Zadnja večer - Rex mirno spava. Sutra vas čeka sretan pas! ❤️', created_at: '2026-03-05T21:00:00Z' },
  // Updates for booking book2222 (Luna kod Marka, 28 Mar - 2 Apr)
  { id: 'upd11', booking_id: 'book2222-2222-2222-2222-222222222222', sitter_id: '22222222-2222-2222-2222-222222222222', type: 'photo', emoji: '🐕', caption: 'Luna je došla! Već se udomaćila i istražuje stan.', created_at: '2026-03-28T10:00:00Z' },
  { id: 'upd12', booking_id: 'book2222-2222-2222-2222-222222222222', sitter_id: '22222222-2222-2222-2222-222222222222', type: 'photo', emoji: '🌳', caption: 'Šetnja centrom Rijeke. Luna je jako društvena, svi je žele pomaziti!', created_at: '2026-03-28T15:00:00Z' },
  { id: 'upd13', booking_id: 'book2222-2222-2222-2222-222222222222', sitter_id: '22222222-2222-2222-2222-222222222222', type: 'text', emoji: '🍽️', caption: 'Luna je pojela sav obrok i pila puno vode. Sve je super!', created_at: '2026-03-28T19:30:00Z' },
  { id: 'upd14', booking_id: 'book2222-2222-2222-2222-222222222222', sitter_id: '22222222-2222-2222-2222-222222222222', type: 'photo', emoji: '🦴', caption: 'Jutarnja igra s igračkom za vuču. Luna ima puno energije!', created_at: '2026-03-29T09:00:00Z' },
  { id: 'upd15', booking_id: 'book2222-2222-2222-2222-222222222222', sitter_id: '22222222-2222-2222-2222-222222222222', type: 'video', emoji: '🏖️', caption: 'Luna na plaži! Obožava trčati po pijesku. 🐾', created_at: '2026-03-29T14:00:00Z' },
  { id: 'upd16', booking_id: 'book2222-2222-2222-2222-222222222222', sitter_id: '22222222-2222-2222-2222-222222222222', type: 'photo', emoji: '😴', caption: 'Umorna nakon cijelog dana igre. Spava kao anđeo!', created_at: '2026-03-29T20:00:00Z' },
  // Updates for booking bookffff (Coco kod Ane, 1 Apr)
  { id: 'upd17', booking_id: 'bookffff-ffff-ffff-ffff-ffffffffffff', sitter_id: '11111111-1111-1111-1111-111111111111', type: 'photo', emoji: '🐕', caption: 'Coco je stigla! Preslatko štene, odmah se počela igrati.', created_at: '2026-03-24T09:00:00Z' },
  { id: 'upd18', booking_id: 'bookffff-ffff-ffff-ffff-ffffffffffff', sitter_id: '11111111-1111-1111-1111-111111111111', type: 'video', emoji: '🌳', caption: 'Coco uči hodati na povodcu! Ide joj sve bolje i bolje.', created_at: '2026-03-24T11:00:00Z' },
  { id: 'upd19', booking_id: 'bookffff-ffff-ffff-ffff-ffffffffffff', sitter_id: '11111111-1111-1111-1111-111111111111', type: 'photo', emoji: '😴', caption: 'Popodnevni drijemež nakon uzbudljivog jutra. 💤', created_at: '2026-03-24T14:00:00Z' },
];

// ============================================================
// PET PASSPORTS (Health Records)
// ============================================================

export const mockPetPassports: PetPassport[] = [
  {
    pet_id: 'pet11111-1111-1111-1111-111111111111', // Rex
    vaccinations: [
      { name: 'Bjesnoća', date: '2025-09-15', vet: 'Dr. Marija Knežević', next_date: '2026-09-15' },
      { name: 'Parvoviroza (DHPPi)', date: '2025-09-15', vet: 'Dr. Marija Knežević', next_date: '2026-09-15' },
      { name: 'Leptospiroza', date: '2025-09-15', vet: 'Dr. Marija Knežević', next_date: '2026-03-15' },
      { name: 'Dehelmintizacija', date: '2026-01-10', vet: 'Dr. Marija Knežević', next_date: '2026-04-10' },
    ],
    allergies: [
      { name: 'Piletina', severity: 'ozbiljna', notes: 'Izaziva povraćanje i proljev. Strogo izbjegavati u hrani.' },
      { name: 'Pelud trave', severity: 'blaga', notes: 'Kihanje u proljeće, ne zahtijeva lijekove.' },
    ],
    medications: [
      { name: 'Apoquel', dose: '16mg', schedule: '1x dnevno ujutro', start_date: '2026-02-01', end_date: '2026-04-30' },
    ],
    vet_info: { name: 'Dr. Marija Knežević', phone: '+385 51 321 456', address: 'Veterinarska ambulanta Rijeka, Fiumara 12, 51000 Rijeka', emergency: true },
    notes: 'Rex voli šetnje ujutro i navečer. Bojažljiv je prema drugim velikim psima. Obožava igru s loptom. Hrani se 2x dnevno — NIKADA piletina!',
  },
  {
    pet_id: 'pet22222-2222-2222-2222-222222222222', // Mila (mačka)
    vaccinations: [
      { name: 'FeLV (Leukemija mačaka)', date: '2025-11-20', vet: 'Dr. Ivan Rupnik', next_date: '2026-11-20' },
      { name: 'Bjesnoća', date: '2025-11-20', vet: 'Dr. Ivan Rupnik', next_date: '2026-11-20' },
      { name: 'Panleukopenija', date: '2025-11-20', vet: 'Dr. Ivan Rupnik', next_date: '2026-11-20' },
      { name: 'Dehelmintizacija', date: '2026-02-15', vet: 'Dr. Ivan Rupnik', next_date: '2026-05-15' },
    ],
    allergies: [],
    medications: [],
    vet_info: { name: 'Dr. Ivan Rupnik', phone: '+385 51 456 789', address: 'Veterinarska stanica Sušak, Strossmayerova 8, 51000 Rijeka', emergency: true },
    notes: 'Mila je mirna mačka koja voli toplinu. Ne voli glasne zvukove. Hrani se premium hranom za perzijske mačke. Potrebno redovito četkanje dlake.',
  },
  {
    pet_id: 'pet33333-3333-3333-3333-333333333333', // Luna (labrador)
    vaccinations: [
      { name: 'Bjesnoća', date: '2026-01-10', vet: 'Dr. Ana Petrović', next_date: '2027-01-10' },
      { name: 'Parvoviroza (DHPPi)', date: '2026-01-10', vet: 'Dr. Ana Petrović', next_date: '2027-01-10' },
      { name: 'Bordetella', date: '2026-01-10', vet: 'Dr. Ana Petrović', next_date: '2026-07-10' },
      { name: 'Dehelmintizacija', date: '2026-03-01', vet: 'Dr. Ana Petrović', next_date: '2026-06-01' },
    ],
    allergies: [
      { name: 'Kukuruz', severity: 'umjerena', notes: 'Izaziva svrbež kože. Koristiti hranu bez kukuruza.' },
    ],
    medications: [],
    vet_info: { name: 'Dr. Ana Petrović', phone: '+385 1 234 5678', address: 'Veterinarska klinika Zagreb, Ilica 200, 10000 Zagreb', emergency: true },
    notes: 'Luna je vesela i energična. Obožava vodu i plivanje. Treba puno fizičke aktivnosti. Hrana bez kukuruza obavezno!',
  },
  {
    pet_id: 'pet44444-4444-4444-4444-444444444444', // Whiskers (mačka s dijabetesom)
    vaccinations: [
      { name: 'FeLV (Leukemija mačaka)', date: '2025-10-05', vet: 'Dr. Ana Petrović', next_date: '2026-10-05' },
      { name: 'Bjesnoća', date: '2025-10-05', vet: 'Dr. Ana Petrović', next_date: '2026-10-05' },
      { name: 'Kaliciviroza', date: '2025-10-05', vet: 'Dr. Ana Petrović', next_date: '2026-10-05' },
    ],
    allergies: [
      { name: 'Mliječni proizvodi', severity: 'umjerena', notes: 'Uzrokuje probavne smetnje.' },
    ],
    medications: [
      { name: 'Caninsulin (inzulin)', dose: '2 IU', schedule: '2x dnevno (ujutro i navečer, uz obrok)', start_date: '2025-06-01', end_date: null },
      { name: 'Dijabetička hrana', dose: 'Prema uputama', schedule: '2x dnevno uz inzulin', start_date: '2025-06-01', end_date: null },
    ],
    vet_info: { name: 'Dr. Ana Petrović', phone: '+385 1 234 5678', address: 'Veterinarska klinika Zagreb, Ilica 200, 10000 Zagreb', emergency: true },
    notes: 'VAŽNO: Whiskers ima dijabetes i MORA dobiti inzulin 2x dnevno! Pratiti razinu šećera. Ne davati hranu izvan rasporeda. Mirna mačka, voli biti u krilu.',
  },
  {
    pet_id: 'pet55555-5555-5555-5555-555555555555', // Buddy (zlatni retriver)
    vaccinations: [
      { name: 'Bjesnoća', date: '2025-12-01', vet: 'Dr. Ana Petrović', next_date: '2026-12-01' },
      { name: 'Parvoviroza (DHPPi)', date: '2025-12-01', vet: 'Dr. Ana Petrović', next_date: '2026-12-01' },
      { name: 'Leptospiroza', date: '2025-12-01', vet: 'Dr. Ana Petrović', next_date: '2026-06-01' },
    ],
    allergies: [],
    medications: [],
    vet_info: { name: 'Dr. Ana Petrović', phone: '+385 1 234 5678', address: 'Veterinarska klinika Zagreb, Ilica 200, 10000 Zagreb', emergency: true },
    notes: 'Buddy je izrazito društven pas. Odlično se slaže s drugim psima i djecom. Obožava igru s loptom i plivanje. Jede sve, paziti na količinu!',
  },
  {
    pet_id: 'pet66666-6666-6666-6666-666666666666', // Coco (pudlica, štene)
    vaccinations: [
      { name: 'Parvoviroza (DHPPi) - 1. doza', date: '2025-12-15', vet: 'Dr. Marija Knežević', next_date: '2026-04-15' },
      { name: 'Bjesnoća', date: '2026-02-01', vet: 'Dr. Marija Knežević', next_date: '2027-02-01' },
    ],
    allergies: [],
    medications: [
      { name: 'NexGard (antiparazitik)', dose: '11.3mg', schedule: '1x mjesečno', start_date: '2026-01-01', end_date: null },
    ],
    vet_info: { name: 'Dr. Marija Knežević', phone: '+385 51 321 456', address: 'Veterinarska ambulanta Rijeka, Fiumara 12, 51000 Rijeka', emergency: true },
    notes: 'Coco je štene od 1 godinu. Još uči osnovne komande. Puno energije! Treba česte kratke šetnje. Hrani se hranom za štence 3x dnevno.',
  },
  {
    pet_id: 'pet77777-7777-7777-7777-777777777777', // Felix (britanska kratkodlaka)
    vaccinations: [
      { name: 'FeLV (Leukemija mačaka)', date: '2025-08-15', vet: 'Dr. Ana Petrović', next_date: '2026-08-15' },
      { name: 'Bjesnoća', date: '2025-08-15', vet: 'Dr. Ana Petrović', next_date: '2026-08-15' },
      { name: 'Panleukopenija', date: '2025-08-15', vet: 'Dr. Ana Petrović', next_date: '2026-08-15' },
    ],
    allergies: [
      { name: 'Gluten', severity: 'blaga', notes: 'Blagi probavni problemi. Koristiti bezglutensku hranu.' },
    ],
    medications: [],
    vet_info: { name: 'Dr. Ana Petrović', phone: '+385 1 234 5678', address: 'Veterinarska klinika Zagreb, Ilica 200, 10000 Zagreb', emergency: true },
    notes: 'Felix je nezavisan ali mazni mačak. Voli visoka mjesta. Potrebna mu je igračka za grebanje. Hrana bez glutena.',
  },
  {
    pet_id: 'pet88888-8888-8888-8888-888888888888', // Žuja (papiga)
    vaccinations: [
      { name: 'Pregled zdravlja ptica', date: '2026-01-20', vet: 'Dr. Petra Vidović', next_date: '2026-07-20' },
    ],
    allergies: [],
    medications: [
      { name: 'Vitaminski dodatak za ptice', dose: '2 kapi', schedule: 'U vodu svaki dan', start_date: '2026-01-01', end_date: null },
    ],
    vet_info: { name: 'Dr. Petra Vidović', phone: '+385 51 789 012', address: 'Egzotična veterina Rijeka, Krešimirova 22, 51000 Rijeka', emergency: false },
    notes: 'Žuja je papiga koja priča nekoliko riječi. Treba posebnu hranu za papige (sjemenke + voće). Ne izlagati propuhu! Kavez čistiti svaki dan.',
  },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

export function getUserById(id: string): User | undefined {
  return mockUsers.find(u => u.id === id);
}

export function getSitterProfile(userId: string) {
  return mockSitterProfiles.find(p => p.user_id === userId) || null;
}

export function getSitterProfiles(filters?: { city?: string; service?: string; min_rating?: string; min_price?: string; max_price?: string; sort?: string }) {
  let results = [...mockSitterProfiles];

  if (filters?.city) {
    results = results.filter(s => s.city === filters.city);
  }
  if (filters?.service) {
    results = results.filter(s => s.services.includes(filters.service as ServiceType));
  }
  if (filters?.min_rating) {
    results = results.filter(s => s.rating_avg >= parseFloat(filters.min_rating!));
  }
  if (filters?.min_price || filters?.max_price) {
    results = results.filter(s => {
      const prices = Object.values(s.prices).filter((p): p is number => typeof p === 'number' && p > 0);
      const minPrice = Math.min(...prices);
      if (filters.min_price && minPrice < parseFloat(filters.min_price)) return false;
      if (filters.max_price && minPrice > parseFloat(filters.max_price)) return false;
      return true;
    });
  }

  // Sort
  const sort = filters?.sort || 'rating';
  if (sort === 'reviews') {
    results.sort((a, b) => b.review_count - a.review_count);
  } else if (sort === 'price') {
    results.sort((a, b) => {
      const aMin = Math.min(...Object.values(a.prices).filter((p): p is number => typeof p === 'number' && p > 0));
      const bMin = Math.min(...Object.values(b.prices).filter((p): p is number => typeof p === 'number' && p > 0));
      return aMin - bMin;
    });
  } else {
    results.sort((a, b) => b.rating_avg - a.rating_avg);
  }

  return results;
}

export function getBookingsForUser(userId: string, role: 'owner' | 'sitter') {
  const field = role === 'owner' ? 'owner_id' : 'sitter_id';
  return mockBookings
    .filter(b => b[field] === userId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .map(b => ({
      ...b,
      owner: getUserById(b.owner_id),
      sitter: getUserById(b.sitter_id),
      pet: mockPets.find(p => p.id === b.pet_id),
      sitter_profile: mockSitterProfiles.find(s => s.user_id === b.sitter_id),
    }));
}

export function getReviewsForSitter(sitterId: string) {
  return mockReviews
    .filter(r => r.reviewee_id === sitterId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function getReviewsByUser(userId: string) {
  return mockReviews.filter(r => r.reviewer_id === userId);
}

export function getAvailabilityForSitter(sitterId: string) {
  const today = new Date().toISOString().split('T')[0];
  return mockAvailability
    .filter(a => a.sitter_id === sitterId && a.available && a.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function getPetsForOwner(ownerId: string) {
  return mockPets
    .filter(p => p.owner_id === ownerId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function getMessagesForUser(userId: string) {
  return mockMessages
    .filter(m => m.sender_id === userId || m.receiver_id === userId)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}

export function getWalkById(walkId: string) {
  return mockWalks.find(w => w.id === walkId) || null;
}

export function getWalksForUser(userId: string) {
  // Owner sees walks for their pets, sitter sees their walks
  const userPetIds = mockPets.filter(p => p.owner_id === userId).map(p => p.id);
  return mockWalks
    .filter(w => w.sitter_id === userId || userPetIds.includes(w.pet_id))
    .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
}

export function getActiveWalksForSitter(sitterId: string) {
  return mockWalks.filter(w => w.sitter_id === sitterId && w.status === 'u_tijeku');
}

export function getUpdatesForBooking(bookingId: string) {
  return mockUpdates
    .filter(u => u.booking_id === bookingId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function getPetPassport(petId: string) {
  return mockPetPassports.find(p => p.pet_id === petId) || null;
}

/**
 * @deprecated This file provides fallback data for lib/db/ functions.
 * Do NOT import directly from app/ pages — use lib/db/ instead.
 * Will be removed once all Supabase tables are fully populated.
 */
import type { User, Pet, SitterProfile, Booking, Review, Message, Availability, ServiceType, Walk, PetUpdate, PetPassport, Groomer, Trainer, TrainingProgram, Article, ForumTopic, ForumComment, ForumCategorySlug, LostPet } from './types';

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
  { id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', email: 'admin@petpark.hr', name: 'Admin PetPark', role: 'admin', avatar_url: null, phone: null, city: 'Zagreb', created_at: '2025-01-01T10:00:00Z' },
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
  { id: 'upd01', booking_id: 'book1111-1111-1111-1111-111111111111', sitter_id: '11111111-1111-1111-1111-111111111111', type: 'photo', emoji: '🐕', caption: 'Rex je stigao i već istražuje dvorište! Odmah je pronašao svoju omiljenu loptu.', photo_url: null, created_at: '2026-03-01T09:00:00Z' },
  { id: 'upd02', booking_id: 'book1111-1111-1111-1111-111111111111', sitter_id: '11111111-1111-1111-1111-111111111111', type: 'photo', emoji: '🌳', caption: 'Jutarnja šetnja kroz park. Rex je uživao u svježem zraku!', photo_url: null, created_at: '2026-03-01T14:00:00Z' },
  { id: 'upd03', booking_id: 'book1111-1111-1111-1111-111111111111', sitter_id: '11111111-1111-1111-1111-111111111111', type: 'text', emoji: '😴', caption: 'Rex upravo spava nakon duge šetnje. Pojeo je cijelu porciju i pije dovoljno vode.', photo_url: null, created_at: '2026-03-01T20:00:00Z' },
  { id: 'upd04', booking_id: 'book1111-1111-1111-1111-111111111111', sitter_id: '11111111-1111-1111-1111-111111111111', type: 'photo', emoji: '🦴', caption: 'Jutarnji ritual - Rex i njegova omiljena kost za žvakanje.', photo_url: null, created_at: '2026-03-02T08:30:00Z' },
  { id: 'upd05', booking_id: 'book1111-1111-1111-1111-111111111111', sitter_id: '11111111-1111-1111-1111-111111111111', type: 'video', emoji: '🏖️', caption: 'Šetnja uz Rivu! Rex obožava more, pogledajte kako trči po plaži! 🌊', photo_url: null, created_at: '2026-03-02T15:00:00Z' },
  { id: 'upd06', booking_id: 'book1111-1111-1111-1111-111111111111', sitter_id: '11111111-1111-1111-1111-111111111111', type: 'photo', emoji: '🐕', caption: 'Popodnevni odmor u hladu. Rex voli ležati na trijemu.', photo_url: null, created_at: '2026-03-03T13:00:00Z' },
  { id: 'upd07', booking_id: 'book1111-1111-1111-1111-111111111111', sitter_id: '11111111-1111-1111-1111-111111111111', type: 'text', emoji: '💊', caption: 'Rex je dobio svoju večernju porciju hrane bez piletine, kako ste naglasili. Sve je u redu!', photo_url: null, created_at: '2026-03-03T19:00:00Z' },
  { id: 'upd08', booking_id: 'book1111-1111-1111-1111-111111111111', sitter_id: '11111111-1111-1111-1111-111111111111', type: 'photo', emoji: '🌳', caption: 'Igra u dvorištu s mojim psom Mikijem. Postali su najbolji prijatelji!', photo_url: null, created_at: '2026-03-04T10:00:00Z' },
  { id: 'upd09', booking_id: 'book1111-1111-1111-1111-111111111111', sitter_id: '11111111-1111-1111-1111-111111111111', type: 'video', emoji: '🐕', caption: 'Rex zna sjediti na komandu! Vježbali smo malo danas.', photo_url: null, created_at: '2026-03-04T16:00:00Z' },
  { id: 'upd10', booking_id: 'book1111-1111-1111-1111-111111111111', sitter_id: '11111111-1111-1111-1111-111111111111', type: 'photo', emoji: '😴', caption: 'Zadnja večer - Rex mirno spava. Sutra vas čeka sretan pas! ❤️', photo_url: null, created_at: '2026-03-05T21:00:00Z' },
  // Updates for booking book2222 (Luna kod Marka, 28 Mar - 2 Apr)
  { id: 'upd11', booking_id: 'book2222-2222-2222-2222-222222222222', sitter_id: '22222222-2222-2222-2222-222222222222', type: 'photo', emoji: '🐕', caption: 'Luna je došla! Već se udomaćila i istražuje stan.', photo_url: null, created_at: '2026-03-28T10:00:00Z' },
  { id: 'upd12', booking_id: 'book2222-2222-2222-2222-222222222222', sitter_id: '22222222-2222-2222-2222-222222222222', type: 'photo', emoji: '🌳', caption: 'Šetnja centrom Rijeke. Luna je jako društvena, svi je žele pomaziti!', photo_url: null, created_at: '2026-03-28T15:00:00Z' },
  { id: 'upd13', booking_id: 'book2222-2222-2222-2222-222222222222', sitter_id: '22222222-2222-2222-2222-222222222222', type: 'text', emoji: '🍽️', caption: 'Luna je pojela sav obrok i pila puno vode. Sve je super!', photo_url: null, created_at: '2026-03-28T19:30:00Z' },
  { id: 'upd14', booking_id: 'book2222-2222-2222-2222-222222222222', sitter_id: '22222222-2222-2222-2222-222222222222', type: 'photo', emoji: '🦴', caption: 'Jutarnja igra s igračkom za vuču. Luna ima puno energije!', photo_url: null, created_at: '2026-03-29T09:00:00Z' },
  { id: 'upd15', booking_id: 'book2222-2222-2222-2222-222222222222', sitter_id: '22222222-2222-2222-2222-222222222222', type: 'video', emoji: '🏖️', caption: 'Luna na plaži! Obožava trčati po pijesku. 🐾', photo_url: null, created_at: '2026-03-29T14:00:00Z' },
  { id: 'upd16', booking_id: 'book2222-2222-2222-2222-222222222222', sitter_id: '22222222-2222-2222-2222-222222222222', type: 'photo', emoji: '😴', caption: 'Umorna nakon cijelog dana igre. Spava kao anđeo!', photo_url: null, created_at: '2026-03-29T20:00:00Z' },
  // Updates for booking bookffff (Coco kod Ane, 1 Apr)
  { id: 'upd17', booking_id: 'bookffff-ffff-ffff-ffff-ffffffffffff', sitter_id: '11111111-1111-1111-1111-111111111111', type: 'photo', emoji: '🐕', caption: 'Coco je stigla! Preslatko štene, odmah se počela igrati.', photo_url: null, created_at: '2026-03-24T09:00:00Z' },
  { id: 'upd18', booking_id: 'bookffff-ffff-ffff-ffff-ffffffffffff', sitter_id: '11111111-1111-1111-1111-111111111111', type: 'video', emoji: '🌳', caption: 'Coco uči hodati na povodcu! Ide joj sve bolje i bolje.', photo_url: null, created_at: '2026-03-24T11:00:00Z' },
  { id: 'upd19', booking_id: 'bookffff-ffff-ffff-ffff-ffffffffffff', sitter_id: '11111111-1111-1111-1111-111111111111', type: 'photo', emoji: '😴', caption: 'Popodnevni drijemež nakon uzbudljivog jutra. 💤', photo_url: null, created_at: '2026-03-24T14:00:00Z' },
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

// ============================================================
// GROOMERS
// ============================================================

export const mockGroomers: Groomer[] = [
  { id: 'gr-1', name: 'Salon PetPark', city: 'Zagreb', services: ['sisanje', 'kupanje', 'trimanje', 'nokti', 'cetkanje'], prices: { sisanje: 35, kupanje: 25, trimanje: 40, nokti: 15, cetkanje: 20 }, rating: 4.9, review_count: 42, bio: 'Premium grooming salon u centru Zagreba s 10+ godina iskustva. Specijalizirani za sve pasmine pasa i mačaka — od malih yorkshirea do velikih bernardinaca. Koristimo isključivo profesionalnu Iv San Bernard kozmetiku i najmodernije alate. Klimatizirani prostor s odvojenim čekaonicama za pse i mačke.', verified: true, specialization: 'oba', phone: '+385 1 234 5678', email: 'info@salonpetpark.hr', address: 'Ilica 42', working_hours: { Pon: { start: '09:00', end: '18:00' }, Uto: { start: '09:00', end: '18:00' }, Sri: { start: '09:00', end: '18:00' }, 'Čet': { start: '09:00', end: '18:00' }, Pet: { start: '09:00', end: '17:00' }, Sub: { start: '10:00', end: '14:00' } } },
  { id: 'gr-2', name: 'Petra Grooming', city: 'Rijeka', services: ['sisanje', 'kupanje', 'trimanje', 'cetkanje'], prices: { sisanje: 30, kupanje: 20, trimanje: 35, nokti: 0, cetkanje: 15 }, rating: 4.8, review_count: 28, bio: 'Mobilni grooming servis u Rijeci i široj okolici. Dolazim na vašu adresu s kompletnom profesionalnom opremom — idealno za starije ljubimce i one koji se boje vožnje. Certificirana groomerica s IPG diplomom. Nježan pristup i individualna pažnja za svakog ljubimca.', verified: true, specialization: 'psi', phone: '+385 91 987 6543', email: 'petra@petragrooming.hr', working_hours: { Pon: { start: '08:00', end: '16:00' }, Uto: { start: '08:00', end: '16:00' }, Sri: { start: '08:00', end: '16:00' }, 'Čet': { start: '08:00', end: '16:00' }, Pet: { start: '08:00', end: '14:00' } } },
  { id: 'gr-3', name: 'Mačji Raj', city: 'Split', services: ['kupanje', 'trimanje', 'nokti', 'cetkanje'], prices: { sisanje: 0, kupanje: 30, trimanje: 35, nokti: 12, cetkanje: 18 }, rating: 4.7, review_count: 19, bio: 'Jedini specijalizirani salon za mačke u Splitu. Tiha, mirna atmosfera bez prisutnosti pasa — prilagođeno osjetljivim mačkama. Iskustvo s perzijskim, britanskim kratkodlakim i maine coon pasminama. Koristimo feline-friendly kozmetiku bez mirisa.', verified: true, specialization: 'macke', phone: '+385 21 345 678', email: 'salon@macjiraj.hr', address: 'Vukovarska 15', working_hours: { Pon: { start: '10:00', end: '18:00' }, Uto: { start: '10:00', end: '18:00' }, Sri: { start: '10:00', end: '18:00' }, 'Čet': { start: '10:00', end: '18:00' }, Pet: { start: '10:00', end: '16:00' } } },
  { id: 'gr-4', name: 'DogStyle Studio', city: 'Zagreb', services: ['sisanje', 'kupanje'], prices: { sisanje: 40, kupanje: 30, trimanje: 0, nokti: 0, cetkanje: 0 }, rating: 4.9, review_count: 56, bio: 'Profesionalni grooming studio u Zagrebu specijaliziran za show grooming i natjecateljsku pripremu. Naš tim čine dva certificirana groomera s iskustvom na međunarodnim izložbama. Premium tretmani uključuju spa kupke s esencijalnim uljima i ručno sušenje.', verified: true, specialization: 'psi', phone: '+385 1 456 7890', email: 'studio@dogstyle.hr', address: 'Savska 78', working_hours: { Pon: { start: '09:00', end: '19:00' }, Uto: { start: '09:00', end: '19:00' }, Sri: { start: '09:00', end: '19:00' }, 'Čet': { start: '09:00', end: '19:00' }, Pet: { start: '09:00', end: '17:00' }, Sub: { start: '09:00', end: '15:00' } } },
  { id: 'gr-5', name: 'Grooming Pula', city: 'Pula', services: ['sisanje', 'kupanje', 'trimanje', 'nokti', 'cetkanje'], prices: { sisanje: 28, kupanje: 18, trimanje: 32, nokti: 10, cetkanje: 12 }, rating: 4.6, review_count: 15, bio: 'Obiteljski grooming salon u Puli s pristupačnim cijenama. Radimo s ljubavlju i strpljenjem — svaki ljubimac dobiva onoliko vremena koliko mu treba. Posebni popusti za udomljene ljubimce i klijente koji dolaze redovito. Besplatan parking ispred salona.', verified: false, specialization: 'oba', phone: '+385 52 123 456', email: 'info@groomingpula.hr', address: 'Giardini 8', working_hours: { Pon: { start: '09:00', end: '17:00' }, Uto: { start: '09:00', end: '17:00' }, Sri: { start: '09:00', end: '17:00' }, 'Čet': { start: '09:00', end: '17:00' }, Pet: { start: '09:00', end: '15:00' } } },
  { id: 'gr-6', name: 'Bella Grooming', city: 'Osijek', services: ['sisanje', 'kupanje', 'trimanje', 'cetkanje'], prices: { sisanje: 25, kupanje: 18, trimanje: 30, nokti: 0, cetkanje: 14 }, rating: 4.8, review_count: 33, bio: 'Profesionalni grooming u Osijeku. Certificirana groomerica s 8 godina iskustva i diplomom City & Guilds. Specijalnost: pudlice, bichoni i terijeri. Redovita edukacija na međunarodnim seminarima. Hipoalergena kozmetika za osjetljivu kožu.', verified: true, specialization: 'psi', phone: '+385 31 234 567', email: 'bella@bellagrooming.hr', address: 'Europska avenija 12', working_hours: { Pon: { start: '08:30', end: '16:30' }, Uto: { start: '08:30', end: '16:30' }, Sri: { start: '08:30', end: '16:30' }, 'Čet': { start: '08:30', end: '16:30' }, Pet: { start: '08:30', end: '14:00' }, Sub: { start: '09:00', end: '13:00' } } },
  { id: 'gr-7', name: 'Pet Care Zadar', city: 'Zadar', services: ['kupanje', 'nokti', 'cetkanje'], prices: { sisanje: 0, kupanje: 22, trimanje: 0, nokti: 12, cetkanje: 10 }, rating: 4.5, review_count: 11, bio: 'Njega ljubimaca u centru Zadra, 5 minuta od mora. Prirodni proizvodi na bazi aloe vere i kokosovog ulja. Opuštajuća atmosfera s glazbom prilagođenom životinjama. Idealno za osvježenje ljubimca nakon ljetnih kupanja u moru.', verified: false, specialization: 'oba', phone: '+385 23 456 789', email: 'info@petcarezadar.hr', working_hours: { Pon: { start: '09:00', end: '17:00' }, Uto: { start: '09:00', end: '17:00' }, Sri: { start: '09:00', end: '17:00' }, 'Čet': { start: '09:00', end: '17:00' }, Pet: { start: '09:00', end: '15:00' } } },
  { id: 'gr-8', name: 'Šišaj Me', city: 'Rijeka', services: ['sisanje', 'trimanje', 'nokti', 'cetkanje'], prices: { sisanje: 32, kupanje: 0, trimanje: 38, nokti: 14, cetkanje: 16 }, rating: 4.7, review_count: 22, bio: 'Iskusna groomerica specijalizirana za velike i gusto dlakave pasmine — huskije, samojede, zlatne retrivere, bernske planinske pse. Brza i precizna usluga s profesionalnim alatima. Deshedding tretmani za smanjenje linjanja do 80%.', verified: true, specialization: 'psi', phone: '+385 91 555 1234', email: 'info@sisajme.hr', address: 'Fiumara 3', working_hours: { Pon: { start: '08:00', end: '16:00' }, Uto: { start: '08:00', end: '16:00' }, Sri: { start: '08:00', end: '16:00' }, 'Čet': { start: '08:00', end: '16:00' }, Pet: { start: '08:00', end: '14:00' } } },
];

export function getGroomerById(id: string) {
  return mockGroomers.find(g => g.id === id) || null;
}

export function getGroomers(filters?: { city?: string; service?: string }) {
  let result = [...mockGroomers];
  if (filters?.city) result = result.filter(g => g.city === filters.city);
  if (filters?.service) result = result.filter(g => g.services.includes(filters.service as Groomer['services'][number]));
  return result.sort((a, b) => b.rating - a.rating);
}

// ============================================================
// TRAINERS
// ============================================================

export const mockTrainers: Trainer[] = [
  { id: 'tr-1', name: 'Marko Šimić', city: 'Zagreb', specializations: ['osnovna', 'napredna', 'ponasanje'], price_per_hour: 50, certificates: ['KIF certifikat', 'FCI licenca'], rating: 4.9, review_count: 38, bio: 'Profesionalni trener pasa s 12 godina iskustva u pozitivnoj dresuri. Radim individualno i u grupama do 6 pasa. Specijalist za korekciju agresivnog ponašanja i vuču na povodcu. Član Hrvatske kinološke udruge i redoviti predavač na seminarima.', certified: true, phone: '+385 91 111 2233', email: 'marko@trenermarko.hr', address: 'Sportski park Maksimir' },
  { id: 'tr-2', name: 'Ana Petrović', city: 'Zagreb', specializations: ['stenci', 'osnovna'], price_per_hour: 40, certificates: ['KIF certifikat'], rating: 4.8, review_count: 25, bio: 'Specijalizirana za rad sa štencima od 8 tjedana i prvu socijalizaciju. Pomažem novim vlasnicima da postave temelje dobrog ponašanja od prvog dana. Grupne Puppy škole vikendom i individualni dolasci na kućnu adresu. 5 godina iskustva.', certified: true, phone: '+385 92 333 4455', email: 'ana@puppyschool.hr' },
  { id: 'tr-3', name: 'Ivan Delić', city: 'Split', specializations: ['agility', 'napredna'], price_per_hour: 45, certificates: ['FCI licenca', 'Agility sudac'], rating: 4.7, review_count: 20, bio: 'Aktivni natjecatelj i FCI licencirani agility sudac. Vodim agility grupu u Splitu s profesionalnim terenom (12 prepreka). Savršeno za aktivne pasmine — border colliji, australski ovčari, belgijski ovčari. Priprema za natjecanja i rekreativni agility.', certified: true, phone: '+385 91 777 8899', email: 'ivan@agilityplit.hr', address: 'Kinološki centar Split, Žnjan' },
  { id: 'tr-4', name: 'Lana Horvat', city: 'Rijeka', specializations: ['ponasanje', 'osnovna', 'stenci'], price_per_hour: 45, certificates: ['KIF certifikat', 'Canine Behaviour Diploma'], rating: 4.9, review_count: 31, bio: 'Certificirana bihevioristica (CBD diploma, UK) s fokusom na problematično ponašanje — agresija, strah, separacijska anksioznost, reaktivnost prema drugim psima. Holistički pristup koji uključuje cijelu obitelj i procjenu životnog okruženja psa. Kućni posjeti u Rijeci i okolici.', certified: true, phone: '+385 95 222 3344', email: 'lana@dogbehaviour.hr' },
  { id: 'tr-5', name: 'Tomislav Radić', city: 'Osijek', specializations: ['osnovna', 'napredna', 'agility'], price_per_hour: 35, certificates: ['KIF certifikat'], rating: 4.6, review_count: 14, bio: 'Trener u Osijeku s fokusom na sportske discipline i poslušnost u gradskim uvjetima. Vodim tečajeve osnovne i napredne poslušnosti te agility. Grupni (max 5 pasa) i individualni rad. Teren pored Drave — idealno za trening u prirodi.', certified: true, phone: '+385 91 444 5566', email: 'tomo@dresuraosijek.hr', address: 'Park kralja Tomislava, Osijek' },
  { id: 'tr-6', name: 'Mia Barić', city: 'Zadar', specializations: ['stenci', 'ponasanje'], price_per_hour: 38, certificates: [], rating: 4.5, review_count: 9, bio: 'Mlada trenerica s modernim pristupom baziranim na znanosti. Koristim clicker training i pozitivno potkrepljenje — bez zastrašivanja i kažnjavanja. Posebno volim rad sa štencima i plašljivim psima. Online konzultacije dostupne za cijelu Hrvatsku.', certified: false, phone: '+385 99 888 7766', email: 'mia@clickertrening.hr' },
];

export const mockTrainingPrograms: TrainingProgram[] = [
  { id: 'tp-1', trainer_id: 'tr-1', name: 'Osnovna poslušnost', type: 'osnovna', duration_weeks: 8, sessions: 16, price: 400, description: 'Temelji poslušnosti: sjedi, lezi, ostani, dolazak na poziv, šetnja na povodcu. Grupni tečaj do 6 pasa.' },
  { id: 'tp-2', trainer_id: 'tr-1', name: 'Napredna poslušnost', type: 'napredna', duration_weeks: 6, sessions: 12, price: 350, description: 'Za pse koji su završili osnovnu. Rad bez povodca, distancijske komande, odbijanje hrane s poda.' },
  { id: 'tp-3', trainer_id: 'tr-1', name: 'Korekcija agresije', type: 'ponasanje', duration_weeks: 10, sessions: 10, price: 500, description: 'Individualni program za pse s agresivnim ponašanjem. Procjena, plan i postupna rehabilitacija.' },
  { id: 'tp-4', trainer_id: 'tr-2', name: 'Škola za štence', type: 'stenci', duration_weeks: 6, sessions: 12, price: 300, description: 'Za štence od 8 tjedana do 6 mjeseci. Socijalizacija, osnove poslušnosti, navikavanje na okruženje.' },
  { id: 'tp-5', trainer_id: 'tr-2', name: 'Puppy Start', type: 'osnovna', duration_weeks: 4, sessions: 8, price: 200, description: 'Kratki uvodni tečaj za nove vlasnike. Higijena, rutina, osnove komunikacije s ljubimcem.' },
  { id: 'tp-6', trainer_id: 'tr-3', name: 'Agility početni', type: 'agility', duration_weeks: 8, sessions: 16, price: 450, description: 'Uvod u agility sport. Prolazak kroz prepreke, tunele, mostiće. Razvija koordinaciju i vezu pas-vlasnik.' },
  { id: 'tp-7', trainer_id: 'tr-3', name: 'Agility natjecateljski', type: 'agility', duration_weeks: 12, sessions: 24, price: 700, description: 'Za pse koji žele na natjecanja. Intenzivni trening brzine, preciznosti i poslušnosti na stazi.' },
  { id: 'tp-8', trainer_id: 'tr-4', name: 'Separacijska anksioznost', type: 'ponasanje', duration_weeks: 6, sessions: 6, price: 350, description: 'Program za pse koji pate kad vlasnik ode. Postupna desenzitizacija i izgradnja samopouzdanja.' },
  { id: 'tp-9', trainer_id: 'tr-4', name: 'Reaktivni psi', type: 'ponasanje', duration_weeks: 8, sessions: 8, price: 420, description: 'Za pse koji reagiraju na druge pse ili ljude. Rad na smirenosti, preusmjeravanju i pozitivnim asocijacijama.' },
  { id: 'tp-10', trainer_id: 'tr-5', name: 'Osnovno školovanje pasa Osijek', type: 'osnovna', duration_weeks: 8, sessions: 16, price: 320, description: 'Grupni tečaj u Osijeku. Maksimalno 5 pasa. Šetnja, poslušnost, socijalizacija u gradskim uvjetima.' },
  { id: 'tp-11', trainer_id: 'tr-6', name: 'Clicker trening', type: 'osnovna', duration_weeks: 4, sessions: 8, price: 220, description: 'Naučite komunicirati sa psom pomoću clickera. Brze i zabavne sesije prilagođene svakom psu.' },
];

export function getTrainerById(id: string) {
  return mockTrainers.find(t => t.id === id) || null;
}

export function getTrainers(filters?: { city?: string; type?: string }) {
  let result = [...mockTrainers];
  if (filters?.city) result = result.filter(t => t.city === filters.city);
  if (filters?.type) result = result.filter(t => t.specializations.includes(filters.type as Trainer['specializations'][number]));
  return result.sort((a, b) => b.rating - a.rating);
}

export function getTrainingProgramsForTrainer(trainerId: string) {
  return mockTrainingPrograms.filter(p => p.trainer_id === trainerId);
}

// ============================================================
// BLOG / ARTICLES
// ============================================================

export const mockArticles: Article[] = [
  {
    slug: 'kako-pripremiti-psa-za-cuvanje',
    title: 'Kako pripremiti psa za čuvanje',
    excerpt: 'Praktični savjeti za vlasnike koji prvi put ostavljaju ljubimca kod sittera.',
    body: `Ostavljanje psa kod sittera može biti stresno — i za vas i za vašeg ljubimca. No uz dobru pripremu, iskustvo može biti pozitivno za sve.

Prije svega, organizirajte upoznavanje vašeg psa sa sitterom. Kratki susret od 15-20 minuta u neutralnom okruženju pomoći će psu da se navikne na novu osobu. Obratite pažnju na govor tijela — opušten rep i radoznalost su dobar znak.

Pripremite torbu za svog ljubimca: omiljenu igračku, hranu koju inače jede, poslastice i bilo kakve lijekove. Ostavite pisane upute o rutini — kad jede, kad ide van, što voli a što ne.

Važno je da se oprostite mirno i brzo. Dugačka i emotivna rastanka stvaraju anksioznost kod psa. Jednostavno se pozdravite i odite s povjerenjem da je vaš ljubimac u dobrim rukama.

Nakon što odete, dajte psu vremena da se prilagodi. Većina pasa se udomaći kod sittera unutar nekoliko sati. Tražite od sittera redovita ažuriranja i fotografije — to će i vama olakšati rastanak.`,
    author: 'Dr. Maja Kovač',
    date: '2026-03-10',
    category: 'dresura',
    emoji: '🐕',
  },
  {
    slug: 'top-5-parkova-za-setnju-u-zagrebu',
    title: 'Top 5 parkova za šetnju u Zagrebu',
    excerpt: 'Otkrijte najbolje parkove za šetnju s vašim ljubimcem u glavnom gradu.',
    body: `Zagreb je grad zelenila i savršen za šetnju s ljubimcima. Evo naših top 5 preporuka za parkove gdje će vaš pas uživati.

Maksimir je neosporno na prvom mjestu. Najveći zagrebački park nudi kilometre staza okruženih drevnim stablima. Mnogi vlasnici ovdje puštaju pse s povodca u ranim jutarnjim satima. Jezera su savršena za pse koji vole vodu.

Bundek je popularan izbor za obiteljske šetnje. Jezero, travnate površine i ravne staze čine ga idealnim za starije pse. Vikendima se ovdje skupljaju grupe vlasnika — odlična prilika za socijalizaciju.

Jarun nudi duge staze oko jezera, savršene za aktivne pse. Postoje i dijelovi plaže gdje psi mogu trčati slobodno izvan sezone. Bring frisbee!

Park Ribnjak u centru grada je manji, ali miran i lijep za kratku šetnju. Idealan za pauzu tijekom radnog dana.

Šestine i okolica nude ruralniji ugođaj — šumske staze, potoci i manje ljudi. Savršeno za pse koji preferiraju mir i prirodu.`,
    author: 'Filip Matić',
    date: '2026-03-08',
    category: 'zabava',
    emoji: '🌳',
  },
  {
    slug: 'zimska-njega-sapa',
    title: 'Zimska njega šapa — sve što trebate znati',
    excerpt: 'Zaštitite šape svog ljubimca od soli, leda i hladnoće.',
    body: `Zima može biti teška za šape vašeg psa. Sol za posipanje, led i niske temperature mogu uzrokovati pukotine, iritaciju pa čak i ozljede. Evo kako zaštititi šape svog ljubimca.

Najvažniji korak je redoviti pregled šapa nakon svake šetnje. Provjerite ima li pukotina, crvenila ili stranih tijela zaglavljenih između prstiju. Operite šape toplom vodom nakon šetnje da uklonite sol i kemikalije.

Balzam za šape je vaš najbolji prijatelj zimi. Nanesite tanki sloj prije šetnje — djeluje kao barijera. Nakon šetnje, nanesite hranjivi balzam za oporavak. Možete koristiti i kokosovo ulje kao prirodnu alternativu.

Čizmica za pse nisu samo modni dodatak — one su praktična zaštita. Potrebno je malo strpljenja da se pas navikne, ali jednom kad prihvati, šetnje po snijegu postaju bezbrižne.

Skratite dlaku između prstiju jer se u njoj nakuplja led i stvara bolne grudice. Redovito šišanje ove dlake spriječit će probleme. Ne zaboravite ni nokte — dugi nokti na ledu mogu uzrokovati proklizavanje i ozljede.`,
    author: 'Dr. Maja Kovač',
    date: '2026-02-15',
    category: 'zdravlje',
    emoji: '🐾',
  },
  {
    slug: 'kako-odabrati-pravog-sittera',
    title: 'Kako odabrati pravog sittera za svog ljubimca',
    excerpt: 'Vodič kroz najvažnije kriterije pri odabiru čuvara ljubimaca.',
    body: `Odabir pravog sittera je jedna od najvažnijih odluka koju ćete donijeti za svog ljubimca. Evo na što obratiti pažnju.

Prvo, čitajte recenzije. Iskustva drugih vlasnika su najbolji pokazatelj kvalitete. Obratite pažnju na komentare o komunikaciji, fotke koje sitter šalje i kako se nosi s nepredviđenim situacijama.

Verificirani sitteri na PetParku prošli su provjeru identiteta i pozadine. To je prvi filter, ali ne i jedini. Organizirajte upoznavanje — kemija između sittera i vašeg ljubimca je ključna.

Pitajte o iskustvu s vašom pasminom. Nije isto čuvati čivavu i njemačkog ovčara. Dobar sitter zna razlike i prilagođava pristup. Pitajte i o hitnim situacijama — ima li plan, zna li put do veterinara?

Jasno komunicirajte rutinu svog ljubimca. Dobar sitter će postaviti puno pitanja — to je dobar znak. Onaj tko samo kaže "bit će sve OK" bez detalja možda nije pravi izbor.

Konačno, povjerenje. Ako se nakon upoznavanja osjećate sigurno i vaš pas reagira pozitivno — pronašli ste pravog sittera!`,
    author: 'Nina Šimunović',
    date: '2026-03-01',
    category: 'zabava',
    emoji: '🔍',
  },
  {
    slug: 'prehrana-stenca-vodic',
    title: 'Prehrana štenca — kompletni vodič',
    excerpt: 'Sve što trebate znati o pravilnoj prehrani vašeg štenca od prvog dana.',
    body: `Pravilna prehrana u prvim mjesecima života postavlja temelje za zdravlje cijelog života vašeg psa. Evo što trebate znati.

Od 8 tjedana do 4 mjeseca, štenac treba jesti 3-4 puta dnevno. Koristite kvalitetnu hranu za štence — ona sadrži više proteina i kalorija nego hrana za odrasle pse. Veličina obroka ovisi o pasmini, pa se posavjetujte s veterinarom.

Od 4 do 12 mjeseci, postupno smanjite na 2 obroka dnevno. Ovo je razdoblje intenzivnog rasta — ne štedite na kvaliteti hrane. Izbjegavajte hranu za ljude, posebno čokoladu, luk, grožđe i ksilitol.

Voda mora biti dostupna cijeli dan. Štenac koji se igra treba više vode nego mirni odrasli pas. Pratite koliko pije — prekomjerna žeđ može biti znak zdravstvenog problema.

Dodaci prehrani obično nisu potrebni ako koristite kvalitetnu kompletnu hranu. No za velike pasmine, veterinar može preporučiti dodatke za zglobove. Nikad ne dajte dodatke bez konzultacije.

Prelazak na hranu za odrasle obično se radi između 12 i 18 mjeseci, ovisno o pasmini. Velike pasmine prelaze kasnije. Prelazak radite postupno — miješajte staru i novu hranu 7-10 dana.`,
    author: 'Dr. Maja Kovač',
    date: '2026-02-20',
    category: 'prehrana',
    emoji: '🍖',
  },
  {
    slug: 'putovanje-s-ljubimcem-u-eu',
    title: 'Putovanje s ljubimcem u EU — što trebate znati',
    excerpt: 'Kompletni vodič za putovanje s ljubimcem unutar Europske unije.',
    body: `Putovanje s ljubimcem u EU zahtijeva pripremu, ali nije komplicirano ako znate korake. Hrvatska je članica EU, što olakšava putovanje unutar Unije.

EU putovnica za kućne ljubimce je obavezan dokument. Izdaje ju ovlašteni veterinar i sadrži podatke o cijepljenjima, mikročipu i vlasniku. Cijena je oko 20-30€ i vrijedi doživotno.

Mikročip je obavezan prije cijepljenja protiv bjesnoće. Pas mora biti čipiran standardom ISO 11784/11785. Ako vaš ljubimac već ima čip starijeg standarda, nosite vlastiti čitač.

Cijepljenje protiv bjesnoće mora biti obavljeno najmanje 21 dan prije putovanja. Godišnje docjepljivanje mora biti uredno evidentirano u putovnici.

Za neke zemlje vrijede dodatna pravila. Finska, Irska, Malta i Norveška zahtijevaju tretman protiv trakavice 24-120 sati prije ulaska. Provjerite specifične zahtjeve odredišne zemlje.

Prijevoz avionom zahtijeva odobrenu transportnu kutiju. Psi do 8 kg obično mogu u kabinu, veći idu u prtljažni prostor. Rezervirajte mjesto za ljubimca unaprijed — broj je ograničen po letu.`,
    author: 'Filip Matić',
    date: '2026-01-28',
    category: 'putovanje',
    emoji: '✈️',
  },
  {
    slug: 'separacijska-anksioznost-savjeti',
    title: 'Separacijska anksioznost — savjeti za vlasnike',
    excerpt: 'Kako prepoznati i ublažiti separacijsku anksioznost kod pasa.',
    body: `Separacijska anksioznost je jedan od najčešćih problema ponašanja kod pasa. Vaš pas vas obožava, ali to ne znači da mora patiti kad odete.

Prepoznajte znakove: pretjerano lajanje ili cviljenje kad odlazite, destruktivno ponašanje (grizenje namještaja, kopanje), nečistoća u kući unatoč treningu, pretjerano slinenje ili znojenje šapa.

Počnite s kratkim odlascima. Ostavite psa samog 5 minuta, pa se vratite. Postupno produžujte vrijeme. Ključno je da se vraćate PRIJE nego pas postane anksiozan — tako gradite pozitivnu asocijaciju.

Rituali odlaska i dolaska trebaju biti dosadni. Nemojte se emotivno opraštati niti pretjerano slaviti dolazak. Mirno odete, mirno se vratite. Pažnju dajete tek kad se pas smiri.

Ostavite nešto što miriše na vas — staru majicu ili jastučnicu. Poznati miris djeluje umirujuće. Kong igračka napunjena poslasticama odlična je za okupaciju prvih 20-30 minuta nakon vašeg odlaska.

Konzultirajte stručnjaka ako je anksioznost teška. Profesionalni trener ili veterinarski biheviorist mogu osmisliti prilagođeni program. U teškim slučajevima, veterinar može preporučiti i medikamentoznu potporu.`,
    author: 'Lana Horvat',
    date: '2026-02-05',
    category: 'dresura',
    emoji: '💔',
  },
  {
    slug: 'grooming-kod-kuce-vodic',
    title: 'Grooming kod kuće — vodič za početnike',
    excerpt: 'Naučite osnove kućnog groominga i održavajte ljubimca urednim između posjeta salonu.',
    body: `Redoviti grooming nije samo estetski — on je bitan za zdravlje vašeg ljubimca. Između posjeta profesionalnom groomeru, evo što možete raditi kod kuće.

Četkanje je osnova svega. Kratke dlake trebaju četkanje jednom tjedno, duge dlake svaki dan. Koristite odgovarajuću četku — slicker brush za duge dlake, gumenu rukavicu za kratke. Četkanje uklanja mrtvu dlaku i sprječava kovrče.

Kupanje radite svaka 4-6 tjedana, osim ako se pas izvaljao u nečemu smrdljivom. Koristite šampon za pse — ljudski šampon ima krivi pH. Temeljito isperite jer ostaci šampona uzrokuju svrbež.

Nokti se šišaju svaka 2-3 tjedna. Koristite giljotina ili škare za nokte. Režite malo po malo da ne pogodite živac (roze dio unutar nokta). Ako pas ima tamne nokte, režite u malim koracima.

Uši čistite jednom tjedno vatenim štapićem i otopinom za čišćenje ušiju. Nikad ne gurajte duboko u ušni kanal. Crvene, smrdljive ili ljepljive uši su znak infekcije — posjetite veterinara.

Za profesionalno šišanje, trimanje i spa tretmane prepustite posao stručnjacima. Pogledajte naše groomere na PetParku i pronađite savršeni salon u vašem gradu!`,
    author: 'Salon PetPark',
    date: '2026-03-15',
    category: 'zdravlje',
    emoji: '✂️',
  },
  {
    slug: 'najpopularnije-pasmine-u-hrvatskoj',
    title: 'Najpopularnije pasmine pasa u Hrvatskoj 2026.',
    excerpt: 'Otkrijte koje su pasmine najtraženije u hrvatskim domovima i zašto.',
    body: `Hrvatska ima sve veću zajednicu ljubitelja pasa, a neke pasmine su posebno popularne. Evo pregleda najpopularnijih pasmina u 2026.

Labrador retriver ostaje na vrhu popularnosti. Prijateljski, prilagodljiv i odličan s djecom — idealan obiteljski pas. Labradorci su aktivni i trebaju puno vježbe, što je savršeno za hrvatske vlasnike koji vole prirodu.

Zlatni retriver dijeli sličnu popularnost. Inteligentni, nježni i lako se treniraju. Savršeni su za obitelji s djecom i odlični su terapijski psi.

Francuski buldog je najtraženija mala pasmina. Prilagodljivi su za stanove u gradu, ne trebaju mnogo vježbe i nevjerojatno su šarmantni. Pazite samo na temperaturu ljeti.

Njemački ovčar je klasični izbor za one koji traže zaštitnika i prijatelja. Inteligentni, odani i svestrani — od pratnje do sportova.

Dalmatinski pas ima posebno mjesto u hrvatskim srcima. Porijeklom iz Dalmacije, ovi psi su energični, ljubazni i savršeni za aktivne vlasnike.`,
    author: 'Nina Šimunović',
    date: '2026-03-20',
    category: 'psi',
    emoji: '🐕',
  },
  {
    slug: 'igre-za-macke-u-stanu',
    title: 'Najbolje igre za mačke u stanu',
    excerpt: 'Kako zabaviti mačku u zatvorenom prostoru i spriječiti dosadu.',
    body: `Mačke koje žive u stanu trebaju mentalnu i fizičku stimulaciju da bi bile sretne. Evo najboljih načina za zabavu vaše mačke.

Laser pointer je klasik koji nikad ne razočara. Većina mačaka će ludo trčati za crvenom točkicom. Važno je završiti igru s fizičkom nagradom — dajte mački poslasticu na kraju da ne bude frustrirana.

Puzzle feederi pretvaraju obrok u avanturu. Mačke su prirodni lovci i uživaju u izazovu pronalaženja hrane. Možete kupiti gotove ili napraviti vlastite od kartonskih kutija.

Prozorska sjedalica daje mački "televizor" — promatranje ptica i prolaznika. Postavite hranilicu za ptice blizu prozora za dodatnu zabavu.

Tunel za mačke pruža savršeno skrovište i mjesto za igru. Većina mačaka obožava provlačenje i skrivanje u tunelima.

DIY igračke su često najzanimljivije. Kartonska kutija, papirna vrećica, kuglica od aluminijske folije — jednostavne stvari često su najzabavnije. Izbjegavajte male predmete koje mačka može progutati.`,
    author: 'Lana Horvat',
    date: '2026-03-18',
    category: 'macke',
    emoji: '🐈',
  },
  {
    slug: 'proljece-i-tvoj-ljubimac-10-opasnosti',
    title: 'Proljeće i tvoj ljubimac: 10 opasnosti koje ne očekuješ',
    excerpt: 'Oleander u vrtu, krpelji na Kvarneru, čokoladna jaja na stolu — proljeće je minsko polje za ljubimce.',
    body: `Prošlog travnja, moja susjeda u Opatiji zvala me u panici. Njen zlatni retriver Bongo pojeo je par latica oleandra iz vrta. Dva sata kasnije bili su na hitnoj u Rijeci. Bongo se oporavio — ali moglo je završiti puno gore.

Proljeće u Hrvatskoj je prelijepo. Ali za vlasnike ljubimaca, to je i sezona u kojoj se opasnosti skrivaju tamo gdje ih najmanje očekujete.

Oleander raste u svakom drugom vrtu na obali. Ljiljan stoji u vazi na prozoru. Oboje su smrtonosno otrovni — oleander za pse, ljiljan za mačke. Kod ljiljana je situacija posebno zastrašujuća: čak i pelud koji mačka olizne sa šape može izazvati zatajenje bubrega. Ako imate mačku, ljiljani ne smiju biti u kući. Točka.

Krpelji na Kvarneru i u Istri kreću već krajem veljače. U unutrašnjosti malo kasnije, ali do travnja su svugdje. Problem nije samo nelagoda — krpelji prenose babeziozu i lajmsku bolest. Antiparazitik nije opcija, nego obaveza. A nakon svake šetnje po travi ili šumi, pregledajte psa: uši, vrat, prepone, između prstiju. Krpelj se zakači za 15 minuta, ali bolest prenosi tek nakon 24-48 sati — tako da imate vremena ako ste pažljivi.

Uskršnja čokoladna jaja. Djeca ih ostavljaju posvuda, a psi imaju nos od 10 kilometara. Teobromin u čokoladi je za pse otrov — tamna čokolada je najgora. Pas od 10 kila koji pojede 50 grama tamne čokolade može završiti na infuziji. Slatkiše držite visoko, a omote bacajte u zatvorenu kantu.

Otvoreni prozori su ubojica mačaka. Svaki veterinar u Hrvatskoj ima priče o "sindromu visokog kata" — mačke koje padnu kroz otvoreni prozor jureći leptira ili pticu. Mrežice koštaju 20-30 eura po prozoru. Život vaše mačke nema cijenu.

Proljetne alergije pogađaju i životinje. Ako vaš pas se češe više nego inače, ima crvenu kožu ili suzne oči — nije mašta, nego alergija. Trava, pelud, ambrozija. Veterinar može prepisati antihistaminike, a vi možete pomoći tako da psa operete nakon šetnje po visokoj travi.

Još dvije stvari koje ljudi zaborave: antifriz iz garaže (sladak okus, smrtonosno otrovan — čak i par kapi) i dehidracija na prvim toplijim izletima. Nosite vodu i sklopivu posudu. Uvijek.

Proljeće je za uživanje. Ali malo opreza čini razliku između lijepog dana i noćne more na hitnoj.`,
    author: 'Dr. Maja Kovač',
    date: '2026-03-28',
    category: 'zdravlje',
    emoji: '🌸',
  },
  {
    slug: 'personalizirana-prehrana-za-pse',
    title: 'Personalizirana prehrana za pse — budućnost ili hype?',
    excerpt: 'Sirova vs. suha hrana, brendovi u Hrvatskoj i koliko zapravo košta kvalitetna prehrana.',
    body: `Kad odete u pet shop po hranu za psa, dočeka vas zid od 200 pakiranja. Svako obećava da je "premium", "natural", "holistic". Marketing mašinerija radi prekovremeno. A vi stojite s praznom vrećom u ruci i pitate se — koliko od ovog je stvarno bitno?

Odgovor je: manje nego što mislite, ali više nego što bi htjeli.

Krenimo od sirove hrane jer je to tema broj jedan u svim Facebook grupama za vlasnike pasa u Hrvatskoj. BARF dijeta — kosti, sirovo meso, povrće. Zagovornici tvrde da su psi "vukovi" i da im treba sirova hrana. Veterinari kažu: psi NISU vukovi. Živimo zajedno 15.000 godina i njihov probavni sustav se promijenio. Sirova hrana MOŽE biti odlična — ali zahtijeva da znate točno što radite. Nebalansirani obroci rade više štete nego najjeftinija granulirana hrana.

Ako nemate vremena vagati kalcij i fosfor u svakom obroku, kvalitetna suha hrana je potpuno OK izbor.

Ali koja? Evo stvarnog stanja u Hrvatskoj:

Farmina N&D je talijanski brend koji se zadnjih par godina probio na naše tržište. Grain-free linija ima odličan sastav — meso na prvom mjestu, bundeva, borovnica. Cijena je viša, ali znate što kupujete.

Josera iz Njemačke je možda najbolji omjer cijene i kvalitete koji možete naći. Posebno SensiPlus za osjetljive pse. Paket od 15 kila košta oko 60 eura — za 4 mjeseca hrane za srednjeg psa, to je fer.

Brit Care iz Češke je underdog koji zaslužuje pažnju. Hypoallergenic linija spašava pse s alergijama. Cijena? Niža od Farmine, a sastav je solidan.

Acana i Orijen su "Rolls-Royce" pseće hrane. Kanadski, skoro savršen sastav. Ali 80+ eura za 11 kila — nije za svačiji budžet.

Hajdemo na brojke. Pas od 20 kila, godišnji trošak hrane:

Chappi/Pedigree s polica Konzuma: oko 180 eura. Jeftino, ali pogledajte sastav — žitarice na prvom mjestu, "mesni nusproizvodi" (ne želite znati što je to).

Brit/Josera: oko 350 eura. Meso na prvom mjestu, bez umjetnih boja. Dobar izbor.

Farmina/Acana: oko 600 eura. Premium, ali ne morate uzeti najveći paket odjednom.

Zanimljiv podatak: veterinari kažu da psi na kvalitetnijoj hrani dolaze na pregled rjeđe. Manje problema s kožom, boljom probavom, manje plinova (da, i to je indikator). Ta razlika od 200 eura godišnje se često vrati u ušteđenim veterinarskim računima.

Jedna stvar koju nitko ne govori: najčešća alergija na hranu kod pasa u Hrvatskoj je — piletina. Da, upravo ta piletina koja je u 80% hrana. Ako vaš pas se stalno češe, a niste našli uzrok — probajte hranu na bazi ribe ili janjetine. Možda je rješenje tako jednostavno.

Pravilo palca za čitanje deklaracije: prva tri sastojka čine 80% hrane. Ako su to kukuruz, pšenica i "životinjsko brašno" — stavite natrag na policu. Ako je meso (ne "mesni nusproizvodi") na prvom mjestu — idete u dobrom smjeru.`,
    author: 'Tomislav Barić',
    date: '2026-03-26',
    category: 'prehrana',
    emoji: '🥩',
  },
  {
    slug: 'checklist-prvi-put-kod-sittera',
    title: 'Prvi put ostavljaš ljubimca s pet sitterom? Evo kompletni checklist',
    excerpt: 'Sve što trebate pripremiti prije prvog bookinga — od dokumentacije do omiljene igračke.',
    body: `Zvoni vam telefon, taksi je za 20 minuta, a vi još provjeravate jeste li spakirali sve za psa. Ovo vam se neće dogoditi ako pročitate sljedeće.

PRIJE BOOKINGA:

✅ Provjerite sitterov profil na PetParku — recenzije, verificiranost, iskustvo
✅ Organizirajte kratko upoznavanje (15-20 min) — neka se pas i sitter upoznaju na neutralnom terenu
✅ Obratite pažnju na kemiju — ako je pas opušten i veselo maše repom, dobar znak!

5 crvenih zastava kod sittera:
- Nema nijednu recenziju i ne želi upoznavanje unaprijed
- Ne pita vas ništa o ljubimcu (alergije, navike, lijekovi)
- Kuća/stan ne izgleda sigurno za životinju
- Ne želi slati ažuriranja i slike tijekom čuvanja
- Cijena je značajno niža od prosjeka (jeftino = sumnjivo)

ŠTO PRIPREMITI — TORBA ZA LJUBIMCA:

📋 Dokumentacija:
- Kopija cijepnog kartona
- Lista alergija i lijekova (ako ima)
- Kontakt vašeg veterinara
- Vaš broj telefona i broj hitne kontakt osobe

🍽️ Hrana i voda:
- Hrana koju inače jede (dovoljno za cijeli period + 1 dan viška)
- Poslastice za nagrađivanje
- Poznata posuda (miris doma smiruje)

🧸 Comfort items:
- Omiljenu igračku
- Dekicu ili jastuk koji miriše na dom
- Povodac i am koji pas nosi

📝 Pisane upute:
- Raspored hranjenja (kad i koliko)
- Raspored šetnji
- Navike (spava li u krevetu? Boji se grmljavine? Voli se igrati s drugim psima?)
- Što voli, a što ne (npr. ne voli kad mu se dira rep)

SEPARACIJSKA ANKSIOZNOST — KAKO PRIPREMITI PSA:

Mnogi psi osjete stres kad ih vlasnik ostavi. Evo kako to ublažiti:

1. Počnite s kratkim odvojenjima tjedan prije — ostavite psa kod prijatelja na sat vremena
2. Ne pravite veliku dramu od odlaska — mirno se pozdravite i odite
3. Ostavite majicu koja miriše na vas — poznat miris smiruje
4. Zamolite sittera da prvih sat vremena bude posebno pažljiv — igra, šetnja, poslastice

NAKON ŠTO ODETE:

Dajte psu vremena da se prilagodi. Većina pasa se opusti unutar 2-3 sata. Na PetParku možete pratiti ljubimca putem:
- 📸 Foto ažuriranja — sitter šalje slike i poruke
- 🗺️ GPS tracking šetnji — vidite rutu i trajanje u realnom vremenu
- 💬 Chat s sitterom — pitajte što god vas zanima

KAD SE VRATITE:

Pas će biti lud od sreće — to je normalno! Dajte mu 15-20 minuta za ponovnu povezivanje. I ne zaboravite ostaviti recenziju sitteru — pomaže budućim vlasnicima da donesu pravu odluku.`,
    author: 'Ana Petrović',
    date: '2026-03-24',
    category: 'psi',
    emoji: '📋',
  },
  {
    slug: 'pametne-igracke-za-pse-koje-stvarno-rade',
    title: 'Pametne igračke za pse — koje stvarno rade?',
    excerpt: 'Testirali smo puzzle feedere, interaktivne lopte i automatske bacače. Evo rezultata.',
    body: `Moj pas je uništio 3 "neuništive" igračke u jednom tjednu. Plišani dinosaur — 4 minute. Gumena kost s Amazona — dan i pol. "Vojni" frisbee — čak 3 dana, ali krajnji rezultat je bio isti: plastični konfeti po cijelom stanu.

Onda sam počeo istraživati. Evo što sam naučio nakon godine dana testiranja.

PUZZLE FEEDERI — ⭐⭐⭐⭐⭐

Nina Ottosson slagalice su kralj kategorije. Tri razine težine — od početnika do naprednog. Pas mora pomicati klizače, otvarati pretince i okretati dijelove da dođe do hrane. Naš testni pas (border collie) riješio je razinu 1 za 30 sekundi, ali razina 3 ga je zabavila dobrih 15 minuta.

Cijena u HR: 18-25€ (dostupno u većim pet shopovima i online)
Za koga: sve pasmine, posebno pametne (border collie, pudla, labrador)
Trajnost: 4/5 — plastika je čvrsta, ali agresivni žvakači mogu oštetiti

KONG CLASSIC — ⭐⭐⭐⭐⭐

Nije "pametna" u high-tech smislu, ali je genijalna u svojoj jednostavnosti. Napunite kikiriki maslacem, zamrznite preko noći, i imate igračku koja zabavlja psa 30+ minuta. Odskače nepredvidivo, izdržljiva je i potpuno sigurna.

Cijena u HR: 12-16€
Za koga: apsolutno sve pse
Trajnost: 5/5 — gotovo neuništiva

LICKI MAT — ⭐⭐⭐⭐

Silikonska podloga s teksturom na koju namažete hranu. Lizanje aktivira endorfine i smiruje anksioznog psa. Savršeno za vrijeme grmljavine ili kad ostaje sam. Može se zamrznuti za dulje trajanje.

Cijena u HR: 8-12€
Za koga: anksiozni psi, psi koji jedu prebrzo
Trajnost: 4/5 — periva u perilici posuđa

AUTOMATSKI BACAČ LOPTICA — ⭐⭐⭐

iFetch i slični uređaji automatski bacaju loptice. Zvuči odlično, ali u praksi — većina pasa ne nauči sama ubacivati lopticu natrag. Trebate nekoliko tjedana treninga. Kad nauče, genijalno je.

Cijena u HR: 45-80€
Za koga: aktivni psi koji obožavaju fetch
Trajnost: 3/5 — mehanički dijelovi se troše

SLOW FEEDER POSUDA — ⭐⭐⭐⭐

Posuda s labirintom usporava jedenje do 10 puta. Jednostavno ali učinkovito. Posebno korisno za pse koji gutaju hranu bez žvakanja — smanjuje rizik od nadimanja.

Cijena u HR: 12-18€
Za koga: svi psi koji jedu prebrzo
Trajnost: 4/5

NAŠ ZAKLJUČAK:

Ne trebate skupe gadgete. Kong + puzzle feeder + licky mat = komplet od 40€ koji će vašeg psa zabavljati mjesecima. Ključ je rotacija — ne dajte sve odjednom, mijenjajte igračke svaki dan da ostanu zanimljive.

Pro tip: zamrznite Kong s mješavinom bananre, kikiriki maslaca i hrane za pse. Jeftino, zdravo i zabavlja psa dulje od bilo koje skuplje igračke na tržištu.`,
    author: 'Filip Matić',
    date: '2026-03-22',
    category: 'psi',
    emoji: '🧩',
  },
  {
    slug: 'kako-prepoznati-dobrog-veterinara',
    title: 'Kako prepoznati dobrog veterinara — 7 znakova kvalitete',
    excerpt: 'Ne trebate biti stručnjak da prepoznate kvalitetnu veterinarsku skrb. Evo na što obratiti pažnju.',
    body: `Prijateljica me pitala za preporuku veterinara u Rijeci. Rekao sam joj da ode kod dr. Marića. "Zašto baš njega?" pitala je. Razmislio sam. I shvatio da znam točno zašto — jer radi sve ono što loši veterinari ne rade.

Evo po čemu ćete i vi prepoznati razliku.

Dobar veterinar ne dira vašeg psa prvih 30 sekundi. Promatra ga. Gleda kako hoda, kako diše, kako reagira na okruženje. Tek onda priđe — polako, s poslasticom u ruci. Ako veterinar zgrabi vašeg psa čim uđete, bez da ga pusti da se prilagodi — to vam govori dosta o pristupu.

Slušanje. Zvuči banalno, ali zamislite: opisujete simptome, a veterinar već tipka na kompjuteru. Ili još gore — prekida vas. Dobar veterinar vas sluša do kraja, zapisuje, i onda pita dodatna pitanja. "Kad ste to prvi put primijetili? Je li gore ujutro ili navečer? Jede li normalno?" Detalji spašavaju živote.

Opcije umjesto ultimatuma. "Vaš pas treba operaciju, košta 800 eura" — ovo NIJE kako komunicira dobar veterinar. Ovako je bolje: "Imamo dvije opcije. Konzervativni pristup s lijekovima — jeftiniji, ali sporiji, uspješnost oko 60%. Ili operacija — skuplja, ali rješava problem trajno. Evo prednosti i mane obje opcije. Što vam odgovara?"

Cijene u Hrvatskoj, da znate što očekivati: redoviti pregled 25-50 eura. Vakcinacija 30-60. Sterilizacija psa 150-300 (ovisi o veličini — štenad jeftinije, doga skuplje). Mačke 80-150. Čipiranje 30-50. Rendgen 40-80. Ako su cijene značajno iznad ili ispod ovog raspona — pitajte zašto.

Čistoća nije luksuz, nego minimum. Obratite pažnju na čekaonicu. Miriše li po dezinfekciji ili po mokraći? Stolovi su čisti ili puni dlaka od prethodnog pacijenta? Male stvari govore puno. Bonus bodovi za ordinacije koje imaju odvojenu čekaonicu za mačke — jer mačka koja čeka u prostoriji punoj pasa koja laju prolazi kroz pakao.

Hitna dostupnost. Postavite ovo pitanje na prvom posjetu: "Što ako se nešto dogodi u 3 ujutro?" Ako odgovor nije jasan — imate problem. Dobre ordinacije imaju ili dežurni broj ili jasnu uputu na najbližu hitnu službu.

I konačno — vaš ljubimac vam govori sve. Ako svaki put drhti, povlači se, cvili — nešto nije u redu. Možda je prethodno iskustvo bilo traumatično. Možda je pristup pregrubo. Fear-free veterina postaje standard u svijetu, a polako dolazi i kod nas. To znači: poslastice na pregledu, nježan pristup, bez forsiranja, sedacija kad je potrebna umjesto "držanja na silu".

Vaš pas ne može birati veterinara. Ali vi možete. Birajte pametno.`,
    author: 'Dr. Maja Kovač',
    date: '2026-03-20',
    category: 'zdravlje',
    emoji: '🏥',
  },
];

export function getArticleBySlug(slug: string) {
  return mockArticles.find(a => a.slug === slug) || null;
}

export function getArticles(category?: string) {
  let result = [...mockArticles];
  if (category) result = result.filter(a => a.category === category);
  return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getRelatedArticles(slug: string, limit = 3) {
  const article = getArticleBySlug(slug);
  if (!article) return [];
  return mockArticles
    .filter(a => a.slug !== slug && a.category === article.category)
    .slice(0, limit)
    .concat(
      mockArticles.filter(a => a.slug !== slug && a.category !== article.category).slice(0, limit)
    )
    .slice(0, limit);
}

// ============================================================
// FORUM
// ============================================================

export const mockForumTopics: ForumTopic[] = [
  { id: 'ft-1', category_slug: 'pitanja', title: 'Koliko često trebam voditi psa veterinaru?', author_name: 'Marina K.', author_initial: 'M', author_gradient: 'from-blue-400 to-cyan-300', created_at: '2026-03-22T14:30:00Z', comment_count: 8, likes: 24, is_pinned: true, is_hot: true },
  { id: 'ft-2', category_slug: 'savjeti', title: '5 trikova za učenje štenca da ne grize', author_name: 'Luka J.', author_initial: 'L', author_gradient: 'from-green-400 to-emerald-300', created_at: '2026-03-21T09:15:00Z', comment_count: 12, likes: 45, is_pinned: false, is_hot: true },
  { id: 'ft-3', category_slug: 'price', title: 'Kako je Bella spasila moj dan — priča o udomljavanju', author_name: 'Ana H.', author_initial: 'A', author_gradient: 'from-pink-400 to-rose-300', created_at: '2026-03-20T18:00:00Z', comment_count: 15, likes: 67, is_pinned: false, is_hot: true },
  { id: 'ft-4', category_slug: 'izgubljeni', title: '🚨 Izgubljen zlatni retriver u Maksimiru — pomoć!', author_name: 'Tomislav B.', author_initial: 'T', author_gradient: 'from-red-400 to-orange-300', created_at: '2026-03-23T08:00:00Z', comment_count: 22, likes: 38, is_pinned: true, is_hot: true },
  { id: 'ft-5', category_slug: 'slobodna', title: 'Koji je vaš najdraži park za šetnju psa u Zagrebu?', author_name: 'Nina Š.', author_initial: 'N', author_gradient: 'from-purple-400 to-pink-300', created_at: '2026-03-19T11:30:00Z', comment_count: 19, likes: 31, is_pinned: false, is_hot: false },
  { id: 'ft-6', category_slug: 'pitanja', title: 'Preporuka za hranu za mačke s osjetljivim želucem?', author_name: 'Petra K.', author_initial: 'P', author_gradient: 'from-amber-400 to-yellow-300', created_at: '2026-03-18T16:45:00Z', comment_count: 7, likes: 18, is_pinned: false, is_hot: false },
  { id: 'ft-7', category_slug: 'savjeti', title: 'Kako pripremiti ljubimca za putovanje avionom', author_name: 'Filip M.', author_initial: 'F', author_gradient: 'from-indigo-400 to-blue-300', created_at: '2026-03-17T13:00:00Z', comment_count: 11, likes: 52, is_pinned: false, is_hot: true },
  { id: 'ft-8', category_slug: 'price', title: 'Moj mačak i pas su postali najbolji prijatelji', author_name: 'Ivana B.', author_initial: 'I', author_gradient: 'from-teal-400 to-cyan-300', created_at: '2026-03-16T20:15:00Z', comment_count: 9, likes: 41, is_pinned: false, is_hot: false },
  { id: 'ft-9', category_slug: 'pitanja', title: 'Je li normalno da pas jede travu?', author_name: 'Marko N.', author_initial: 'M', author_gradient: 'from-orange-400 to-amber-300', created_at: '2026-03-15T10:00:00Z', comment_count: 6, likes: 14, is_pinned: false, is_hot: false },
  { id: 'ft-10', category_slug: 'izgubljeni', title: 'Nestala crna mačka u Splitu, Mertojak — molim pomoć', author_name: 'Ante P.', author_initial: 'A', author_gradient: 'from-rose-400 to-red-300', created_at: '2026-03-22T07:30:00Z', comment_count: 14, likes: 29, is_pinned: false, is_hot: false },
  { id: 'ft-11', category_slug: 'savjeti', title: 'Najbolji načini za rashladiti psa tijekom ljeta', author_name: 'Maja P.', author_initial: 'M', author_gradient: 'from-sky-400 to-blue-300', created_at: '2026-03-14T15:30:00Z', comment_count: 8, likes: 36, is_pinned: false, is_hot: false },
  { id: 'ft-12', category_slug: 'slobodna', title: 'Tko ide na Dog Walk event u Rijeci ovaj vikend?', author_name: 'Lucija V.', author_initial: 'L', author_gradient: 'from-violet-400 to-purple-300', created_at: '2026-03-21T12:00:00Z', comment_count: 5, likes: 22, is_pinned: false, is_hot: false },
  { id: 'ft-13', category_slug: 'price', title: 'Priča o Rexu: od napuštenog štenca do terapijskog psa', author_name: 'Ivan K.', author_initial: 'I', author_gradient: 'from-emerald-400 to-green-300', created_at: '2026-03-13T09:00:00Z', comment_count: 20, likes: 89, is_pinned: false, is_hot: true },
  { id: 'ft-14', category_slug: 'pitanja', title: 'Kada sterilizirati mačku — iskustva?', author_name: 'Katarina T.', author_initial: 'K', author_gradient: 'from-fuchsia-400 to-pink-300', created_at: '2026-03-12T14:00:00Z', comment_count: 10, likes: 16, is_pinned: false, is_hot: false },
  { id: 'ft-15', category_slug: 'savjeti', title: 'DIY igračke za mačke od stvari koje imate doma', author_name: 'Nina Š.', author_initial: 'N', author_gradient: 'from-purple-400 to-pink-300', created_at: '2026-03-11T17:45:00Z', comment_count: 7, likes: 33, is_pinned: false, is_hot: false },
];

export const mockForumComments: ForumComment[] = [
  // Comments for ft-1 (veterinar)
  { id: 'fc-1', topic_id: 'ft-1', author_name: 'Ana H.', author_initial: 'A', author_gradient: 'from-pink-400 to-rose-300', content: 'Za odrasle pse preporučujem barem jednom godišnje, a za štence svaka 3-4 mjeseca dok ne završe s cijepljenjem.', created_at: '2026-03-22T15:00:00Z', likes: 12 },
  { id: 'fc-2', topic_id: 'ft-1', author_name: 'Marko N.', author_initial: 'M', author_gradient: 'from-orange-400 to-amber-300', content: 'Moj veterinar kaže da stariji psi (7+ godina) trebaju ići svaka 6 mjeseci na pregled. Prevencija je ključna!', created_at: '2026-03-22T15:30:00Z', likes: 8 },
  { id: 'fc-3', topic_id: 'ft-1', author_name: 'Petra K.', author_initial: 'P', author_gradient: 'from-amber-400 to-yellow-300', content: 'Slažem se s Markom. Naš pas je imao problem s bubrezima koji smo uhvatili rano baš zato što smo redovito išli na preglede.', created_at: '2026-03-22T16:15:00Z', likes: 5 },
  // Comments for ft-2 (štenci grizu)
  { id: 'fc-4', topic_id: 'ft-2', author_name: 'Marina K.', author_initial: 'M', author_gradient: 'from-blue-400 to-cyan-300', content: 'Odličan post! Mi smo koristili "zamijeni i preusmjeri" metodu — čim štene krene gristi ruku, damo mu igračku za žvakanje.', created_at: '2026-03-21T10:00:00Z', likes: 15 },
  { id: 'fc-5', topic_id: 'ft-2', author_name: 'Filip M.', author_initial: 'F', author_gradient: 'from-indigo-400 to-blue-300', content: 'Strpljenje je ključno! Naš Buddy je trebao oko 2 mjeseca da prestane, ali sad je super.', created_at: '2026-03-21T11:30:00Z', likes: 9 },
  // Comments for ft-3 (Bella udomljavanje)
  { id: 'fc-6', topic_id: 'ft-3', author_name: 'Tomislav B.', author_initial: 'T', author_gradient: 'from-red-400 to-orange-300', content: 'Predivna priča! Udomljavanje je uvijek najbolji izbor. Naš Rex je isto udomljen i najsretniji je pas na svijetu.', created_at: '2026-03-20T19:00:00Z', likes: 18 },
  { id: 'fc-7', topic_id: 'ft-3', author_name: 'Maja P.', author_initial: 'M', author_gradient: 'from-sky-400 to-blue-300', content: 'Rasplakala sam se čitajući ovo. Hvala što si podijelila! 🥹', created_at: '2026-03-20T19:30:00Z', likes: 22 },
  { id: 'fc-8', topic_id: 'ft-3', author_name: 'Lucija V.', author_initial: 'L', author_gradient: 'from-violet-400 to-purple-300', content: 'Bella izgleda prekrasno na slikama! Sretna sam da je pronašla svoj dom.', created_at: '2026-03-20T20:00:00Z', likes: 11 },
  // Comments for ft-4 (izgubljen retriver)
  { id: 'fc-9', topic_id: 'ft-4', author_name: 'Nina Š.', author_initial: 'N', author_gradient: 'from-purple-400 to-pink-300', content: 'Podijelila sam na svim grupama! Nadam se da će se brzo pronaći. Jeste li obavijestili udruge za životinje?', created_at: '2026-03-23T08:30:00Z', likes: 14 },
  { id: 'fc-10', topic_id: 'ft-4', author_name: 'Ivan K.', author_initial: 'I', author_gradient: 'from-emerald-400 to-green-300', content: 'Provjerite i Bundek, tamo često viđam pse koji su pobjegli iz Maksimira. Držim fige!', created_at: '2026-03-23T09:00:00Z', likes: 10 },
  { id: 'fc-11', topic_id: 'ft-4', author_name: 'Katarina T.', author_initial: 'K', author_gradient: 'from-fuchsia-400 to-pink-300', content: 'UPDATE: Mislim da sam ga vidjela kod jezera u Maksimiru oko 7 ujutro! Ima li ogrlicu?', created_at: '2026-03-23T09:45:00Z', likes: 20 },
  // Comments for ft-5 (parkovi Zagreb)
  { id: 'fc-12', topic_id: 'ft-5', author_name: 'Filip M.', author_initial: 'F', author_gradient: 'from-indigo-400 to-blue-300', content: 'Bundek je savršen! Ima ograđeni dio za pse i jezero u blizini.', created_at: '2026-03-19T12:00:00Z', likes: 7 },
  { id: 'fc-13', topic_id: 'ft-5', author_name: 'Maja P.', author_initial: 'M', author_gradient: 'from-sky-400 to-blue-300', content: 'Maksimir je klasik, ali Dotršćina je underrated — manje ljudi, više prostora za trčanje!', created_at: '2026-03-19T12:30:00Z', likes: 11 },
  // Comments for ft-13 (Rex priča)
  { id: 'fc-14', topic_id: 'ft-13', author_name: 'Ana H.', author_initial: 'A', author_gradient: 'from-pink-400 to-rose-300', content: 'Rex je dokaz da svaki pas zaslužuje drugu šansu. Nevjerojatna priča, hvala na dijeljenju!', created_at: '2026-03-13T10:00:00Z', likes: 25 },
  { id: 'fc-15', topic_id: 'ft-13', author_name: 'Marina K.', author_initial: 'M', author_gradient: 'from-blue-400 to-cyan-300', content: 'Postoji li udruga koja organizira edukaciju za terapijske pse? Htjela bih isto probati s mojim Maxom.', created_at: '2026-03-13T11:00:00Z', likes: 8 },
];

export function getForumTopics(category?: ForumCategorySlug) {
  let result = [...mockForumTopics];
  if (category) result = result.filter(t => t.category_slug === category);
  return result.sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

export function getForumTopicById(id: string) {
  return mockForumTopics.find(t => t.id === id);
}

export function getForumCommentsForTopic(topicId: string) {
  return mockForumComments
    .filter(c => c.topic_id === topicId)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}

export function getTrendingTopics() {
  return [...mockForumTopics]
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 5);
}

// ============================================================
// LOST PETS
// ============================================================

export const mockLostPets: LostPet[] = [
  {
    id: 'lp-001',
    name: 'Rex',
    species: 'pas',
    breed: 'Njemački ovčar',
    color: 'Crno-smeđi',
    sex: 'muško',
    image_url: '/images/services/04-setanje-pasa.jpg',
    gallery: ['/images/services/04-setanje-pasa.jpg'],
    city: 'Zagreb',
    neighborhood: 'Maksimir',
    location_lat: 45.8244,
    location_lng: 16.0195,
    date_lost: '2026-03-22T18:30:00Z',
    status: 'lost',
    hidden: false,
    description: 'Rex je nestao tijekom večernje šetnje u parku Maksimir. Vrlo je prijazan prema ljudima ali plašljiv od glasnih zvukova. Zadnji put viđen kod jezera.',
    special_marks: 'Ima ožiljak na lijevom uhu. Nosi crvenu ogrlicu s imenom.',
    has_microchip: true,
    has_collar: true,
    contact_name: 'Marko Petković',
    contact_phone: '+385 91 234 5678',
    contact_email: 'marko.p@email.hr',
    share_count: 234,
    found_at: null,
    found_method: null,
    reunion_message: null,
    updates: [
      { id: 'u1', date: '2026-03-22T19:00:00Z', text: 'Prijavljeno nestanak — zadnji put viđen kod jezera u Maksimiru' },
      { id: 'u2', date: '2026-03-23T08:15:00Z', text: 'Susjed javio da je čuo lajanje u smjeru Bukovačke ulice' },
      { id: 'u3', date: '2026-03-23T14:30:00Z', text: 'Još se traži — proširena potraga na Šalatu' },
    ],
    sightings: [
      { id: 's1', date: '2026-03-23T07:45:00Z', location: 'Bukovačka ulica, Zagreb', description: 'Viđen pas sličnog opisa kako trči prema Šalati.' },
    ],
    expires_at: null,
    reminder_sent_at: null,
    alerts_dispatched_at: null,
    created_at: '2026-03-22T19:00:00Z',
  },
  {
    id: 'lp-002',
    name: 'Mila',
    species: 'macka',
    breed: 'Perzijska',
    color: 'Bijela',
    sex: 'žensko',
    image_url: '/images/services/08-macka.jpg',
    gallery: ['/images/services/08-macka.jpg'],
    city: 'Split',
    neighborhood: 'Bačvice',
    location_lat: 43.5020,
    location_lng: 16.4520,
    date_lost: '2026-03-20T10:00:00Z',
    status: 'lost',
    hidden: false,
    description: 'Mila je pobjegla kroz otvoreni prozor. Kućna mačka, nikad nije bila vani. Vjerojatno je uplašena i skriva se negdje u blizini.',
    special_marks: 'Ima heterokromiju — jedno oko plavo, drugo zeleno. Vrlo mekano bijelo krzno.',
    has_microchip: true,
    has_collar: false,
    contact_name: 'Ana Klarić',
    contact_phone: '+385 92 345 6789',
    contact_email: 'ana.klaric@email.hr',
    share_count: 187,
    found_at: null,
    found_method: null,
    reunion_message: null,
    updates: [
      { id: 'u1', date: '2026-03-20T10:30:00Z', text: 'Mila pobjegla kroz prozor — tražimo u okolici Bačvica' },
      { id: 'u2', date: '2026-03-21T09:00:00Z', text: 'Postavljene zamke s hranom u dvorištu i oko zgrade' },
    ],
    sightings: [],
    expires_at: null,
    reminder_sent_at: null,
    alerts_dispatched_at: null,
    created_at: '2026-03-20T10:30:00Z',
  },
  {
    id: 'lp-003',
    name: 'Buddy',
    species: 'pas',
    breed: 'Labrador retriver',
    color: 'Zlatni',
    sex: 'muško',
    image_url: '/images/services/07-hero-puppy.jpg',
    gallery: ['/images/services/07-hero-puppy.jpg'],
    city: 'Rijeka',
    neighborhood: 'Trsat',
    location_lat: 45.3320,
    location_lng: 14.4530,
    date_lost: '2026-03-21T16:00:00Z',
    status: 'lost',
    hidden: false,
    description: 'Buddy se otrgao s povodca dok smo šetali na Trsatu. Jako je energičan i veseo, vjerojatno prilazi ljudima. Voli hranu i loptice.',
    special_marks: 'Nosi plavu ogrlicu s brojem telefona. Ima mali bijeli mrlja na prsima.',
    has_microchip: true,
    has_collar: true,
    contact_name: 'Ivan Brajković',
    contact_phone: '+385 95 567 8901',
    contact_email: 'ivan.b@email.hr',
    share_count: 156,
    found_at: null,
    found_method: null,
    reunion_message: null,
    updates: [
      { id: 'u1', date: '2026-03-21T16:30:00Z', text: 'Buddy pobjegao na Trsatu — trčao prema Kozali' },
      { id: 'u2', date: '2026-03-22T11:00:00Z', text: 'Viđen u blizini tržnice na Brajdi' },
    ],
    sightings: [
      { id: 's1', date: '2026-03-22T10:30:00Z', location: 'Tržnica Brajda, Rijeka', description: 'Zlatni labrador viđen kako njuška oko štandova.' },
    ],
    expires_at: null,
    reminder_sent_at: null,
    alerts_dispatched_at: null,
    created_at: '2026-03-21T16:30:00Z',
  },
  {
    id: 'lp-004',
    name: 'Luna',
    species: 'macka',
    breed: 'Domaća kratkodlaka',
    color: 'Crna',
    sex: 'žensko',
    image_url: '/images/services/08-macka.jpg',
    gallery: ['/images/services/08-macka.jpg'],
    city: 'Osijek',
    neighborhood: 'Gornji grad',
    location_lat: 45.5600,
    location_lng: 18.6950,
    date_lost: '2026-03-19T20:00:00Z',
    status: 'lost',
    hidden: false,
    description: 'Luna je nestala iz dvorišta. Crna mačka srednje veličine, sterilizirana. Obično ne odlazi daleko od kuće.',
    special_marks: 'Ima bijelu zvjezdicu na prsima. Vrlo tiha i plašljiva.',
    has_microchip: false,
    has_collar: true,
    contact_name: 'Martina Šimić',
    contact_phone: '+385 99 678 9012',
    contact_email: 'martina.s@email.hr',
    share_count: 98,
    found_at: null,
    found_method: null,
    reunion_message: null,
    updates: [
      { id: 'u1', date: '2026-03-19T20:30:00Z', text: 'Luna nestala iz dvorišta u Gornjem gradu' },
      { id: 'u2', date: '2026-03-20T18:00:00Z', text: 'Susjedi obavješteni, postavljeni letci u kvartu' },
    ],
    sightings: [],
    expires_at: null,
    reminder_sent_at: null,
    alerts_dispatched_at: null,
    created_at: '2026-03-19T20:30:00Z',
  },
  {
    id: 'lp-005',
    name: 'Čarli',
    species: 'pas',
    breed: 'Francuski buldog',
    color: 'Sivo-bijeli',
    sex: 'muško',
    image_url: '/images/services/01-pet-sitting.jpg',
    gallery: ['/images/services/01-pet-sitting.jpg'],
    city: 'Zagreb',
    neighborhood: 'Jarun',
    location_lat: 45.7870,
    location_lng: 15.9280,
    date_lost: '2026-03-23T09:00:00Z',
    status: 'lost',
    hidden: false,
    description: 'Čarli je nestao s Jaruna jutros. Mali francuski buldog, jako prijateljski nastrojen. Ne voli hladnoću, vjerojatno traži sklonište.',
    special_marks: 'Ima šarenu bandanu oko vrata. Hramlje na zadnju lijevu nogu (stara ozljeda).',
    has_microchip: true,
    has_collar: false,
    contact_name: 'Luka Vuković',
    contact_phone: '+385 91 789 0123',
    contact_email: 'luka.v@email.hr',
    share_count: 312,
    found_at: null,
    found_method: null,
    reunion_message: null,
    updates: [
      { id: 'u1', date: '2026-03-23T09:30:00Z', text: 'Čarli nestao s Jaruna — hitno ga tražimo!' },
      { id: 'u2', date: '2026-03-23T12:00:00Z', text: 'Viđen u blizini studentskog doma na Savi' },
      { id: 'u3', date: '2026-03-24T08:00:00Z', text: 'Potraga se nastavlja — molimo sve u okolici Jaruna da provjere dvorišta' },
    ],
    sightings: [
      { id: 's1', date: '2026-03-23T11:45:00Z', location: 'Savska cesta kod studentskog doma', description: 'Mali sivo-bijeli buldog viđen kako sjedi ispred ulaza.' },
    ],
    expires_at: null,
    reminder_sent_at: null,
    alerts_dispatched_at: null,
    created_at: '2026-03-23T09:30:00Z',
  },
  {
    id: 'lp-006',
    name: 'Kiki',
    species: 'macka',
    breed: 'Sijamska',
    color: 'Krem-smeđa',
    sex: 'žensko',
    image_url: '/images/services/08-macka.jpg',
    gallery: ['/images/services/08-macka.jpg'],
    city: 'Pula',
    neighborhood: 'Veruda',
    location_lat: 44.8560,
    location_lng: 13.8430,
    date_lost: '2026-03-18T14:00:00Z',
    status: 'found',
    hidden: false,
    description: 'Kiki je pronađena! Bila je u podrumu susjedne zgrade. Hvala svima koji su podijelili i pomogli u potrazi!',
    special_marks: 'Karakteristične sijamske oznake, plave oči.',
    has_microchip: true,
    has_collar: true,
    contact_name: 'Petra Morić',
    contact_phone: '+385 98 890 1234',
    contact_email: 'petra.m@email.hr',
    share_count: 445,
    found_at: '2026-03-19T11:00:00Z',
    found_method: 'other',
    reunion_message: 'Kiki je bila zaključana u podrumu susjedne zgrade! Hvala svima koji su podijelili i pomogli u potrazi!',
    updates: [
      { id: 'u1', date: '2026-03-18T14:30:00Z', text: 'Kiki nestala iz stana na Verudi' },
      { id: 'u2', date: '2026-03-19T10:00:00Z', text: 'Čuli mijaukanje u podrumu' },
      { id: 'u3', date: '2026-03-19T11:00:00Z', text: '🟢 PRONAĐENA! Kiki je bila zaključana u podrumu susjedne zgrade!' },
    ],
    sightings: [],
    expires_at: null,
    reminder_sent_at: null,
    alerts_dispatched_at: null,
    created_at: '2026-03-18T14:30:00Z',
  },
  {
    id: 'lp-007',
    name: 'Thor',
    species: 'pas',
    breed: 'Haski',
    color: 'Sivo-bijeli',
    sex: 'muško',
    image_url: '/images/services/04-setanje-pasa.jpg',
    gallery: ['/images/services/04-setanje-pasa.jpg'],
    city: 'Zadar',
    neighborhood: 'Borik',
    location_lat: 44.1300,
    location_lng: 15.2150,
    date_lost: '2026-03-17T07:00:00Z',
    status: 'found',
    hidden: false,
    description: 'Thor je pronađen na plaži u Ninu! Pobjegao je jer se uplašio vatrometa. Sada je sigurno kod kuće. Hvala susjedima iz Nina!',
    special_marks: 'Plave oči, jako krzno. Ima tetoviran broj na unutarnjem dijelu uha.',
    has_microchip: true,
    has_collar: true,
    contact_name: 'Dario Knez',
    contact_phone: '+385 91 901 2345',
    contact_email: 'dario.k@email.hr',
    share_count: 567,
    found_at: '2026-03-18T18:00:00Z',
    found_method: 'sighting',
    reunion_message: 'Thor je pronađen na plaži u Ninu zahvaljujući susjedima koji su ga prepoznali! Sada je sigurno kod kuće.',
    updates: [
      { id: 'u1', date: '2026-03-17T07:30:00Z', text: 'Thor pobjegao nakon vatrometa u Boriku' },
      { id: 'u2', date: '2026-03-18T16:00:00Z', text: 'Viđen na plaži u Ninu' },
      { id: 'u3', date: '2026-03-18T18:00:00Z', text: '🟢 PRONAĐEN! Thor pronađen na plaži u Ninu, sada je sigurno kod kuće!' },
    ],
    sightings: [
      { id: 's1', date: '2026-03-18T15:30:00Z', location: 'Plaža Nin, Zadar', description: 'Haski viđen kako trči po plaži.' },
    ],
    expires_at: null,
    reminder_sent_at: null,
    alerts_dispatched_at: null,
    created_at: '2026-03-17T07:30:00Z',
  },
  {
    id: 'lp-008',
    name: 'Bella',
    species: 'pas',
    breed: 'Zlatni retriver',
    color: 'Zlatna',
    sex: 'žensko',
    image_url: '/images/services/07-hero-puppy.jpg',
    gallery: ['/images/services/07-hero-puppy.jpg'],
    city: 'Split',
    neighborhood: 'Spinut',
    location_lat: 43.5150,
    location_lng: 16.4320,
    date_lost: '2026-03-23T17:30:00Z',
    status: 'lost',
    hidden: false,
    description: 'Bella je nestala iz dvorišta na Spinutu. Stara je 3 godine, sterilizirana, vrlo nježna. Bojimo se da ju je netko odveo jer je vrata dvorišta bila otvorena.',
    special_marks: 'Ima ružičastu ogrlicu s privjeskom u obliku srca.',
    has_microchip: true,
    has_collar: true,
    contact_name: 'Maja Perković',
    contact_phone: '+385 92 012 3456',
    contact_email: 'maja.p@email.hr',
    share_count: 89,
    found_at: null,
    found_method: null,
    reunion_message: null,
    updates: [
      { id: 'u1', date: '2026-03-23T18:00:00Z', text: 'Bella nestala iz dvorišta na Spinutu — vrata bila otvorena' },
    ],
    sightings: [],
    expires_at: null,
    reminder_sent_at: null,
    alerts_dispatched_at: null,
    created_at: '2026-03-23T18:00:00Z',
  },
  {
    id: 'lp-009',
    name: 'Medo',
    species: 'pas',
    breed: 'Mješanac',
    color: 'Smeđi',
    sex: 'muško',
    image_url: '/images/services/01-pet-sitting.jpg',
    gallery: ['/images/services/01-pet-sitting.jpg'],
    city: 'Rijeka',
    neighborhood: 'Krnjevo',
    location_lat: 45.3350,
    location_lng: 14.4380,
    date_lost: '2026-03-22T12:00:00Z',
    status: 'lost',
    hidden: false,
    description: 'Medo je nestao iz dvorišta na Krnjevu. Srednje veličine, jako voli djecu. Može biti uplašen od nepoznatih odraslih.',
    special_marks: 'Nedostaje mu dio lijevog uha (od štenceta). Kratka smeđa dlaka.',
    has_microchip: false,
    has_collar: true,
    contact_name: 'Tomislav Grgić',
    contact_phone: '+385 95 123 4567',
    contact_email: 'tomo.g@email.hr',
    share_count: 143,
    found_at: null,
    found_method: null,
    reunion_message: null,
    updates: [
      { id: 'u1', date: '2026-03-22T12:30:00Z', text: 'Medo nestao s Krnjeva — tražimo ga!' },
      { id: 'u2', date: '2026-03-22T18:00:00Z', text: 'Viđen u Krnjevo 14:30 — trčao prema Vežici' },
    ],
    sightings: [
      { id: 's1', date: '2026-03-22T14:30:00Z', location: 'Krnjevo, Rijeka', description: 'Smeđi mješanac viđen kako trči prema Vežici.' },
    ],
    expires_at: null,
    reminder_sent_at: null,
    alerts_dispatched_at: null,
    created_at: '2026-03-22T12:30:00Z',
  },
  {
    id: 'lp-010',
    name: 'Nala',
    species: 'macka',
    breed: 'Maine Coon',
    color: 'Smeđe-prugasta',
    sex: 'žensko',
    image_url: '/images/services/08-macka.jpg',
    gallery: ['/images/services/08-macka.jpg'],
    city: 'Zagreb',
    neighborhood: 'Trešnjevka',
    location_lat: 45.8000,
    location_lng: 15.9550,
    date_lost: '2026-03-16T09:00:00Z',
    status: 'lost',
    hidden: false,
    description: 'Nala je nestala iz stana na Trešnjevci. Jako velika Maine Coon mačka, teška oko 7kg. Nikad nije bila vani, vjerojatno je uplašena. Voli se skrivati u grmovima.',
    special_marks: 'Jako velika mačka (7kg), dugo puhasto krzno, karakteristične ušne četkice.',
    has_microchip: true,
    has_collar: false,
    contact_name: 'Sara Đurić',
    contact_phone: '+385 98 234 5678',
    contact_email: 'sara.d@email.hr',
    share_count: 289,
    found_at: null,
    found_method: null,
    reunion_message: null,
    updates: [
      { id: 'u1', date: '2026-03-16T09:30:00Z', text: 'Nala nestala s Trešnjevke — velika Maine Coon mačka' },
      { id: 'u2', date: '2026-03-17T14:00:00Z', text: 'Čuli mijaukanje noćas ali nismo je pronašli' },
    ],
    sightings: [
      { id: 's1', date: '2026-03-17T13:45:00Z', location: 'Trešnjevka, kod parka', description: 'Velika prugasta mačka viđena kako se skriva ispod automobila.' },
    ],
    expires_at: null,
    reminder_sent_at: null,
    alerts_dispatched_at: null,
    created_at: '2026-03-16T09:30:00Z',
  },
];

export function getLostPets(filters?: { city?: string; species?: string; status?: string }) {
  let pets = [...mockLostPets];
  if (filters?.city) pets = pets.filter(p => p.city === filters.city);
  if (filters?.species) pets = pets.filter(p => p.species === filters.species);
  if (filters?.status) pets = pets.filter(p => p.status === filters.status);
  return pets.sort((a, b) => new Date(b.date_lost).getTime() - new Date(a.date_lost).getTime());
}

export function getLostPetById(id: string) {
  return mockLostPets.find(p => p.id === id);
}

// ============================================================
// GROOMER REVIEWS
// ============================================================

export interface GroomerReview {
  id: string;
  groomer_id: string;
  author_name: string;
  author_initial: string;
  rating: number;
  comment: string;
  created_at: string;
}

export const mockGroomerReviews: GroomerReview[] = [
  // gr-1 Salon PetPark (5 recenzija)
  { id: 'grev-1', groomer_id: 'gr-1', author_name: 'Marina Kovač', author_initial: 'M', rating: 5, comment: 'Izvrsna usluga! Moj zlatni retriver izgleda predivno nakon šišanja. Osoblje je nježno i profesionalno.', created_at: '2026-03-10T14:00:00Z' },
  { id: 'grev-2', groomer_id: 'gr-1', author_name: 'Tomislav Barić', author_initial: 'T', rating: 5, comment: 'Najbolji salon u Zagrebu. Naš pudlica je uvijek savršeno ošišan. Koristimo ih već 2 godine.', created_at: '2026-02-28T10:00:00Z' },
  { id: 'grev-3', groomer_id: 'gr-1', author_name: 'Ana Perković', author_initial: 'A', rating: 5, comment: 'Spa tretman je bio fantastičan! Moj malinoiz je izašao potpuno opušten i miriše predivno.', created_at: '2026-02-15T16:00:00Z' },
  { id: 'grev-4', groomer_id: 'gr-1', author_name: 'Nikola Štefanec', author_initial: 'N', rating: 4, comment: 'Odlična kvaliteta ali ponekad treba čekati na termin. Preporučam rezervirati unaprijed.', created_at: '2026-01-20T11:00:00Z' },
  { id: 'grev-5', groomer_id: 'gr-1', author_name: 'Ivana Bošnjak', author_initial: 'I', rating: 5, comment: 'Mačka mi se inače boji groominga ali ovdje su bili nevjerojatno strpljivi. Hvala!', created_at: '2026-01-05T09:00:00Z' },
  // gr-2 Petra Grooming (3 recenzije)
  { id: 'grev-6', groomer_id: 'gr-2', author_name: 'Davor Jelić', author_initial: 'D', rating: 5, comment: 'Mobilni servis je genijalan! Petra dolazi na kućnu adresu, pas se ne stresira od vožnje. Top usluga.', created_at: '2026-03-05T13:00:00Z' },
  { id: 'grev-7', groomer_id: 'gr-2', author_name: 'Sanja Milić', author_initial: 'S', rating: 4, comment: 'Jako dobra usluga za cijenu. Jedino ne nudi spa tretmane, ali šišanje i kupanje su odlični.', created_at: '2026-02-10T15:00:00Z' },
  { id: 'grev-8', groomer_id: 'gr-2', author_name: 'Krešimir Horvat', author_initial: 'K', rating: 5, comment: 'Naš husky je konačno lijepo ošišan! Petra zna raditi s većim pasminama. Svaka preporuka.', created_at: '2026-01-22T10:00:00Z' },
  // gr-3 Mačji Raj (2 recenzije)
  { id: 'grev-9', groomer_id: 'gr-3', author_name: 'Maja Vidović', author_initial: 'M', rating: 5, comment: 'Jedini salon gdje se moja mačka ne boji! Mirna atmosfera bez pasa je ključna. Preporučujem svim vlasnicima mačaka.', created_at: '2026-03-01T12:00:00Z' },
  { id: 'grev-10', groomer_id: 'gr-3', author_name: 'Robert Blažević', author_initial: 'R', rating: 4, comment: 'Jako dobar salon za mačke. Cijene su malo više ali vrijedi za specijalnu njegu.', created_at: '2026-02-05T14:00:00Z' },
  // gr-4 DogStyle Studio (2 recenzije)
  { id: 'grev-11', groomer_id: 'gr-4', author_name: 'Lana Matić', author_initial: 'L', rating: 5, comment: 'Luksuzni tretman za našeg jorkšira! Aromaterapija i masaža — pas je bio potpuno opušten. Vrhunski!', created_at: '2026-03-12T11:00:00Z' },
  { id: 'grev-12', groomer_id: 'gr-4', author_name: 'Petar Grgić', author_initial: 'P', rating: 5, comment: 'Premium usluga, premium rezultat. Naša francuska buldožica izgleda kao iz časopisa. Definitivno se vraćamo.', created_at: '2026-02-20T16:00:00Z' },
  // gr-5 Grooming Pula (1 recenzija)
  { id: 'grev-13', groomer_id: 'gr-5', author_name: 'Sandra Jurišić', author_initial: 'S', rating: 4, comment: 'Simpatičan obiteljski salon. Posebno cijenim popust za udomljene ljubimce. Usluga je solidna.', created_at: '2026-02-18T10:00:00Z' },
  // gr-6 Bella Grooming (1 recenzija)
  { id: 'grev-14', groomer_id: 'gr-6', author_name: 'Josip Pavlović', author_initial: 'J', rating: 5, comment: 'Naša pudlica je konačno dobila savršen šišanje. 8 godina iskustva se vidi! Profesionalno i brzo.', created_at: '2026-03-08T14:00:00Z' },
  // gr-8 Šišaj Me (1 recenzija)
  { id: 'grev-15', groomer_id: 'gr-8', author_name: 'Vedrana Tomašić', author_initial: 'V', rating: 5, comment: 'Specijalistkinja za huskije — konačno netko tko zna raditi s gustim krznom! Rezultat je fenomenalan.', created_at: '2026-01-30T13:00:00Z' },
];

export function getGroomerReviews(groomerId: string) {
  return mockGroomerReviews.filter(r => r.groomer_id === groomerId);
}

// ============================================================
// TRAINER REVIEWS
// ============================================================

export interface TrainerReview {
  id: string;
  trainer_id: string;
  author_name: string;
  author_initial: string;
  rating: number;
  comment: string;
  created_at: string;
}

export const mockTrainerReviews: TrainerReview[] = [
  // tr-1 Marko Šimić (4 recenzije)
  { id: 'trev-1', trainer_id: 'tr-1', author_name: 'Ivan Mandić', author_initial: 'I', rating: 5, comment: 'Marko je nevjerojatan trener! Naš pas je za 8 tjedana naučio sve osnove. Pozitivan pristup bez kažnjavanja daje rezultate.', created_at: '2026-03-15T10:00:00Z' },
  { id: 'trev-2', trainer_id: 'tr-1', author_name: 'Petra Šimunović', author_initial: 'P', rating: 5, comment: 'Program korekcije agresije je spasio našeg psa. Marko je strpljiv i stručan. Preporučujem svima s problematičnim psima.', created_at: '2026-02-25T14:00:00Z' },
  { id: 'trev-3', trainer_id: 'tr-1', author_name: 'Dario Herceg', author_initial: 'D', rating: 5, comment: 'Napredna poslušnost je bila izazovna ali Marko nas je vodio korak po korak. Pas sada sluša bez povodca!', created_at: '2026-02-01T11:00:00Z' },
  { id: 'trev-4', trainer_id: 'tr-1', author_name: 'Mirna Babić', author_initial: 'M', rating: 4, comment: 'Grupni tečaj je odličan, samo bi volio manji broj pasa u grupi. Inače sve pohvale za metodu rada.', created_at: '2026-01-10T16:00:00Z' },
  // tr-2 Ana Petrović (3 recenzije)
  { id: 'trev-5', trainer_id: 'tr-2', author_name: 'Maja Knežević', author_initial: 'M', rating: 5, comment: 'Ana je fantastična s malim štencima. Naša Bella je za 6 tjedana postala poslušna i socijalizirana. Hvala!', created_at: '2026-03-10T09:00:00Z' },
  { id: 'trev-6', trainer_id: 'tr-2', author_name: 'Goran Vuković', author_initial: 'G', rating: 5, comment: 'Puppy Start program je savršen za nove vlasnike. Naučili smo komunicirati sa psom na pravi način.', created_at: '2026-02-15T13:00:00Z' },
  { id: 'trev-7', trainer_id: 'tr-2', author_name: 'Katarina Ružić', author_initial: 'K', rating: 4, comment: 'Dobra trenerica, jako nježna sa štencima. Jedino bih voljela duži program — 6 tjedana brzo prođe.', created_at: '2026-01-20T15:00:00Z' },
  // tr-3 Ivan Delić (2 recenzije)
  { id: 'trev-8', trainer_id: 'tr-3', author_name: 'Ante Jurić', author_initial: 'A', rating: 5, comment: 'Agility trening je promijenio život našem border collieju! Ivan je pravi profesionalac i natjecatelj.', created_at: '2026-03-05T10:00:00Z' },
  { id: 'trev-9', trainer_id: 'tr-3', author_name: 'Lucija Bašić', author_initial: 'L', rating: 4, comment: 'Natjecateljski program je zahtjevan ali rezultati su vidljivi. Naš pas je osvojio 2. mjesto na regionalnom natjecanju!', created_at: '2026-02-08T12:00:00Z' },
  // tr-4 Lana Horvat (2 recenzije)
  { id: 'trev-10', trainer_id: 'tr-4', author_name: 'Filip Radman', author_initial: 'F', rating: 5, comment: 'Lana je riješila separacijsku anksioznost našeg psa za 6 tjedana. Profesionalan i empatičan pristup. Spasiteljica!', created_at: '2026-03-12T14:00:00Z' },
  { id: 'trev-11', trainer_id: 'tr-4', author_name: 'Jelena Tomić', author_initial: 'J', rating: 5, comment: 'Program za reaktivne pse je bio ključan za našeg šarplaninca. Sada mirno prolazimo pored drugih pasa.', created_at: '2026-02-20T11:00:00Z' },
  // tr-5 Tomislav Radić (1 recenzija)
  { id: 'trev-12', trainer_id: 'tr-5', author_name: 'Branko Ilić', author_initial: 'B', rating: 4, comment: 'Solidan trener u Osijeku. Grupni tečaj je dobro organiziran, pas je napredovao u šetnji i poslušnosti.', created_at: '2026-01-25T10:00:00Z' },
];

export function getTrainerReviews(trainerId: string) {
  return mockTrainerReviews.filter(r => r.trainer_id === trainerId);
}

// ── Shop / Webshop Mock Data ──

import type { Product, ProductReview } from '@/lib/types';

export const mockProducts: Product[] = [
  // ── Hrana (8) ──
  { id: 'prod-1', slug: 'premium-suha-hrana-psi', name: 'Premium suha hrana za pse', category: 'hrana', price: 65, description: 'Visokokvalitetna suha hrana za odrasle pse svih pasmina. Bogata proteinima iz piletine i lososa, obogaćena vitaminima i mineralima za zdravu dlaku i jake kosti. Idealna za svakodnevnu prehranu aktivnih pasa.', emoji: '🥩', brand: 'Purina Pro Plan', rating: 4.7, reviewCount: 124, inStock: true, variants: [{ label: 'Težina', value: '2kg', priceModifier: -40 }, { label: 'Težina', value: '5kg', priceModifier: -20 }, { label: 'Težina', value: '10kg' }], specs: { 'Težina': '10kg', 'Vrsta': 'Suha hrana', 'Dob': 'Odrasli psi', 'Glavni sastojak': 'Piletina', 'Zemlja podrijetla': 'Francuska' } },
  { id: 'prod-2', slug: 'mokra-hrana-psi-royal-canin', name: 'Mokra hrana za pse', category: 'hrana', price: 35, description: 'Premium mokra hrana u praktičnim vrećicama. Savršena kombinacija mesa i povrća koja osigurava kompletnu prehranu. Bez umjetnih boja i konzervansa. Psi je obožavaju!', emoji: '🍖', brand: 'Royal Canin', rating: 4.5, reviewCount: 89, inStock: true, variants: [{ label: 'Pakiranje', value: '6x400g', priceModifier: -15 }, { label: 'Pakiranje', value: '12x400g' }], specs: { 'Pakiranje': '12x400g', 'Vrsta': 'Mokra hrana', 'Dob': 'Odrasli psi', 'Okus': 'Govedina i povrće', 'Bez žitarica': 'Ne' } },
  { id: 'prod-3', slug: 'hrana-za-stence', name: 'Hrana za štence', category: 'hrana', price: 28, description: 'Posebno formulirana hrana za štence do 12 mjeseci. Sadrži DHA za razvoj mozga i vida, kalcij za jake kosti i zube. Malene granule prilagođene malim čeljustima štenaca.', emoji: '🐶', brand: "Hill's Science Plan", rating: 4.8, reviewCount: 67, inStock: true, variants: [{ label: 'Težina', value: '1.5kg', priceModifier: -12 }, { label: 'Težina', value: '3kg' }], specs: { 'Težina': '3kg', 'Vrsta': 'Suha hrana', 'Dob': 'Štenci (0-12mj)', 'Glavni sastojak': 'Piletina', 'DHA': 'Da' } },
  { id: 'prod-4', slug: 'grain-free-hrana', name: 'Grain-free hrana', category: 'hrana', price: 48, description: 'Hrana bez žitarica za pse s osjetljivom probavom. Napravljena od divljači i slatkog krumpira. Prirodni probiotici podržavaju zdravu probavu i jačaju imunitet.', emoji: '🦌', brand: 'Taste of the Wild', rating: 4.6, reviewCount: 52, inStock: true, variants: [{ label: 'Težina', value: '2kg', priceModifier: -25 }, { label: 'Težina', value: '5.6kg' }], specs: { 'Težina': '5.6kg', 'Vrsta': 'Suha hrana', 'Bez žitarica': 'Da', 'Protein': 'Divljač', 'Zemlja podrijetla': 'SAD' } },
  { id: 'prod-5', slug: 'hrana-velike-pse', name: 'Hrana za velike pse', category: 'hrana', price: 72, description: 'Specijalna formula za velike i gigantske pasmine. Velike granule potiču sporije žvakanje. Glukozamin i hondroitin za zdravlje zglobova. L-karnitin pomaže u održavanju idealne tjelesne težine.', emoji: '🐕', brand: 'Eukanuba', rating: 4.4, reviewCount: 41, inStock: true, variants: [{ label: 'Težina', value: '7.5kg', priceModifier: -30 }, { label: 'Težina', value: '15kg' }], specs: { 'Težina': '15kg', 'Vrsta': 'Suha hrana', 'Dob': 'Odrasli psi', 'Pasmina': 'Velike (25kg+)', 'Glukozamin': 'Da' } },
  { id: 'prod-6', slug: 'senior-hrana-psi', name: 'Senior hrana za pse', category: 'hrana', price: 42, description: 'Prilagođena hrana za starije pse (7+ godina). Smanjen udio masti, povećan udio vlakana. Antioksidanti za podršku imuniteta i vitalnosti u starijoj dobi.', emoji: '🧓', brand: 'Purina ONE', rating: 4.5, reviewCount: 38, inStock: true, variants: [{ label: 'Težina', value: '3kg', priceModifier: -18 }, { label: 'Težina', value: '7.5kg' }], specs: { 'Težina': '7.5kg', 'Vrsta': 'Suha hrana', 'Dob': 'Seniori (7+)', 'Kalorije': 'Smanjene', 'Antioksidanti': 'Da' } },
  { id: 'prod-7', slug: 'hrana-male-pse', name: 'Hrana za male pse', category: 'hrana', price: 32, description: 'Posebna formula za male pasmine do 10kg. Male granule prilagođene malim ustima. Visok udio energije za brzi metabolizam malih pasa. Omega masne kiseline za sjajnu dlaku.', emoji: '🐩', brand: 'Royal Canin Mini', rating: 4.6, reviewCount: 73, inStock: true, variants: [{ label: 'Težina', value: '2kg', priceModifier: -14 }, { label: 'Težina', value: '4kg' }], specs: { 'Težina': '4kg', 'Vrsta': 'Suha hrana', 'Pasmina': 'Male (do 10kg)', 'Omega 3&6': 'Da', 'Zemlja podrijetla': 'Francuska' } },
  { id: 'prod-8', slug: 'hipoalergena-hrana', name: 'Hipoalergena hrana', category: 'hrana', price: 55, originalPrice: 62, description: 'Veterinarska dijetetska hrana za pse s alergijama na hranu. Hidrolizirani proteini smanjuju rizik od alergijskih reakcija. Preporučuju je veterinari diljem Hrvatske.', emoji: '🏥', brand: "Hill's z/d", rating: 4.9, reviewCount: 29, inStock: true, variants: [{ label: 'Težina', value: '1.5kg', priceModifier: -30 }, { label: 'Težina', value: '3kg' }], specs: { 'Težina': '3kg', 'Vrsta': 'Dijetetska hrana', 'Protein': 'Hidrolizirani', 'Veterinarska': 'Da', 'Alergeni': 'Smanjeni' } },

  // ── Igračke (6) ──
  { id: 'prod-9', slug: 'kong-classic', name: 'Kong Classic', category: 'igracke', price: 12, description: 'Legendarna neizdrživa igračka za pse. Može se puniti poslasticama za dodatnu zabavu. Odskače nepredvidivo i drži psa zaokupljenim satima. Sigurna za zube i desni.', emoji: '🔴', brand: 'Kong', rating: 4.8, reviewCount: 203, inStock: true, variants: [{ label: 'Veličina', value: 'S' }, { label: 'Veličina', value: 'M' }, { label: 'Veličina', value: 'L', priceModifier: 4 }, { label: 'Veličina', value: 'XL', priceModifier: 8 }], specs: { 'Materijal': 'Prirodna guma', 'Izdržljivost': 'Izuzetna', 'Može se puniti': 'Da', 'Pranje': 'U perilici' } },
  { id: 'prod-10', slug: 'loptica-s-uzetom', name: 'Loptica s užetom', category: 'igracke', price: 8, description: 'Klasična teniska loptica s čvrstim užetom za igru povlačenja. Uže čisti zube dok se pas igra. Idealna za park i dvorište. Lagana i jednostavna za bacanje na veliku udaljenost.', emoji: '🎾', brand: 'Trixie', rating: 4.3, reviewCount: 87, inStock: true, variants: [], specs: { 'Materijal': 'Guma + pamuk', 'Duljina': '35cm', 'Za pasmine': 'Sve veličine' } },
  { id: 'prod-11', slug: 'piskava-kost', name: 'Piskava kost', category: 'igracke', price: 6, description: 'Zabavna igračka u obliku kosti koja pišti kada je pas stisne. Mekana i sigurna za zube. Dolazi u veselim bojama koje privlače pažnju psa.', emoji: '🦴', brand: 'Nobby', rating: 4.1, reviewCount: 56, inStock: true, variants: [], specs: { 'Materijal': 'Vinil', 'Zvuk': 'Piskalica', 'Duljina': '18cm' } },
  { id: 'prod-12', slug: 'frisbee-za-pse', name: 'Frisbee za pse', category: 'igracke', price: 10, description: 'Mekani gumeni frisbee dizajniran posebno za pse. Ne oštećuje zube i desni pri hvatanju. Pluta na vodi pa je idealan i za igru na plaži ili jezeru.', emoji: '🥏', brand: 'Chuckit', rating: 4.5, reviewCount: 64, inStock: true, variants: [], specs: { 'Materijal': 'Mekana guma', 'Promjer': '24cm', 'Pluta': 'Da', 'Težina': '120g' } },
  { id: 'prod-13', slug: 'interaktivna-slagalica', name: 'Interaktivna slagalica', category: 'igracke', price: 18, description: 'Mentalna stimulacija za pametne pse! Razine težine od 1 do 3. Pas mora riješiti slagalicu da dođe do poslastica. Smanjuje dosadu i destruktivno ponašanje.', emoji: '🧩', brand: 'Nina Ottosson', rating: 4.7, reviewCount: 45, inStock: true, variants: [{ label: 'Razina', value: 'Početnik' }, { label: 'Razina', value: 'Srednja' }, { label: 'Razina', value: 'Napredna', priceModifier: 5 }], specs: { 'Materijal': 'Plastika (BPA-free)', 'Razina': '1-3', 'Pranje': 'Ručno', 'Dimenzije': '30x30cm' } },
  { id: 'prod-14', slug: 'set-igracaka', name: 'Set igračaka (5 kom)', category: 'igracke', price: 22, originalPrice: 28, description: 'Komplet od 5 raznovrsnih igračaka: loptica, uže, piskava igračka, gumena kost i plišana igračka. Savršen poklon za svakog psa. Raznolikost drži psa zainteresiranim.', emoji: '🎁', brand: 'PetStages', rating: 4.4, reviewCount: 91, inStock: true, variants: [], specs: { 'Broj komada': '5', 'Materijali': 'Guma, pamuk, pliš', 'Za pasmine': 'Male do srednje' } },

  // ── Povodci (5) ──
  { id: 'prod-15', slug: 'flexi-povodac-5m', name: 'Flexi povodac 5m', category: 'povodci', price: 25, description: 'Automatski uvlačivi povodac duljine 5 metara. Ergonomska ručka s gumbom za zaključavanje. Čvrst mehanizam koji traje godinama. Daje psu slobodu kretanja uz vašu kontrolu.', emoji: '🔗', brand: 'Flexi', rating: 4.6, reviewCount: 156, inStock: true, variants: [{ label: 'Duljina', value: '3m', priceModifier: -5 }, { label: 'Duljina', value: '5m' }, { label: 'Duljina', value: '8m', priceModifier: 8 }], specs: { 'Duljina': '5m', 'Max. težina psa': '20kg', 'Materijal': 'Najlon traka', 'Tip': 'Automatski uvlačivi' } },
  { id: 'prod-16', slug: 'najlonski-povodac-ogrlica-set', name: 'Najlonski povodac + ogrlica set', category: 'povodci', price: 18, description: 'Elegantan set povodca i ogrlice od premium najlona. Podesiva ogrlica s brzom kopčom. Reflektirajuće niti za vidljivost po noći. Dostupan u više boja.', emoji: '🐕‍🦺', brand: 'Hunter', rating: 4.3, reviewCount: 72, inStock: true, variants: [{ label: 'Veličina', value: 'S' }, { label: 'Veličina', value: 'M' }, { label: 'Veličina', value: 'L' }], specs: { 'Materijal': 'Premium najlon', 'Povodac': '120cm', 'Reflektirajući': 'Da', 'Kopča': 'Brza' } },
  { id: 'prod-17', slug: 'kozni-povodac-premium', name: 'Kožni povodac premium', category: 'povodci', price: 35, description: 'Ručno rađen kožni povodac od talijanske kože. Mekan u ruci, čvrst i izdržljiv. Razvija patinu vremenom i postaje još ljepši. Za vlasnike koji cijene kvalitetu.', emoji: '👜', brand: 'Cloud7', rating: 4.9, reviewCount: 34, inStock: true, variants: [{ label: 'Duljina', value: '100cm' }, { label: 'Duljina', value: '150cm', priceModifier: 5 }], specs: { 'Materijal': 'Talijanska koža', 'Debljina': '2cm', 'Ručni rad': 'Da', 'Boja': 'Smeđa' } },
  { id: 'prod-18', slug: 'reflektirajuci-povodac', name: 'Reflektirajući povodac', category: 'povodci', price: 15, description: 'Sigurnosni povodac s visokom vidljivošću za noćne šetnje. Reflektirajuća traka vidljiva na 200m. Udobna ručka s neoprenom. Lagan i jednostavan za korištenje.', emoji: '🌙', brand: 'Ruffwear', rating: 4.4, reviewCount: 48, inStock: true, variants: [{ label: 'Veličina', value: 'S/M' }, { label: 'Veličina', value: 'L/XL' }], specs: { 'Vidljivost': '200m', 'Materijal': 'Najlon + reflektor', 'Duljina': '150cm', 'Ručka': 'Neopren' } },
  { id: 'prod-19', slug: 'am-anti-pull', name: 'Am za pse — anti-pull', category: 'povodci', price: 22, description: 'Ergonomski am koji sprječava povlačenje bez gušenja. Prednji i stražnji prsten za povodac. Podstava od mekanog materijala sprječava trljanje. Idealan za treniranje šetnje.', emoji: '🦺', brand: 'Julius-K9', rating: 4.7, reviewCount: 112, inStock: true, variants: [{ label: 'Veličina', value: 'S' }, { label: 'Veličina', value: 'M' }, { label: 'Veličina', value: 'L' }, { label: 'Veličina', value: 'XL', priceModifier: 5 }], specs: { 'Tip': 'Anti-pull am', 'Materijal': 'Najlon + neopren', 'Prsni prsten': 'Da', 'Reflektirajući': 'Da' } },

  // ── Krevetići (5) ──
  { id: 'prod-20', slug: 'ortopedski-krevet-l', name: 'Ortopedski krevet za pse L', category: 'krevetici', price: 55, description: 'Memory foam krevet koji se prilagođava obliku tijela psa. Smanjuje pritisak na zglobove — idealan za starije pse i pse s artritisom. Navlaka se može prati u perilici.', emoji: '🛏️', brand: 'PetFusion', rating: 4.8, reviewCount: 67, inStock: true, variants: [{ label: 'Veličina', value: 'M', priceModifier: -15 }, { label: 'Veličina', value: 'L' }, { label: 'Veličina', value: 'XL', priceModifier: 20 }], specs: { 'Veličina': 'L (90x70cm)', 'Punjenje': 'Memory foam', 'Navlaka': 'Periva', 'Neklizajući dno': 'Da' } },
  { id: 'prod-21', slug: 'plisani-krevet-okrugli', name: 'Plišani krevet okrugli M', category: 'krevetici', price: 35, description: 'Mekan okrugli krevet s uzdignutim rubom koji pruža osjećaj sigurnosti. Plišani materijal za maksimalnu udobnost. Psi se vole ugnijezditi u sredinu ovog krevetića.', emoji: '🟤', brand: 'Best Friends', rating: 4.5, reviewCount: 89, inStock: true, variants: [{ label: 'Veličina', value: 'S', priceModifier: -10 }, { label: 'Veličina', value: 'M' }, { label: 'Veličina', value: 'L', priceModifier: 12 }], specs: { 'Promjer': '60cm (M)', 'Materijal': 'Mikro pliš', 'Periva': 'Da', 'Oblik': 'Okrugli s rubom' } },
  { id: 'prod-22', slug: 'vodootporni-krevet-vrt', name: 'Vodootporni krevet za vrt', category: 'krevetici', price: 42, description: 'Izdržljiv krevet za vanjsku upotrebu s vodootpornom tkaninom. UV zaštita sprječava blijeđenje na suncu. Lako se čisti brisanjem. Savršen za terasu ili vrt.', emoji: '🌿', brand: 'Scruffs', rating: 4.3, reviewCount: 31, inStock: true, variants: [{ label: 'Veličina', value: 'M' }, { label: 'Veličina', value: 'L', priceModifier: 10 }], specs: { 'Veličina': 'M (70x55cm)', 'Materijal': 'Vodootporna tkanina', 'UV zaštita': 'Da', 'Za vanjsku upotrebu': 'Da' } },
  { id: 'prod-23', slug: 'putni-krevet-sklopivi', name: 'Putni krevet sklopivi', category: 'krevetici', price: 28, description: 'Lagani sklopivi krevet idealan za putovanja i kampiranje. Sklapa se u praktičnu torbu. Čvrst okvir od aluminija drži psa podignutog od tla. Postavlja se za 30 sekundi.', emoji: '🏕️', brand: 'Kuranda', rating: 4.4, reviewCount: 25, inStock: true, variants: [{ label: 'Veličina', value: 'M' }, { label: 'Veličina', value: 'L', priceModifier: 8 }], specs: { 'Veličina': 'M (75x55cm)', 'Okvir': 'Aluminij', 'Težina': '2.5kg', 'Sklopiv': 'Da' } },
  { id: 'prod-24', slug: 'premium-memory-foam-xl', name: 'Premium memory foam XL', category: 'krevetici', price: 78, originalPrice: 95, description: 'Luksuzni krevet za velike pse s 10cm memory foam punjenjem. Ergonomski dizajn s uzglavljem. Vodootporna unutarnja navlaka i luksuzna vanjska od mikrovlakana. Najbolji izbor za vašeg velikog ljubimca.', emoji: '👑', brand: 'BarkBox', rating: 4.9, reviewCount: 43, inStock: true, variants: [{ label: 'Veličina', value: 'L', priceModifier: -20 }, { label: 'Veličina', value: 'XL' }], specs: { 'Veličina': 'XL (110x85cm)', 'Punjenje': '10cm memory foam', 'Navlaka': 'Mikrovlakna', 'Vodootporna': 'Unutarnja navlaka' } },

  // ── Posude (4) ──
  { id: 'prod-25', slug: 'automatski-dozator-hrane', name: 'Automatski dozator hrane', category: 'posude', price: 45, description: 'Programabilni dozator koji automatski servira obroke u točno vrijeme. Kapacitet 3L za do 4 obroka dnevno. LCD zaslon za jednostavno programiranje. Idealan kada ste na poslu.', emoji: '⏰', brand: 'PetSafe', rating: 4.6, reviewCount: 58, inStock: true, variants: [], specs: { 'Kapacitet': '3L', 'Broj obroka': 'Do 4/dan', 'Napajanje': 'Baterije + adapter', 'Zaslon': 'LCD' } },
  { id: 'prod-26', slug: 'keramicka-posuda-set', name: 'Keramička posuda set (2)', category: 'posude', price: 18, description: 'Elegantan set od dvije keramičke posude — za hranu i vodu. Teške i stabilne, pas ih ne može prevrnuti. Sigurne za pranje u perilici posuđa. Bez štetnih kemikalija.', emoji: '🥣', brand: 'Le Creuset', rating: 4.7, reviewCount: 44, inStock: true, variants: [{ label: 'Veličina', value: 'S (300ml)' }, { label: 'Veličina', value: 'M (600ml)', priceModifier: 4 }, { label: 'Veličina', value: 'L (1000ml)', priceModifier: 8 }], specs: { 'Materijal': 'Keramika', 'Broj komada': '2', 'Perilica posuđa': 'Da', 'Neklizajuće dno': 'Da' } },
  { id: 'prod-27', slug: 'putna-posuda-sklopiva', name: 'Putna posuda sklopiva', category: 'posude', price: 8, description: 'Silikonska posuda koja se sklapa na veličinu dlana. Karabiner za pričvršćivanje na ruksak ili povodac. Nezamjenjiva za šetnje, planinarenje i putovanja s psom.', emoji: '🏔️', brand: 'Dexas', rating: 4.2, reviewCount: 96, inStock: true, variants: [], specs: { 'Materijal': 'Silikon (food-grade)', 'Kapacitet': '500ml', 'Sklopiva': 'Da', 'Karabiner': 'Uključen' } },
  { id: 'prod-28', slug: 'slow-feeder-posuda', name: 'Slow feeder posuda', category: 'posude', price: 15, description: 'Posuda s labirintom koji usporava jedenje do 10 puta. Sprječava nadimanje, povraćanje i pretilost. Zabavna za psa jer mora "riješiti" labirint da dođe do hrane.', emoji: '🐌', brand: 'Outward Hound', rating: 4.5, reviewCount: 71, inStock: true, variants: [], specs: { 'Materijal': 'Plastika (BPA-free)', 'Kapacitet': '700ml', 'Pranje': 'Perilica posuđa', 'Dizajn': 'Labirint' } },

  // ── Njega (4) ──
  { id: 'prod-29', slug: 'sampon-za-pse-500ml', name: 'Šampon za pse 500ml', category: 'njega', price: 12, description: 'Blagi šampon s ovsom i aloe verom za osjetljivu kožu. pH balansiran posebno za pse. Čisti, hidratizira i ostavlja dlaku mekom i sjajnom. Ugodan miris lavande.', emoji: '🧴', brand: 'Burt\'s Bees', rating: 4.6, reviewCount: 83, inStock: true, variants: [], specs: { 'Volumen': '500ml', 'Sastojci': 'Ovas, aloe vera', 'pH balansiran': 'Da', 'Miris': 'Lavanda' } },
  { id: 'prod-30', slug: 'cetka-za-dlaku', name: 'Četka za dlaku', category: 'njega', price: 10, description: 'Profesionalna četka za uklanjanje poddlake i čvorova. Smanjuje linjanje do 90%. Ergonomska ručka za ugodan rad. Pogodna za sve tipove dlake — kratku, srednju i dugu.', emoji: '🖌️', brand: 'FURminator', rating: 4.8, reviewCount: 134, inStock: true, variants: [{ label: 'Tip', value: 'Kratka dlaka' }, { label: 'Tip', value: 'Duga dlaka' }], specs: { 'Tip': 'Deshedding četka', 'Materijal': 'Nehrđajući čelik', 'Ručka': 'Ergonomska', 'Smanjuje linjanje': 'Do 90%' } },
  { id: 'prod-31', slug: 'nail-clipper', name: 'Nail clipper', category: 'njega', price: 8, description: 'Profesionalne škare za rezanje noktiju s sigurnosnim graničnikom. Oštrice od nehrđajućeg čelika za čist rez bez cijepanja. Gumena ručka za siguran hvat.', emoji: '✂️', brand: 'Safari', rating: 4.3, reviewCount: 62, inStock: true, variants: [], specs: { 'Materijal': 'Nehrđajući čelik', 'Sigurnosni graničnik': 'Da', 'Ručka': 'Gumirana', 'Za pasmine': 'Srednje do velike' } },
  { id: 'prod-32', slug: 'dental-sticks-30', name: 'Dental sticks (30 kom)', category: 'njega', price: 14, description: 'Dnevne dentalne grickalice koje čiste zube i osvježavaju dah. Posebna tekstura mehanički uklanja naslage i zubni kamenac. Dodani kalcij za jače zube. Psi ih obožavaju!', emoji: '🦷', brand: 'Pedigree DentaStix', rating: 4.4, reviewCount: 108, inStock: true, variants: [{ label: 'Veličina', value: 'Mali psi', priceModifier: -2 }, { label: 'Veličina', value: 'Srednji psi' }, { label: 'Veličina', value: 'Veliki psi', priceModifier: 3 }], specs: { 'Broj komada': '30', 'Učestalost': '1 dnevno', 'Čisti zube': 'Da', 'Svježi dah': 'Da' } },

  // ── Odjeća (4) ──
  { id: 'prod-33', slug: 'zimska-jakna-psi', name: 'Zimska jakna za pse', category: 'odjeca', price: 28, description: 'Topla zimska jakna s vodootpornim vanjskim slojem i mekanom flisanom podstavom. Reflektirajuće trake za sigurnost po noći. Jednostavno kopčanje s čičkom oko trbuha.', emoji: '🧥', brand: 'Hurtta', rating: 4.7, reviewCount: 55, inStock: true, variants: [{ label: 'Veličina', value: 'S' }, { label: 'Veličina', value: 'M' }, { label: 'Veličina', value: 'L', priceModifier: 4 }, { label: 'Veličina', value: 'XL', priceModifier: 8 }], specs: { 'Materijal': 'Vodootporan + flis', 'Temperatura': 'Do -15°C', 'Reflektirajući': 'Da', 'Kopčanje': 'Čičak' } },
  { id: 'prod-34', slug: 'kisna-kabanica', name: 'Kišna kabanica', category: 'odjeca', price: 18, description: 'Lagana vodootporna kabanica za kišne šetnje. Prozirna kapuljača ne ometa vid. Elastični rubovi za savršen prianjanje. Kompaktna — stane u džep za šetnje.', emoji: '🌧️', brand: 'Puppia', rating: 4.2, reviewCount: 39, inStock: true, variants: [{ label: 'Veličina', value: 'S' }, { label: 'Veličina', value: 'M' }, { label: 'Veličina', value: 'L' }], specs: { 'Materijal': 'PVC vodootporan', 'Kapuljača': 'Da', 'Težina': '80g', 'Kompaktna': 'Da' } },
  { id: 'prod-35', slug: 'cooling-vest-ljeto', name: 'Cooling vest za ljeto', category: 'odjeca', price: 22, description: 'Rashladni prsluk za vruće ljetne dane. Namočite u vodu i oblačite — hladi psa do 3 sata. UPF 50+ zaštita od sunca. Neophodan za kratkonosne pasmine i šetnje po vrućini.', emoji: '❄️', brand: 'Ruffwear', rating: 4.5, reviewCount: 47, inStock: true, variants: [{ label: 'Veličina', value: 'S' }, { label: 'Veličina', value: 'M' }, { label: 'Veličina', value: 'L' }], specs: { 'Princip': 'Evaporativno hlađenje', 'Trajanje': 'Do 3 sata', 'UPF zaštita': '50+', 'Aktivacija': 'Namočiti u vodu' } },
  { id: 'prod-36', slug: 'carape-za-pse', name: 'Čarape za pse (4 kom)', category: 'odjeca', price: 10, description: 'Set od 4 protuklizne čarape za zaštitu šapa na glatkim podovima. Silikonski uzorak na dnu sprječava klizanje. Štite šape od vrućeg asfalta ljeti i soli zimi.', emoji: '🧦', brand: 'QUMY', rating: 4.0, reviewCount: 33, inStock: true, variants: [{ label: 'Veličina', value: 'S' }, { label: 'Veličina', value: 'M' }, { label: 'Veličina', value: 'L' }], specs: { 'Broj komada': '4', 'Materijal': 'Pamuk + silikon', 'Protuklizne': 'Da', 'Perive': 'Da' } },

  // ── Grickalice (4) ──
  { id: 'prod-37', slug: 'dentalne-kosti-10', name: 'Dentalne kosti (10 kom)', category: 'grickalice', price: 12, description: 'Ukusne dentalne kosti koje čiste zube dok pas žvače. Prirodni sastojci bez umjetnih aroma. Pomoću posebnog oblika dopiru i do stražnjih zubi. Savršen dodatak dentalnoj njezi.', emoji: '🦷', brand: 'Whimzees', rating: 4.5, reviewCount: 79, inStock: true, variants: [{ label: 'Veličina', value: 'S (mali psi)' }, { label: 'Veličina', value: 'M (srednji psi)' }, { label: 'Veličina', value: 'L (veliki psi)', priceModifier: 3 }], specs: { 'Broj komada': '10', 'Prirodni sastojci': 'Da', 'Vegetarijanski': 'Da', 'Čisti zube': 'Da' } },
  { id: 'prod-38', slug: 'suseno-meso-strips', name: 'Sušeno meso strips', category: 'grickalice', price: 15, description: 'Premium sušeni pileći fileti rezani u trakice. 100% meso bez aditiva i konzervansa. Bogati proteinima, nisko kalorični. Savršeni za nagrađivanje i trening.', emoji: '🍗', brand: 'Dokas', rating: 4.7, reviewCount: 95, inStock: true, variants: [], specs: { 'Sastav': '100% piletina', 'Težina': '200g', 'Kalorije': 'Niske', 'Aditivi': 'Bez' } },
  { id: 'prod-39', slug: 'training-treats', name: 'Training treats (200g)', category: 'grickalice', price: 8, description: 'Mali, mekani zalogaji idealni za trening. Mogu se lako lomiti na manje komade. Nemasni, ne prljaju ruke ni džepove. Psi su za njih spremni napraviti bilo što!', emoji: '🎯', brand: 'Zuke\'s', rating: 4.6, reviewCount: 118, inStock: true, variants: [], specs: { 'Težina': '200g', 'Veličina zalogaja': 'Mali', 'Kalorije po komadu': '3 kcal', 'Tekstura': 'Mekani' } },
  { id: 'prod-40', slug: 'bully-sticks-5', name: 'Bully sticks (5 kom)', category: 'grickalice', price: 18, description: 'Dugotrajne grickalice od sušene govedine. Zabavljaju psa 30-60 minuta. Potpuno probavljive i sigurne. Čiste zube i jačaju čeljust. Prirodna alternativa sintetičkim igračkama.', emoji: '🥓', brand: 'Best Bully Sticks', rating: 4.8, reviewCount: 86, inStock: true, variants: [{ label: 'Duljina', value: '15cm' }, { label: 'Duljina', value: '30cm', priceModifier: 6 }], specs: { 'Broj komada': '5', 'Sastav': '100% govedina', 'Trajanje žvakanja': '30-60 min', 'Probavljivost': '100%' } },
];

export const mockProductReviews: ProductReview[] = [
  // prod-1 Premium suha hrana
  { id: 'prev-1', productId: 'prod-1', authorName: 'Marija Kovačević', authorInitial: 'M', rating: 5, comment: 'Moj pas obožava ovu hranu! Dlaka mu je sjajnija nego ikad, a energija na vrhuncu. Definitivno naša stalna hrana.', createdAt: '2026-03-20' },
  { id: 'prev-2', productId: 'prod-1', authorName: 'Ivan Horvat', authorInitial: 'I', rating: 4, comment: 'Odlična kvaliteta za cijenu. Pas jede s guštom. Jedina zamjerka je što pakiranje moglo biti s boljim zatvaračem.', createdAt: '2026-03-15' },
  { id: 'prev-3', productId: 'prod-1', authorName: 'Ana Babić', authorInitial: 'A', rating: 5, comment: 'Veterinar nam je preporučio Purina Pro Plan i stvarno vidimo razliku. Manje problema s probavom, pas je sretniji.', createdAt: '2026-03-01' },
  // prod-9 Kong Classic
  { id: 'prev-4', productId: 'prod-9', authorName: 'Petra Novak', authorInitial: 'P', rating: 5, comment: 'Jedina igračka koju naš labrador nije uništio! Punimo je s kikiriki maslacem i zauzme ga na sat vremena. Vrhunski!', createdAt: '2026-03-18' },
  { id: 'prev-5', productId: 'prod-9', authorName: 'Tomislav Jurić', authorInitial: 'T', rating: 5, comment: 'Kong je klasik s razlogom. Imamo ih 3 u različitim veličinama. Neprobojni su, a pas ih obožava.', createdAt: '2026-03-10' },
  { id: 'prev-6', productId: 'prod-9', authorName: 'Lucija Matić', authorInitial: 'L', rating: 4, comment: 'Super igračka, samo pazite da uzmete pravu veličinu. Mi smo prvo uzeli premali i morali zamijeniti.', createdAt: '2026-02-25' },
  // prod-15 Flexi povodac
  { id: 'prev-7', productId: 'prod-15', authorName: 'Dario Šimić', authorInitial: 'D', rating: 5, comment: 'Flexi povodac je najbolja investicija za šetnje. Pas uživa u slobodi, a ja imam punu kontrolu. Mehanizam je besprijekoran.', createdAt: '2026-03-22' },
  { id: 'prev-8', productId: 'prod-15', authorName: 'Mirna Petrović', authorInitial: 'M', rating: 4, comment: 'Dobar povodac, koristimo ga svaki dan. Jedino je ručka malo teška za dulje šetnje, ali funkcionalnost je top.', createdAt: '2026-03-05' },
  { id: 'prev-9', productId: 'prod-15', authorName: 'Goran Mandić', authorInitial: 'G', rating: 5, comment: 'Treći Flexi povodac koji kupujem — uvijek se vraćam jer je kvaliteta neupitna. Služi nam godinama.', createdAt: '2026-02-15' },
  // prod-20 Ortopedski krevet
  { id: 'prev-10', productId: 'prod-20', authorName: 'Jelena Tomić', authorInitial: 'J', rating: 5, comment: 'Naš stari zlatni retriver konačno spava mirno! Memory foam mu je očito puno ugodniji za zglobove. Vrijedi svake kune.', createdAt: '2026-03-19' },
  { id: 'prev-11', productId: 'prod-20', authorName: 'Filip Knežević', authorInitial: 'F', rating: 5, comment: 'Kvalitetan krevet, navlaka se lako skida i pere. Pas je odmah legao i nije se maknuo 3 sata. Očito je udoban!', createdAt: '2026-03-08' },
  { id: 'prev-12', productId: 'prod-20', authorName: 'Katarina Ružić', authorInitial: 'K', rating: 4, comment: 'Odličan krevet. Malo je veći nego što sam očekivala, ali kvaliteta je vrhunska. Preporučujem za veće pse.', createdAt: '2026-02-20' },
  // prod-25 Automatski dozator
  { id: 'prev-13', productId: 'prod-25', authorName: 'Ante Jurić', authorInitial: 'A', rating: 5, comment: 'Spašava me kada radim duže smjene! Programiram obroke ujutro i znam da će pas biti nahranjen na vrijeme. Genijalan uređaj.', createdAt: '2026-03-21' },
  { id: 'prev-14', productId: 'prod-25', authorName: 'Maja Šimunović', authorInitial: 'M', rating: 4, comment: 'Radi pouzdano, LCD zaslon je intuitivan. Jedino bi mogao biti tiši kada izbacuje hranu — budi me ujutro.', createdAt: '2026-03-12' },
  { id: 'prev-15', productId: 'prod-25', authorName: 'Branko Ilić', authorInitial: 'B', rating: 4, comment: 'Solidan dozator za tu cijenu. Koristimo ga 3 mjeseca bez problema. Baterije traju dugo kao backup.', createdAt: '2026-02-28' },
  // prod-29 Šampon
  { id: 'prev-16', productId: 'prod-29', authorName: 'Ivana Matković', authorInitial: 'I', rating: 5, comment: 'Konačno šampon koji ne iritira kožu našeg psa! Miris lavande je ugodan i dugo se zadrži. Dlaka je mekana danima poslije.', createdAt: '2026-03-17' },
  { id: 'prev-17', productId: 'prod-29', authorName: 'Robert Vuković', authorInitial: 'R', rating: 4, comment: 'Dobar šampon, pjeni se lijepo i lako se ispire. Naš pas s osjetljivom kožom ga dobro podnosi.', createdAt: '2026-03-02' },
  // prod-33 Zimska jakna
  { id: 'prev-18', productId: 'prod-33', authorName: 'Sandra Herceg', authorInitial: 'S', rating: 5, comment: 'Hurtta jakna je fantastična! Naš mali pas više ne drhti na šetnjama. Vodootporna je i topla, a lako se pere.', createdAt: '2026-03-14' },
  { id: 'prev-19', productId: 'prod-33', authorName: 'Nikola Bašić', authorInitial: 'N', rating: 5, comment: 'Kupili smo za našeg vipeta i savršena je. Reflektirajuće trake su super za večernje šetnje. Čičak drži čvrsto.', createdAt: '2026-02-22' },
  { id: 'prev-20', productId: 'prod-33', authorName: 'Lana Radić', authorInitial: 'L', rating: 4, comment: 'Kvalitetna jakna, ali preporučujem uzeti veličinu veću jer je malo uža u grudima. Inače sve pohvale!', createdAt: '2026-02-10' },
  // prod-37 Dentalne kosti
  { id: 'prev-21', productId: 'prod-37', authorName: 'Darko Filipović', authorInitial: 'D', rating: 5, comment: 'Whimzees su hit kod našeg psa! Žvače ih s užitkom, a veterinar je primijetio poboljšanje zubi. Kupujemo redovito.', createdAt: '2026-03-16' },
  { id: 'prev-22', productId: 'prod-37', authorName: 'Vesna Orlić', authorInitial: 'V', rating: 4, comment: 'Dobre dentalne kosti, volim što su vegetarijanske i prirodne. Malo su skuplje ali kvaliteta je tu.', createdAt: '2026-03-03' },
  // prod-40 Bully sticks
  { id: 'prev-23', productId: 'prod-40', authorName: 'Marko Vidović', authorInitial: 'M', rating: 5, comment: 'Jedina grickalica koja zauzme našeg pit bulla na duže od 5 minuta! Kvalitetna govedina, bez mirisa. Top!', createdAt: '2026-03-23' },
  { id: 'prev-24', productId: 'prod-40', authorName: 'Tea Gregurić', authorInitial: 'T', rating: 5, comment: 'Naručujem već treći put. Pas ih obožava, a ja volim što su 100% prirodne i probavljive. Preporučujem!', createdAt: '2026-03-11' },
  { id: 'prev-25', productId: 'prod-40', authorName: 'Hrvoje Babić', authorInitial: 'H', rating: 4, comment: 'Odlične grickalice, samo bi volio da ih ima više u pakiranju za tu cijenu. Ali kvaliteta je neupitna.', createdAt: '2026-02-18' },
  // prod-13 Interaktivna slagalica
  { id: 'prev-26', productId: 'prod-13', authorName: 'Sanja Perić', authorInitial: 'S', rating: 5, comment: 'Naš border collie je riješio Level 1 za 2 minute! Sjajno za mentalno stimuliranje inteligentnih pasa.', createdAt: '2026-03-13' },
  { id: 'prev-27', productId: 'prod-13', authorName: 'Matej Kovač', authorInitial: 'M', rating: 4, comment: 'Dobra igračka za kišne dane kada ne možemo na dulje šetnje. Pas je zaokupirani i sretan. Lako se čisti.', createdAt: '2026-02-27' },
  // prod-19 Am anti-pull
  { id: 'prev-28', productId: 'prod-19', authorName: 'Iva Radman', authorInitial: 'I', rating: 5, comment: 'Julius-K9 am je potpuno promijenio naše šetnje! Pas više ne vuče i šetnja je opet ugodna. Kvaliteta izrade je fantastična.', createdAt: '2026-03-09' },
  { id: 'prev-29', productId: 'prod-19', authorName: 'Petar Dumančić', authorInitial: 'P', rating: 5, comment: 'Imamo am za našeg haskija i konačno ga mogu normalno šetati. Neopren podstava ne trlja, a reflektori su super za noć.', createdAt: '2026-02-14' },
  { id: 'prev-30', productId: 'prod-19', authorName: 'Nina Lončar', authorInitial: 'N', rating: 4, comment: 'Vrlo dobar am. Preporučujem mjerenje prije narudžbe jer veličine nisu univerzalne. Ali kad nađete pravu, savršen je.', createdAt: '2026-01-30' },
];

export function getProductBySlug(slug: string): Product | undefined {
  return mockProducts.find(p => p.slug === slug);
}

export function getProductReviews(productId: string): ProductReview[] {
  return mockProductReviews.filter(r => r.productId === productId);
}

export function getProductsByCategory(category: string): Product[] {
  return mockProducts.filter(p => p.category === category);
}

export function getRelatedProducts(productId: string, limit = 4): Product[] {
  const product = mockProducts.find(p => p.id === productId);
  if (!product) return [];
  return mockProducts.filter(p => p.category === product.category && p.id !== productId).slice(0, limit);
}

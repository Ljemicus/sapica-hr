import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Unesite valjanu email adresu'),
  password: z.string().min(6, 'Lozinka mora imati najmanje 6 znakova'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Ime mora imati najmanje 2 znaka'),
  email: z.string().email('Unesite valjanu email adresu'),
  password: z.string().min(6, 'Lozinka mora imati najmanje 6 znakova'),
  confirmPassword: z.string(),
  role: z.enum(['owner', 'sitter'], { message: 'Odaberite ulogu' }),
  city: z.string().min(1, 'Odaberite grad'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Lozinke se ne podudaraju',
  path: ['confirmPassword'],
});

export const petSchema = z.object({
  name: z.string().min(1, 'Unesite ime ljubimca'),
  species: z.enum(['dog', 'cat', 'other'], { message: 'Odaberite vrstu' }),
  breed: z.string().optional(),
  age: z.coerce.number().min(0).max(30).optional(),
  weight: z.coerce.number().min(0).max(200).optional(),
  special_needs: z.string().optional(),
  photo_url: z.string().url().nullish(),
});

// ── Pet Passport ──

const vaccinationSchema = z.object({
  name: z.string(),
  date: z.string(),
  vet: z.string(),
  next_date: z.string(),
});

const allergySchema = z.object({
  name: z.string(),
  severity: z.enum(['blaga', 'umjerena', 'ozbiljna']),
  notes: z.string(),
});

const medicationSchema = z.object({
  name: z.string(),
  dose: z.string(),
  schedule: z.string(),
  start_date: z.string(),
  end_date: z.string().nullable(),
});

const vetInfoSchema = z.object({
  name: z.string(),
  phone: z.string(),
  address: z.string(),
  emergency: z.boolean(),
});

export const petPassportSchema = z.object({
  vaccinations: z.array(vaccinationSchema).optional(),
  allergies: z.array(allergySchema).optional(),
  medications: z.array(medicationSchema).optional(),
  vet_info: vetInfoSchema.optional(),
  notes: z.string().optional(),
});

export type PetPassportInput = z.infer<typeof petPassportSchema>;

export const sitterProfileSchema = z.object({
  bio: z.string().min(10, 'Bio mora imati najmanje 10 znakova'),
  experience_years: z.coerce.number().min(0).max(50),
  services: z.array(z.enum(['boarding', 'walking', 'house-sitting', 'drop-in', 'daycare'])).min(1, 'Odaberite barem jednu uslugu'),
  prices: z.record(z.string(), z.coerce.number().min(0)),
  city: z.string().min(1, 'Odaberite grad'),
});

export const bookingSchema = z.object({
  sitter_id: z.string().uuid(),
  pet_id: z.string().uuid('Odaberite ljubimca'),
  service_type: z.enum(['boarding', 'walking', 'house-sitting', 'drop-in', 'daycare'], { message: 'Odaberite uslugu' }),
  start_date: z.string().min(1, 'Odaberite datum početka'),
  end_date: z.string().min(1, 'Odaberite datum završetka'),
  note: z.string().optional(),
});

export const reviewSchema = z.object({
  booking_id: z.string().uuid(),
  rating: z.number().min(1).max(5),
  comment: z.string().min(5, 'Recenzija mora imati najmanje 5 znakova'),
});

export const messageSchema = z.object({
  content: z.string().min(1, 'Poruka ne može biti prazna'),
  receiver_id: z.string().uuid(),
  booking_id: z.string().uuid().optional(),
});

// ── Adoption Listing ──

export const adoptionListingImageSchema = z.object({
  url: z.string().url('Neispravan URL slike'),
  alt: z.string().nullable().optional(),
  is_primary: z.boolean().default(false),
});

export const adoptionListingSchema = z.object({
  name: z.string().min(1, 'Unesite ime životinje'),
  species: z.enum(['dog', 'cat', 'rabbit', 'other'], { message: 'Odaberite vrstu' }),
  breed: z.string().optional(),
  age_months: z.coerce.number().min(0).max(360).optional(),
  gender: z.enum(['male', 'female']).optional(),
  size: z.enum(['small', 'medium', 'large']).optional(),
  weight_kg: z.coerce.number().min(0).max(200).optional(),
  color: z.string().optional(),
  sterilized: z.boolean().default(false),
  vaccinated: z.boolean().default(false),
  microchipped: z.boolean().default(false),
  good_with_kids: z.boolean().nullable().optional(),
  good_with_pets: z.boolean().nullable().optional(),
  description: z.string().min(20, 'Opis mora imati najmanje 20 znakova'),
  personality: z.string().optional(),
  special_needs: z.string().optional(),
  city: z.string().min(1, 'Odaberite grad'),
  images: z.array(adoptionListingImageSchema).max(8, 'Najviše 8 slika').default([]),
  contact_phone: z.string().optional(),
  contact_email: z.string().email('Neispravan email').optional().or(z.literal('')),
  is_urgent: z.boolean().default(false),
});

/** Publish rules: stricter checks required before status can move to 'active'. */
export const adoptionPublishRules = adoptionListingSchema.extend({
  description: z.string().min(20, 'Opis mora imati najmanje 20 znakova'),
  city: z.string().min(1, 'Grad je obavezan za objavu'),
  images: z.array(adoptionListingImageSchema).min(1, 'Potrebna je barem jedna slika za objavu').max(8),
});

export type AdoptionListingInput = z.infer<typeof adoptionListingSchema>;
export type AdoptionPublishInput = z.infer<typeof adoptionPublishRules>;

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type PetInput = z.infer<typeof petSchema>;
export type SitterProfileInput = z.infer<typeof sitterProfileSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type MessageInput = z.infer<typeof messageSchema>;

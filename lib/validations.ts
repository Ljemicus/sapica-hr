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
  note: z.string().max(500, 'Napomena može imati najviše 500 znakova').optional(),
});

export const reviewSchema = z.object({
  booking_id: z.string().uuid(),
  rating: z.number().min(1).max(5),
  comment: z.string().min(5, 'Recenzija mora imati najmanje 5 znakova'),
});

export const messageSchema = z.object({
  content: z.string().min(1, 'Poruka ne može biti prazna').max(2000, 'Poruka može imati najviše 2000 znakova'),
  receiver_id: z.string().uuid(),
  booking_id: z.string().uuid().optional(),
});

export const blogCommentSchema = z.object({
  article_slug: z.string().min(1, 'Članak nije pronađen'),
  content: z.string().trim().min(1, 'Komentar ne može biti prazan').max(1000, 'Komentar može imati najviše 1000 znakova'),
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

// ── Provider Onboarding ──

const providerTypeSchema = z.enum(['čuvar', 'groomer', 'trener', 'drugo'], {
  message: 'Odaberite vrstu profila',
});

const providerServiceSchema = z.enum([
  'Čuvanje preko noći',
  'Dnevni boravak',
  'Šetnja pasa',
  'Čuvanje u domu vlasnika',
  'Njega i kupanje',
  'Trening i dresura',
], {
  message: 'Odaberite valjanu uslugu',
});

export const providerBasicProfileSchema = z.object({
  display_name: z.string().min(2, 'Ime mora imati najmanje 2 znaka'),
  bio: z.string().min(10, 'Bio mora imati najmanje 10 znakova').max(1000, 'Bio može imati najviše 1000 znakova'),
  city: z.string().min(1, 'Odaberite grad'),
  phone: z.string().min(6, 'Unesite valjani telefonski broj'),
});

export const providerServiceInfoSchema = z.object({
  provider_type: providerTypeSchema,
  services: z.array(providerServiceSchema).min(1, 'Odaberite barem jednu uslugu'),
  experience_years: z.coerce.number().min(0, 'Minimalno 0').max(50, 'Maksimalno 50'),
  prices: z.record(z.string(), z.coerce.number().min(0, 'Cijena mora biti pozitivna')),
});

export const providerLegalInfoSchema = z.object({
  business_name: z.string().optional(),
  oib: z.string().regex(/^\d{11}$/, 'OIB mora imati točno 11 znamenki').optional().or(z.literal('')),
  address: z.string().optional(),
});

export const providerPayoutInfoSchema = z.object({
  stripe_account_id: z.string().optional(),
  stripe_onboarding_complete: z.boolean().optional(),
});

export const providerTermsSchema = z.object({
  terms_accepted: z.boolean().refine((value) => value === true, {
    message: 'Morate prihvatiti uvjete korištenja',
  }),
  privacy_accepted: z.boolean().refine((value) => value === true, {
    message: 'Morate prihvatiti politiku privatnosti',
  }),
});

/** Combined schema for full application submission */
export const providerApplicationSchema = providerBasicProfileSchema
  .merge(providerServiceInfoSchema)
  .merge(providerLegalInfoSchema)
  .merge(providerPayoutInfoSchema)
  .merge(providerTermsSchema);

/** Partial save schema (draft) — everything optional except user presence */
export const providerDraftSchema = z.object({
  display_name: z.string().optional(),
  bio: z.string().optional(),
  city: z.string().optional(),
  phone: z.string().optional(),
  provider_type: providerTypeSchema.optional(),
  services: z.array(providerServiceSchema).optional(),
  experience_years: z.coerce.number().min(0).max(50).optional(),
  prices: z.record(z.string(), z.coerce.number().min(0)).optional(),
  business_name: z.string().optional(),
  oib: z.string().optional(),
  address: z.string().optional(),
  terms_accepted: z.boolean().optional(),
  privacy_accepted: z.boolean().optional(),
});

export type ProviderBasicProfileInput = z.input<typeof providerBasicProfileSchema>;
export type ProviderServiceInfoInput = z.input<typeof providerServiceInfoSchema>;
export type ProviderLegalInfoInput = z.input<typeof providerLegalInfoSchema>;
export type ProviderPayoutInfoInput = z.input<typeof providerPayoutInfoSchema>;
export type ProviderTermsInput = z.input<typeof providerTermsSchema>;
export type ProviderApplicationInput = z.input<typeof providerApplicationSchema>;
export type ProviderDraftInput = z.input<typeof providerDraftSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email('Unesite valjanu email adresu'),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Lozinka mora imati najmanje 6 znakova'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Lozinke se ne podudaraju',
  path: ['confirmPassword'],
});

export const lostPetReportSchema = z.object({
  name: z.string().trim().min(1, 'Ime ljubimca je obavezno').max(120),
  species: z.enum(['pas', 'macka', 'ostalo'], { message: 'Odaberite vrstu' }),
  breed: z.string().trim().max(120).optional().or(z.literal('')),
  color: z.string().trim().min(1, 'Boja je obavezna').max(120),
  sex: z.enum(['muško', 'žensko']).optional(),
  description: z.string().trim().min(20, 'Opis mora imati najmanje 20 znakova').max(2000),
  special_marks: z.string().trim().max(1000).optional().or(z.literal('')),
  neighborhood: z.string().trim().min(1, 'Kvart ili ulica su obavezni').max(160),
  city: z.string().trim().min(1, 'Grad je obavezan').max(120),
  date_lost: z.string().min(1, 'Datum nestanka je obavezan'),
  contact_name: z.string().trim().min(2, 'Kontakt ime je obavezno').max(120),
  contact_phone: z.string().trim().min(6, 'Telefon je obavezan').max(40),
  contact_email: z.string().email('Neispravan email').optional().or(z.literal('')),
  has_microchip: z.boolean().optional().default(false),
  has_collar: z.boolean().optional().default(false),
  image_url: z.string().url('Neispravan URL slike').optional(),
  gallery: z.array(z.string().url('Neispravan URL slike')).max(5, 'Najviše 5 slika').optional(),
  location_lat: z.number().min(42).max(47),
  location_lng: z.number().min(13).max(20),
});

export const lostPetSightingSchema = z.object({
  location: z.string().trim().min(2, 'Lokacija je obavezna').max(200),
  description: z.string().trim().min(2, 'Opis je obavezan').max(1000),
  photo_url: z.string().url('Neispravan URL slike').optional(),
});

export const markLostPetFoundSchema = z.object({
  found_method: z.enum(['sighting', 'returned_home', 'shelter', 'other'], {
    message: 'Odaberite način pronalaska',
  }),
  reunion_message: z.string().trim().max(2000).optional().or(z.literal('')),
});

export const lostPetAlertSchema = z.object({
  city: z.string().trim().min(1, 'Grad je obavezan').max(120),
  species: z.enum(['pas', 'macka', 'ostalo', 'sve'], { message: 'Odaberite vrstu' }),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type PetInput = z.infer<typeof petSchema>;
export type SitterProfileInput = z.infer<typeof sitterProfileSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
export type BlogCommentInput = z.infer<typeof blogCommentSchema>;
export type LostPetReportInput = z.infer<typeof lostPetReportSchema>;
export type LostPetSightingInput = z.infer<typeof lostPetSightingSchema>;
export type MarkLostPetFoundInput = z.infer<typeof markLostPetFoundSchema>;
export type LostPetAlertInput = z.infer<typeof lostPetAlertSchema>;

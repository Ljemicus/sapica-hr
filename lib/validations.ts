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
  photo_url: z.string().url().optional(),
});

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

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type PetInput = z.infer<typeof petSchema>;
export type SitterProfileInput = z.infer<typeof sitterProfileSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type MessageInput = z.infer<typeof messageSchema>;

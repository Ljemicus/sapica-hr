export type UserRole = 'owner' | 'sitter' | 'admin';
export type VerificationLevel = 'basic' | 'verified' | 'premium';
export type Species = 'dog' | 'cat' | 'other';
export type ServiceType = 'boarding' | 'walking' | 'house-sitting' | 'drop-in' | 'daycare';
export type BookingStatus = 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'pending' | 'paid' | 'failed' | 'refunded';

export interface Payment {
  id: string;
  booking_id: string;
  stripe_payment_intent_id: string;
  stripe_session_id: string | null;
  amount: number;
  platform_fee: number;
  currency: string;
  status: PaymentStatus;
  created_at: string;
  updated_at: string;
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  'unpaid': 'Nije plaćeno',
  'pending': 'Na čekanju',
  'paid': 'Plaćeno',
  'failed': 'Neuspjelo',
  'refunded': 'Vraćeno',
};

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url: string | null;
  phone: string | null;
  city: string | null;
  created_at: string;
}

export interface Pet {
  id: string;
  owner_id: string;
  name: string;
  species: Species;
  breed: string | null;
  age: number | null;
  weight: number | null;
  special_needs: string | null;
  photo_url: string | null;
  created_at: string;
}

export interface SitterProfile {
  user_id: string;
  bio: string | null;
  experience_years: number;
  services: ServiceType[];
  prices: Record<ServiceType, number>;
  verified: boolean;
  superhost: boolean;
  response_time: string | null;
  rating_avg: number;
  review_count: number;
  location_lat: number | null;
  location_lng: number | null;
  city: string | null;
  photos: string[];
  created_at: string;
  verified_level?: VerificationLevel;
  user?: User;
}

export interface Booking {
  id: string;
  owner_id: string;
  sitter_id: string;
  pet_id: string;
  service_type: ServiceType;
  start_date: string;
  end_date: string;
  status: BookingStatus;
  total_price: number;
  platform_fee?: number;
  payment_status?: PaymentStatus;
  currency?: string;
  note: string | null;
  is_demo?: boolean;
  created_at: string;
  owner?: User;
  sitter?: User;
  pet?: Pet;
  sitter_profile?: SitterProfile;
}

export type OwnerHistoryBooking = Booking & {
  sitter?: Pick<User, 'id' | 'name' | 'avatar_url'>;
  pet?: Pick<Pet, 'id' | 'owner_id' | 'name' | 'species' | 'created_at'>;
};

export type SitterDashboardBooking = Booking & {
  owner: User & Pick<User, 'email' | 'name' | 'avatar_url'>;
  pet: Pet & Pick<Pet, 'name' | 'species' | 'breed' | 'special_needs'>;
  address?: string | null;
  message?: string | null;
};

export type OwnerDashboardBooking = Booking & {
  sitter: User & Pick<User, 'name' | 'avatar_url'>;
  pet: Pet & Pick<Pet, 'name' | 'species'>;
};

export type WalkSelectorBooking = Booking & {
  pet?: Pick<Pet, 'id' | 'owner_id' | 'name' | 'species' | 'created_at'>;
};

export interface Review {
  id: string;
  booking_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer?: User;
  booking?: Booking;
}

export type SitterDashboardReview = Review & {
  reviewer: User & Pick<User, 'name' | 'avatar_url'>;
};

export type PublicSitterReview = Review & {
  reviewer: User & Pick<User, 'name' | 'avatar_url'>;
  booking: Pick<Booking, 'service_type'>;
};

export type WalkLabelPet = Pick<Pet, 'id' | 'owner_id' | 'name' | 'species' | 'created_at'>;

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  booking_id: string | null;
  content: string | null;
  image_url: string | null;
  read: boolean;
  created_at: string;
  sender?: User;
}

export interface Availability {
  id: string;
  sitter_id: string;
  date: string;
  available: boolean;
}

export interface SearchFilters {
  city?: string;
  service_type?: ServiceType;
  start_date?: string;
  end_date?: string;
  min_price?: number;
  max_price?: number;
  min_rating?: number;
}

export const SERVICE_LABELS: Record<ServiceType, string> = {
  'boarding': 'Smještaj',
  'walking': 'Šetnja',
  'house-sitting': 'Čuvanje u kući',
  'drop-in': 'Kratki posjet',
  'daycare': 'Dnevna briga',
};

export const SPECIES_LABELS: Record<Species, string> = {
  'dog': 'Pas',
  'cat': 'Mačka',
  'other': 'Ostalo',
};

export const STATUS_LABELS: Record<BookingStatus, string> = {
  'pending': 'Na čekanju',
  'accepted': 'Prihvaćeno',
  'rejected': 'Odbijeno',
  'completed': 'Završeno',
  'cancelled': 'Otkazano',
};

// ── Walk Tracking ──

export type WalkStatus = 'u_tijeku' | 'zavrsena';

export interface WalkCheckpoint {
  time: string;
  label: string;
  emoji: string;
  lat: number;
  lng: number;
}

export interface Walk {
  id: string;
  sitter_id: string;
  pet_id: string;
  booking_id: string;
  start_time: string;
  end_time: string | null;
  status: WalkStatus;
  distance_km: number;
  route: { lat: number; lng: number }[];
  checkpoints: WalkCheckpoint[];
}

// ── Pet Updates ──

export type UpdateType = 'photo' | 'video' | 'text';

export interface PetUpdate {
  id: string;
  booking_id: string;
  sitter_id: string;
  type: UpdateType;
  emoji: string;
  caption: string;
  photo_url: string | null;
  created_at: string;
}

// ── Pet Passport ──

export interface Vaccination {
  name: string;
  date: string;
  vet: string;
  next_date: string;
}

export interface Allergy {
  name: string;
  severity: 'blaga' | 'umjerena' | 'ozbiljna';
  notes: string;
}

export interface Medication {
  name: string;
  dose: string;
  schedule: string;
  start_date: string;
  end_date: string | null;
}

export interface VetInfo {
  name: string;
  phone: string;
  address: string;
  emergency: boolean;
}

export interface PetPassport {
  pet_id: string;
  vaccinations: Vaccination[];
  allergies: Allergy[];
  medications: Medication[];
  vet_info: VetInfo;
  notes: string;
}

export const WALK_STATUS_LABELS: Record<WalkStatus, string> = {
  'u_tijeku': 'U tijeku',
  'zavrsena': 'Završena',
};

export const ALLERGY_SEVERITY_LABELS: Record<string, string> = {
  'blaga': 'Blaga',
  'umjerena': 'Umjerena',
  'ozbiljna': 'Ozbiljna',
};

// ── Grooming ──

export type GroomingServiceType = 'sisanje' | 'kupanje' | 'trimanje' | 'nokti' | 'cetkanje';

export const GROOMING_SERVICE_LABELS: Record<GroomingServiceType, string> = {
  'sisanje': 'Šišanje',
  'kupanje': 'Kupanje',
  'trimanje': 'Trimanje',
  'nokti': 'Nokti',
  'cetkanje': 'Četkanje',
};

export type GroomerSpecialization = 'psi' | 'macke' | 'oba';

export const GROOMER_SPECIALIZATION_LABELS: Record<GroomerSpecialization, string> = {
  'psi': 'Psi',
  'macke': 'Mačke',
  'oba': 'Psi i mačke',
};

export interface Groomer {
  id: string;
  name: string;
  city: string;
  services: GroomingServiceType[];
  prices: Record<GroomingServiceType, number>;
  rating: number;
  review_count: number;
  bio: string;
  verified: boolean;
  specialization: GroomerSpecialization;
  user_id?: string;
  phone?: string;
  email?: string;
  address?: string;
  working_hours?: Record<string, { start: string; end: string }>;
}

// ── Groomer Booking ──

export type GroomerBookingStatus = 'pending' | 'confirmed' | 'rejected' | 'completed' | 'cancelled';

export const GROOMER_BOOKING_STATUS_LABELS: Record<GroomerBookingStatus, string> = {
  'pending': 'Na čekanju',
  'confirmed': 'Potvrđeno',
  'rejected': 'Odbijeno',
  'completed': 'Završeno',
  'cancelled': 'Otkazano',
};

export const GROOMER_BOOKING_STATUS_COLORS: Record<GroomerBookingStatus, string> = {
  'pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'confirmed': 'bg-green-100 text-green-700 border-green-200',
  'rejected': 'bg-red-100 text-red-700 border-red-200',
  'completed': 'bg-blue-100 text-blue-700 border-blue-200',
  'cancelled': 'bg-gray-100 text-gray-500 border-gray-200',
};

export interface GroomerAvailabilitySlot {
  id: string;
  groomer_id: string;
  date: string;
  start_time: string;
  end_time: string;
  slot_duration_minutes: number;
  is_available: boolean;
}

export interface GroomerBooking {
  id: string;
  groomer_id: string;
  user_id: string;
  service: GroomingServiceType;
  date: string;
  start_time: string;
  end_time: string;
  price: number;
  status: GroomerBookingStatus;
  pet_name: string | null;
  pet_type: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
  groomer?: Groomer;
}

// ── Training / Školovanje pasa ──

export type TrainingType = 'osnovna' | 'napredna' | 'agility' | 'ponasanje' | 'stenci';

export const TRAINING_TYPE_LABELS: Record<TrainingType, string> = {
  'osnovna': 'Osnovna poslušnost',
  'napredna': 'Napredni trening',
  'agility': 'Agility',
  'ponasanje': 'Korekcija ponašanja',
  'stenci': 'Štenci',
};

export interface Trainer {
  id: string;
  name: string;
  city: string;
  specializations: TrainingType[];
  price_per_hour: number;
  certificates: string[];
  rating: number;
  review_count: number;
  bio: string;
  certified: boolean;
  user_id?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface TrainingProgram {
  id: string;
  trainer_id: string;
  name: string;
  type: TrainingType;
  duration_weeks: number;
  sessions: number;
  price: number;
  description: string;
}

export interface TrainerAvailabilitySlot {
  id: string;
  trainer_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

// ── Trainer Booking ──

export type TrainerBookingStatus = 'pending' | 'confirmed' | 'rejected' | 'completed' | 'cancelled';

export const TRAINER_BOOKING_STATUS_LABELS: Record<TrainerBookingStatus, string> = {
  'pending': 'Na čekanju',
  'confirmed': 'Potvrđeno',
  'rejected': 'Odbijeno',
  'completed': 'Završeno',
  'cancelled': 'Otkazano',
};

export const TRAINER_BOOKING_STATUS_COLORS: Record<TrainerBookingStatus, string> = {
  'pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'confirmed': 'bg-green-100 text-green-700 border-green-200',
  'rejected': 'bg-red-100 text-red-700 border-red-200',
  'completed': 'bg-blue-100 text-blue-700 border-blue-200',
  'cancelled': 'bg-gray-100 text-gray-500 border-gray-200',
};

export interface TrainerBooking {
  id: string;
  trainer_id: string;
  user_id: string;
  program_id: string | null;
  date: string;
  start_time: string;
  end_time: string;
  status: TrainerBookingStatus;
  pet_name: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
  trainer?: Trainer;
}

/** Statuses that block a slot from being available */
export const TRAINER_BOOKING_BLOCKING_STATUSES: TrainerBookingStatus[] = ['pending', 'confirmed'];

// ── Blog ──

export type BlogCategory = 'zdravlje' | 'prehrana' | 'dresura' | 'putovanje' | 'zabava' | 'psi' | 'macke';

export const BLOG_CATEGORY_LABELS: Record<BlogCategory, string> = {
  'psi': 'Psi',
  'macke': 'Mačke',
  'zdravlje': 'Zdravlje',
  'prehrana': 'Prehrana',
  'dresura': 'Školovanje pasa',
  'putovanje': 'Putovanje',
  'zabava': 'Zabava',
};

export const BLOG_CATEGORY_EMOJI: Record<BlogCategory, string> = {
  'psi': '🐕',
  'macke': '🐈',
  'zdravlje': '🏥',
  'prehrana': '🥗',
  'dresura': '🎓',
  'putovanje': '✈️',
  'zabava': '🎾',
};

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  author: string;
  date: string;
  updatedAt?: string;
  category: BlogCategory;
  emoji: string;
  coverGradient?: string;
}

export interface BlogComment {
  id: string;
  article_slug: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user?: Pick<User, 'id' | 'name' | 'avatar_url'>;
}

export interface BlogCommentReport {
  id: string;
  comment_id: string;
  reporter_user_id: string;
  article_slug: string;
  reason: string | null;
  created_at: string;
}

// ── Forum ──

export type ForumCategorySlug = 'pitanja' | 'savjeti' | 'price' | 'izgubljeni' | 'slobodna';

export interface ForumCategory {
  id: string;
  slug: ForumCategorySlug;
  name: string;
  emoji: string;
  description: string;
  color: string;
  topic_count: number;
  post_count: number;
}

export interface ForumTopic {
  id: string;
  user_id?: string;
  category_slug: ForumCategorySlug;
  title: string;
  body?: string;
  status?: 'active' | 'hidden' | 'locked';
  author_name: string;
  author_initial: string;
  author_gradient: string;
  created_at: string;
  views?: number;
  reply_count?: number;
  comment_count: number;
  likes: number;
  is_pinned: boolean;
  is_hot: boolean;
  is_solved?: boolean;
  last_reply_at?: string;
  last_reply_by?: string;
  tags?: string[];
  cover_image_url?: string;
}

export interface ForumComment {
  id: string;
  topic_id: string;
  user_id?: string;
  status?: 'active' | 'hidden';
  author_name: string;
  author_initial: string;
  author_gradient: string;
  content: string;
  created_at: string;
  likes: number;
}

export interface ForumPost {
  id: string;
  topic_id: string;
  author_name: string;
  author_initial: string;
  content: string;
  created_at: string;
  likes: number;
  is_best_answer: boolean;
}

export const FORUM_CATEGORIES: ForumCategory[] = [
  { id: 'cat-1', slug: 'pitanja', name: 'Pitanja', emoji: '❓', description: 'Postavite pitanje zajednici', color: 'bg-blue-50 text-blue-700 border-blue-200', topic_count: 4, post_count: 12 },
  { id: 'cat-2', slug: 'savjeti', name: 'Savjeti', emoji: '💡', description: 'Korisni savjeti i trikovi za ljubimce', color: 'bg-green-50 text-green-700 border-green-200', topic_count: 4, post_count: 15 },
  { id: 'cat-3', slug: 'price', name: 'Priče', emoji: '📖', description: 'Vaše priče o ljubimcima', color: 'bg-pink-50 text-pink-700 border-pink-200', topic_count: 3, post_count: 10 },
  { id: 'cat-4', slug: 'izgubljeni', name: 'Izgubljeni', emoji: '🚨', description: 'Izgubljeni i pronađeni ljubimci', color: 'bg-red-50 text-red-700 border-red-200', topic_count: 2, post_count: 6 },
  { id: 'cat-5', slug: 'slobodna', name: 'Slobodna tema', emoji: '💬', description: 'Slobodne teme i rasprave', color: 'bg-amber-50 text-amber-700 border-amber-200', topic_count: 2, post_count: 5 },
];

export const FORUM_CATEGORY_LABELS: Record<ForumCategorySlug, string> = {
  'pitanja': 'Pitanja',
  'savjeti': 'Savjeti',
  'price': 'Priče',
  'izgubljeni': 'Izgubljeni',
  'slobodna': 'Slobodna tema',
};

// ── Lost Pets ──

export type LostPetStatus = 'lost' | 'found';
export type LostPetSpecies = 'pas' | 'macka' | 'ostalo';

export const LOST_PET_STATUS_LABELS: Record<LostPetStatus, string> = {
  'lost': 'Još se traži',
  'found': 'Pronađen!',
};

export const LOST_PET_SPECIES_LABELS: Record<LostPetSpecies, string> = {
  'pas': 'Pas',
  'macka': 'Mačka',
  'ostalo': 'Ostalo',
};

/** Legacy shape stored in lost_pets.sightings JSONB (read-only). */
export interface LostPetSightingLegacy {
  id: string;
  date: string;
  location: string;
  description: string;
}

/** Normalized row from lost_pet_sightings table. */
export interface LostPetSighting {
  id: string;
  lost_pet_id: string;
  location_label: string;
  lat: number | null;
  lng: number | null;
  seen_at: string;
  photo_url: string | null;
  description: string;
  created_at: string;
}

export interface LostPetUpdate {
  id: string;
  date: string;
  text: string;
}

export interface LostPet {
  id: string;
  user_id?: string | null;
  name: string;
  species: LostPetSpecies;
  breed: string;
  color: string;
  sex: 'muško' | 'žensko';
  image_url: string;
  gallery: string[];
  city: string;
  neighborhood: string;
  location_lat: number;
  location_lng: number;
  date_lost: string;
  status: LostPetStatus;
  hidden: boolean;
  description: string;
  special_marks: string;
  has_microchip: boolean;
  has_collar: boolean;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  share_count: number;
  updates: LostPetUpdate[];
  sightings: LostPetSighting[];
  created_at: string;
}

// ── Shop / Webshop ──

export type ProductCategory = 'hrana' | 'igracke' | 'povodci' | 'krevetici' | 'posude' | 'njega' | 'odjeca' | 'grickalice';

export const PRODUCT_CATEGORY_LABELS: Record<ProductCategory, string> = {
  hrana: 'Hrana',
  igracke: 'Igračke',
  povodci: 'Povodci',
  krevetici: 'Krevetići',
  posude: 'Posude',
  njega: 'Njega',
  odjeca: 'Odjeća',
  grickalice: 'Grickalice',
};

export const PRODUCT_CATEGORY_EMOJI: Record<ProductCategory, string> = {
  hrana: '🍖',
  igracke: '🎾',
  povodci: '🦮',
  krevetici: '🛏️',
  posude: '🥣',
  njega: '🧴',
  odjeca: '👕',
  grickalice: '🦴',
};

export interface ProductVariant {
  label: string;
  value: string;
  priceModifier?: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  price: number;
  originalPrice?: number;
  description: string;
  emoji: string;
  brand: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  variants: ProductVariant[];
  specs: Record<string, string>;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  authorName: string;
  authorInitial: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// ── Publisher Profiles (Faza 1) ──

export type PublisherProfileType = 'vlasnik' | 'čuvar' | 'groomer' | 'trener' | 'uzgajivač' | 'veterinar' | 'udomljavanje';

export const PUBLISHER_PROFILE_TYPE_LABELS: Record<PublisherProfileType, string> = {
  'vlasnik': 'Vlasnik ljubimca',
  'čuvar': 'Čuvar / Šetač',
  'groomer': 'Groomer',
  'trener': 'Trener',
  'uzgajivač': 'Uzgajivač',
  'veterinar': 'Veterinar',
  'udomljavanje': 'Udomljavanje',
};

export const PUBLISHER_PROFILE_TYPE_EMOJI: Record<PublisherProfileType, string> = {
  'vlasnik': '🐾',
  'čuvar': '🏠',
  'groomer': '✂️',
  'trener': '🎓',
  'uzgajivač': '🐕‍🦺',
  'veterinar': '🏥',
  'udomljavanje': '❤️',
};

export const PUBLISHER_PROFILE_TYPE_DESCRIPTIONS: Record<PublisherProfileType, string> = {
  'vlasnik': 'Tražim usluge za svog ljubimca',
  'čuvar': 'Nudim usluge čuvanja i šetnje',
  'groomer': 'Nudim usluge uljepšavanja',
  'trener': 'Nudim usluge treniranja',
  'uzgajivač': 'Uzgajam i prodajem ljubimce',
  'veterinar': 'Pružam veterinarske usluge',
  'udomljavanje': 'Objavljujem ljubimce za udomljavanje',
};

export interface PublisherProfile {
  id: string;
  user_id: string;
  type: PublisherProfileType;
  display_name: string;
  bio: string | null;
  city: string | null;
  phone: string | null;
  avatar_url: string | null;
  is_onboarded: boolean;
  created_at: string;
  updated_at: string;
}

// ── Adoption Listings (Faza 2) ──

export type AdoptionSpecies = 'dog' | 'cat' | 'rabbit' | 'other';
export type AdoptionGender = 'male' | 'female';
export type AdoptionSize = 'small' | 'medium' | 'large';
export type AdoptionListingStatus = 'draft' | 'active' | 'paused' | 'adopted' | 'expired';

export const ADOPTION_SPECIES_LABELS: Record<AdoptionSpecies, string> = {
  'dog': 'Pas',
  'cat': 'Mačka',
  'rabbit': 'Kunić',
  'other': 'Ostalo',
};

export const ADOPTION_SPECIES_EMOJI: Record<AdoptionSpecies, string> = {
  'dog': '🐕',
  'cat': '🐈',
  'rabbit': '🐰',
  'other': '🐾',
};

export const ADOPTION_GENDER_LABELS: Record<AdoptionGender, string> = {
  'male': 'Muški',
  'female': 'Ženski',
};

export const ADOPTION_SIZE_LABELS: Record<AdoptionSize, string> = {
  'small': 'Mali',
  'medium': 'Srednji',
  'large': 'Veliki',
};

export const ADOPTION_STATUS_LABELS: Record<AdoptionListingStatus, string> = {
  'draft': 'Skica',
  'active': 'Aktivno',
  'paused': 'Pauzirano',
  'adopted': 'Udomljeno',
  'expired': 'Isteklo',
};

export const ADOPTION_STATUS_COLORS: Record<AdoptionListingStatus, string> = {
  'draft': 'bg-gray-100 text-gray-700',
  'active': 'bg-green-100 text-green-700',
  'paused': 'bg-yellow-100 text-yellow-700',
  'adopted': 'bg-blue-100 text-blue-700',
  'expired': 'bg-red-100 text-red-700',
};

export interface AdoptionListingImage {
  url: string;
  alt: string | null;
  is_primary: boolean;
}

export interface AdoptionListing {
  id: string;
  publisher_id: string;
  status: AdoptionListingStatus;
  name: string;
  species: AdoptionSpecies;
  breed: string | null;
  age_months: number | null;
  gender: AdoptionGender | null;
  size: AdoptionSize | null;
  weight_kg: number | null;
  color: string | null;
  sterilized: boolean;
  vaccinated: boolean;
  microchipped: boolean;
  good_with_kids: boolean | null;
  good_with_pets: boolean | null;
  description: string;
  personality: string | null;
  special_needs: string | null;
  city: string;
  images: AdoptionListingImage[];
  contact_phone: string | null;
  contact_email: string | null;
  is_urgent: boolean;
  published_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  publisher?: PublisherProfile;
}

export type AdoptionListingCard = Pick<
  AdoptionListing,
  | 'id'
  | 'status'
  | 'name'
  | 'species'
  | 'breed'
  | 'age_months'
  | 'gender'
  | 'size'
  | 'city'
  | 'images'
  | 'is_urgent'
  | 'published_at'
> & {
  publisher_display_name: string | null;
};

// ── Trust Layer (canonical types in lib/types/trust.ts) ──
// Re-export PublicStatus for use in ProviderApplication interface
export type { PublicStatus } from '@/lib/types/trust';
import type { PublicStatus } from '@/lib/types/trust';

// ── Provider Onboarding ──

export type ProviderApplicationStatus = 'draft' | 'pending_verification' | 'restricted' | 'active' | 'rejected';

export const PROVIDER_APPLICATION_STATUS_LABELS: Record<ProviderApplicationStatus, string> = {
  'draft': 'Skica',
  'pending_verification': 'U provjeri',
  'restricted': 'Ograničeno',
  'active': 'Aktivno',
  'rejected': 'Odbijeno',
};

export const PROVIDER_APPLICATION_STATUS_COLORS: Record<ProviderApplicationStatus, string> = {
  'draft': 'bg-gray-100 text-gray-700 border-gray-200',
  'pending_verification': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'restricted': 'bg-orange-100 text-orange-700 border-orange-200',
  'active': 'bg-green-100 text-green-700 border-green-200',
  'rejected': 'bg-red-100 text-red-700 border-red-200',
};

export interface ProviderApplication {
  id: string;
  user_id: string;
  status: ProviderApplicationStatus;

  // Basic profile
  display_name: string;
  bio: string | null;
  city: string | null;
  phone: string | null;
  avatar_url: string | null;

  // Service info
  provider_type: string;
  services: string[];
  experience_years: number;
  prices: Record<string, number>;

  // Legal / business info
  business_name: string | null;
  oib: string | null;
  address: string | null;
  id_verified: boolean;

  // Payout info
  stripe_account_id: string | null;
  stripe_onboarding_complete: boolean;
  payout_enabled: boolean;

  // Terms
  terms_accepted: boolean;
  terms_accepted_at: string | null;
  privacy_accepted: boolean;
  privacy_accepted_at: string | null;

  // Admin
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;

  // Trust layer
  public_status: PublicStatus;
  working_hours: Record<string, unknown> | null;
  profile_completeness_pct: number | null;

  created_at: string;
  updated_at: string;
}

export const CITIES = [
  'Zagreb',
  'Rijeka',
  'Split',
  'Osijek',
  'Zadar',
  'Pula',
  'Dubrovnik',
  'Karlovac',
  'Varaždin',
  'Šibenik',
];

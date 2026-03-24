export type UserRole = 'owner' | 'sitter' | 'admin';
export type Species = 'dog' | 'cat' | 'other';
export type ServiceType = 'boarding' | 'walking' | 'house-sitting' | 'drop-in' | 'daycare';
export type BookingStatus = 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';

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
  note: string | null;
  created_at: string;
  owner?: User;
  sitter?: User;
  pet?: Pet;
  sitter_profile?: SitterProfile;
}

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

export type GroomingServiceType = 'sisanje' | 'kupanje' | 'trimanje' | 'nokti' | 'spa';

export const GROOMING_SERVICE_LABELS: Record<GroomingServiceType, string> = {
  'sisanje': 'Šišanje',
  'kupanje': 'Kupanje',
  'trimanje': 'Trimanje',
  'nokti': 'Nokti',
  'spa': 'Spa',
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
  reviews: number;
  bio: string;
  verified: boolean;
  specialization: GroomerSpecialization;
}

// ── Training / Dresura ──

export type TrainingType = 'osnovna' | 'napredna' | 'agility' | 'ponasanje' | 'stenci';

export const TRAINING_TYPE_LABELS: Record<TrainingType, string> = {
  'osnovna': 'Osnovna poslušnost',
  'napredna': 'Napredna dresura',
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
  reviews: number;
  bio: string;
  certified: boolean;
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

// ── Blog ──

export type BlogCategory = 'zdravlje' | 'prehrana' | 'dresura' | 'putovanje' | 'zabava';

export const BLOG_CATEGORY_LABELS: Record<BlogCategory, string> = {
  'zdravlje': 'Zdravlje',
  'prehrana': 'Prehrana',
  'dresura': 'Dresura',
  'putovanje': 'Putovanje',
  'zabava': 'Zabava',
};

export const BLOG_CATEGORY_EMOJI: Record<BlogCategory, string> = {
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
  category: BlogCategory;
  emoji: string;
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

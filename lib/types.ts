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

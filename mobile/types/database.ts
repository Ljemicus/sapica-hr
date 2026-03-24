export type UserRole = 'owner' | 'sitter' | 'both';
export type PetSpecies = 'dog' | 'cat' | 'bird' | 'reptile' | 'other';
export type PetSize = 'small' | 'medium' | 'large';
export type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
export type ServiceType = 'walking' | 'boarding' | 'daycare' | 'house_sitting';

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: UserRole;
  phone: string | null;
  bio: string | null;
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  created_at: string;
  updated_at: string;
}

export interface Pet {
  id: string;
  owner_id: string;
  name: string;
  species: PetSpecies;
  breed: string | null;
  age_years: number | null;
  size: PetSize;
  notes: string | null;
  photos: string[];
  created_at: string;
}

export interface SitterProfile {
  id: string;
  user_id: string;
  services: string[];
  hourly_rate: number | null;
  daily_rate: number | null;
  availability: Record<string, unknown>;
  radius_km: number;
  description: string | null;
  experience_years: number;
  certifications: string[];
  photos: string[];
  rating_avg: number;
  review_count: number;
  verified: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  user?: User;
}

export interface Booking {
  id: string;
  owner_id: string;
  sitter_id: string;
  pet_id: string;
  service_type: string;
  start_date: string;
  end_date: string;
  status: BookingStatus;
  total_price: number;
  payment_intent_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  pet?: Pet;
  owner?: User;
  sitter?: User;
}

export interface Review {
  id: string;
  booking_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  text: string | null;
  created_at: string;
  reviewer?: User;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  booking_id: string | null;
  text: string;
  read: boolean;
  created_at: string;
  sender?: User;
  receiver?: User;
}

export interface Conversation {
  user: User;
  lastMessage: Message;
  unreadCount: number;
}

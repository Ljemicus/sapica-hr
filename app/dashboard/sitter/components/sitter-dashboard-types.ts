import type {
  Availability,
  Booking,
  BookingStatus,
  PetUpdate,
  Review,
  ServiceType,
  SitterProfile,
  UpdateType,
  User,
} from '@/lib/types';

export interface SitterDashboardProps {
  user: User;
  profile: SitterProfile | null;
  bookings: (Booking & {
    owner: { name: string; avatar_url: string | null; email: string };
    pet: { name: string; species: string; breed: string | null; special_needs: string | null };
    address?: string | null;
    message?: string | null;
  })[];
  reviews: (Review & { reviewer: { name: string; avatar_url: string | null } })[];
  availability: Availability[];
  recentUpdates?: PetUpdate[];
}

export type DashboardBooking = SitterDashboardProps['bookings'][number];
export type DashboardReview = SitterDashboardProps['reviews'][number];

export interface ProfileFormState {
  bio: string;
  experience_years: string;
  services: ServiceType[];
  prices: Record<string, number>;
  city: string;
}

export interface UpdateDialogState {
  bookingId: string;
  caption: string;
  emoji: string;
  type: UpdateType;
  photoUrls: string[];
  sending: boolean;
}

export const statusColors: Record<BookingStatus, string> = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  accepted: 'bg-blue-50 text-blue-700 border-blue-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-gray-50 text-gray-700 border-gray-200',
};

export const EMOJI_OPTIONS = ['😊', '🐾', '🐶', '🐱', '❤️', '🏃♂️', '😴', '🍽️', '☀️', '🌧️'];

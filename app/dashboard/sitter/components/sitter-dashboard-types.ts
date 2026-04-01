import type {
  Availability,
  BookingStatus,
  PetUpdate,
  ServiceType,
  SitterDashboardBooking,
  SitterDashboardReview,
  SitterProfile,
  UpdateType,
  User,
} from '@/lib/types';
import { dashboardBookingStatusColors } from '@/app/dashboard/shared/dashboard-booking-status';

export interface SitterDashboardProps {
  user: User;
  profile: SitterProfile | null;
  bookings: SitterDashboardBooking[];
  reviews: SitterDashboardReview[];
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

export const statusColors: Record<BookingStatus, string> = dashboardBookingStatusColors;

export const EMOJI_OPTIONS = ['😊', '🐾', '🐶', '🐱', '❤️', '🏃♂️', '😴', '🍽️', '☀️', '🌧️'];

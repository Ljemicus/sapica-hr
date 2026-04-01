import type { BookingStatus, OwnerDashboardBooking as OwnerBookingShape, Pet, ServiceType, Species, User, Walk } from '@/lib/types';
import { dashboardBookingStatusColors, dashboardBookingStatusDotColors } from '@/app/dashboard/shared/dashboard-booking-status';

export interface OwnerDashboardProps {
  user: User;
  pets: Pet[];
  bookings: OwnerBookingShape[];
  reviewedBookingIds: string[];
  activeWalks: (Walk & { sitterName: string; petName: string })[];
}

export type OwnerDashboardBooking = OwnerDashboardProps['bookings'][number];
export type OwnerActiveWalk = OwnerDashboardProps['activeWalks'][number];

export interface PetFormState {
  name: string;
  species: Species;
  breed: string;
  age: string;
  weight: string;
  special_needs: string;
  photo_url: string;
}

export const statusColors: Record<BookingStatus, string> = dashboardBookingStatusColors;
export const statusDotColors: Record<BookingStatus, string> = dashboardBookingStatusDotColors;

export type { BookingStatus, ServiceType, Species };

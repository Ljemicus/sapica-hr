import type {
  Groomer,
  GroomerAvailabilitySlot,
  GroomerBooking,
  GroomerBookingStatus,
  GroomingServiceType,
} from '@/lib/types';

export interface GroomerDashboardProps {
  groomer: Groomer;
  bookings: GroomerBooking[];
  availability: GroomerAvailabilitySlot[];
}

export type DashboardGroomerBooking = GroomerDashboardProps['bookings'][number];
export type DashboardGroomerAvailabilitySlot = GroomerDashboardProps['availability'][number];

export interface GroomerBookingsTabProps {
  bookings: DashboardGroomerBooking[];
  updatingId: string | null;
  onUpdateStatus: (bookingId: string, status: GroomerBookingStatus) => void;
}

export interface GroomerAvailabilityTabProps {
  availability: DashboardGroomerAvailabilitySlot[];
  generatingSlots: boolean;
  onGenerateSlots: () => void;
}

export interface GroomerStatsProps {
  pendingBookingsCount: number;
  upcomingBookingsCount: number;
  availabilityCount: number;
}

export type { GroomerBookingStatus, GroomingServiceType };

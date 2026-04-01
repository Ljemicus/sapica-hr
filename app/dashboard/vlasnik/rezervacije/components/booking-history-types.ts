import type { OwnerHistoryBooking } from '@/lib/types';

export type FilterTab = 'sve' | 'u_tijeku' | 'zavrsene' | 'otkazane';

export interface BookingRow extends OwnerHistoryBooking {
  has_review?: boolean;
}

export interface GroomingBookingRow {
  id: string;
  groomer_id: string;
  service: string;
  date: string;
  start_time: string;
  end_time: string;
  price: number;
  status: string;
  pet_name: string | null;
  pet_type: string | null;
  note: string | null;
  groomer?: { name: string; city: string } | null;
}

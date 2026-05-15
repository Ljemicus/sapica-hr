import type { BookingRequestEventSummary } from './activity';

export type BookingRequestStatus = 'pending' | 'contacted' | 'closed' | 'withdrawn';
export type BookingRequestActionStatus = 'contacted' | 'closed';

export type BookingRequestInput = {
  providerSlug: string;
  providerName: string;
  providerCity: string;
  providerDistrict?: string;
  serviceLabel: string;
  priceSnapshot: string;
  responseTimeSnapshot: string;
  mode?: 'visit';
  startDate: string;
  endDate: string;
  petName: string;
  petType: 'pas' | 'macka' | 'drugo';
  notes?: string;
  requesterName: string;
  requesterEmail?: string;
  requesterPhone?: string;
  contactConsent: true;
};

export type BookingRequestRow = {
  id: string;
  provider_slug: string;
  provider_name: string;
  provider_city: string;
  provider_district: string;
  service_label: string;
  price_snapshot: string;
  response_time_snapshot: string;
  mode: string;
  start_date: string;
  end_date: string;
  pet_name: string;
  pet_type: string;
  notes: string;
  status: string;
  source: string;
  submitted_at: string;
  created_at: string;
  owner_profile_id: string | null;
  requester_name: string | null;
  requester_email: string | null;
  requester_phone: string | null;
  contact_consent: boolean;
  contact_source: string;
};

export type OwnedBookingRequestSummary = {
  id: string;
  providerSlug: string;
  serviceLabel: string;
  priceSnapshot: string;
  responseTimeSnapshot: string;
  petName: string;
  petType: string;
  dateRange: string;
  notes: string;
  status: string;
  submittedAt: string;
  requesterName: string | null;
  requesterEmail: string | null;
  requesterPhone: string | null;
  contactConsent: boolean;
  conversationEnabled: boolean;
  unreadNotificationCount: number;
  events: BookingRequestEventSummary[];
};

export type OwnerBookingRequestSummary = {
  id: string;
  providerSlug: string;
  providerName: string;
  serviceLabel: string;
  priceSnapshot: string;
  responseTimeSnapshot: string;
  petName: string;
  petType: string;
  dateRange: string;
  notes: string;
  status: BookingRequestStatus;
  statusLabel: 'Poslano' | 'Kontaktiran' | 'Zatvoreno' | 'Povučen';
  submittedAt: string;
  contactMethod: {
    email: string | null;
    phone: string | null;
    consent: boolean;
  };
  conversationEnabled: boolean;
  unreadNotificationCount: number;
  events: BookingRequestEventSummary[];
};

export type BookingRequestStatusUpdateResult =
  | { ok: true; id: string; status: BookingRequestStatus }
  | { ok: false; statusCode: number; code: string; message: string };

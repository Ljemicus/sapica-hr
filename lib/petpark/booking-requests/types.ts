export type BookingRequestStatus = 'pending' | 'contacted' | 'closed';

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
};

export type OwnedBookingRequestSummary = {
  id: string;
  providerSlug: string;
  serviceLabel: string;
  petName: string;
  petType: string;
  dateRange: string;
  notes: string;
  status: string;
  submittedAt: string;
};

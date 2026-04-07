// ═══════════════════════════════════════════════════════════════════════════════
// PetPark Calendar System — TypeScript Types
// ═══════════════════════════════════════════════════════════════════════════════

export type ProviderType = 'sitter' | 'groomer' | 'trainer';

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';

export type SlotType = 'one_time' | 'recurring';

export type BlockType = 'time_off' | 'vacation' | 'holiday' | 'sick_leave' | 'personal' | 'other';

export type SyncDirection = 'to_google' | 'from_google' | 'bidirectional';

export type BookingSource = 'manual' | 'client_booking' | 'google_calendar' | 'ical_import' | 'api';

export type LocationType = 'provider' | 'client' | 'other';

// ═══════════════════════════════════════════════════════════════════════════════
// BOOKING TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface Booking {
  id: string;
  provider_type: ProviderType;
  provider_id: string;
  client_id: string | null;
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  pet_id: string | null;
  pet_name: string | null;
  pet_type: string | null;
  title: string;
  description: string | null;
  status: BookingStatus;
  start_time: string;
  end_time: string;
  timezone: string;
  price: number | null;
  currency: string;
  location_type: LocationType;
  location_address: string | null;
  internal_notes: string | null;
  client_notes: string | null;
  reminder_sent_24h: boolean;
  reminder_sent_1h: boolean;
  source: BookingSource;
  external_id: string | null;
  is_recurring: boolean;
  recurring_pattern_id: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  
  // Joined fields
  client?: {
    name: string;
    avatar_url: string | null;
  };
  pet?: {
    name: string;
    photo_url: string | null;
  };
  services?: BookingService[];
}

export interface BookingService {
  id: string;
  booking_id: string;
  service_id: string | null;
  service_type: string;
  service_name: string;
  duration_minutes: number;
  price: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface CreateBookingInput {
  provider_type: ProviderType;
  provider_id: string;
  client_name: string;
  client_email?: string;
  client_phone?: string;
  pet_name?: string;
  pet_type?: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  timezone?: string;
  price?: number;
  currency?: string;
  location_type?: LocationType;
  location_address?: string;
  internal_notes?: string;
  client_notes?: string;
  services?: CreateBookingServiceInput[];
}

export interface CreateBookingServiceInput {
  service_id?: string;
  service_type: string;
  service_name: string;
  duration_minutes?: number;
  price?: number;
  metadata?: Record<string, unknown>;
}

export interface UpdateBookingInput {
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  pet_name?: string;
  pet_type?: string;
  title?: string;
  description?: string;
  status?: BookingStatus;
  start_time?: string;
  end_time?: string;
  price?: number;
  location_type?: LocationType;
  location_address?: string;
  internal_notes?: string;
  client_notes?: string;
  services?: CreateBookingServiceInput[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// AVAILABILITY TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface AvailabilitySlot {
  id: string;
  provider_type: ProviderType;
  provider_id: string;
  slot_type: SlotType;
  specific_date: string | null;
  day_of_week: number | null;
  start_time: string;
  end_time: string;
  effective_from: string;
  effective_until: string | null;
  slot_duration_minutes: number;
  buffer_minutes: number;
  max_bookings_per_slot: number;
  is_available: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAvailabilitySlotInput {
  provider_type: ProviderType;
  provider_id: string;
  slot_type: SlotType;
  specific_date?: string;
  day_of_week?: number;
  start_time: string;
  end_time: string;
  effective_from?: string;
  effective_until?: string;
  slot_duration_minutes?: number;
  buffer_minutes?: number;
  max_bookings_per_slot?: number;
  notes?: string;
}

export interface UpdateAvailabilitySlotInput {
  start_time?: string;
  end_time?: string;
  is_available?: boolean;
  notes?: string;
  effective_until?: string;
}

export interface WorkingHours {
  pon?: { start: string; end: string };
  uto?: { start: string; end: string };
  sri?: { start: string; end: string };
  cet?: { start: string; end: string };
  pet?: { start: string; end: string };
  sub?: { start: string; end: string };
  ned?: { start: string; end: string };
}

export interface DailyAvailabilitySlot {
  time_slot: string;
  is_available: boolean;
  booking_id: string | null;
  booking_title: string | null;
  booking_status: BookingStatus | null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// BLOCKED DATES TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface BlockedDate {
  id: string;
  provider_type: ProviderType;
  provider_id: string;
  block_type: BlockType;
  start_date: string;
  end_date: string;
  start_time: string | null;
  end_time: string | null;
  title: string | null;
  reason: string | null;
  is_recurring_yearly: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateBlockedDateInput {
  provider_type: ProviderType;
  provider_id: string;
  block_type: BlockType;
  start_date: string;
  end_date: string;
  start_time?: string;
  end_time?: string;
  title?: string;
  reason?: string;
  is_recurring_yearly?: boolean;
}

export interface UpdateBlockedDateInput {
  block_type?: BlockType;
  start_date?: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  title?: string;
  reason?: string;
  is_recurring_yearly?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CALENDAR SYNC TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface CalendarSyncToken {
  id: string;
  user_id: string;
  provider_type: ProviderType | null;
  provider_id: string | null;
  google_calendar_id: string | null;
  access_token: string;
  refresh_token: string;
  token_expires_at: string;
  sync_direction: SyncDirection;
  sync_enabled: boolean;
  last_sync_at: string | null;
  next_sync_token: string | null;
  default_reminder_minutes: number;
  color_code: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCalendarSyncInput {
  provider_type?: ProviderType;
  provider_id?: string;
  google_calendar_id?: string;
  access_token: string;
  refresh_token: string;
  token_expires_at: string;
  sync_direction?: SyncDirection;
  default_reminder_minutes?: number;
  color_code?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ICAL FEED TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface ICalFeed {
  id: string;
  provider_type: ProviderType;
  provider_id: string;
  feed_token: string;
  feed_name: string;
  is_public: boolean;
  include_statuses: BookingStatus[];
  exclude_services: string[];
  include_client_details: boolean;
  include_internal_notes: boolean;
  last_accessed_at: string | null;
  access_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateICalFeedInput {
  provider_type: ProviderType;
  provider_id: string;
  feed_name?: string;
  is_public?: boolean;
  include_statuses?: BookingStatus[];
  exclude_services?: string[];
  include_client_details?: boolean;
  include_internal_notes?: boolean;
}

export interface UpdateICalFeedInput {
  feed_name?: string;
  is_public?: boolean;
  include_statuses?: BookingStatus[];
  exclude_services?: string[];
  include_client_details?: boolean;
  include_internal_notes?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CALENDAR UI TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type CalendarView = 'month' | 'week' | 'day' | 'agenda';

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  extendedProps: {
    booking: Booking;
    services: BookingService[];
    clientName: string;
    petName: string | null;
    status: BookingStatus;
  };
}

export interface CalendarFilters {
  status: BookingStatus[];
  serviceTypes: string[];
  clientId: string | null;
  dateRange: {
    start: Date;
    end: Date;
  } | null;
}

export interface DragDropInfo {
  bookingId: string;
  newStart: Date;
  newEnd: Date;
}

// ═══════════════════════════════════════════════════════════════════════════════
// API RESPONSE TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface CalendarApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface BookingStatistics {
  total_bookings: number;
  pending_bookings: number;
  confirmed_bookings: number;
  completed_bookings: number;
  cancelled_bookings: number;
  total_revenue: number;
  average_booking_value: number;
  most_popular_service: string | null;
}

export interface ConflictCheckResult {
  has_conflict: boolean;
  conflicting_bookings: Array<{
    id: string;
    title: string;
    start_time: string;
    end_time: string;
  }>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// NOTIFICATION TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface BookingNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data: {
    booking_id: string;
    provider_type: ProviderType;
    start_time: string;
  };
  read: boolean;
  created_at: string;
}

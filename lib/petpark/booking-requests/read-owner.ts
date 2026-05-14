import { createAdminClient } from '@/lib/supabase/admin';
import { isSupabaseConfigured } from '@/lib/db/helpers';
import type { BookingRequestRow, BookingRequestStatus, OwnerBookingRequestSummary } from './types';

const ownerStatusLabels: Record<BookingRequestStatus, OwnerBookingRequestSummary['statusLabel']> = {
  pending: 'Poslano',
  contacted: 'Kontaktiran',
  closed: 'Zatvoreno',
  withdrawn: 'Povučen',
};

function toDateRange(startDate: string, endDate: string) {
  const start = new Date(`${startDate}T00:00:00.000Z`);
  const end = new Date(`${endDate}T00:00:00.000Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return `${startDate} – ${endDate}`;
  return `${start.toLocaleDateString('hr-HR')} – ${end.toLocaleDateString('hr-HR')}`;
}

function toSubmittedAt(createdAt: string) {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return createdAt;
  return date.toLocaleDateString('hr-HR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function normalizeStatus(status: string): BookingRequestStatus {
  if (status === 'contacted' || status === 'closed' || status === 'withdrawn') return status;
  return 'pending';
}

export function getOwnerBookingRequestStatusLabel(status: string): OwnerBookingRequestSummary['statusLabel'] {
  return ownerStatusLabels[normalizeStatus(status)];
}

export function maskRequesterEmail(email?: string | null) {
  if (!email) return null;
  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) return 'E-mail zabilježen';
  const visible = localPart.slice(0, Math.min(2, localPart.length));
  return `${visible}${'•'.repeat(Math.max(2, Math.min(6, localPart.length - visible.length)))}@${domain}`;
}

export function maskRequesterPhone(phone?: string | null) {
  if (!phone) return null;
  const compact = phone.replace(/\s+/g, ' ').trim();
  if (compact.length <= 6) return 'Telefon zabilježen';
  return `${compact.slice(0, 4)}••••${compact.slice(-3)}`;
}

export function mapOwnerBookingRequestSummary(request: BookingRequestRow): OwnerBookingRequestSummary {
  const status = normalizeStatus(request.status);
  return {
    id: request.id,
    providerSlug: request.provider_slug,
    providerName: request.provider_name,
    serviceLabel: request.service_label,
    priceSnapshot: request.price_snapshot,
    responseTimeSnapshot: request.response_time_snapshot,
    petName: request.pet_name,
    petType: request.pet_type,
    dateRange: toDateRange(request.start_date, request.end_date),
    notes: request.notes || '',
    status,
    statusLabel: ownerStatusLabels[status],
    submittedAt: toSubmittedAt(request.created_at),
    contactMethod: {
      email: maskRequesterEmail(request.requester_email),
      phone: maskRequesterPhone(request.requester_phone),
      consent: Boolean(request.contact_consent),
    },
  };
}

export async function getOwnerBookingRequestSummaries(ownerProfileId: string): Promise<OwnerBookingRequestSummary[]> {
  if (!isSupabaseConfigured() || !ownerProfileId) return [];

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('booking_requests')
      .select('id, provider_slug, provider_name, service_label, price_snapshot, response_time_snapshot, mode, start_date, end_date, pet_name, pet_type, notes, status, source, submitted_at, created_at, owner_profile_id, requester_name, requester_email, requester_phone, contact_consent, contact_source, provider_city, provider_district')
      .eq('owner_profile_id', ownerProfileId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error || !data) return [];
    return (data as BookingRequestRow[]).map(mapOwnerBookingRequestSummary);
  } catch {
    return [];
  }
}

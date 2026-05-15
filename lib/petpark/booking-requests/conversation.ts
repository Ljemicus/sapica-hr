import { createAdminClient } from '@/lib/supabase/admin';
import { isSupabaseConfigured } from '@/lib/db/helpers';
import type { BookingRequestRow } from './types';

export type BookingRequestConversationRole = 'owner' | 'provider' | 'admin';

export type BookingRequestMessageSummary = {
  id: string;
  bookingRequestId: string;
  senderProfileId: string;
  senderRole: BookingRequestConversationRole;
  body: string;
  createdAt: string;
  createdAtLabel: string;
  isMine: boolean;
};

type MessageRow = {
  id: string;
  booking_request_id: string;
  sender_profile_id: string;
  sender_role: string;
  body: string;
  created_at: string;
};

type ParticipantResolution =
  | {
      ok: true;
      request: BookingRequestRow;
      role: BookingRequestConversationRole;
      providerProfileId: string | null;
      ownerProfileId: string;
    }
  | { ok: false; statusCode: number; code: string; message: string };

function toDateTimeLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('hr-HR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function mapMessage(row: MessageRow, currentProfileId: string): BookingRequestMessageSummary {
  return {
    id: row.id,
    bookingRequestId: row.booking_request_id,
    senderProfileId: row.sender_profile_id,
    senderRole: row.sender_role === 'provider' || row.sender_role === 'admin' ? row.sender_role : 'owner',
    body: row.body,
    createdAt: row.created_at,
    createdAtLabel: toDateTimeLabel(row.created_at),
    isMine: row.sender_profile_id === currentProfileId,
  };
}

export async function resolveBookingRequestConversationParticipant(requestId: string, profileId: string, userRole?: string | null): Promise<ParticipantResolution> {
  if (!isSupabaseConfigured()) {
    return { ok: false, statusCode: 503, code: 'SUPABASE_NOT_CONFIGURED', message: 'Supabase is not configured.' };
  }

  const admin = createAdminClient();
  const { data: request, error: requestError } = await admin
    .from('booking_requests')
    .select('*')
    .eq('id', requestId)
    .single();

  if (requestError || !request) {
    return { ok: false, statusCode: 404, code: 'BOOKING_REQUEST_NOT_FOUND', message: 'Booking upit nije pronađen.' };
  }

  const bookingRequest = request as BookingRequestRow;
  if (!bookingRequest.owner_profile_id) {
    return { ok: false, statusCode: 409, code: 'CONVERSATION_UNAVAILABLE_FOR_ANONYMOUS_REQUEST', message: 'In-app razgovor je dostupan samo za upite poslane s prijavljenim računom.' };
  }

  const providerProfileId = await getProviderProfileIdForRequest(bookingRequest.provider_slug);

  if (bookingRequest.owner_profile_id === profileId) {
    return { ok: true, request: bookingRequest, role: 'owner', providerProfileId, ownerProfileId: bookingRequest.owner_profile_id };
  }

  if (providerProfileId === profileId) {
    return { ok: true, request: bookingRequest, role: 'provider', providerProfileId, ownerProfileId: bookingRequest.owner_profile_id };
  }

  if (userRole === 'admin') {
    return { ok: true, request: bookingRequest, role: 'admin', providerProfileId, ownerProfileId: bookingRequest.owner_profile_id };
  }

  return { ok: false, statusCode: 403, code: 'FORBIDDEN', message: 'Možeš otvoriti samo razgovor za svoje upite ili svoje usluge.' };
}

async function getProviderProfileIdForRequest(providerSlug: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('service_listings')
    .select('providers!inner(profile_id)')
    .eq('slug', providerSlug)
    .maybeSingle();

  if (error || !data) return null;
  const provider = Array.isArray(data.providers) ? data.providers[0] : data.providers;
  return provider?.profile_id || null;
}

export async function getBookingRequestMessages(requestId: string, profileId: string, userRole?: string | null) {
  const participant = await resolveBookingRequestConversationParticipant(requestId, profileId, userRole);
  if (!participant.ok) return participant;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('booking_request_messages')
    .select('id, booking_request_id, sender_profile_id, sender_role, body, created_at')
    .eq('booking_request_id', requestId)
    .order('created_at', { ascending: true })
    .limit(100);

  if (error) {
    return { ok: false as const, statusCode: 503, code: 'CONVERSATION_SCHEMA_UNAVAILABLE', message: 'Razgovor još nije aktiviran na bazi.' };
  }

  return {
    ok: true as const,
    role: participant.role,
    messages: ((data || []) as MessageRow[]).map((row) => mapMessage(row, profileId)),
  };
}

export async function createBookingRequestMessage(input: { requestId: string; profileId: string; userRole?: string | null; body: string }) {
  const participant = await resolveBookingRequestConversationParticipant(input.requestId, input.profileId, input.userRole);
  if (!participant.ok) return participant;

  const body = input.body.trim();
  if (!body) {
    return { ok: false as const, statusCode: 400, code: 'EMPTY_MESSAGE', message: 'Poruka ne može biti prazna.' };
  }
  if (body.length > 2000) {
    return { ok: false as const, statusCode: 400, code: 'MESSAGE_TOO_LONG', message: 'Poruka može imati najviše 2000 znakova.' };
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('booking_request_messages')
    .insert({
      booking_request_id: input.requestId,
      sender_profile_id: input.profileId,
      sender_role: participant.role,
      body,
      metadata: {},
    })
    .select('id, booking_request_id, sender_profile_id, sender_role, body, created_at')
    .single();

  if (error || !data) {
    return { ok: false as const, statusCode: 503, code: 'MESSAGE_CREATE_FAILED', message: 'Poruku trenutno nije moguće poslati.' };
  }

  const recipientProfileId = participant.role === 'owner' ? participant.providerProfileId : participant.ownerProfileId;
  if (recipientProfileId && recipientProfileId !== input.profileId) {
    try {
      await admin.from('notifications').insert({
        recipient_profile_id: recipientProfileId,
        booking_request_id: input.requestId,
        type: 'booking_request_message',
        title: 'Nova poruka za upit',
        body: participant.role === 'owner'
          ? `${participant.request.requester_name || 'Vlasnik'} je poslao poruku za ${participant.request.service_label}.`
          : `${participant.request.provider_name} je poslao poruku za ${participant.request.service_label}.`,
        target_path: participant.role === 'owner' ? '/moje-usluge' : '/moji-upiti',
        metadata: { providerSlug: participant.request.provider_slug, serviceLabel: participant.request.service_label },
      });
    } catch {
      // In-app notification is best effort; message creation remains the source of truth.
    }
  }

  return { ok: true as const, message: mapMessage(data as MessageRow, input.profileId) };
}

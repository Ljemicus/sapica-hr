import { createAdminClient } from '@/lib/supabase/admin';
import { getAuthUser } from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/db/helpers';
import { canTransitionBookingRequestStatus, canWithdrawBookingRequestStatus } from './schema';
import {
  createBookingRequestCreatedArtifacts,
  createOwnerWithdrawnArtifacts,
  createProviderClosedArtifacts,
  createProviderContactedArtifacts,
  getBookingRequestEventsByRequestIds,
  getUnreadNotificationCountsByBookingRequest,
} from './activity';
import type { BookingRequestInputPayload } from './schema';
import type { BookingRequestActionStatus, BookingRequestRow, BookingRequestStatusUpdateResult, OwnedBookingRequestSummary } from './types';

function toDateRange(startDate: string, endDate: string) {
  const start = new Date(`${startDate}T00:00:00.000Z`);
  const end = new Date(`${endDate}T00:00:00.000Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return `${startDate} – ${endDate}`;
  return `${start.toLocaleDateString('hr-HR')} – ${end.toLocaleDateString('hr-HR')}`;
}

export async function createBookingRequest(input: BookingRequestInputPayload): Promise<BookingRequestRow | null> {
  if (!isSupabaseConfigured()) return null;

  const user = await getAuthUser();
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('booking_requests')
    .insert({
      provider_slug: input.providerSlug,
      provider_name: input.providerName,
      provider_city: input.providerCity,
      provider_district: input.providerDistrict || '',
      service_label: input.serviceLabel,
      price_snapshot: input.priceSnapshot,
      response_time_snapshot: input.responseTimeSnapshot,
      mode: input.mode,
      start_date: input.startDate,
      end_date: input.endDate,
      pet_name: input.petName,
      pet_type: input.petType,
      notes: input.notes || '',
      owner_profile_id: user?.id || null,
      requester_name: input.requesterName,
      requester_email: input.requesterEmail || null,
      requester_phone: input.requesterPhone || null,
      contact_consent: input.contactConsent,
      contact_source: 'booking_request_form',
      status: 'pending',
      source: 'web_request_flow',
    })
    .select('*')
    .single();

  if (error || !data) return null;

  const bookingRequest = data as BookingRequestRow;
  await createBookingRequestCreatedArtifacts(bookingRequest, user?.id || null).catch(() => undefined);

  return bookingRequest;
}

export async function updateOwnedBookingRequestStatus(requestId: string, nextStatus: BookingRequestActionStatus): Promise<BookingRequestStatusUpdateResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, statusCode: 503, code: 'SUPABASE_NOT_CONFIGURED', message: 'Supabase is not configured.' };
  }

  const user = await getAuthUser();
  if (!user) {
    return { ok: false, statusCode: 401, code: 'UNAUTHORIZED', message: 'Prijavi se prije promjene statusa upita.' };
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
  if (!canTransitionBookingRequestStatus(bookingRequest.status, nextStatus)) {
    return { ok: false, statusCode: 400, code: 'INVALID_STATUS_TRANSITION', message: 'Ovaj status upita više nije moguće promijeniti na taj način.' };
  }

  if (user.role !== 'admin') {
    const { data: listing, error: listingError } = await admin
      .from('service_listings')
      .select('provider_id')
      .eq('slug', bookingRequest.provider_slug)
      .single();

    if (listingError || !listing?.provider_id) {
      return { ok: false, statusCode: 404, code: 'SERVICE_LISTING_NOT_FOUND', message: 'Povezana usluga nije pronađena.' };
    }

    const { data: provider, error: providerError } = await admin
      .from('providers')
      .select('id')
      .eq('id', listing.provider_id)
      .eq('profile_id', user.id)
      .maybeSingle();

    if (providerError || !provider) {
      return { ok: false, statusCode: 403, code: 'FORBIDDEN', message: 'Možeš mijenjati samo upite za svoje usluge.' };
    }
  }

  const { data: updated, error: updateError } = await admin
    .from('booking_requests')
    .update({ status: nextStatus })
    .eq('id', requestId)
    .select('id, status')
    .single();

  if (updateError || !updated) {
    return { ok: false, statusCode: 500, code: 'BOOKING_REQUEST_STATUS_UPDATE_FAILED', message: 'Status upita trenutno nije moguće promijeniti.' };
  }

  const actorRole = user.role === 'admin' ? 'admin' : 'provider';
  if (nextStatus === 'contacted') {
    await createProviderContactedArtifacts(bookingRequest, user.id, bookingRequest.status, actorRole).catch(() => undefined);
  } else {
    await createProviderClosedArtifacts(bookingRequest, user.id, bookingRequest.status, actorRole).catch(() => undefined);
  }

  return { ok: true, id: updated.id, status: updated.status };
}

export async function withdrawOwnedBookingRequest(requestId: string): Promise<BookingRequestStatusUpdateResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, statusCode: 503, code: 'SUPABASE_NOT_CONFIGURED', message: 'Supabase is not configured.' };
  }

  const user = await getAuthUser();
  if (!user) {
    return { ok: false, statusCode: 401, code: 'UNAUTHORIZED', message: 'Prijavi se prije povlačenja upita.' };
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
  if (!bookingRequest.owner_profile_id || bookingRequest.owner_profile_id !== user.id) {
    return { ok: false, statusCode: 403, code: 'FORBIDDEN', message: 'Možeš povući samo upite koje si poslao/la s ovim računom.' };
  }

  if (!canWithdrawBookingRequestStatus(bookingRequest.status)) {
    return { ok: false, statusCode: 400, code: 'INVALID_WITHDRAW_TRANSITION', message: 'Ovaj upit više nije moguće povući.' };
  }

  const { data: updated, error: updateError } = await admin
    .from('booking_requests')
    .update({ status: 'withdrawn' })
    .eq('id', requestId)
    .eq('owner_profile_id', user.id)
    .select('id, status')
    .single();

  if (updateError || !updated) {
    return { ok: false, statusCode: 500, code: 'BOOKING_REQUEST_WITHDRAW_FAILED', message: 'Upit trenutno nije moguće povući.' };
  }

  await createOwnerWithdrawnArtifacts(bookingRequest, user.id, bookingRequest.status).catch(() => undefined);

  return { ok: true, id: updated.id, status: updated.status };
}

export async function getOwnedBookingRequestSummaries(): Promise<OwnedBookingRequestSummary[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const user = await getAuthUser();
    const userId = user?.id;
    if (!userId) return [];

    const admin = createAdminClient();
    const { data: providers, error: providersError } = await admin
      .from('providers')
      .select('id')
      .eq('profile_id', userId);

    if (providersError || !providers?.length) return [];

    const providerIds = providers.map((provider) => provider.id);
    const { data: listings, error: listingsError } = await admin
      .from('service_listings')
      .select('slug')
      .in('provider_id', providerIds);

    if (listingsError || !listings?.length) return [];

    const slugs = listings.map((listing) => listing.slug).filter(Boolean);
    if (!slugs.length) return [];

    const { data, error } = await admin
      .from('booking_requests')
      .select('*')
      .in('provider_slug', slugs)
      .order('created_at', { ascending: false })
      .limit(30);

    if (error || !data) return [];

    const requests = data as BookingRequestRow[];
    const requestIds = requests.map((request) => request.id);
    const eventsByRequest = await getBookingRequestEventsByRequestIds(requestIds);
    const unreadCountsByRequest = await getUnreadNotificationCountsByBookingRequest(userId, requestIds);

    return requests.map((request) => ({
      id: request.id,
      providerSlug: request.provider_slug,
      serviceLabel: request.service_label,
      priceSnapshot: request.price_snapshot,
      responseTimeSnapshot: request.response_time_snapshot,
      petName: request.pet_name,
      petType: request.pet_type,
      dateRange: toDateRange(request.start_date, request.end_date),
      notes: request.notes,
      status: request.status,
      submittedAt: new Date(request.created_at).toLocaleDateString('hr-HR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      requesterName: request.requester_name,
      requesterEmail: request.requester_email,
      requesterPhone: request.requester_phone,
      contactConsent: request.contact_consent,
      conversationEnabled: Boolean(request.owner_profile_id),
      unreadNotificationCount: unreadCountsByRequest.get(request.id) || 0,
      events: eventsByRequest.get(request.id) || [],
    }));
  } catch {
    return [];
  }
}

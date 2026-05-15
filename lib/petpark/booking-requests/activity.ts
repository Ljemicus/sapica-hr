import { createAdminClient } from '@/lib/supabase/admin';
import { isSupabaseConfigured } from '@/lib/db/helpers';
import type { BookingRequestRow } from './types';

export type BookingRequestEventType = 'created' | 'provider_contacted' | 'provider_closed' | 'owner_withdrawn';
export type BookingRequestActorRole = 'owner' | 'provider' | 'admin' | 'system';
export type BookingRequestNotificationType = 'booking_request_created' | 'booking_request_contacted' | 'booking_request_closed' | 'booking_request_withdrawn';

export type BookingRequestEventSummary = {
  id: string;
  type: BookingRequestEventType;
  actorRole: BookingRequestActorRole;
  summary: string;
  oldStatus: string | null;
  newStatus: string | null;
  createdAt: string;
  createdAtLabel: string;
};

export type BookingRequestNotificationSummary = {
  id: string;
  type: BookingRequestNotificationType;
  title: string;
  body: string;
  targetPath: string;
  readAt: string | null;
  createdAt: string;
  createdAtLabel: string;
};

type EventRow = {
  id: string;
  booking_request_id: string;
  actor_profile_id: string | null;
  actor_role: string;
  event_type: string;
  old_status: string | null;
  new_status: string | null;
  summary: string;
  created_at: string;
};

type NotificationRow = {
  id: string;
  type: string;
  title: string;
  body: string;
  target_path: string;
  read_at: string | null;
  created_at: string;
};

function toDateTimeLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('hr-HR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function normalizeEventType(value: string): BookingRequestEventType {
  if (value === 'provider_contacted' || value === 'provider_closed' || value === 'owner_withdrawn') return value;
  return 'created';
}

function normalizeActorRole(value: string): BookingRequestActorRole {
  if (value === 'owner' || value === 'provider' || value === 'admin') return value;
  return 'system';
}

function normalizeNotificationType(value: string): BookingRequestNotificationType {
  if (value === 'booking_request_contacted' || value === 'booking_request_closed' || value === 'booking_request_withdrawn') return value;
  return 'booking_request_created';
}

export function mapBookingRequestEventSummary(row: EventRow): BookingRequestEventSummary {
  return {
    id: row.id,
    type: normalizeEventType(row.event_type),
    actorRole: normalizeActorRole(row.actor_role),
    summary: row.summary,
    oldStatus: row.old_status,
    newStatus: row.new_status,
    createdAt: row.created_at,
    createdAtLabel: toDateTimeLabel(row.created_at),
  };
}

export function mapBookingRequestNotificationSummary(row: NotificationRow): BookingRequestNotificationSummary {
  return {
    id: row.id,
    type: normalizeNotificationType(row.type),
    title: row.title,
    body: row.body,
    targetPath: row.target_path,
    readAt: row.read_at,
    createdAt: row.created_at,
    createdAtLabel: toDateTimeLabel(row.created_at),
  };
}

export function shouldNotifyOwner(request: Pick<BookingRequestRow, 'owner_profile_id'>) {
  return Boolean(request.owner_profile_id);
}

export function eventSummaryFor(type: BookingRequestEventType) {
  if (type === 'provider_contacted') return 'Pružatelj je označio upit kao kontaktiran';
  if (type === 'provider_closed') return 'Upit je zatvoren';
  if (type === 'owner_withdrawn') return 'Vlasnik je povukao upit';
  return 'Novi upit je poslan';
}

export async function getProviderProfileIdForBookingRequest(request: Pick<BookingRequestRow, 'provider_slug'>): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('service_listings')
    .select('providers!inner(profile_id)')
    .eq('slug', request.provider_slug)
    .maybeSingle();

  if (error || !data) return null;
  const provider = Array.isArray(data.providers) ? data.providers[0] : data.providers;
  return provider?.profile_id || null;
}

export async function createBookingRequestEvent(input: {
  bookingRequestId: string;
  actorProfileId?: string | null;
  actorRole: BookingRequestActorRole;
  eventType: BookingRequestEventType;
  oldStatus?: string | null;
  newStatus?: string | null;
  summary?: string;
  metadata?: Record<string, unknown>;
}) {
  if (!isSupabaseConfigured()) return false;

  const admin = createAdminClient();
  const { error } = await admin.from('booking_request_events').insert({
    booking_request_id: input.bookingRequestId,
    actor_profile_id: input.actorProfileId || null,
    actor_role: input.actorRole,
    event_type: input.eventType,
    old_status: input.oldStatus || null,
    new_status: input.newStatus || null,
    summary: input.summary || eventSummaryFor(input.eventType),
    metadata: input.metadata || {},
  });

  return !error;
}

export async function createNotification(input: {
  recipientProfileId?: string | null;
  bookingRequestId: string;
  type: BookingRequestNotificationType;
  title: string;
  body: string;
  targetPath: string;
  metadata?: Record<string, unknown>;
}) {
  if (!isSupabaseConfigured() || !input.recipientProfileId) return false;

  const admin = createAdminClient();
  const { error } = await admin.from('notifications').insert({
    recipient_profile_id: input.recipientProfileId,
    booking_request_id: input.bookingRequestId,
    type: input.type,
    title: input.title,
    body: input.body,
    target_path: input.targetPath,
    metadata: input.metadata || {},
  });

  return !error;
}

export async function createBookingRequestCreatedArtifacts(request: BookingRequestRow, actorProfileId?: string | null) {
  await createBookingRequestEvent({
    bookingRequestId: request.id,
    actorProfileId: actorProfileId || request.owner_profile_id,
    actorRole: request.owner_profile_id ? 'owner' : 'system',
    eventType: 'created',
    oldStatus: null,
    newStatus: request.status,
    metadata: { providerSlug: request.provider_slug, serviceLabel: request.service_label },
  });

  const providerProfileId = await getProviderProfileIdForBookingRequest(request);
  await createNotification({
    recipientProfileId: providerProfileId,
    bookingRequestId: request.id,
    type: 'booking_request_created',
    title: 'Novi upit',
    body: `${request.requester_name || 'Vlasnik'} je poslao upit za ${request.service_label}.`,
    targetPath: '/moje-usluge',
    metadata: { providerSlug: request.provider_slug, serviceLabel: request.service_label },
  });
}

export async function createProviderContactedArtifacts(request: BookingRequestRow, actorProfileId: string, oldStatus: string, actorRole: BookingRequestActorRole = 'provider') {
  await createBookingRequestEvent({
    bookingRequestId: request.id,
    actorProfileId,
    actorRole,
    eventType: 'provider_contacted',
    oldStatus,
    newStatus: 'contacted',
    metadata: { providerSlug: request.provider_slug, serviceLabel: request.service_label },
  });

  await createNotification({
    recipientProfileId: request.owner_profile_id,
    bookingRequestId: request.id,
    type: 'booking_request_contacted',
    title: 'Pružatelj je označio upit kao kontaktiran',
    body: `${request.provider_name} je označio da te kontaktirao za ${request.service_label}.`,
    targetPath: '/moji-upiti',
    metadata: { providerSlug: request.provider_slug, serviceLabel: request.service_label },
  });
}

export async function createProviderClosedArtifacts(request: BookingRequestRow, actorProfileId: string, oldStatus: string, actorRole: BookingRequestActorRole = 'provider') {
  await createBookingRequestEvent({
    bookingRequestId: request.id,
    actorProfileId,
    actorRole,
    eventType: 'provider_closed',
    oldStatus,
    newStatus: 'closed',
    metadata: { providerSlug: request.provider_slug, serviceLabel: request.service_label },
  });

  await createNotification({
    recipientProfileId: request.owner_profile_id,
    bookingRequestId: request.id,
    type: 'booking_request_closed',
    title: 'Upit je zatvoren',
    body: `${request.provider_name} je zatvorio upit za ${request.service_label}.`,
    targetPath: '/moji-upiti',
    metadata: { providerSlug: request.provider_slug, serviceLabel: request.service_label },
  });
}

export async function createOwnerWithdrawnArtifacts(request: BookingRequestRow, actorProfileId: string, oldStatus: string) {
  await createBookingRequestEvent({
    bookingRequestId: request.id,
    actorProfileId,
    actorRole: 'owner',
    eventType: 'owner_withdrawn',
    oldStatus,
    newStatus: 'withdrawn',
    metadata: { providerSlug: request.provider_slug, serviceLabel: request.service_label },
  });

  const providerProfileId = await getProviderProfileIdForBookingRequest(request);
  await createNotification({
    recipientProfileId: providerProfileId,
    bookingRequestId: request.id,
    type: 'booking_request_withdrawn',
    title: 'Vlasnik je povukao upit',
    body: `${request.requester_name || 'Vlasnik'} je povukao upit za ${request.service_label}.`,
    targetPath: '/moje-usluge',
    metadata: { providerSlug: request.provider_slug, serviceLabel: request.service_label },
  });
}

export async function getBookingRequestEventsByRequestIds(requestIds: string[]) {
  if (!isSupabaseConfigured() || requestIds.length === 0) return new Map<string, BookingRequestEventSummary[]>();

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('booking_request_events')
    .select('id, booking_request_id, actor_profile_id, actor_role, event_type, old_status, new_status, summary, created_at')
    .in('booking_request_id', requestIds)
    .order('created_at', { ascending: true });

  const eventsByRequest = new Map<string, BookingRequestEventSummary[]>();
  if (error || !data) return eventsByRequest;

  for (const event of data as EventRow[]) {
    const list = eventsByRequest.get(event.booking_request_id) || [];
    list.push(mapBookingRequestEventSummary(event));
    eventsByRequest.set(event.booking_request_id, list);
  }

  return eventsByRequest;
}

export async function getNotificationsForProfile(profileId: string): Promise<BookingRequestNotificationSummary[]> {
  if (!isSupabaseConfigured() || !profileId) return [];

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('notifications')
    .select('id, type, title, body, target_path, read_at, created_at')
    .eq('recipient_profile_id', profileId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error || !data) return [];
  return (data as NotificationRow[]).map(mapBookingRequestNotificationSummary);
}

export async function markNotificationRead(notificationId: string, profileId: string) {
  if (!isSupabaseConfigured() || !notificationId || !profileId) return false;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId)
    .eq('recipient_profile_id', profileId)
    .is('read_at', null)
    .select('id')
    .maybeSingle();

  return !error && Boolean(data?.id);
}

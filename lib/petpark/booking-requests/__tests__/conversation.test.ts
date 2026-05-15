import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createBookingRequestMessage, getBookingRequestMessages } from '../conversation';

vi.mock('@/lib/db/helpers', () => ({ isSupabaseConfigured: () => true }));

const request = {
  id: 'request-1',
  provider_slug: 'listing-1',
  provider_name: 'Provider',
  provider_city: 'Rijeka',
  provider_district: '',
  service_label: 'Čuvanje',
  price_snapshot: '10 €',
  response_time_snapshot: '1h',
  mode: 'visit',
  start_date: '2026-05-16',
  end_date: '2026-05-16',
  pet_name: 'Rex',
  pet_type: 'pas',
  notes: '',
  status: 'pending',
  source: 'web',
  submitted_at: '2026-05-15T00:00:00.000Z',
  created_at: '2026-05-15T00:00:00.000Z',
  owner_profile_id: 'owner-1',
  requester_name: 'Owner',
  requester_email: 'owner@example.com',
  requester_phone: null,
  contact_consent: true,
  contact_source: 'booking_request_form',
};

let db: {
  request: typeof request | null;
  providerProfileId: string | null;
  messages: Array<Record<string, string>>;
  notifications: Array<Record<string, unknown>>;
};

function makeBuilder(table: string) {
  let inserted: Record<string, unknown> | null = null;
  const builder = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    order: vi.fn(() => builder),
    limit: vi.fn(() => builder),
    insert: vi.fn((payload: Record<string, unknown>) => {
      inserted = payload;
      if (table === 'notifications') db.notifications.push(payload);
      return builder;
    }),
    single: vi.fn(async () => {
      if (table === 'booking_requests') return db.request ? { data: db.request, error: null } : { data: null, error: { message: 'missing' } };
      if (table === 'booking_request_messages' && inserted) {
        const row = { id: 'message-new', created_at: '2026-05-15T08:00:00.000Z', ...inserted } as Record<string, string>;
        db.messages.push(row);
        return { data: row, error: null };
      }
      return { data: null, error: { message: 'unexpected single' } };
    }),
    maybeSingle: vi.fn(async () => {
      if (table === 'service_listings' && db.providerProfileId) {
        return { data: { providers: { profile_id: db.providerProfileId } }, error: null };
      }
      return { data: null, error: null };
    }),
    then(resolve: (value: { data: unknown; error: unknown }) => void) {
      if (table === 'booking_request_messages') resolve({ data: db.messages, error: null });
      else if (table === 'notifications') resolve({ data: null, error: null });
      else resolve({ data: null, error: null });
    },
  };
  return builder;
}

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({ from: (table: string) => makeBuilder(table) }),
}));

describe('booking request conversation', () => {
  beforeEach(() => {
    db = { request: { ...request }, providerProfileId: 'provider-1', messages: [], notifications: [] };
  });

  it('lets the owner read their own request messages', async () => {
    db.messages.push({
      id: 'message-1',
      booking_request_id: 'request-1',
      sender_profile_id: 'owner-1',
      sender_role: 'owner',
      body: 'Bok',
      created_at: '2026-05-15T08:00:00.000Z',
    });

    const result = await getBookingRequestMessages('request-1', 'owner-1');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.messages[0].isMine).toBe(true);
  });

  it('blocks unrelated users', async () => {
    const result = await getBookingRequestMessages('request-1', 'stranger-1');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.statusCode).toBe(403);
  });

  it('blocks anonymous owner requests', async () => {
    db.request = { ...request, owner_profile_id: null };
    const result = await getBookingRequestMessages('request-1', 'provider-1');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('CONVERSATION_UNAVAILABLE_FOR_ANONYMOUS_REQUEST');
  });

  it('rejects empty and too-long messages', async () => {
    const empty = await createBookingRequestMessage({ requestId: 'request-1', profileId: 'owner-1', body: '   ' });
    expect(empty.ok).toBe(false);
    const long = await createBookingRequestMessage({ requestId: 'request-1', profileId: 'owner-1', body: 'a'.repeat(2001) });
    expect(long.ok).toBe(false);
  });

  it('creates a message and one in-app notification for the other participant', async () => {
    const result = await createBookingRequestMessage({ requestId: 'request-1', profileId: 'owner-1', body: ' Može termin? ' });
    expect(result.ok).toBe(true);
    expect(db.messages).toHaveLength(1);
    expect(db.notifications).toHaveLength(1);
    expect(db.notifications[0].recipient_profile_id).toBe('provider-1');
    expect(db.notifications[0].type).toBe('booking_request_message');
  });
});

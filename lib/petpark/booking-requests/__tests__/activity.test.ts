import { describe, expect, it } from 'vitest';
import {
  bookingRequestTargetPath,
  eventSummaryFor,
  mapBookingRequestEventSummary,
  mapBookingRequestNotificationSummary,
  shouldNotifyOwner,
} from '../activity';

describe('booking request activity helpers', () => {
  it('maps booking request events into UI summaries', () => {
    const mapped = mapBookingRequestEventSummary({
      id: 'event-1',
      booking_request_id: 'request-1',
      actor_profile_id: 'provider-1',
      actor_role: 'provider',
      event_type: 'provider_contacted',
      old_status: 'pending',
      new_status: 'contacted',
      summary: 'Pružatelj je označio upit kao kontaktiran',
      created_at: '2026-05-15T00:00:00.000Z',
    });

    expect(mapped.type).toBe('provider_contacted');
    expect(mapped.actorRole).toBe('provider');
    expect(mapped.oldStatus).toBe('pending');
    expect(mapped.newStatus).toBe('contacted');
    expect(mapped.createdAtLabel).toContain('2026');
  });

  it('maps notification rows and read state', () => {
    const mapped = mapBookingRequestNotificationSummary({
      id: 'notification-1',
      type: 'booking_request_withdrawn',
      title: 'Vlasnik je povukao upit',
      body: 'Luna više ne treba termin.',
      target_path: '/moje-usluge',
      read_at: null,
      created_at: '2026-05-15T00:00:00.000Z',
    });

    expect(mapped.type).toBe('booking_request_withdrawn');
    expect(mapped.targetPath).toBe('/moje-usluge');
    expect(mapped.readAt).toBeNull();
  });

  it('maps booking request message notifications without downgrading their type', () => {
    const mapped = mapBookingRequestNotificationSummary({
      id: 'notification-message-1',
      type: 'booking_request_message',
      title: 'Nova poruka za upit',
      body: 'Imaš novu poruku za upit.',
      target_path: '/moji-upiti?request=request-1#request-request-1',
      read_at: null,
      created_at: '2026-05-15T00:00:00.000Z',
    });

    expect(mapped.type).toBe('booking_request_message');
    expect(mapped.targetPath).toBe('/moji-upiti?request=request-1#request-request-1');
  });

  it('builds deep links to focused booking request cards', () => {
    expect(bookingRequestTargetPath('/moji-upiti', 'request 1')).toBe('/moji-upiti?request=request%201#request-request%201');
    expect(bookingRequestTargetPath('/moje-usluge', 'abc-123')).toBe('/moje-usluge?request=abc-123#request-abc-123');
  });

  it('keeps anonymous owners notification-free for owner-facing notifications', () => {
    expect(shouldNotifyOwner({ owner_profile_id: 'owner-1' })).toBe(true);
    expect(shouldNotifyOwner({ owner_profile_id: null })).toBe(false);
  });

  it('uses Croatian lifecycle copy', () => {
    expect(eventSummaryFor('created')).toBe('Novi upit je poslan');
    expect(eventSummaryFor('provider_contacted')).toBe('Pružatelj je označio upit kao kontaktiran');
    expect(eventSummaryFor('provider_closed')).toBe('Upit je zatvoren');
    expect(eventSummaryFor('owner_withdrawn')).toBe('Vlasnik je povukao upit');
  });
});

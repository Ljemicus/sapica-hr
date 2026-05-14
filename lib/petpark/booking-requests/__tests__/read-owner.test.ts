import { describe, expect, it } from 'vitest';
import { getOwnerBookingRequestStatusLabel, mapOwnerBookingRequestSummary, maskRequesterEmail, maskRequesterPhone } from '../read-owner';
import type { BookingRequestRow } from '../types';

const baseRow: BookingRequestRow = {
  id: 'request-1',
  provider_slug: 'osnovni-trening-poslusnosti-rijeka-31000000',
  provider_name: 'Maja Trainer',
  provider_city: 'Rijeka',
  provider_district: 'Centar',
  service_label: 'Osnovni trening poslušnosti',
  price_snapshot: '30 € / sat',
  response_time_snapshot: 'Odgovara unutar 24 h',
  mode: 'visit',
  start_date: '2026-06-01',
  end_date: '2026-06-03',
  pet_name: 'Luna',
  pet_type: 'pas',
  notes: 'Treba uvježbati hodanje na povodcu.',
  status: 'pending',
  source: 'web_request_flow',
  submitted_at: '2026-05-14T10:00:00.000Z',
  created_at: '2026-05-14T10:00:00.000Z',
  owner_profile_id: 'owner-1',
  requester_name: 'Niko',
  requester_email: 'niko@example.com',
  requester_phone: '+385 91 123 4567',
  contact_consent: true,
  contact_source: 'booking_request_form',
};

describe('owner booking request mapping', () => {
  it('maps owner request cards without exposing raw contact details', () => {
    const mapped = mapOwnerBookingRequestSummary(baseRow);

    expect(mapped.statusLabel).toBe('Poslano');
    expect(mapped.providerName).toBe('Maja Trainer');
    expect(mapped.serviceLabel).toBe('Osnovni trening poslušnosti');
    expect(mapped.dateRange).toContain('01. 06. 2026.');
    expect(mapped.contactMethod.email).toBe('ni••@example.com');
    expect(mapped.contactMethod.phone).toBe('+385••••567');
  });

  it('uses owner-facing status labels', () => {
    expect(getOwnerBookingRequestStatusLabel('pending')).toBe('Poslano');
    expect(getOwnerBookingRequestStatusLabel('contacted')).toBe('Kontaktiran');
    expect(getOwnerBookingRequestStatusLabel('closed')).toBe('Zatvoreno');
    expect(getOwnerBookingRequestStatusLabel('withdrawn')).toBe('Povučen');
    expect(getOwnerBookingRequestStatusLabel('unexpected')).toBe('Poslano');
  });

  it('masks requester contact methods', () => {
    expect(maskRequesterEmail('ab@example.com')).toBe('ab••@example.com');
    expect(maskRequesterEmail(null)).toBeNull();
    expect(maskRequesterPhone('+385 91 123 4567')).toBe('+385••••567');
    expect(maskRequesterPhone(null)).toBeNull();
  });
});

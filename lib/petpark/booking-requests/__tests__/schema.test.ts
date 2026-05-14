import { describe, expect, it } from 'vitest';
import { bookingRequestInputSchema, bookingRequestStatusActionSchema, canTransitionBookingRequestStatus } from '../schema';

const validPayload = {
  providerSlug: 'osnovni-trening-poslusnosti-rijeka-31000000',
  providerName: 'Maja Trainer',
  providerCity: 'Rijeka',
  providerDistrict: '',
  serviceLabel: 'Osnovni trening poslušnosti',
  priceSnapshot: '30 €',
  responseTimeSnapshot: 'Odgovara unutar 24 h',
  mode: 'visit' as const,
  startDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
  endDate: new Date(Date.now() + 172800000).toISOString().slice(0, 10),
  petName: 'Luna',
  petType: 'pas' as const,
  notes: 'Mirna kujica, osnovni trening.',
  requesterName: 'Niko Miljanić',
  requesterEmail: 'niko@example.com',
  requesterPhone: '',
  contactConsent: true as const,
};

describe('bookingRequestInputSchema', () => {
  it('accepts a valid booking request payload', () => {
    const parsed = bookingRequestInputSchema.safeParse(validPayload);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.mode).toBe('visit');
      expect(parsed.data.requesterEmail).toBe('niko@example.com');
    }
  });

  it('trims requester fields and lowercases email', () => {
    const parsed = bookingRequestInputSchema.safeParse({
      ...validPayload,
      requesterName: '  Niko Miljanić  ',
      requesterEmail: '  NIKO@EXAMPLE.COM  ',
      requesterPhone: '  +385 91 111 2222  ',
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.requesterName).toBe('Niko Miljanić');
      expect(parsed.data.requesterEmail).toBe('niko@example.com');
      expect(parsed.data.requesterPhone).toBe('+385 91 111 2222');
    }
  });

  it('accepts phone-only contact when consent is given', () => {
    expect(bookingRequestInputSchema.safeParse({ ...validPayload, requesterEmail: '', requesterPhone: '+385 91 111 2222' }).success).toBe(true);
  });

  it('rejects missing requester contact method', () => {
    expect(bookingRequestInputSchema.safeParse({ ...validPayload, requesterEmail: '', requesterPhone: '' }).success).toBe(false);
  });

  it('rejects missing contact consent', () => {
    expect(bookingRequestInputSchema.safeParse({ ...validPayload, contactConsent: false }).success).toBe(false);
  });

  it('rejects invalid requester email', () => {
    expect(bookingRequestInputSchema.safeParse({ ...validPayload, requesterEmail: 'not-email' }).success).toBe(false);
  });

  it('rejects missing pet name', () => {
    expect(bookingRequestInputSchema.safeParse({ ...validPayload, petName: '' }).success).toBe(false);
  });

  it('rejects an end date before the start date', () => {
    expect(bookingRequestInputSchema.safeParse({ ...validPayload, startDate: validPayload.endDate, endDate: validPayload.startDate }).success).toBe(false);
  });

  it('rejects past start dates', () => {
    expect(bookingRequestInputSchema.safeParse({ ...validPayload, startDate: '2020-01-01', endDate: '2020-01-02' }).success).toBe(false);
  });

  it('accepts only contacted or closed as provider action statuses', () => {
    expect(bookingRequestStatusActionSchema.safeParse({ status: 'contacted' }).success).toBe(true);
    expect(bookingRequestStatusActionSchema.safeParse({ status: 'closed' }).success).toBe(true);
    expect(bookingRequestStatusActionSchema.safeParse({ status: 'pending' }).success).toBe(false);
    expect(bookingRequestStatusActionSchema.safeParse({ status: 'confirmed' }).success).toBe(false);
  });

  it('allows only safe manual status transitions', () => {
    expect(canTransitionBookingRequestStatus('pending', 'contacted')).toBe(true);
    expect(canTransitionBookingRequestStatus('pending', 'closed')).toBe(true);
    expect(canTransitionBookingRequestStatus('contacted', 'closed')).toBe(true);
    expect(canTransitionBookingRequestStatus('contacted', 'contacted')).toBe(false);
    expect(canTransitionBookingRequestStatus('closed', 'contacted')).toBe(false);
    expect(canTransitionBookingRequestStatus('closed', 'closed')).toBe(false);
  });
});

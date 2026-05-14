import { z } from 'zod';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Odaberite valjani datum.');

export const bookingRequestInputSchema = z.object({
  providerSlug: z.string().trim().min(1).max(180),
  providerName: z.string().trim().min(1).max(160),
  providerCity: z.string().trim().min(1).max(120),
  providerDistrict: z.string().trim().max(120).optional().or(z.literal('')),
  serviceLabel: z.string().trim().min(1).max(180),
  priceSnapshot: z.string().trim().min(1).max(120),
  responseTimeSnapshot: z.string().trim().min(1).max(120),
  mode: z.literal('visit').optional().default('visit'),
  startDate: isoDate,
  endDate: isoDate,
  petName: z.string().trim().min(1, 'Unesite ime ljubimca.').max(80),
  petType: z.enum(['pas', 'macka', 'drugo']),
  notes: z.string().trim().max(1000).optional().default(''),
}).superRefine((value, ctx) => {
  const start = new Date(`${value.startDate}T00:00:00.000Z`);
  const end = new Date(`${value.endDate}T00:00:00.000Z`);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    ctx.addIssue({ code: 'custom', path: ['startDate'], message: 'Datumi nisu valjani.' });
    return;
  }

  if (start < today) {
    ctx.addIssue({ code: 'custom', path: ['startDate'], message: 'Datum početka ne može biti u prošlosti.' });
  }

  if (end < start) {
    ctx.addIssue({ code: 'custom', path: ['endDate'], message: 'Datum završetka ne može biti prije početka.' });
  }
});

export const bookingRequestStatusActionSchema = z.object({
  status: z.enum(['contacted', 'closed']),
});

export function canTransitionBookingRequestStatus(currentStatus: string, nextStatus: 'contacted' | 'closed') {
  if (currentStatus === 'closed') return false;
  if (currentStatus === 'pending') return nextStatus === 'contacted' || nextStatus === 'closed';
  if (currentStatus === 'contacted') return nextStatus === 'closed';
  return false;
}

export type BookingRequestInputPayload = z.infer<typeof bookingRequestInputSchema>;
export type BookingRequestStatusActionPayload = z.infer<typeof bookingRequestStatusActionSchema>;

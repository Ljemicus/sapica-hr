import { NextResponse } from 'next/server';
import { apiError } from '@/lib/api-errors';
import { getAuthUser } from '@/lib/auth';
import { getBookings, createBooking, getSitter, getPet } from '@/lib/db';
import { appLogger } from '@/lib/logger';
import { bookingSchema } from '@/lib/validations';
import { SERVICE_LABELS, type ServiceType } from '@/lib/types';
import { sendEmail } from '@/lib/email';
import { newBookingRequestEmail } from '@/lib/email-templates';

export async function GET(request: Request) {
  const user = await getAuthUser();
  if (!user) return apiError({ status: 401, code: 'UNAUTHORIZED', message: 'Unauthorized' });

  const { searchParams } = new URL(request.url);
  const fieldsParam = searchParams.get('fields');
  const role = user.role === 'sitter' ? 'sitter' : 'owner';
  const fields: 'full' | 'owner-history' = role === 'owner' && fieldsParam === 'owner-history' ? 'owner-history' : 'full';

  const bookings = fields === 'owner-history'
    ? await getBookings(user.id, role, 'owner-history')
    : await getBookings(user.id, role, 'full');
  return NextResponse.json(bookings);
}

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return apiError({ status: 401, code: 'UNAUTHORIZED', message: 'Unauthorized' });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError({ status: 400, code: 'INVALID_JSON', message: 'Invalid JSON body' });
  }
  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    appLogger.warn('bookings.create', 'Booking validation failed');
    return apiError({ status: 400, code: 'INVALID_INPUT', message: 'Neispravan booking payload.', details: parsed.error.flatten() });
  }

  const { sitter_id, pet_id, service_type, start_date, end_date, note } = parsed.data;

  const start = new Date(start_date);
  const end = new Date(end_date);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return apiError({ status: 400, code: 'INVALID_BOOKING_DATES', message: 'Booking datumi nisu valjani.' });
  }

  if (end < start) {
    return apiError({ status: 400, code: 'INVALID_BOOKING_RANGE', message: 'Datum završetka ne može biti prije datuma početka.' });
  }

  const startDay = new Date(start);
  startDay.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (startDay < today) {
    return apiError({ status: 400, code: 'BOOKING_IN_PAST', message: 'Booking ne može početi u prošlosti.' });
  }

  const sitterProfile = await getSitter(sitter_id);
  if (!sitterProfile) {
    appLogger.warn('bookings.create', 'Sitter profile missing', { sitterId: sitter_id });
    return apiError({ status: 404, code: 'SITTER_NOT_FOUND', message: 'Sitter not found' });
  }

  const pricePerDay = sitterProfile.prices[service_type as keyof typeof sitterProfile.prices] || 0;

  if (pricePerDay <= 0) {
    return apiError({ status: 400, code: 'SERVICE_UNAVAILABLE', message: 'Odabrana usluga nije dostupna za ovog sittera.' });
  }

  const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  const total_price = pricePerDay * days;

  const booking = await createBooking({
    owner_id: user.id,
    sitter_id,
    pet_id,
    service_type,
    start_date,
    end_date,
    total_price,
    note: note || null,
    status: 'pending',
  });

  if (!booking) {
    appLogger.error('bookings.create', 'Failed to create booking', {
      ownerId: user.id,
      sitterId: sitter_id,
      petId: pet_id,
    });
    return apiError({ status: 500, code: 'BOOKING_CREATE_FAILED', message: 'Failed to create booking' });
  }

  // Best-effort: notify sitter via email
  try {
    const pet = await getPet(pet_id);
    const sitterEmail = sitterProfile.user?.email;
    if (sitterEmail) {
      const dates = `${new Date(start_date).toLocaleDateString('hr-HR')} – ${new Date(end_date).toLocaleDateString('hr-HR')}`;
      const serviceName = SERVICE_LABELS[service_type as ServiceType] || service_type;
      sendEmail({
        to: sitterEmail,
        subject: 'Novi upit za čuvanje!',
        html: newBookingRequestEmail(
          sitterProfile.user?.name || 'Čuvar',
          user.name || 'Korisnik',
          pet?.name || 'Ljubimac',
          serviceName,
          dates,
        ),
      }).catch((err) => appLogger.error('bookings.create', 'Failed to send booking request email', { error: String(err) }));
    }
  } catch (emailErr) {
    appLogger.error('bookings.create', 'Email notification error', { error: String(emailErr) });
  }

  return NextResponse.json(booking, { status: 201 });
}

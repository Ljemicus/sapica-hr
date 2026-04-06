import { NextResponse } from 'next/server';
import { apiError } from '@/lib/api-errors';
import { getAuthUser } from '@/lib/auth';
import { getBookings, createBooking, getSitter, getPet } from '@/lib/db';
import { dispatchAlert } from '@/lib/alerting';
import { getRequestId, createScopedLogger } from '@/lib/request-context';
import { bookingSchema } from '@/lib/validations';
import { SERVICE_LABELS, type ServiceType } from '@/lib/types';
import { sendEmail } from '@/lib/email';
import { newBookingRequestEmail } from '@/lib/email-templates';
import { calculatePlatformFee } from '@/lib/payment';
import { sendPushToMultiple, NotificationTemplates } from '@/lib/push-notifications';
import { getUserPushSubscriptions, canSendNotification } from '@/lib/db/notifications';
import { sendSMS } from '@/lib/sms';

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
  const reqId = getRequestId(request);
  const log = createScopedLogger('bookings.create', reqId);
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
    log.warn( 'Booking validation failed');
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

  if (sitter_id === user.id) {
    return apiError({ status: 400, code: 'SELF_BOOKING', message: 'Ne možete rezervirati vlastiti profil.' });
  }

  const sitterProfile = await getSitter(sitter_id);
  if (!sitterProfile) {
    log.warn( 'Sitter profile missing', { sitterId: sitter_id });
    return apiError({ status: 404, code: 'SITTER_NOT_FOUND', message: 'Sitter not found' });
  }

  const pricePerDay = sitterProfile.prices[service_type as keyof typeof sitterProfile.prices] || 0;

  if (pricePerDay <= 0) {
    return apiError({ status: 400, code: 'SERVICE_UNAVAILABLE', message: 'Odabrana usluga nije dostupna za ovog sittera.' });
  }

  const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  const total_price = pricePerDay * days;
  const platform_fee = calculatePlatformFee(Math.round(total_price * 100)) / 100;

  const booking = await createBooking({
    owner_id: user.id,
    sitter_id,
    pet_id,
    service_type,
    start_date,
    end_date,
    total_price,
    platform_fee,
    payment_status: 'unpaid',
    currency: 'EUR',
    note: note || null,
    status: 'pending',
  });

  if (!booking) {
    log.error( 'Failed to create booking', {
      ownerId: user.id,
      sitterId: sitter_id,
      petId: pet_id,
    });
    dispatchAlert({
      severity: 'P1',
      service: 'bookings.create',
      description: 'Booking creation failed (DB write returned null)',
      value: `owner=${user.id} sitter=${sitter_id}`,
      owner: 'bookings',
    }).catch(() => {});
    return apiError({ status: 500, code: 'BOOKING_CREATE_FAILED', message: 'Failed to create booking' });
  }

  // Best-effort: notify sitter via email + push
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
      }).catch((err) => log.error( 'Failed to send booking request email', { error: String(err) }));
    }

    // Send push notification to sitter
    const canSendPush = await canSendNotification(sitter_id, 'push', 'bookings');
    if (canSendPush) {
      const subscriptions = await getUserPushSubscriptions(sitter_id);
      if (subscriptions.length > 0) {
        const pushPayload = NotificationTemplates.bookingRequest(
          user.name || 'Korisnik',
          pet?.name || 'ljubimca'
        );
        sendPushToMultiple(
          subscriptions.map(sub => ({
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          })),
          pushPayload
        ).then(results => {
          if (results.expired.length > 0) {
            log.info('Cleaned up expired push subscriptions', { count: results.expired.length });
          }
        }).catch(err => {
          log.error('Failed to send push notification', { error: String(err) });
        });
      }
    }

    // Send SMS notification if enabled
    const canSendSMS = await canSendNotification(sitter_id, 'sms', 'bookings');
    if (canSendSMS && sitterProfile.user?.phone) {
      const smsMessage = `PetPark: Novi upit za cuvanje od ${user.name || 'Korisnik'} za ${pet?.name || 'ljubimca'}. Provjerite u aplikaciji.`;
      sendSMS({ to: sitterProfile.user.phone, message: smsMessage }).catch(err => {
        log.error('Failed to send SMS', { error: String(err) });
      });
    }
  } catch (notifyErr) {
    log.error( 'Notification error', { error: String(notifyErr) });
  }

  return NextResponse.json(booking, { status: 201 });
}

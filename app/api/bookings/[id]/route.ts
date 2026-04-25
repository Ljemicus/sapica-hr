import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getBooking, updateBooking } from '@/lib/db';
import type { Booking, BookingStatus } from '@/lib/types';
import { dispatchAlert } from '@/lib/alerting';
import { appLogger } from '@/lib/logger';
import { sendEmail } from '@/lib/email';
import { bookingAcceptedEmail, bookingRejectedEmail, bookingCancelledEmail } from '@/lib/email-templates';
import { sendPushToMultiple, NotificationTemplates } from '@/lib/push-notifications';
import { getUserPushSubscriptions, canSendNotification } from '@/lib/db/notifications';

interface BookingRouteError {
  error: string;
}

const VALID_STATUSES: BookingStatus[] = ['accepted', 'rejected', 'completed', 'cancelled'];
const OWNER_ALLOWED = new Set<BookingStatus>(['cancelled']);
const SITTER_ALLOWED = new Set<BookingStatus>(['accepted', 'rejected', 'completed', 'cancelled']);

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getAuthUser();
  if (!user) return NextResponse.json<BookingRouteError>({ error: 'Unauthorized' }, { status: 401 });

  const booking = await getBooking(id);
  if (!booking) return NextResponse.json<BookingRouteError>({ error: 'Booking not found' }, { status: 404 });
  if (booking.owner_id !== user.id && booking.sitter_id !== user.id && !user.isAdmin) {
    return NextResponse.json<BookingRouteError>({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json<Booking>(booking);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getAuthUser();
  if (!user) return NextResponse.json<BookingRouteError>({ error: 'Unauthorized' }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<BookingRouteError>({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const { status } = body as { status?: BookingStatus };

  if (!status || !VALID_STATUSES.includes(status)) {
    return NextResponse.json<BookingRouteError>({ error: 'Invalid status' }, { status: 400 });
  }

  const booking = await getBooking(id);
  if (!booking) return NextResponse.json<BookingRouteError>({ error: 'Booking not found' }, { status: 404 });

  const isOwner = booking.owner_id === user.id;
  const isSitter = booking.sitter?.id === user.id;
  if (!isOwner && !isSitter) {
    return NextResponse.json<BookingRouteError>({ error: 'Forbidden' }, { status: 403 });
  }

  if (isOwner && !OWNER_ALLOWED.has(status)) {
    return NextResponse.json<BookingRouteError>({ error: 'Owner može samo otkazati rezervaciju.' }, { status: 403 });
  }

  if (isSitter && !SITTER_ALLOWED.has(status)) {
    return NextResponse.json<BookingRouteError>({ error: 'Sitter ne može postaviti taj status.' }, { status: 403 });
  }

  if (status === 'cancelled' && (booking.status === 'completed' || booking.status === 'rejected' || booking.status === 'cancelled')) {
    return NextResponse.json<BookingRouteError>({ error: 'Završene, odbijene ili već otkazane rezervacije ne mogu se otkazati.' }, { status: 400 });
  }

  if (status === 'completed' && booking.status !== 'accepted') {
    return NextResponse.json<BookingRouteError>({ error: 'Rezervacija mora biti prihvaćena prije završetka.' }, { status: 400 });
  }

  if ((status === 'accepted' || status === 'rejected') && booking.status !== 'pending') {
    return NextResponse.json<BookingRouteError>({ error: 'Samo pending rezervacije mogu biti prihvaćene ili odbijene.' }, { status: 400 });
  }

  const updated = await updateBooking(id, { status });
  if (!updated) {
    dispatchAlert({
      severity: 'P1',
      service: 'bookings.update',
      description: 'Booking status update failed (DB write returned null)',
      value: `bookingId=${id} status=${status}`,
      owner: 'bookings',
    }).catch(() => {});
    return NextResponse.json<BookingRouteError>({ error: 'Booking update failed' }, { status: 500 });
  }

  // Best-effort: send status notification emails + push
  try {
    const dates = `${new Date(booking.start_date).toLocaleDateString('hr-HR')} – ${new Date(booking.end_date).toLocaleDateString('hr-HR')}`;
    const petName = booking.pet?.name || 'Ljubimac';

    if (status === 'accepted' && booking.owner?.email) {
      sendEmail({
        to: booking.owner.email,
        subject: 'Rezervacija potvrđena!',
        html: bookingAcceptedEmail(
          booking.owner.name || 'Korisnik',
          booking.sitter?.name || 'Čuvar',
          petName,
          dates,
        ),
      }).catch((err) => appLogger.error('bookings.update', 'Failed to send accepted email', { error: String(err) }));

      // Push notification to owner
      const canSendPush = await canSendNotification(booking.owner_id, 'push', 'bookings');
      if (canSendPush) {
        const subscriptions = await getUserPushSubscriptions(booking.owner_id);
        if (subscriptions.length > 0) {
          const pushPayload = NotificationTemplates.bookingAccepted(
            booking.sitter?.name || 'Čuvar',
            petName
          );
          sendPushToMultiple(
            subscriptions.map(sub => ({
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            })),
            pushPayload
          ).catch(err => {
            appLogger.error('bookings.update', 'Failed to send push notification', { error: String(err) });
          });
        }
      }
    }

    if (status === 'rejected' && booking.owner?.email) {
      sendEmail({
        to: booking.owner.email,
        subject: 'Rezervacija odbijena',
        html: bookingRejectedEmail(
          booking.owner.name || 'Korisnik',
          booking.sitter?.name || 'Čuvar',
          petName,
          dates,
        ),
      }).catch((err) => appLogger.error('bookings.update', 'Failed to send rejected email', { error: String(err) }));
    }

    if (status === 'cancelled') {
      // Notify the other party
      const recipientEmail = isOwner ? booking.sitter?.email : booking.owner?.email;
      const recipientName = isOwner ? booking.sitter?.name : booking.owner?.name;
      const recipientId = isOwner ? booking.sitter?.id || '' : booking.owner_id;
      if (recipientEmail) {
        sendEmail({
          to: recipientEmail,
          subject: 'Rezervacija otkazana',
          html: bookingCancelledEmail(recipientName || 'Korisnik', petName, dates),
        }).catch((err) => appLogger.error('bookings.update', 'Failed to send cancelled email', { error: String(err) }));
      }

      // Push notification
      const canSendPush = await canSendNotification(recipientId, 'push', 'bookings');
      if (canSendPush) {
        const subscriptions = await getUserPushSubscriptions(recipientId);
        if (subscriptions.length > 0) {
          const pushPayload = NotificationTemplates.bookingUpdated(
            petName,
            'Otkazano'
          );
          sendPushToMultiple(
            subscriptions.map(sub => ({
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            })),
            pushPayload
          ).catch(err => {
            appLogger.error('bookings.update', 'Failed to send push notification', { error: String(err) });
          });
        }
      }
    }
  } catch (notifyErr) {
    appLogger.error('bookings.update', 'Notification error', { error: String(notifyErr) });
  }

  return NextResponse.json<Booking>(updated);
}

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import { rateLimit } from '@/lib/rate-limit';
import {
  newBookingRequestEmail,
  bookingAcceptedEmail,
  bookingCancelledEmail,
  newMessageEmail,
  walkUpdateEmail,
  welcomeEmail,
} from '@/lib/email-templates';

const ALLOWED_TYPES = new Set(['booking_request', 'booking_accepted', 'booking_cancelled', 'new_message', 'walk_update', 'welcome'] as const);
type NotificationType = 'booking_request' | 'booking_accepted' | 'booking_cancelled' | 'new_message' | 'walk_update' | 'welcome';

function isAllowedRecipient(userEmail: string | null | undefined, to: string) {
  if (!userEmail) return false;
  return userEmail.toLowerCase() === to.toLowerCase();
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimit(`notifications:${user.id}:${ip}`, 5, 60_000)) {
      return NextResponse.json({ error: 'Previše zahtjeva. Pokušajte kasnije.' }, { status: 429 });
    }

    const body = await request.json();
    const { type, to, data } = body as { type: NotificationType; to: string; data: Record<string, string> };

    if (!type || !to || !ALLOWED_TYPES.has(type)) {
      return NextResponse.json({ error: 'Invalid notification request' }, { status: 400 });
    }

    if (!isAllowedRecipient(user.email, to)) {
      return NextResponse.json({ error: 'Slanje emaila na proizvoljne adrese nije dozvoljeno.' }, { status: 403 });
    }

    let subject = '';
    let html = '';

    switch (type) {
      case 'booking_request':
        subject = 'Novi upit za čuvanje!';
        html = newBookingRequestEmail(data.sitterName, data.ownerName, data.petName, data.serviceName, data.dates);
        break;
      case 'booking_accepted':
        subject = 'Rezervacija potvrđena!';
        html = bookingAcceptedEmail(data.ownerName, data.sitterName, data.petName, data.dates);
        break;
      case 'booking_cancelled':
        subject = 'Rezervacija otkazana';
        html = bookingCancelledEmail(data.recipientName, data.petName, data.dates);
        break;
      case 'new_message':
        subject = 'Nova poruka na PetParku';
        html = newMessageEmail(data.recipientName, data.senderName);
        break;
      case 'walk_update':
        subject = 'Vaš ljubimac je na šetnji!';
        html = walkUpdateEmail(data.ownerName, data.petName, data.sitterName);
        break;
      case 'welcome':
        subject = 'Dobrodošli na PetPark!';
        html = welcomeEmail(data.userName);
        break;
    }

    const result = await sendEmail({ to, subject, html });
    if (!result.success) {
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

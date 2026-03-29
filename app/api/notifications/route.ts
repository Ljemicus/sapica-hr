import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import {
  newBookingRequestEmail,
  bookingAcceptedEmail,
  bookingCancelledEmail,
  newMessageEmail,
  walkUpdateEmail,
  welcomeEmail,
} from '@/lib/email-templates';

type NotificationType = 'booking_request' | 'booking_accepted' | 'booking_cancelled' | 'new_message' | 'walk_update' | 'welcome';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, to, data } = body as { type: NotificationType; to: string; data: Record<string, string> };

    if (!type || !to) {
      return NextResponse.json({ error: 'Missing type or to' }, { status: 400 });
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
      default:
        return NextResponse.json({ error: 'Unknown notification type' }, { status: 400 });
    }

    const result = await sendEmail({ to, subject, html });

    if (!result.success) {
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Notification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

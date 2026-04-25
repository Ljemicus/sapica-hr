import { NextResponse } from 'next/server';
import { appLogger } from '@/lib/logger';
import { dispatchAlert } from '@/lib/alerting';
import { getAuthUser } from '@/lib/auth';
import { createRefund, formatCurrency } from '@/lib/payment';
import { createClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email';
import { bookingCancelledEmail } from '@/lib/email-templates';

type RefundReason = 'owner_cancel' | 'provider_cancel' | 'other';

type BookingRow = {
  id: string;
  owner_profile_id: string;
  provider_id: string;
  starts_at: string;
  ends_at: string;
  total_amount: number;
  payment_status: string;
  currency: string | null;
  status: string;
  owner?: { name: string | null; email: string | null } | null;
  provider?: {
    display_name: string | null;
    email: string | null;
    profile?: { display_name: string | null; email: string | null } | null;
  } | null;
  pet?: { name: string | null } | null;
};

type PaymentRow = {
  stripe_payment_intent_id: string | null;
};

function calculateRefundPercentage(startDate: string, reason: RefundReason): number {
  if (reason === 'provider_cancel') return 100;

  const now = new Date();
  const start = new Date(startDate);
  const hoursUntilStart = (start.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursUntilStart >= 48) return 100;
  if (hoursUntilStart >= 24) return 50;
  return 0;
}

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Nemate pristup.' }, { status: 401 });
  }

  let body: { bookingId: string; reason: RefundReason };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Neispravan zahtjev.' }, { status: 400 });
  }

  const { bookingId, reason } = body;
  if (!bookingId || !reason) {
    return NextResponse.json({ error: 'Nedostaju polja: bookingId, reason.' }, { status: 400 });
  }

  const validReasons: RefundReason[] = ['owner_cancel', 'provider_cancel', 'other'];
  if (!validReasons.includes(reason)) {
    return NextResponse.json({ error: 'Neispravan razlog otkazivanja.' }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select(`
      id,
      owner_profile_id,
      provider_id,
      starts_at,
      ends_at,
      total_amount,
      payment_status,
      currency,
      status,
      owner:profiles!bookings_owner_profile_id_fkey(display_name, email),
      provider:providers!bookings_provider_id_fkey(display_name, email, profile:profiles!providers_profile_id_fkey(display_name, email)),
      pet:pets!bookings_pet_id_fkey(name)
    `)
    .eq('id', bookingId)
    .single<BookingRow>();

  if (bookingError || !booking) {
    return NextResponse.json({ error: 'Rezervacija nije pronađena.' }, { status: 404 });
  }

  const isOwner = booking.owner_profile_id === user.id;
  const isProvider = booking.provider?.profile?.email !== undefined
    ? booking.provider_id === user.id || false
    : booking.provider_id === user.id;

  if (!isOwner && !isProvider && !user.isAdmin) {
    return NextResponse.json({ error: 'Nemate pristup ovoj rezervaciji.' }, { status: 403 });
  }

  if (reason === 'provider_cancel' && !isProvider && !user.isAdmin) {
    return NextResponse.json({ error: 'Samo pružatelj može otkazati kao provider_cancel.' }, { status: 403 });
  }
  if (reason === 'owner_cancel' && !isOwner && !user.isAdmin) {
    return NextResponse.json({ error: 'Samo vlasnik može otkazati kao owner_cancel.' }, { status: 403 });
  }

  if (booking.payment_status !== 'paid') {
    return NextResponse.json({ error: 'Rezervacija nije plaćena.' }, { status: 400 });
  }

  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .select('stripe_payment_intent_id')
    .eq('booking_id', bookingId)
    .single<PaymentRow>();

  if (paymentError || !payment?.stripe_payment_intent_id) {
    return NextResponse.json({ error: 'Nema podataka o plaćanju za povrat.' }, { status: 400 });
  }

  const refundPercentage = calculateRefundPercentage(booking.starts_at, reason);
  const totalCents = Math.round(Number(booking.total_amount) * 100);
  const refundAmountCents = Math.round(totalCents * (refundPercentage / 100));

  if (refundPercentage === 0) {
    await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId);

    return NextResponse.json({
      refundId: null,
      amount: 0,
      amountFormatted: formatCurrency(0),
      percentage: 0,
      status: 'denied',
      message: 'Otkazivanje manje od 24 sata prije početka ne podliježe povratu.',
    });
  }

  try {
    const { refundId } = await createRefund(payment.stripe_payment_intent_id, refundAmountCents);

    await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        payment_status: 'refunded',
      })
      .eq('id', bookingId);

    await supabase
      .from('payments')
      .update({
        status: 'refunded',
        raw_provider_payload: {
          refund_id: refundId,
          refund_amount: refundAmountCents / 100,
          refund_reason: reason,
        },
      })
      .eq('booking_id', bookingId);

    try {
      const petName = booking.pet?.name || 'Ljubimac';
      const ownerName = booking.owner?.name || 'Korisnik';
      const providerName = booking.provider?.profile?.display_name || booking.provider?.display_name || 'Pružatelj';
      const dates = `${new Date(booking.starts_at).toLocaleDateString('hr-HR')} – ${new Date(booking.ends_at).toLocaleDateString('hr-HR')}`;
      const recipientEmail = isOwner ? (booking.provider?.profile?.email || booking.provider?.email) : booking.owner?.email;
      const recipientName = isOwner ? providerName : ownerName;

      if (recipientEmail) {
        sendEmail({
          to: recipientEmail,
          subject: 'Rezervacija otkazana — povrat sredstava',
          html: bookingCancelledEmail(recipientName, petName, dates),
        }).catch((err) => appLogger.error('payments.refund', 'Failed to send cancellation email', { error: String(err) }));
      }
    } catch (emailErr) {
      appLogger.error('payments.refund', 'Email notification error', { error: String(emailErr) });
    }

    return NextResponse.json({
      refundId,
      amount: refundAmountCents,
      amountFormatted: formatCurrency(refundAmountCents),
      percentage: refundPercentage,
      status: 'succeeded',
      message: refundPercentage === 100 ? 'Puni povrat sredstava.' : `Djelomični povrat (${refundPercentage}%).`,
    });
  } catch (err) {
    appLogger.error('payments.refund', 'Refund creation failed', { error: String(err) });
    dispatchAlert({
      severity: 'P1',
      service: 'payments.refund',
      description: 'Stripe refund creation failed — user expecting money back',
      value: `booking=${bookingId}, amount=${refundAmountCents}`,
      owner: 'platform',
    });
    return NextResponse.json(
      { error: 'Greška pri povratu sredstava. Pokušajte ponovo.' },
      { status: 500 }
    );
  }
}

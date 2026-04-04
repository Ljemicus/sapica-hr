import { NextResponse } from 'next/server';
import { appLogger } from '@/lib/logger';
import { dispatchAlert } from '@/lib/alerting';
import { getAuthUser } from '@/lib/auth';
import { createRefund, formatCurrency } from '@/lib/payment';
import { createClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email';
import { bookingCancelledEmail } from '@/lib/email-templates';

type RefundReason = 'owner_cancel' | 'sitter_cancel' | 'other';

function calculateRefundPercentage(
  startDate: string,
  reason: RefundReason
): number {
  if (reason === 'sitter_cancel') return 100;

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

  const validReasons: RefundReason[] = ['owner_cancel', 'sitter_cancel', 'other'];
  if (!validReasons.includes(reason)) {
    return NextResponse.json({ error: 'Neispravan razlog otkazivanja.' }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .single();

  if (bookingError || !booking) {
    return NextResponse.json({ error: 'Rezervacija nije pronađena.' }, { status: 404 });
  }

  // Check authorization
  const isOwner = booking.owner_id === user.id;
  const isSitter = booking.sitter_id === user.id;
  if (!isOwner && !isSitter && user.role !== 'admin') {
    return NextResponse.json({ error: 'Nemate pristup ovoj rezervaciji.' }, { status: 403 });
  }

  // Validate reason matches the actor to prevent owners claiming sitter_cancel for 100% refund
  if (reason === 'sitter_cancel' && !isSitter && user.role !== 'admin') {
    return NextResponse.json({ error: 'Samo čuvar može otkazati kao sitter_cancel.' }, { status: 403 });
  }
  if (reason === 'owner_cancel' && !isOwner && user.role !== 'admin') {
    return NextResponse.json({ error: 'Samo vlasnik može otkazati kao owner_cancel.' }, { status: 403 });
  }

  if (booking.payment_status !== 'paid') {
    return NextResponse.json({ error: 'Rezervacija nije plaćena.' }, { status: 400 });
  }

  if (!booking.stripe_payment_intent_id) {
    return NextResponse.json({ error: 'Nema podataka o plaćanju za povrat.' }, { status: 400 });
  }

  const refundPercentage = calculateRefundPercentage(booking.start_date, reason);
  const totalCents = Math.round(booking.total_price * 100);
  const refundAmountCents = Math.round(totalCents * (refundPercentage / 100));

  if (refundPercentage === 0) {
    // Still cancel the booking even if no refund is given
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
    const { refundId } = await createRefund(
      booking.stripe_payment_intent_id,
      refundAmountCents
    );

    // Update booking
    await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        payment_status: 'refunded',
      })
      .eq('id', bookingId);

    // Log refund in payments
    await supabase.from('payments').insert({
      booking_id: bookingId,
      stripe_payment_intent_id: booking.stripe_payment_intent_id,
      amount: refundAmountCents,
      platform_fee: 0,
      sitter_payout: 0,
      currency: booking.currency || 'EUR',
      status: 'refunded',
      refund_id: refundId,
      refund_amount: refundAmountCents,
    });

    // Best-effort: send cancellation email to the other party
    try {
      const { data: bookingDetails } = await supabase
        .from('bookings')
        .select('start_date, end_date, owner:users!owner_id(name, email), sitter:users!sitter_id(name, email), pet:pets(name)')
        .eq('id', bookingId)
        .single();

      if (bookingDetails) {
        const dates = `${new Date(bookingDetails.start_date).toLocaleDateString('hr-HR')} – ${new Date(bookingDetails.end_date).toLocaleDateString('hr-HR')}`;
        const pet = bookingDetails.pet as unknown as { name: string } | null;
        const owner = bookingDetails.owner as unknown as { name: string; email: string } | null;
        const sitter = bookingDetails.sitter as unknown as { name: string; email: string } | null;
        const petName = pet?.name || 'Ljubimac';
        const recipientEmail = isOwner ? sitter?.email : owner?.email;
        const recipientName = isOwner ? sitter?.name : owner?.name;

        if (recipientEmail) {
          sendEmail({
            to: recipientEmail,
            subject: 'Rezervacija otkazana — povrat sredstava',
            html: bookingCancelledEmail(recipientName || 'Korisnik', petName, dates),
          }).catch((err) => appLogger.error('payments.refund', 'Failed to send cancellation email', { error: String(err) }));
        }
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
      message:
        refundPercentage === 100
          ? 'Puni povrat sredstava.'
          : `Djelomični povrat (${refundPercentage}%).`,
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

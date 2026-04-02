import { NextResponse } from 'next/server';
import { appLogger } from '@/lib/logger';
import { getAuthUser } from '@/lib/auth';
import { createRefund, formatCurrency } from '@/lib/payment';
import { createClient } from '@/lib/supabase/server';

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
  if (booking.owner_id !== user.id && booking.sitter_id !== user.id && user.role !== 'admin') {
    return NextResponse.json({ error: 'Nemate pristup ovoj rezervaciji.' }, { status: 403 });
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
    return NextResponse.json(
      { error: 'Greška pri povratu sredstava. Pokušajte ponovo.' },
      { status: 500 }
    );
  }
}

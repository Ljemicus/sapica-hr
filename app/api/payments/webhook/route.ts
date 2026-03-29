import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { calculateSitterPayout, calculatePlatformFee } from '@/lib/payment';
import { createClient } from '@/lib/supabase/server';
import type Stripe from 'stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret || webhookSecret.includes('REPLACE')) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    console.error('[Webhook] Signature verification failed');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = await createClient();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.bookingId;

      if (bookingId) {
        const amountTotal = session.amount_total || 0;
        const platformFee = calculatePlatformFee(amountTotal);
        const sitterPayout = calculateSitterPayout(amountTotal);

        // Update booking
        await supabase
          .from('bookings')
          .update({
            payment_status: 'paid',
            stripe_payment_intent_id: typeof session.payment_intent === 'string'
              ? session.payment_intent
              : session.payment_intent?.id || null,
            stripe_session_id: session.id,
            platform_fee: platformFee / 100,
          })
          .eq('id', bookingId);

        // Log payment
        await supabase.from('payments').insert({
          booking_id: bookingId,
          stripe_payment_intent_id: typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id || null,
          stripe_session_id: session.id,
          amount: amountTotal,
          platform_fee: platformFee,
          sitter_payout: sitterPayout,
          currency: session.currency || 'eur',
          status: 'succeeded',
        });

        }
      break;
    }

    case 'payment_intent.succeeded': {
      break;
    }

    case 'payment_intent.payment_failed': {
      const pi = event.data.object as Stripe.PaymentIntent;
      const bookingId = pi.metadata?.bookingId;

      if (bookingId) {
        await supabase
          .from('bookings')
          .update({ payment_status: 'failed' })
          .eq('id', bookingId);
      }
      break;
    }

    case 'account.updated': {
      const account = event.data.object as Stripe.Account;

      // Update sitter onboarding status
      await supabase
        .from('sitter_profiles')
        .update({
          stripe_onboarding_complete: account.details_submitted || false,
          payout_enabled: account.payouts_enabled || false,
        })
        .eq('stripe_account_id', account.id);
      break;
    }

    case 'charge.dispute.created': {
      const dispute = event.data.object as Stripe.Dispute;
      console.error(`[Webhook] ⚠️ DISPUTE created: ${dispute.id} — amount: €${((dispute.amount || 0) / 100).toFixed(2)}`);
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}

import { NextResponse } from 'next/server';
import { apiError } from '@/lib/api-errors';
import { getStripe } from '@/lib/stripe';
import { calculateSitterPayout, calculatePlatformFee } from '@/lib/payment';
import { appLogger } from '@/lib/logger';
import { createClient } from '@/lib/supabase/server';
import type Stripe from 'stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret || webhookSecret.includes('REPLACE')) {
    return apiError({ status: 500, code: 'WEBHOOK_UNAVAILABLE', message: 'Webhook not configured' });
  }

  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig) {
    appLogger.warn('payments.webhook', 'Missing stripe-signature header');
    return apiError({ status: 400, code: 'SIGNATURE_MISSING', message: 'Missing stripe-signature header' });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    appLogger.error('payments.webhook', 'Signature verification failed');
    return apiError({ status: 400, code: 'INVALID_SIGNATURE', message: 'Invalid signature' });
  }

  const supabase = await createClient();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.bookingId;

      if (!bookingId) {
        appLogger.warn('payments.webhook', 'checkout.session.completed missing bookingId metadata', {
          sessionId: session.id,
        });
        break;
      }

      const amountTotal = session.amount_total || 0;
      if (amountTotal <= 0) {
        appLogger.error('payments.webhook', 'checkout.session.completed has invalid amount', {
          sessionId: session.id,
          bookingId,
          amountTotal,
        });
        break;
      }

      {
        const platformFee = calculatePlatformFee(amountTotal);
        const sitterPayout = calculateSitterPayout(amountTotal);

        // Update booking
        const { error: bookingUpdateError } = await supabase
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

        if (bookingUpdateError) {
          appLogger.error('payments.webhook', 'Failed to update booking after checkout completion', {
            bookingId,
            sessionId: session.id,
            reason: bookingUpdateError.message,
          });
          break;
        }

        // Log payment
        const { error: paymentInsertError } = await supabase.from('payments').insert({
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

        if (paymentInsertError) {
          appLogger.error('payments.webhook', 'Failed to insert payment log after checkout completion', {
            bookingId,
            sessionId: session.id,
            reason: paymentInsertError.message,
          });
        }
      }
      break;
    }

    case 'payment_intent.succeeded': {
      break;
    }

    case 'payment_intent.payment_failed': {
      const pi = event.data.object as Stripe.PaymentIntent;
      const bookingId = pi.metadata?.bookingId;

      if (!bookingId) {
        appLogger.warn('payments.webhook', 'payment_intent.payment_failed missing bookingId metadata', {
          paymentIntentId: pi.id,
        });
        break;
      }

      const { error: paymentFailedUpdateError } = await supabase
        .from('bookings')
        .update({ payment_status: 'failed' })
        .eq('id', bookingId);

      if (paymentFailedUpdateError) {
        appLogger.error('payments.webhook', 'Failed to mark booking payment as failed', {
          bookingId,
          paymentIntentId: pi.id,
          reason: paymentFailedUpdateError.message,
        });
      }
      break;
    }

    case 'account.updated': {
      const account = event.data.object as Stripe.Account;

      // Update sitter onboarding status
      const { error: accountUpdateError } = await supabase
        .from('sitter_profiles')
        .update({
          stripe_onboarding_complete: account.details_submitted || false,
          payout_enabled: account.payouts_enabled || false,
        })
        .eq('stripe_account_id', account.id);

      if (accountUpdateError) {
        appLogger.error('payments.webhook', 'Failed to update sitter onboarding status', {
          stripeAccountId: account.id,
          reason: accountUpdateError.message,
        });
      }
      break;
    }

    case 'charge.dispute.created': {
      const dispute = event.data.object as Stripe.Dispute;
      appLogger.error('payments.webhook', 'Dispute created', {
        disputeId: dispute.id,
        amount: dispute.amount || 0,
      });
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}

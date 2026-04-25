import Stripe from 'stripe';

// ── Server-side Stripe client ──

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey || secretKey.includes('REPLACE')) {
    throw new Error('STRIPE_SECRET_KEY nije konfiguriran');
  }

  _stripe = new Stripe(secretKey, {
    apiVersion: '2026-02-25.clover',
    typescript: true,
  });

  return _stripe;
}

// ── Payment Intent Creation ──

interface CreatePaymentIntentOptions {
  amount: number; // in cents
  currency: string;
  bookingId?: string;
  metadata?: Record<string, string>;
}

interface CreatePaymentIntentResult {
  success: boolean;
  paymentIntentId?: string;
  clientSecret?: string;
  error?: string;
}

export async function createPaymentIntent(
  options: CreatePaymentIntentOptions
): Promise<CreatePaymentIntentResult> {
  try {
    const stripe = getStripe();
    
    const bookingId = options.bookingId || options.metadata?.bookingId || options.metadata?.booking_id || 'unknown';
    const paymentIntent = await stripe.paymentIntents.create({ // idempotencyKey below
      amount: options.amount,
      currency: options.currency,
      metadata: options.metadata,
      automatic_payment_methods: { enabled: true },
    }, {
      idempotencyKey: `pi-${bookingId}`,
    });

    return {
      success: true,
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret || undefined,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: errorMsg,
    };
  }
}

// ── Client-side Stripe loader ──

import { loadStripe, type Stripe as StripeClient } from '@stripe/stripe-js';

let stripePromise: Promise<StripeClient | null> | null = null;

export function getStripeClient(): Promise<StripeClient | null> {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey || publishableKey.includes('REPLACE')) {
      return Promise.resolve(null);
    }
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
}

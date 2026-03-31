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

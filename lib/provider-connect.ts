// ── Provider Stripe Connect Abstraction ──
// Wraps Stripe Connect operations for provider onboarding.
// Falls back gracefully when Stripe is not configured.

import { getStripe } from './stripe';

export interface ConnectOnboardingResult {
  accountId: string;
  onboardingUrl: string;
}

export interface ConnectAccountStatus {
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
}

function isStripeConfigured(): boolean {
  const key = process.env.STRIPE_SECRET_KEY;
  return !!(key && key.length > 0 && !key.includes('REPLACE'));
}

/**
 * Create a Stripe Connect Express account for a provider and return
 * the account ID + hosted onboarding URL.
 */
export async function createProviderConnectAccount(
  userId: string,
  email: string,
  displayName: string,
  country = 'HR'
): Promise<ConnectOnboardingResult | null> {
  if (!isStripeConfigured()) {
    return null;
  }

  const stripe = getStripe();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://petpark.hr';

  const account = await stripe.accounts.create({
    type: 'express',
    country,
    email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    business_type: 'individual',
    business_profile: {
      name: displayName,
    },
    metadata: {
      petpark_user_id: userId,
      petpark_flow: 'provider_onboarding',
    },
  });

  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${baseUrl}/onboarding/provider?stripe_refresh=true`,
    return_url: `${baseUrl}/onboarding/provider?stripe_complete=true`,
    type: 'account_onboarding',
  });

  return {
    accountId: account.id,
    onboardingUrl: accountLink.url,
  };
}

/**
 * Re-generate a Stripe Connect onboarding link (e.g. after link expiry).
 */
export async function refreshProviderOnboardingLink(
  stripeAccountId: string
): Promise<string | null> {
  if (!isStripeConfigured()) {
    return null;
  }

  const stripe = getStripe();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://petpark.hr';

  const accountLink = await stripe.accountLinks.create({
    account: stripeAccountId,
    refresh_url: `${baseUrl}/onboarding/provider?stripe_refresh=true`,
    return_url: `${baseUrl}/onboarding/provider?stripe_complete=true`,
    type: 'account_onboarding',
  });

  return accountLink.url;
}

/**
 * Check the status of a provider's Connect account.
 */
export async function getProviderConnectStatus(
  stripeAccountId: string
): Promise<ConnectAccountStatus | null> {
  if (!isStripeConfigured()) {
    return null;
  }

  const stripe = getStripe();
  const account = await stripe.accounts.retrieve(stripeAccountId);

  return {
    chargesEnabled: account.charges_enabled || false,
    payoutsEnabled: account.payouts_enabled || false,
    detailsSubmitted: account.details_submitted || false,
  };
}

// ── Stripe Payment Helpers (Real Implementation) ──
// Requires: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET in .env.local

import { getStripe } from './stripe';

export const PLATFORMA_FEE = 0.10; // 10% platform fee

// ── Types ──

export interface CheckoutSessionResult {
  url: string;
  sessionId: string;
}

export interface ConnectAccountResult {
  accountId: string;
  onboardingUrl: string;
}

export interface TransferResult {
  transferId: string;
}

export interface RefundResult {
  refundId: string;
}

export interface AccountBalance {
  available: number;
  pending: number;
}

export interface AccountStatus {
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
}

export interface SitterData {
  id: string;
  email: string;
  name: string;
  country?: string;
}

// ── Stripe Functions ──

export async function createCheckoutSession(
  bookingId: string,
  sellerPriceInCents: number, // seller cijena u centima (npr. 100 EUR = 10000)
  currency: string,
  providerStripeAccountId: string,
  serviceName?: string,
  origin?: string
): Promise<CheckoutSessionResult> {
  const stripe = getStripe();
  
  // Surcharge model: korisnik plaća 110%, seller dobije 100%
  const customerPriceInCents = Math.round(sellerPriceInCents * (1 + PLATFORMA_FEE));
  const sellerAmountInCents = sellerPriceInCents;

  const baseUrl = origin || process.env.NEXT_PUBLIC_APP_URL || 'https://petpark.hr';

  const session = await stripe.checkout.sessions.create({ // idempotencyKey: `checkout-${bookingId}`
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: serviceName || 'PetPark — Usluga za ljubimce',
            description: `Rezervacija #${bookingId.slice(0, 8)}`,
          },
          unit_amount: customerPriceInCents,
        },
        quantity: 1,
      },
    ],
    payment_intent_data: {
      // BEZ application_fee — cijela razlika ostaje na platform accountu
      transfer_data: {
        destination: providerStripeAccountId,
        amount: sellerAmountInCents,
      },
      metadata: {
        bookingId,
        providerStripeAccountId,
        sellerPrice: sellerPriceInCents.toString(),
        customerPrice: customerPriceInCents.toString(),
        platformFee: (customerPriceInCents - sellerAmountInCents).toString(),
      },
    },
    metadata: {
      bookingId,
    },
    success_url: `${baseUrl}/checkout/${bookingId}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/checkout/${bookingId}/cancel`,
  }, {
    idempotencyKey: `checkout-${bookingId}`,
  });

  return {
    url: session.url || '',
    sessionId: session.id,
  };
}

function getDayBucket(): string {
  return Math.floor(Date.now() / (1000 * 60 * 60 * 24)).toString();
}

export async function createConnectAccount(
  sitterData: SitterData
): Promise<ConnectAccountResult> {
  const stripe = getStripe();

  const account = await stripe.accounts.create({ // idempotencyKey below
    type: 'express',
    country: sitterData.country || 'HR',
    email: sitterData.email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    business_type: 'individual',
    metadata: {
      petpark_user_id: sitterData.id,
    },
  }, {
    idempotencyKey: `account-${sitterData.id}`,
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://petpark.hr';
  const dayBucket = getDayBucket();

  const accountLink = await stripe.accountLinks.create({ // idempotencyKey below
    account: account.id,
    refresh_url: `${baseUrl}/dashboard/sitter?stripe_refresh=true`,
    return_url: `${baseUrl}/dashboard/sitter?stripe_onboarding=complete`,
    type: 'account_onboarding',
  }, {
    idempotencyKey: `acctlink-${account.id}-${dayBucket}`,
  });

  return {
    accountId: account.id,
    onboardingUrl: accountLink.url,
  };
}

export async function createAccountLink(
  stripeAccountId: string
): Promise<string> {
  const stripe = getStripe();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://petpark.hr';
  const dayBucket = getDayBucket();

  const accountLink = await stripe.accountLinks.create({ // idempotencyKey below
    account: stripeAccountId,
    refresh_url: `${baseUrl}/dashboard/sitter?stripe_refresh=true`,
    return_url: `${baseUrl}/dashboard/sitter?stripe_onboarding=complete`,
    type: 'account_onboarding',
  }, {
    idempotencyKey: `acctlink-${stripeAccountId}-${dayBucket}`,
  });

  return accountLink.url;
}

export async function createTransfer(
  amount: number,
  destinationAccountId: string,
  paymentIntentId: string
): Promise<TransferResult> {
  const stripe = getStripe();

  const transfer = await stripe.transfers.create({
    amount,
    currency: 'eur',
    destination: destinationAccountId,
    source_transaction: paymentIntentId,
  });

  return { transferId: transfer.id };
}

export async function createRefund(
  paymentIntentId: string,
  amount?: number
): Promise<RefundResult> {
  const stripe = getStripe();

  const params: { payment_intent: string; amount?: number } = {
    payment_intent: paymentIntentId,
  };
  if (amount !== undefined) {
    params.amount = amount;
  }

  const refund = await stripe.refunds.create(params, {
    idempotencyKey: `refund-${paymentIntentId}`,
  });
  return { refundId: refund.id };
}

export async function getAccountBalance(
  stripeAccountId: string
): Promise<AccountBalance> {
  const stripe = getStripe();

  const balance = await stripe.balance.retrieve({
    stripeAccount: stripeAccountId,
  });

  const available = balance.available
    .filter((b) => b.currency === 'eur')
    .reduce((sum, b) => sum + b.amount, 0);
  const pending = balance.pending
    .filter((b) => b.currency === 'eur')
    .reduce((sum, b) => sum + b.amount, 0);

  return { available, pending };
}

export async function getAccountStatus(
  stripeAccountId: string
): Promise<AccountStatus> {
  const stripe = getStripe();

  const account = await stripe.accounts.retrieve(stripeAccountId);

  return {
    chargesEnabled: account.charges_enabled || false,
    payoutsEnabled: account.payouts_enabled || false,
    detailsSubmitted: account.details_submitted || false,
  };
}

export async function createDashboardLink(
  stripeAccountId: string
): Promise<string> {
  const stripe = getStripe();

  const dayBucket = getDayBucket();
  const loginLink = await stripe.accounts.createLoginLink(stripeAccountId, {}, {
    idempotencyKey: `loginlink-${stripeAccountId}-${dayBucket}`,
  });
  return loginLink.url;
}

// ── Utility ──

export function calculateSitterPayout(totalAmount: number): number {
  return Math.round(totalAmount * (1 - PLATFORMA_FEE));
}

export function calculatePlatformFee(totalAmount: number): number {
  return Math.round(totalAmount * PLATFORMA_FEE);
}

export function formatCurrency(amountInCents: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('hr-HR', {
    style: 'currency',
    currency,
  }).format(amountInCents / 100);
}

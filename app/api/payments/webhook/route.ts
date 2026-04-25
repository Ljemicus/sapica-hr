import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { apiError } from '@/lib/api-errors';
import { getStripe } from '@/lib/stripe';
import { calculatePlatformFee, formatCurrency } from '@/lib/payment';
import { SERVICE_LABELS, type ServiceType } from '@/lib/types';
import { dispatchAlert } from '@/lib/alerting';
import { getRequestId, createScopedLogger } from '@/lib/request-context';
import { sendEmail } from '@/lib/email';
import { paymentConfirmationEmail, sitterPaymentNotificationEmail } from '@/lib/email-templates';
import type Stripe from 'stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type SupabaseAdmin = any;

type BookingEmailRow = {
  id: string;
  starts_at: string;
  ends_at: string;
  primary_service_code: string;
  total_amount: number;
  owner?: { display_name: string | null; email: string | null } | null;
  provider?: {
    display_name: string | null;
    email: string | null;
    profile?: { display_name: string | null; email: string | null } | null;
  } | null;
  pet?: { name: string | null } | null;
};

function toServiceType(serviceCode: string): ServiceType {
  switch (serviceCode) {
    case 'house_sitting':
      return 'house-sitting';
    case 'drop_in':
      return 'drop-in';
    case 'boarding':
    case 'walking':
    case 'daycare':
      return serviceCode;
    default:
      return 'boarding';
  }
}

function getObjectId(value: string | { id?: string } | null | undefined): string | null {
  if (!value) return null;
  if (typeof value === 'string') return value;
  return value.id || null;
}

function moneyFromCents(amount: number | null | undefined): number | null {
  if (typeof amount !== 'number') return null;
  return amount / 100;
}

async function markProcessed(
  admin: SupabaseAdmin,
  eventId: string,
  processingResult: Record<string, unknown>,
) {
  await admin
    .from('stripe_events')
    .update({
      processed_at: new Date().toISOString(),
      processing_result: processingResult,
    })
    .eq('event_id', eventId);
}

async function markBookingPaymentFailed(
  admin: SupabaseAdmin,
  bookingId: string,
  payload: Record<string, unknown>,
) {
  await admin.from('bookings').update({ payment_status: 'failed' }).eq('id', bookingId);
  await admin.from('payments').update({ status: 'failed', raw_provider_payload: payload }).eq('booking_id', bookingId);
}

async function sendCheckoutEmails(admin: SupabaseAdmin, bookingId: string, log: ReturnType<typeof createScopedLogger>) {
  try {
    const { data: bookingDetails } = await admin
      .from('bookings')
      .select(`
        id,
        starts_at,
        ends_at,
        primary_service_code,
        total_amount,
        owner:profiles!bookings_owner_profile_id_fkey(display_name, email),
        provider:providers!bookings_provider_id_fkey(display_name, email, profile:profiles!providers_profile_id_fkey(display_name, email)),
        pet:pets!bookings_pet_id_fkey(name)
      `)
      .eq('id', bookingId)
      .single();

    const booking = bookingDetails as BookingEmailRow | null;
    if (!booking?.owner?.email) return;

    const dates = `${new Date(booking.starts_at).toLocaleDateString('hr-HR')} – ${new Date(booking.ends_at).toLocaleDateString('hr-HR')}`;
    const serviceName = SERVICE_LABELS[toServiceType(booking.primary_service_code)] || booking.primary_service_code || 'Usluga';
    const providerEmail = booking.provider?.profile?.email || booking.provider?.email;
    const providerName = booking.provider?.profile?.display_name || booking.provider?.display_name || 'Pružatelj';

    sendEmail({
      to: booking.owner.email,
      subject: 'Plaćanje potvrđeno!',
      html: paymentConfirmationEmail(
        booking.owner.display_name || 'Korisnik',
        booking.pet?.name || 'Ljubimac',
        serviceName,
        dates,
        formatCurrency(Math.round(Number(booking.total_amount) * 100)),
      ),
    }).catch((err) => log.error('Failed to send owner payment email', { error: String(err) }));

    if (providerEmail) {
      sendEmail({
        to: providerEmail,
        subject: 'Nova uplata primljena!',
        html: sitterPaymentNotificationEmail(
          providerName,
          booking.owner.display_name || 'Korisnik',
          booking.pet?.name || 'Ljubimac',
          serviceName,
          dates,
          formatCurrency(Math.round(Number(booking.total_amount) * 100)),
        ),
      }).catch((err) => log.error('Failed to send provider payment email', { error: String(err) }));
    }
  } catch (emailErr) {
    log.error('Failed to fetch booking details for email', { error: String(emailErr) });
  }
}

async function handleCheckoutCompleted(admin: SupabaseAdmin, event: Stripe.Event, log: ReturnType<typeof createScopedLogger>) {
  const session = event.data.object as Stripe.Checkout.Session;
  const bookingId = session.metadata?.bookingId;

  if (!bookingId) {
    log.warn('checkout.session.completed missing bookingId metadata', { sessionId: session.id });
    return { skipped: 'missing_booking_id', sessionId: session.id };
  }

  const amountTotal = session.amount_total || 0;
  if (amountTotal <= 0) {
    log.error('checkout.session.completed has invalid amount', { sessionId: session.id, bookingId, amountTotal });
    return { skipped: 'invalid_amount', bookingId, sessionId: session.id };
  }

  const { data: existingBooking } = await admin
    .from('bookings')
    .select('payment_status, provider_id, total_amount')
    .eq('id', bookingId)
    .single();

  if (existingBooking?.payment_status === 'paid') {
    log.info('Skipping already-paid booking', { bookingId, sessionId: session.id });
    return { skipped: 'already_paid', bookingId, sessionId: session.id };
  }

  const platformFee = calculatePlatformFee(amountTotal);
  const paymentIntentId = getObjectId(session.payment_intent);

  const { error: bookingUpdateError } = await admin
    .from('bookings')
    .update({
      payment_status: 'paid',
      platform_fee_amount: platformFee / 100,
      stripe_checkout_session_id: session.id,
    })
    .eq('id', bookingId);

  if (bookingUpdateError) {
    log.error('Failed to update booking after checkout completion', { bookingId, sessionId: session.id, reason: bookingUpdateError.message });
    dispatchAlert({
      severity: 'P1',
      service: 'payments.webhook',
      description: 'Failed to update booking after successful Stripe checkout',
      value: `booking=${bookingId}`,
      owner: 'platform',
    });
    return { error: 'booking_update_failed', bookingId, sessionId: session.id };
  }

  const { error: paymentUpsertError } = await admin
    .from('payments')
    .upsert({
      booking_id: bookingId,
      provider_id: existingBooking?.provider_id,
      stripe_payment_intent_id: paymentIntentId,
      stripe_checkout_session_id: session.id,
      amount: Number(existingBooking?.total_amount ?? amountTotal / 100),
      platform_fee_amount: platformFee / 100,
      currency: (session.currency || 'eur').toUpperCase(),
      status: 'paid',
      paid_at: new Date().toISOString(),
      raw_provider_payload: {
        stripe_event_id: event.id,
        stripe_event_type: event.type,
        amount_total_cents: amountTotal,
      },
    }, { onConflict: 'booking_id' });

  if (paymentUpsertError) {
    log.error('Failed to upsert payment log after checkout completion', { bookingId, sessionId: session.id, reason: paymentUpsertError.message });
    dispatchAlert({
      severity: 'P2',
      service: 'payments.webhook',
      description: 'Failed to insert payment record — booking updated but payment log missing',
      value: `booking=${bookingId}`,
      owner: 'platform',
    });
  }

  await sendCheckoutEmails(admin, bookingId, log);
  return { ok: true, bookingId, sessionId: session.id };
}

async function handleCheckoutExpired(admin: SupabaseAdmin, event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  const bookingId = session.metadata?.bookingId;
  if (!bookingId) return { skipped: 'missing_booking_id', sessionId: session.id };

  await markBookingPaymentFailed(admin, bookingId, {
    stripe_event_id: event.id,
    stripe_event_type: event.type,
    checkout_session_id: session.id,
  });
  return { ok: true, bookingId, sessionId: session.id };
}

async function handlePaymentIntentFailed(admin: SupabaseAdmin, event: Stripe.Event, log: ReturnType<typeof createScopedLogger>) {
  const pi = event.data.object as Stripe.PaymentIntent;
  const bookingId = pi.metadata?.bookingId;
  if (!bookingId) {
    log.warn(`${event.type} missing bookingId metadata`, { paymentIntentId: pi.id });
    return { skipped: 'missing_booking_id', paymentIntentId: pi.id };
  }

  await admin.from('bookings').update({ payment_status: 'failed' }).eq('id', bookingId);
  await admin
    .from('payments')
    .update({
      status: 'failed',
      stripe_payment_intent_id: pi.id,
      raw_provider_payload: {
        stripe_event_id: event.id,
        stripe_event_type: event.type,
        last_payment_error: pi.last_payment_error?.message || null,
      },
    })
    .eq('booking_id', bookingId);

  dispatchAlert({
    severity: 'P2',
    service: 'payments.webhook',
    description: 'Payment intent failed/canceled for booking',
    value: `booking=${bookingId}, pi=${pi.id}`,
    owner: 'platform',
  });

  return { ok: true, bookingId, paymentIntentId: pi.id };
}

async function handleRefund(admin: SupabaseAdmin, event: Stripe.Event) {
  const refund = event.data.object as Stripe.Refund;
  const paymentIntentId = getObjectId(refund.payment_intent);
  const refundedAmount = moneyFromCents(refund.amount);
  const refundStatus = refund.status || event.type;

  let query = admin
    .from('payments')
    .update({
      refund_status: refundStatus,
      refunded_amount: refundedAmount,
      status: refund.status === 'succeeded' ? 'refunded' : 'paid',
      raw_provider_payload: {
        stripe_event_id: event.id,
        stripe_event_type: event.type,
        refund_id: refund.id,
        refund_status: refund.status,
      },
    });

  if (paymentIntentId) {
    query = query.eq('stripe_payment_intent_id', paymentIntentId);
  } else {
    query = query.eq('raw_provider_payload->>refund_id', refund.id);
  }

  const { data: paymentRows } = await query.select('booking_id');
  const bookingIds = (paymentRows || []).map((row: { booking_id: string }) => row.booking_id).filter(Boolean);

  if (refund.status === 'succeeded' && bookingIds.length > 0) {
    await admin.from('bookings').update({ payment_status: 'refunded' }).in('id', bookingIds);
  }

  return { ok: true, refundId: refund.id, paymentIntentId, bookingIds };
}

async function handleChargeRefunded(admin: SupabaseAdmin, event: Stripe.Event) {
  const charge = event.data.object as Stripe.Charge;
  const paymentIntentId = getObjectId(charge.payment_intent);
  const refundedAmount = moneyFromCents(charge.amount_refunded || charge.amount);

  if (!paymentIntentId) return { skipped: 'missing_payment_intent', chargeId: charge.id };

  const { data: paymentRows } = await admin
    .from('payments')
    .update({
      refund_status: charge.refunded ? 'succeeded' : 'partial',
      refunded_amount: refundedAmount,
      status: charge.refunded ? 'refunded' : 'paid',
      raw_provider_payload: {
        stripe_event_id: event.id,
        stripe_event_type: event.type,
        charge_id: charge.id,
        amount_refunded_cents: charge.amount_refunded,
      },
    })
    .eq('stripe_payment_intent_id', paymentIntentId)
    .select('booking_id');

  const bookingIds = (paymentRows || []).map((row: { booking_id: string }) => row.booking_id).filter(Boolean);
  if (charge.refunded && bookingIds.length > 0) {
    await admin.from('bookings').update({ payment_status: 'refunded' }).in('id', bookingIds);
  }

  return { ok: true, chargeId: charge.id, paymentIntentId, bookingIds };
}

async function handleDispute(admin: SupabaseAdmin, event: Stripe.Event, log: ReturnType<typeof createScopedLogger>) {
  const dispute = event.data.object as Stripe.Dispute;
  const paymentIntentId = getObjectId(dispute.payment_intent);
  const disputeState = event.type === 'charge.dispute.closed' ? `closed:${dispute.status}` : `open:${dispute.status}`;

  if (paymentIntentId) {
    const { data: paymentRows } = await admin
      .from('payments')
      .update({
        raw_provider_payload: {
          stripe_event_id: event.id,
          stripe_event_type: event.type,
          dispute_id: dispute.id,
          dispute_status: dispute.status,
        },
      })
      .eq('stripe_payment_intent_id', paymentIntentId)
      .select('booking_id');

    const bookingIds = (paymentRows || []).map((row: { booking_id: string }) => row.booking_id).filter(Boolean);
    if (bookingIds.length > 0) {
      await admin.from('bookings').update({ dispute_state: disputeState }).in('id', bookingIds);
    }
  }

  if (event.type === 'charge.dispute.created') {
    log.error('Dispute created', { disputeId: dispute.id, amount: dispute.amount || 0 });
    dispatchAlert({
      severity: 'P0',
      service: 'payments.webhook',
      description: 'Stripe dispute opened — immediate action required',
      value: `dispute=${dispute.id}, amount=${dispute.amount || 0}`,
      owner: 'founder',
    });
  }

  return { ok: true, disputeId: dispute.id, paymentIntentId, disputeState };
}

async function handlePayout(admin: SupabaseAdmin, event: Stripe.Event) {
  const payout = event.data.object as Stripe.Payout;
  const stripeAccountId = event.account || null;
  if (!stripeAccountId) return { skipped: 'missing_connected_account', payoutId: payout.id };

  await admin
    .from('providers')
    .update({ payout_last_status: event.type === 'payout.paid' ? 'paid' : 'failed' })
    .eq('stripe_account_id', stripeAccountId);

  return { ok: true, payoutId: payout.id, stripeAccountId };
}

async function handleAccountUpdated(admin: SupabaseAdmin, event: Stripe.Event) {
  const account = event.data.object as Stripe.Account;
  const { error: accountUpdateError } = await admin
    .from('providers')
    .update({ stripe_onboarding_complete: account.details_submitted || false })
    .eq('stripe_account_id', account.id);

  if (accountUpdateError) return { error: accountUpdateError.message, stripeAccountId: account.id };
  return { ok: true, stripeAccountId: account.id };
}

export async function POST(request: Request) {
  const reqId = getRequestId(request);
  const log = createScopedLogger('payments.webhook', reqId);
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret || webhookSecret.includes('REPLACE')) {
    return apiError({ status: 500, code: 'WEBHOOK_UNAVAILABLE', message: 'Webhook not configured' });
  }

  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig) {
    log.warn('Missing stripe-signature header');
    return apiError({ status: 400, code: 'SIGNATURE_MISSING', message: 'Missing stripe-signature header' });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    log.error('Signature verification failed');
    dispatchAlert({
      severity: 'P1',
      service: 'payments.webhook',
      description: 'Stripe signature verification failed — possible tampering or misconfigured secret',
      owner: 'platform',
    });
    return apiError({ status: 400, code: 'INVALID_SIGNATURE', message: 'Invalid signature' });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    log.error('Supabase service role is not configured for webhook processing');
    return apiError({ status: 500, code: 'WEBHOOK_STORAGE_UNAVAILABLE', message: 'Webhook storage not configured' });
  }

  const admin = createSupabaseClient(supabaseUrl, serviceRoleKey);

  const { error: dedupErr } = await admin
    .from('stripe_events')
    .insert({ event_id: event.id, event_type: event.type, payload: event as unknown as Record<string, unknown> });

  if (dedupErr?.code === '23505') {
    return NextResponse.json({ deduped: event.id });
  }

  if (dedupErr) {
    log.error('stripe_events insert failed', { eventId: event.id, reason: dedupErr.message });
    return apiError({ status: 500, code: 'DEDUP_INSERT_FAILED', message: 'Failed to persist Stripe event' });
  }

  let processingResult: Record<string, unknown> = { ignored: event.type };

  switch (event.type) {
    case 'checkout.session.completed':
      processingResult = await handleCheckoutCompleted(admin, event, log);
      break;
    case 'checkout.session.expired':
    case 'checkout.session.async_payment_failed':
      processingResult = await handleCheckoutExpired(admin, event);
      break;
    case 'payment_intent.payment_failed':
    case 'payment_intent.canceled':
      processingResult = await handlePaymentIntentFailed(admin, event, log);
      break;
    case 'charge.refunded':
      processingResult = await handleChargeRefunded(admin, event);
      break;
    case 'refund.created':
    case 'refund.updated':
      processingResult = await handleRefund(admin, event);
      break;
    case 'charge.dispute.created':
    case 'charge.dispute.closed':
      processingResult = await handleDispute(admin, event, log);
      break;
    case 'payout.failed':
    case 'payout.paid':
      processingResult = await handlePayout(admin, event);
      break;
    case 'account.updated':
      processingResult = await handleAccountUpdated(admin, event);
      break;
    case 'payment_intent.succeeded':
      processingResult = { ok: true, ignored: 'payment_intent_succeeded_checkout_is_source_of_truth' };
      break;
    default:
      break;
  }

  await markProcessed(admin, event.id, processingResult);

  return NextResponse.json({ received: true, result: processingResult });
}

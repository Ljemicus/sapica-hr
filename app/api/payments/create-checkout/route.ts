import { NextResponse } from 'next/server';
import { appLogger } from '@/lib/logger';
import { dispatchAlert } from '@/lib/alerting';
import { getAuthUser } from '@/lib/auth';
import { createCheckoutSession, calculatePlatformFee } from '@/lib/payment';
import { createClient } from '@/lib/supabase/server';
import { SERVICE_LABELS, type ServiceType } from '@/lib/types';

type BookingRow = {
  id: string;
  owner_profile_id: string;
  provider_id: string;
  status: string;
  payment_status: string;
  total_amount: number;
  provider_amount: number | null;
  platform_fee: number | null;
  currency: string | null;
  primary_service_code: string;
  payments: { stripe_checkout_session_id: string | null }[] | null;
};

type ProviderRow = {
  stripe_account_id: string | null;
  stripe_onboarding_complete: boolean | null;
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

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Nemate pristup.' }, { status: 401 });
  }

  const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'https://petpark.hr';

  let body: { bookingId: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Neispravan zahtjev.' }, { status: 400 });
  }

  const { bookingId } = body;
  if (!bookingId) {
    return NextResponse.json({ error: 'Nedostaje bookingId.' }, { status: 400 });
  }

  if (typeof bookingId !== 'string' || !bookingId.trim()) {
    return NextResponse.json({ error: 'Neispravan bookingId.' }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('id, owner_profile_id, provider_id, status, payment_status, total_amount, provider_amount, platform_fee, currency, primary_service_code, payments(stripe_checkout_session_id)')
    .eq('id', bookingId)
    .single<BookingRow>();

  if (bookingError || !booking) {
    return NextResponse.json({ error: 'Rezervacija nije pronađena.' }, { status: 404 });
  }

  if (booking.owner_profile_id !== user.id) {
    return NextResponse.json({ error: 'Nemate pristup ovoj rezervaciji.' }, { status: 403 });
  }

  if (booking.status !== 'accepted') {
    return NextResponse.json({ error: 'Samo prihvaćene rezervacije mogu biti plaćene.' }, { status: 400 });
  }

  const providerAmount = Number(booking.provider_amount ?? booking.total_amount);

  if (providerAmount <= 0) {
    appLogger.warn('payments.checkout', 'Booking has invalid total amount for checkout', { bookingId });
    return NextResponse.json({ error: 'Rezervacija ima neispravan iznos za plaćanje.' }, { status: 400 });
  }

  if (booking.payment_status === 'paid') {
    return NextResponse.json({ error: 'Ova rezervacija je već plaćena.' }, { status: 400 });
  }

  const existingSessionId = booking.payments?.[0]?.stripe_checkout_session_id || null;

  const { data: provider, error: providerError } = await supabase
    .from('providers')
    .select('stripe_account_id, stripe_onboarding_complete')
    .eq('id', booking.provider_id)
    .single<ProviderRow>();

  if (providerError || !provider?.stripe_account_id || !provider.stripe_onboarding_complete) {
    return NextResponse.json(
      { error: 'Pružatelj još nije povezao plaćanja. Kontaktirajte ga da poveže Stripe račun.' },
      { status: 400 }
    );
  }

  try {
    const sellerPriceInCents = Math.round(providerAmount * 100);
    const platformFeeInCents = Math.round(Number(booking.platform_fee ?? calculatePlatformFee(sellerPriceInCents) / 100) * 100);
    const customerPriceInCents = sellerPriceInCents + platformFeeInCents;
    const serviceType = toServiceType(booking.primary_service_code);
    const serviceName = SERVICE_LABELS[serviceType] || 'Usluga';

    const { url, sessionId } = await createCheckoutSession(
      bookingId,
      sellerPriceInCents,
      booking.currency || 'EUR',
      provider.stripe_account_id,
      `PetPark — ${serviceName}`,
      origin
    );

    if (existingSessionId && existingSessionId === sessionId) {
      return NextResponse.json({ url, sessionId, reused: true });
    }

    const { error: paymentUpsertError } = await supabase
      .from('payments')
      .upsert({
        booking_id: bookingId,
        provider_id: booking.provider_id,
        stripe_checkout_session_id: sessionId,
        amount: customerPriceInCents / 100,
        platform_fee_amount: platformFeeInCents / 100,
        currency: booking.currency || 'EUR',
        status: 'pending',
        raw_provider_payload: {
          checkout_origin: origin,
          customer_total_amount: customerPriceInCents / 100,
          seller_total_amount: providerAmount,
        },
      }, { onConflict: 'booking_id' });

    if (paymentUpsertError) {
      appLogger.error('payments.checkout', 'Failed to persist pending payment record', {
        bookingId,
        error: paymentUpsertError.message,
      });
      return NextResponse.json({ error: 'Greška pri spremanju plaćanja.' }, { status: 500 });
    }

    const { error: bookingUpdateError } = await supabase
      .from('bookings')
      .update({
        payment_status: 'pending',
        platform_fee_amount: platformFeeInCents / 100,
        provider_amount: sellerPriceInCents / 100,
        platform_fee: platformFeeInCents / 100,
        total_amount: customerPriceInCents / 100,
        stripe_checkout_session_id: sessionId,
      })
      .eq('id', bookingId);

    if (bookingUpdateError) {
      appLogger.error('payments.checkout', 'Failed to update booking pending payment status', {
        bookingId,
        error: bookingUpdateError.message,
      });
      return NextResponse.json({ error: 'Greška pri ažuriranju rezervacije.' }, { status: 500 });
    }

    return NextResponse.json({ url, sessionId });
  } catch (err) {
    appLogger.error('payments.checkout', 'Checkout session creation failed', { error: String(err) });
    dispatchAlert({
      severity: 'P1',
      service: 'payments.checkout',
      description: 'Stripe checkout session creation failed — user cannot pay',
      value: `booking=${bookingId}`,
      owner: 'platform',
    });
    return NextResponse.json(
      { error: 'Greška pri kreiranju plaćanja. Pokušajte ponovo.' },
      { status: 500 }
    );
  }
}

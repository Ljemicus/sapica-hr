import { NextResponse } from 'next/server';
import { appLogger } from '@/lib/logger';
import { getAuthUser } from '@/lib/auth';
import { createCheckoutSession, calculatePlatformFee } from '@/lib/payment';
import { createClient } from '@/lib/supabase/server';
import { SERVICE_LABELS, type ServiceType } from '@/lib/types';

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

  // Get booking
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .single();

  if (bookingError || !booking) {
    return NextResponse.json({ error: 'Rezervacija nije pronađena.' }, { status: 404 });
  }

  // Check ownership
  if (booking.owner_id !== user.id) {
    return NextResponse.json({ error: 'Nemate pristup ovoj rezervaciji.' }, { status: 403 });
  }

  // Check if already paid
  if (booking.total_price <= 0) {
    appLogger.warn('payments.checkout', 'Booking has invalid total price for checkout', { bookingId });
    return NextResponse.json({ error: 'Rezervacija ima neispravan iznos za plaćanje.' }, { status: 400 });
  }

  if (booking.payment_status === 'paid') {
    return NextResponse.json({ error: 'Ova rezervacija je već plaćena.' }, { status: 400 });
  }

  // Get sitter's Stripe account
  const { data: sitterProfile } = await supabase
    .from('sitter_profiles')
    .select('stripe_account_id, stripe_onboarding_complete')
    .eq('user_id', booking.sitter_id)
    .single();

  if (!sitterProfile?.stripe_account_id || !sitterProfile.stripe_onboarding_complete) {
    return NextResponse.json(
      { error: 'Čuvar još nije povezao plaćanja. Kontaktirajte ga da poveže Stripe račun.' },
      { status: 400 }
    );
  }

  try {
    const amountInCents = Math.round(booking.total_price * 100);
    const serviceName = SERVICE_LABELS[booking.service_type as ServiceType] || 'Usluga';

    const { url, sessionId } = await createCheckoutSession(
      bookingId,
      amountInCents,
      booking.currency || 'EUR',
      sitterProfile.stripe_account_id,
      `PetPark — ${serviceName}`,
      origin
    );

    // Update booking with session ID
    await supabase
      .from('bookings')
      .update({
        stripe_session_id: sessionId,
        payment_status: 'pending',
        platform_fee: calculatePlatformFee(amountInCents) / 100,
      })
      .eq('id', bookingId);

    return NextResponse.json({ url, sessionId });
  } catch (err) {
    appLogger.error('payments.checkout', 'Checkout session creation failed', { error: String(err) });
    return NextResponse.json(
      { error: 'Greška pri kreiranju plaćanja. Pokušajte ponovo.' },
      { status: 500 }
    );
  }
}

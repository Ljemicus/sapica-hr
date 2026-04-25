import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { appLogger } from '@/lib/logger';
import { bookingSchema } from '@/lib/validations';
import { calculatePlatformFee } from '@/lib/payment';
import { sendPushToMultiple, NotificationTemplates } from '@/lib/push-notifications';
import { getUserPushSubscriptions, canSendNotification } from '@/lib/db/notifications';
import { sendSMS } from '@/lib/sms';
import { sendEmail } from '@/lib/email';
import { bookingAcceptedEmail } from '@/lib/email-templates';
import { SERVICE_LABELS, type ServiceType } from '@/lib/types';

function toPrimaryServiceCode(serviceType: ServiceType): string {
  switch (serviceType) {
    case 'house-sitting':
      return 'house_sitting';
    case 'drop-in':
      return 'drop_in';
    default:
      return serviceType;
  }
}

/**
 * POST /api/bookings/instant
 * Create an instant booking — skips pending state, goes directly to accepted + payment
 * Only works for sitters with instant_booking = true
 */
export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = bookingSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid booking data', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { sitter_id, pet_id, service_type, start_date, end_date, note } = parsed.data;

    // Validate dates
    const start = new Date(start_date);
    const end = new Date(end_date);
    
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return NextResponse.json({ error: 'Invalid dates' }, { status: 400 });
    }
    
    if (end < start) {
      return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 });
    }

    const startDay = new Date(start);
    startDay.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDay < today) {
      return NextResponse.json({ error: 'Cannot book in the past' }, { status: 400 });
    }

    if (sitter_id === user.id) {
      return NextResponse.json({ error: 'Cannot book yourself' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: provider, error: providerError } = await supabase
      .from('providers')
      .select('id, profile_id, display_name, email, phone, verified_status, instant_booking_enabled, stripe_account_id, stripe_onboarding_complete')
      .eq('id', sitter_id)
      .eq('provider_kind', 'sitter')
      .maybeSingle();

    if (providerError || !provider) {
      return NextResponse.json({ error: 'Sitter not found' }, { status: 404 });
    }

    if (!provider.instant_booking_enabled) {
      return NextResponse.json(
        { error: 'Sitter does not support instant booking', code: 'INSTANT_BOOKING_NOT_ENABLED' },
        { status: 400 }
      );
    }

    if (provider.verified_status !== 'verified') {
      return NextResponse.json(
        { error: 'Sitter must be verified for instant booking', code: 'SITTER_NOT_VERIFIED' },
        { status: 400 }
      );
    }

    const [{ data: providerProfile }, { data: providerServices }] = await Promise.all([
      provider.profile_id
        ? supabase.from('profiles').select('id, display_name, email, phone').eq('id', provider.profile_id).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      supabase.from('provider_services').select('service_code, base_price, is_active').eq('provider_id', sitter_id).eq('is_active', true),
    ]);

    // Get pet details
    const { data: pet, error: petError } = await supabase
      .from('pets')
      .select('name, owner_profile_id')
      .eq('id', pet_id)
      .maybeSingle();

    if (petError || !pet) {
      return NextResponse.json({ error: 'Pet not found' }, { status: 404 });
    }

    if (pet.owner_profile_id !== user.id) {
      return NextResponse.json({ error: 'Pet does not belong to you' }, { status: 403 });
    }

    // Calculate pricing
    const serviceCode = toPrimaryServiceCode(service_type as ServiceType);
    const serviceRow = (providerServices || []).find((service: any) => service.service_code === serviceCode && service.is_active !== false);
    const pricePerDay = Number(serviceRow?.base_price || 0);
    if (pricePerDay <= 0) {
      return NextResponse.json(
        { error: 'Service not available from this sitter' },
        { status: 400 }
      );
    }

    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const provider_amount = pricePerDay * days;
    const platform_fee = calculatePlatformFee(Math.round(provider_amount * 100)) / 100;
    const total_price = provider_amount + platform_fee;

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        owner_profile_id: user.id,
        provider_id: sitter_id,
        pet_id,
        provider_kind: 'sitter',
        primary_service_code: serviceCode,
        starts_at: start_date,
        ends_at: end_date,
        subtotal_amount: provider_amount,
        provider_amount,
        platform_fee,
        platform_fee_amount: platform_fee,
        total_amount: total_price,
        payment_status: 'pending',
        currency: 'EUR',
        owner_note: note || null,
        status: 'accepted',
      })
      .select('id, owner_profile_id, provider_id, pet_id, primary_service_code, starts_at, ends_at, total_amount, platform_fee_amount, payment_status, currency, owner_note, status, created_at')
      .single();

    if (bookingError || !booking) {
      appLogger.error('instant-booking', 'Failed to create booking', { error: bookingError?.message });
      return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
    }

    const { createCheckoutSession } = await import('@/lib/payment');

    if (!provider.stripe_account_id || !provider.stripe_onboarding_complete) {
      await supabase.from('bookings').delete().eq('id', booking.id);
      return NextResponse.json({ error: 'Sitter has not connected payments yet' }, { status: 400 });
    }

    const { url, sessionId } = await createCheckoutSession(
      booking.id,
      Math.round(provider_amount * 100),
      'EUR',
      provider.stripe_account_id,
      `PetPark — ${SERVICE_LABELS[service_type as ServiceType] || service_type}`
    );

    await supabase.from('payments').upsert({
      booking_id: booking.id,
      provider_id: sitter_id,
      stripe_checkout_session_id: sessionId,
      amount: total_price,
      platform_fee_amount: platform_fee,
      currency: 'EUR',
      status: 'pending',
      raw_provider_payload: { instant_booking: true },
    }, { onConflict: 'booking_id' });

    // Notify sitter (async, don't block response)
    const sitterUser = {
      name: providerProfile?.display_name || provider.display_name || undefined,
      email: providerProfile?.email || provider.email || undefined,
      phone: providerProfile?.phone || provider.phone || undefined,
    };
    
    // Email notification
    if (sitterUser?.email) {
      const dates = `${start.toLocaleDateString('hr-HR')} – ${end.toLocaleDateString('hr-HR')}`;
      const _serviceName = SERVICE_LABELS[service_type as ServiceType] || service_type;
      
      sendEmail({
        to: sitterUser.email,
        subject: '🎉 Nova potvrđena rezervacija!',
        html: bookingAcceptedEmail(
          sitterUser.name || 'Čuvar',
          user.name || 'Korisnik',
          pet.name || 'Ljubimac',
          dates,
        ),
      }).catch(err => appLogger.error('instant-booking', 'Email failed', { error: String(err) }));
    }

    // Push notification
    const canSendPush = await canSendNotification(sitter_id, 'push', 'bookings');
    if (canSendPush) {
      const subscriptions = await getUserPushSubscriptions(sitter_id);
      if (subscriptions.length > 0) {
        sendPushToMultiple(
          subscriptions.map(sub => ({
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          })),
          NotificationTemplates.bookingAccepted(user.name || 'Korisnik', pet.name || 'ljubimca')
        ).catch(err => appLogger.error('instant-booking', 'Push failed', { error: String(err) }));
      }
    }

    // SMS notification
    const canSendSMS = await canSendNotification(sitter_id, 'sms', 'bookings');
    if (canSendSMS && sitterUser?.phone) {
      const smsMessage = `PetPark: Nova potvrdena rezervacija od ${user.name || 'Korisnik'} za ${pet.name || 'ljubimca'}. Provjerite u aplikaciji.`;
      sendSMS({ to: sitterUser.phone, body: smsMessage }).catch(err => {
        appLogger.error('instant-booking', 'SMS failed', { error: String(err) });
      });
    }

    return NextResponse.json({
      booking,
      checkoutUrl: url,
      checkoutSessionId: sessionId,
      message: 'Instant booking created successfully',
    }, { status: 201 });

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    appLogger.error('instant-booking', 'Unexpected error', { error: errorMsg });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

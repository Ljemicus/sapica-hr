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

    // Check if sitter has instant booking enabled
    const { data: sitterProfile, error: sitterError } = await supabase
      .from('sitter_profiles')
      .select('user_id, prices, instant_booking, verified, user:users!user_id(id, name, email, phone)')
      .eq('user_id', sitter_id)
      .maybeSingle();

    if (sitterError || !sitterProfile) {
      return NextResponse.json({ error: 'Sitter not found' }, { status: 404 });
    }

    if (!sitterProfile.instant_booking) {
      return NextResponse.json(
        { error: 'Sitter does not support instant booking', code: 'INSTANT_BOOKING_NOT_ENABLED' },
        { status: 400 }
      );
    }

    if (!sitterProfile.verified) {
      return NextResponse.json(
        { error: 'Sitter must be verified for instant booking', code: 'SITTER_NOT_VERIFIED' },
        { status: 400 }
      );
    }

    // Get pet details
    const { data: pet, error: petError } = await supabase
      .from('pets')
      .select('name, owner_id')
      .eq('id', pet_id)
      .maybeSingle();

    if (petError || !pet) {
      return NextResponse.json({ error: 'Pet not found' }, { status: 404 });
    }

    if (pet.owner_id !== user.id) {
      return NextResponse.json({ error: 'Pet does not belong to you' }, { status: 403 });
    }

    // Calculate pricing
    const pricePerDay = sitterProfile.prices?.[service_type as ServiceType] || 0;
    if (pricePerDay <= 0) {
      return NextResponse.json(
        { error: 'Service not available from this sitter' },
        { status: 400 }
      );
    }

    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const total_price = pricePerDay * days;
    const platform_fee = calculatePlatformFee(Math.round(total_price * 100)) / 100;

    // Create booking with status = accepted (skips pending)
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        owner_id: user.id,
        sitter_id,
        pet_id,
        service_type,
        start_date,
        end_date,
        total_price,
        platform_fee,
        payment_status: 'pending', // Will be updated after Stripe payment
        currency: 'EUR',
        note: note || null,
        status: 'accepted', // ← INSTANT: skips pending
      })
      .select()
      .single();

    if (bookingError || !booking) {
      appLogger.error('instant-booking', 'Failed to create booking', { error: bookingError?.message });
      return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
    }

    // Create Stripe payment intent
    const { createPaymentIntent } = await import('@/lib/stripe');
    const paymentResult = await createPaymentIntent({
      amount: Math.round(total_price * 100),
      currency: 'eur',
      metadata: {
        booking_id: booking.id,
        sitter_id,
        owner_id: user.id,
      },
    });

    if (!paymentResult.success) {
      // Rollback booking if payment intent fails
      await supabase.from('bookings').delete().eq('id', booking.id);
      return NextResponse.json(
        { error: 'Payment initialization failed', details: paymentResult.error },
        { status: 500 }
      );
    }

    // Update booking with payment intent
    await supabase
      .from('bookings')
      .update({ 
        payment_status: 'pending',
        stripe_payment_intent_id: paymentResult.paymentIntentId,
      })
      .eq('id', booking.id);

    // Notify sitter (async, don't block response)
    const sitterUser = sitterProfile.user as { name?: string; email?: string; phone?: string } | null;
    
    // Email notification
    if (sitterUser?.email) {
      const dates = `${start.toLocaleDateString('hr-HR')} – ${end.toLocaleDateString('hr-HR')}`;
      const serviceName = SERVICE_LABELS[service_type as ServiceType] || service_type;
      
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
      sendSMS({ to: sitterUser.phone, message: smsMessage }).catch(err => {
        appLogger.error('instant-booking', 'SMS failed', { error: String(err) });
      });
    }

    return NextResponse.json({
      booking,
      paymentIntentId: paymentResult.paymentIntentId,
      clientSecret: paymentResult.clientSecret,
      message: 'Instant booking created successfully',
    }, { status: 201 });

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    appLogger.error('instant-booking', 'Unexpected error', { error: errorMsg });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { apiError } from '@/lib/api-errors';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { lostPetSightingSchema } from '@/lib/validations';
import { sendEmail } from '@/lib/email';
import { lostPetSightingEmail } from '@/lib/email-templates';
import { appLogger } from '@/lib/logger';
import { rateLimit } from '@/lib/rate-limit';
import { sendPushToMultiple } from '@/lib/push-notifications';
import { getUserPushSubscriptions, canSendNotification } from '@/lib/db/notifications';

function normalizeSightingText(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError({ status: 400, code: 'INVALID_JSON', message: 'Invalid JSON body' });
  }

  const parsed = lostPetSightingSchema.safeParse(body);
  if (!parsed.success) {
    return apiError({ status: 400, code: 'INVALID_INPUT', message: 'Neispravna prijava viđenja.', details: parsed.error.flatten() });
  }

  try {
    const { id } = await context.params;
    const supabase = await createClient();
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

    if (!rateLimit(`lost-pet-sighting:${id}:${ip}`, 5, 10 * 60_000)) {
      return apiError({ status: 429, code: 'RATE_LIMITED', message: 'Previše dojava u kratkom roku. Pokušajte ponovno kasnije.' });
    }
    const { data: pet, error: fetchError } = await supabase
      .from('lost_pets')
      .select('sightings, name, contact_name, contact_email, status, hidden, user_id')
      .eq('id', id)
      .single();

    if (fetchError || !pet) {
      return apiError({ status: 404, code: 'LOST_PET_NOT_FOUND', message: 'Oglas nije pronađen.' });
    }

    if ((pet.hidden as boolean) || (pet.status as string) !== 'lost') {
      return apiError({ status: 400, code: 'LISTING_NOT_ACTIVE', message: 'Oglas više nije aktivan.' });
    }

    const currentSightings = Array.isArray(pet.sightings) ? pet.sightings : [];

    // Duplicate / abuse guard: reject near-identical sightings submitted in the last hour
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const normalizedLocation = normalizeSightingText(parsed.data.location);
    const normalizedDescription = normalizeSightingText(parsed.data.description);
    const isDuplicate = currentSightings.some(
      (s: { location?: string; description?: string; date?: string }) =>
        normalizeSightingText(s.location || '') === normalizedLocation &&
        normalizeSightingText(s.description || '') === normalizedDescription &&
        Boolean(s.date) && new Date(s.date as string).getTime() > oneHourAgo,
    );
    if (isDuplicate) {
      return apiError({ status: 429, code: 'DUPLICATE_SIGHTING', message: 'Slično viđenje je već prijavljeno nedavno.' });
    }

    // Cap sightings per listing to prevent unbounded growth
    if (currentSightings.length >= 50) {
      return apiError({ status: 400, code: 'SIGHTINGS_LIMIT', message: 'Maksimalan broj viđenja za ovaj oglas je dosegnut.' });
    }

    const newSighting = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      location: parsed.data.location,
      description: parsed.data.description,
      status: 'new' as const,
      ...(parsed.data.photo_url && { photo_url: parsed.data.photo_url }),
    };

    const { error } = await supabase
      .from('lost_pets')
      .update({ sightings: [...currentSightings, newSighting] })
      .eq('id', id);

    if (error) {
      return apiError({ status: 500, code: 'SIGHTING_CREATE_FAILED', message: 'Prijava viđenja nije spremljena.' });
    }

    // Notify pet owner (best-effort, don't fail the request)
    try {
      const admin = createAdminClient();
      let ownerEmail = typeof pet.contact_email === 'string' ? pet.contact_email.trim() : '';
      let ownerName = typeof pet.contact_name === 'string' && pet.contact_name.trim() ? pet.contact_name.trim() : 'Vlasnik';
      let notificationsAllowed = Boolean(ownerEmail);

      if (pet.user_id) {
        const { data: owner } = await admin
          .from('users')
          .select('email, name')
          .eq('id', pet.user_id)
          .maybeSingle();

        if (owner?.email) ownerEmail = String(owner.email).trim();
        if (owner?.name) ownerName = String(owner.name).trim();

        const { data: prefs } = await admin
          .from('notification_preferences')
          .select('email_enabled, lost_pets_enabled')
          .eq('user_id', pet.user_id)
          .maybeSingle();

        notificationsAllowed = Boolean(ownerEmail) && (!prefs || (prefs.email_enabled !== false && prefs.lost_pets_enabled !== false));
      }

      if (notificationsAllowed && ownerEmail) {
        const html = lostPetSightingEmail(
          ownerName,
          pet.name as string,
          parsed.data.location,
          parsed.data.description,
          id,
        );
        const emailResult = await sendEmail({
          to: ownerEmail,
          subject: `Novo viđenje ljubimca "${pet.name as string}"`,
          html,
        });

        if (!emailResult.success) {
          appLogger.error('sighting-notify', 'Failed to notify owner', {
            listingId: id,
            ownerEmail,
            error: emailResult.error || 'Unknown email failure',
          });
        }
      }

      // Push notification to owner
      if (pet.user_id) {
        try {
          const canSendPush = await canSendNotification(pet.user_id, 'push', 'lost_pets');
          if (canSendPush) {
            const subscriptions = await getUserPushSubscriptions(pet.user_id);
            if (subscriptions.length > 0) {
              const pushPayload = {
                title: `Novo viđenje: ${pet.name as string}`,
                body: `Netko je vidio ${pet.name as string} u ${parsed.data.location}`,
                tag: 'lost_pet_sighting',
                requireInteraction: true,
                data: { url: `/izgubljeni/${id}` },
              };
              sendPushToMultiple(
                subscriptions.map(sub => ({
                  endpoint: sub.endpoint,
                  keys: { p256dh: sub.p256dh, auth: sub.auth },
                })),
                pushPayload
              ).catch(err => {
                appLogger.error('sighting-notify', 'Failed to send push notification', { error: String(err) });
              });
            }
          }
        } catch (pushErr) {
          appLogger.error('sighting-notify', 'Push notification error', {
            error: pushErr instanceof Error ? pushErr.message : String(pushErr),
          });
        }
      }
    } catch (emailErr) {
      appLogger.error('sighting-notify', 'Failed to notify owner', {
        listingId: id,
        error: emailErr instanceof Error ? emailErr.message : String(emailErr),
      });
    }

    return NextResponse.json({ sighting: newSighting }, { status: 201 });
  } catch {
    return apiError({ status: 500, code: 'SIGHTING_CREATE_FAILED', message: 'Prijava viđenja nije spremljena.' });
  }
}


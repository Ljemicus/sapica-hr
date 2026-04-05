import { NextResponse } from 'next/server';
import { apiError } from '@/lib/api-errors';
import { createClient } from '@/lib/supabase/server';
import { lostPetSightingSchema } from '@/lib/validations';
import { insertSighting } from '@/lib/db';
import { rateLimit } from '@/lib/rate-limit';
import { sendEmail } from '@/lib/email';
import { appLogger } from '@/lib/logger';

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('lost_pet_sightings')
      .select('*')
      .eq('lost_pet_id', id)
      .order('seen_at', { ascending: false });

    if (error) {
      return apiError({ status: 500, code: 'SIGHTING_FETCH_FAILED', message: 'Dohvat viđenja nije uspio.' });
    }

    return NextResponse.json({ sightings: data ?? [] });
  } catch {
    return apiError({ status: 500, code: 'SIGHTING_FETCH_FAILED', message: 'Dohvat viđenja nije uspio.' });
  }
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const { id } = await context.params;

  if (!rateLimit(`sighting:${id}:${ip}`, 5, 60_000)) {
    return apiError({ status: 429, code: 'RATE_LIMITED', message: 'Previše prijava. Pokušajte ponovno za minutu.' });
  }

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
    // Verify the lost pet exists
    const supabase = await createClient();
    const { data: pet, error: fetchError } = await supabase
      .from('lost_pets')
      .select('id, user_id, name, contact_email, status')
      .eq('id', id)
      .single();

    if (fetchError || !pet) {
      return apiError({ status: 404, code: 'LOST_PET_NOT_FOUND', message: 'Oglas nije pronađen.' });
    }

    // Insert into normalized lost_pet_sightings table
    const sighting = await insertSighting({
      lost_pet_id: id,
      location_label: parsed.data.location_label,
      lat: parsed.data.lat ?? undefined,
      lng: parsed.data.lng ?? undefined,
      seen_at: parsed.data.seen_at,
      photo_url: parsed.data.photo_url ?? undefined,
      description: parsed.data.description,
      reporter_ip: ip,
    });

    if (!sighting) {
      return apiError({ status: 500, code: 'SIGHTING_CREATE_FAILED', message: 'Prijava viđenja nije spremljena.' });
    }

    // Best-effort owner email notification (fire-and-forget)
    notifyOwner(pet, sighting.location_label).catch((err) => {
      appLogger.error('sighting-notify', 'Failed to send sighting notification', { error: String(err) });
    });

    return NextResponse.json({ sighting }, { status: 201 });
  } catch {
    return apiError({ status: 500, code: 'SIGHTING_CREATE_FAILED', message: 'Prijava viđenja nije spremljena.' });
  }
}

async function notifyOwner(
  pet: { user_id: string | null; name: string; contact_email: string | null },
  locationLabel: string,
) {
  const email = pet.contact_email;
  if (!email) return;

  // Respect notification preferences if the owner has a user account
  if (pet.user_id) {
    try {
      const supabase = await createClient();
      const { data: prefs } = await supabase
        .from('notification_preferences')
        .select('email_enabled, lost_pets_enabled')
        .eq('user_id', pet.user_id)
        .single();

      if (prefs && (!prefs.email_enabled || !prefs.lost_pets_enabled)) return;
    } catch {
      // If we can't fetch prefs, default to sending
    }
  }

  await sendEmail({
    to: email,
    subject: `Novo viđenje: ${pet.name}`,
    html: `
      <h2>Netko je vidio ${pet.name}!</h2>
      <p><strong>Lokacija:</strong> ${escapeHtml(locationLabel)}</p>
      <p>Prijavite se na PetPark za više detalja.</p>
    `,
  });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

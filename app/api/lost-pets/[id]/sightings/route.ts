import { NextResponse } from 'next/server';
import { apiError } from '@/lib/api-errors';
import { createClient } from '@/lib/supabase/server';
import { lostPetSightingSchema } from '@/lib/validations';
import { sendEmail } from '@/lib/email';
import { lostPetSightingEmail } from '@/lib/email-templates';
import { appLogger } from '@/lib/logger';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
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
    const { data: pet, error: fetchError } = await supabase
      .from('lost_pets')
      .select('sightings, name, contact_name, contact_email, status')
      .eq('id', id)
      .single();

    if (fetchError || !pet) {
      return apiError({ status: 404, code: 'LOST_PET_NOT_FOUND', message: 'Oglas nije pronađen.' });
    }

    if ((pet.status as string) !== 'lost') {
      return apiError({ status: 400, code: 'LISTING_NOT_ACTIVE', message: 'Oglas više nije aktivan.' });
    }

    const currentSightings = Array.isArray(pet.sightings) ? pet.sightings : [];

    // Duplicate / abuse guard: reject if same location text was submitted in last hour
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const isDuplicate = currentSightings.some(
      (s: { location?: string; date?: string }) =>
        s.location === parsed.data.location &&
        s.date && new Date(s.date).getTime() > oneHourAgo,
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
    if (pet.contact_email) {
      try {
        const html = lostPetSightingEmail(
          (pet.contact_name as string) || 'Vlasnik',
          pet.name as string,
          parsed.data.location,
          parsed.data.description,
          id,
        );
        await sendEmail({
          to: pet.contact_email as string,
          subject: `Novo viđenje ljubimca "${pet.name as string}"`,
          html,
        });
      } catch (emailErr) {
        appLogger.error('sighting-notify', 'Failed to notify owner', {
          listingId: id,
          error: emailErr instanceof Error ? emailErr.message : String(emailErr),
        });
      }
    }

    return NextResponse.json({ sighting: newSighting }, { status: 201 });
  } catch {
    return apiError({ status: 500, code: 'SIGHTING_CREATE_FAILED', message: 'Prijava viđenja nije spremljena.' });
  }
}

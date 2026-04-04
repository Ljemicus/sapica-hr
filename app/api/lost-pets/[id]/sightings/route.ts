import { NextResponse } from 'next/server';
import { apiError } from '@/lib/api-errors';
import { createClient } from '@/lib/supabase/server';
import { lostPetSightingSchema } from '@/lib/validations';

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
      .select('sightings')
      .eq('id', id)
      .single();

    if (fetchError || !pet) {
      return apiError({ status: 404, code: 'LOST_PET_NOT_FOUND', message: 'Oglas nije pronađen.' });
    }

    const currentSightings = Array.isArray(pet.sightings) ? pet.sightings : [];
    const newSighting = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      location: parsed.data.location,
      description: parsed.data.description,
    };

    const { error } = await supabase
      .from('lost_pets')
      .update({ sightings: [...currentSightings, newSighting] })
      .eq('id', id);

    if (error) {
      return apiError({ status: 500, code: 'SIGHTING_CREATE_FAILED', message: 'Prijava viđenja nije spremljena.' });
    }

    return NextResponse.json({ sighting: newSighting }, { status: 201 });
  } catch {
    return apiError({ status: 500, code: 'SIGHTING_CREATE_FAILED', message: 'Prijava viđenja nije spremljena.' });
  }
}

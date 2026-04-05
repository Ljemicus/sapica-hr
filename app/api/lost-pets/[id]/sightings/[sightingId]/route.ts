import { NextResponse } from 'next/server';
import { apiError } from '@/lib/api-errors';
import { getAuthUser } from '@/lib/auth';
import { getLostPet, updateLostPetSightingStatus } from '@/lib/db';
import { lostPetSightingStatusUpdateSchema } from '@/lib/validations';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; sightingId: string }> },
) {
  const user = await getAuthUser();
  if (!user) return apiError({ status: 401, code: 'UNAUTHORIZED', message: 'Unauthorized' });

  const { id, sightingId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError({ status: 400, code: 'INVALID_JSON', message: 'Invalid JSON body' });
  }

  const parsed = lostPetSightingStatusUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return apiError({ status: 400, code: 'INVALID_INPUT', message: 'Neispravan status dojave.', details: parsed.error.flatten() });
  }

  const pet = await getLostPet(id);
  if (!pet) {
    return apiError({ status: 404, code: 'NOT_FOUND', message: 'Listing not found' });
  }

  if (pet.user_id !== user.id) {
    return apiError({ status: 403, code: 'FORBIDDEN', message: 'You can only update your own listings' });
  }

  if (pet.status !== 'lost' || pet.hidden) {
    return apiError({ status: 400, code: 'LISTING_NOT_ACTIVE', message: 'Only active lost-pet listings can be moderated' });
  }

  const existing = pet.sightings.find((sighting) => sighting.id === sightingId);
  if (!existing) {
    return apiError({ status: 404, code: 'SIGHTING_NOT_FOUND', message: 'Sighting not found' });
  }

  const updated = await updateLostPetSightingStatus(id, sightingId, parsed.data.status);
  if (!updated) {
    return apiError({ status: 500, code: 'UPDATE_FAILED', message: 'Failed to update sighting status' });
  }

  const sighting = updated.sightings.find((entry) => entry.id === sightingId);
  return NextResponse.json({ sighting, sightings: updated.sightings });
}

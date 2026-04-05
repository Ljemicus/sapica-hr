import { NextResponse } from 'next/server';
import { apiError } from '@/lib/api-errors';
import { getAuthUser } from '@/lib/auth';
import { addLostPetOwnerUpdate, getLostPet } from '@/lib/db/lost-pets';
import { lostPetOwnerUpdateSchema } from '@/lib/validations';

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const pet = await getLostPet(id);

  if (!pet) {
    return apiError({ status: 404, code: 'NOT_FOUND', message: 'Listing not found' });
  }

  return NextResponse.json({ updates: pet.updates });
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!user) return apiError({ status: 401, code: 'UNAUTHORIZED', message: 'Unauthorized' });

  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError({ status: 400, code: 'INVALID_JSON', message: 'Invalid JSON body' });
  }

  const parsed = lostPetOwnerUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return apiError({ status: 400, code: 'INVALID_INPUT', message: 'Neispravno ažuriranje.', details: parsed.error.flatten() });
  }

  const pet = await getLostPet(id);
  if (!pet) {
    return apiError({ status: 404, code: 'NOT_FOUND', message: 'Listing not found' });
  }

  if (pet.user_id !== user.id) {
    return apiError({ status: 403, code: 'FORBIDDEN', message: 'You can only update your own listings' });
  }

  if (pet.status !== 'lost' || pet.hidden) {
    return apiError({ status: 400, code: 'LISTING_NOT_ACTIVE', message: 'Only active lost-pet listings can receive owner updates' });
  }

  const updated = await addLostPetOwnerUpdate(id, parsed.data);
  if (!updated) {
    return apiError({ status: 500, code: 'UPDATE_CREATE_FAILED', message: 'Ažuriranje nije spremljeno.' });
  }

  return NextResponse.json({ updates: updated.updates, update: updated.updates[0] }, { status: 201 });
}

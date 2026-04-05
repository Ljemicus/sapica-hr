import { NextResponse } from 'next/server';
import { apiError } from '@/lib/api-errors';
import { getAuthUser } from '@/lib/auth';
import { getLostPet, markLostPetFound } from '@/lib/db';
import { markLostPetFoundSchema } from '@/lib/validations';

/**
 * PATCH /api/lost-pets/[id]/status
 * Owner marks their listing as found, with method and optional reunion message.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthUser();
  if (!user) return apiError({ status: 401, code: 'UNAUTHORIZED', message: 'Unauthorized' });

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError({ status: 400, code: 'INVALID_JSON', message: 'Invalid JSON body' });
  }

  const parsed = markLostPetFoundSchema.safeParse(body);
  if (!parsed.success) {
    return apiError({ status: 400, code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message || 'Invalid input' });
  }

  const pet = await getLostPet(id);
  if (!pet) {
    return apiError({ status: 404, code: 'NOT_FOUND', message: 'Listing not found' });
  }

  if (pet.user_id !== user.id) {
    return apiError({ status: 403, code: 'FORBIDDEN', message: 'You can only update your own listings' });
  }

  if (pet.status === 'found') {
    return apiError({ status: 400, code: 'ALREADY_FOUND', message: 'This listing is already marked as found' });
  }

  const updated = await markLostPetFound(id, {
    found_method: parsed.data.found_method,
    reunion_message: parsed.data.reunion_message || undefined,
  });
  if (!updated) {
    return apiError({ status: 500, code: 'UPDATE_FAILED', message: 'Failed to update status' });
  }

  return NextResponse.json({ pet: updated });
}

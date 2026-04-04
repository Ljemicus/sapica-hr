import { NextResponse } from 'next/server';
import { apiError } from '@/lib/api-errors';
import { getAuthUser } from '@/lib/auth';
import { getLostPet, updateLostPetStatus } from '@/lib/db';

/**
 * PATCH /api/lost-pets/[id]/status
 * Owner marks their listing as found.
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

  const { status } = (body || {}) as { status?: string };
  if (status !== 'found') {
    return apiError({ status: 400, code: 'INVALID_STATUS', message: 'Only "found" status is allowed' });
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

  const updated = await updateLostPetStatus(id, 'found');
  if (!updated) {
    return apiError({ status: 500, code: 'UPDATE_FAILED', message: 'Failed to update status' });
  }

  return NextResponse.json({ pet: updated });
}

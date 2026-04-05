import { NextResponse } from 'next/server';
import { apiError } from '@/lib/api-errors';
import { getAuthUser } from '@/lib/auth';
import { getLostPet, renewLostPet } from '@/lib/db';

/**
 * POST /api/lost-pets/[id]/renew
 * Owner renews (extends) their expired or expiring listing for another 30 days.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthUser();
  if (!user) return apiError({ status: 401, code: 'UNAUTHORIZED', message: 'Unauthorized' });

  const { id } = await params;

  const pet = await getLostPet(id);
  if (!pet) {
    return apiError({ status: 404, code: 'NOT_FOUND', message: 'Listing not found' });
  }

  if (pet.user_id !== user.id) {
    return apiError({ status: 403, code: 'FORBIDDEN', message: 'You can only renew your own listings' });
  }

  if (pet.status === 'found') {
    return apiError({ status: 400, code: 'ALREADY_FOUND', message: 'Found listings cannot be renewed' });
  }

  const updated = await renewLostPet(id);
  if (!updated) {
    return apiError({ status: 500, code: 'RENEW_FAILED', message: 'Failed to renew listing' });
  }

  return NextResponse.json({ pet: updated });
}

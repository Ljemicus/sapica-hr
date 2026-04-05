import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getLostPetsByUser } from '@/lib/db';
import { apiError } from '@/lib/api-errors';
import type { LostPetFilters } from '@/lib/db/lost-pets';

/**
 * GET /api/user/lost-pets
 * Owner-facing endpoint to get their own lost pet listings
 * Supports lead/sighting filtering and sorting
 */
export async function GET(request: Request) {
  const user = await getAuthUser();
  if (!user) {
    return apiError({ status: 401, code: 'UNAUTHORIZED', message: 'Unauthorized' });
  }

  const { searchParams } = new URL(request.url);
  
  // Parse filter params
  const statusParam = searchParams.get('status') as 'lost' | 'found' | 'expired' | null;
  const hasUnreviewedSightings = searchParams.get('hasUnreviewedSightings');
  const minSightingCount = searchParams.get('minSightingCount');
  const maxSightingCount = searchParams.get('maxSightingCount');
  const sortBy = searchParams.get('sortBy') as LostPetFilters['sortBy'];
  const sortOrder = searchParams.get('sortOrder') as LostPetFilters['sortOrder'];

  const pets = await getLostPetsByUser(user.id, {
    status: statusParam || undefined,
    excludeExpired: !statusParam,
    // Lead/sighting filters
    hasUnreviewedSightings: hasUnreviewedSightings !== null 
      ? hasUnreviewedSightings === 'true' 
      : undefined,
    minSightingCount: minSightingCount !== null 
      ? parseInt(minSightingCount, 10) 
      : undefined,
    maxSightingCount: maxSightingCount !== null 
      ? parseInt(maxSightingCount, 10) 
      : undefined,
    // Sorting
    sortBy: sortBy || undefined,
    sortOrder: sortOrder || undefined,
  });

  return NextResponse.json(pets);
}

import { NextResponse } from 'next/server';
import { getLostPets } from '@/lib/db';
import type { LostPetFilters } from '@/lib/db/lost-pets';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get('status') as 'lost' | 'found' | 'expired' | null;
  
  // Parse lead/sighting filter params
  const hasUnreviewedSightings = searchParams.get('hasUnreviewedSightings');
  const minSightingCount = searchParams.get('minSightingCount');
  const maxSightingCount = searchParams.get('maxSightingCount');
  const sortBy = searchParams.get('sortBy') as LostPetFilters['sortBy'];
  const sortOrder = searchParams.get('sortOrder') as LostPetFilters['sortOrder'];
  
  const pets = await getLostPets({
    city: searchParams.get('city') || undefined,
    species: (searchParams.get('species') as 'pas' | 'macka' | 'ostalo' | null) || undefined,
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

  const sanitized = pets.map((pet) => ({
    ...pet,
    contact_name: '',
    contact_phone: '',
    contact_email: '',
  }));

  return NextResponse.json(sanitized);
}

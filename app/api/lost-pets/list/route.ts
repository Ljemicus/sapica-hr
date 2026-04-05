import { NextResponse } from 'next/server';
import { getLostPets } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get('status') as 'lost' | 'found' | 'expired' | null;
  const pets = await getLostPets({
    city: searchParams.get('city') || undefined,
    species: (searchParams.get('species') as 'pas' | 'macka' | 'ostalo' | null) || undefined,
    status: statusParam || undefined,
    excludeExpired: !statusParam,
  });

  const sanitized = pets.map((pet) => ({
    ...pet,
    contact_name: '',
    contact_phone: '',
    contact_email: '',
  }));

  return NextResponse.json(sanitized);
}

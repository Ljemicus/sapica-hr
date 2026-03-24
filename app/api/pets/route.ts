import { NextResponse } from 'next/server';
import { getMockUser } from '@/lib/mock-auth';
import { mockPets, getPetsForOwner } from '@/lib/mock-data';
import { petSchema } from '@/lib/validations';

export async function GET() {
  const user = await getMockUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const pets = getPetsForOwner(user.id);
  return NextResponse.json(pets);
}

export async function POST(request: Request) {
  const user = await getMockUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const parsed = petSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const pet = {
    id: `pet-mock-${Date.now()}`,
    owner_id: user.id,
    name: parsed.data.name,
    species: parsed.data.species,
    breed: parsed.data.breed || null,
    age: parsed.data.age ?? null,
    weight: parsed.data.weight ?? null,
    special_needs: parsed.data.special_needs || null,
    photo_url: null,
    created_at: new Date().toISOString(),
  };

  mockPets.push(pet);
  return NextResponse.json(pet, { status: 201 });
}

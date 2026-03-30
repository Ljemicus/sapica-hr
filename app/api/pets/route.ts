import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getPetsByOwner, createPet } from '@/lib/db';
import { petSchema } from '@/lib/validations';

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const pets = await getPetsByOwner(user.id);
  return NextResponse.json(pets);
}

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const parsed = petSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const pet = await createPet({
    owner_id: user.id,
    name: parsed.data.name,
    species: parsed.data.species,
    breed: parsed.data.breed || null,
    age: parsed.data.age ?? null,
    weight: parsed.data.weight ?? null,
    special_needs: parsed.data.special_needs || null,
    photo_url: parsed.data.photo_url || null,
  });

  if (!pet) return NextResponse.json({ error: 'Failed to create pet' }, { status: 500 });
  return NextResponse.json(pet, { status: 201 });
}

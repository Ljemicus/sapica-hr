import { NextResponse } from 'next/server';
import { apiError } from '@/lib/api-errors';
import { getAuthUser } from '@/lib/auth';
import { getPetsByOwner, createPet } from '@/lib/db';
import { petSchema } from '@/lib/validations';
import type { Pet } from '@/lib/types';

type PetsGetResponse = Pet[];

export async function GET() {
  const user = await getAuthUser();
  if (!user) return apiError({ status: 401, code: 'UNAUTHORIZED', message: 'Unauthorized' });

  const pets = await getPetsByOwner(user.id);
  return NextResponse.json<PetsGetResponse>(pets);
}

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return apiError({ status: 401, code: 'UNAUTHORIZED', message: 'Unauthorized' });

  let body;
  try {
    body = await request.json();
  } catch {
    return apiError({ status: 400, code: 'INVALID_JSON', message: 'Invalid JSON body' });
  }
  const parsed = petSchema.safeParse(body);
  if (!parsed.success) return apiError({ status: 400, code: 'INVALID_INPUT', message: 'Neispravan pet payload.', details: parsed.error.flatten() });

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

  if (!pet) return apiError({ status: 500, code: 'PET_CREATE_FAILED', message: 'Failed to create pet' });
  return NextResponse.json(pet, { status: 201 });
}

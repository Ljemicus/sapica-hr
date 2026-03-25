import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getPetsByOwner } from '@/lib/db';
import { petSchema } from '@/lib/validations';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const pets = await getPetsByOwner(user.id);
  return NextResponse.json(pets);
}

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const parsed = petSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const supabase = await createClient();
  const { data: pet, error } = await supabase
    .from('pets')
    .insert({
      owner_id: user.id,
      name: parsed.data.name,
      species: parsed.data.species,
      breed: parsed.data.breed || null,
      age: parsed.data.age ?? null,
      weight: parsed.data.weight ?? null,
      special_needs: parsed.data.special_needs || null,
      photo_url: null,
    })
    .select()
    .single();

  if (error || !pet) return NextResponse.json({ error: 'Failed to create pet' }, { status: 500 });
  return NextResponse.json(pet, { status: 201 });
}

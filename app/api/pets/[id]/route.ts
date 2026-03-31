import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getPet, createPet } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';
import { petSchema } from '@/lib/validations';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const pet = await getPet(id);
  if (!pet || pet.owner_id !== user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await request.json().catch(() => null);
  const parsed = petSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const supabase = await createClient();
  const { data, error } = await supabase.from('pets').update({
    name: parsed.data.name,
    species: parsed.data.species,
    breed: parsed.data.breed || null,
    age: parsed.data.age ?? null,
    weight: parsed.data.weight ?? null,
    special_needs: parsed.data.special_needs || null,
    photo_url: parsed.data.photo_url || null,
  }).eq('id', id).eq('owner_id', user.id).select().single();

  if (error || !data) return NextResponse.json({ error: 'Failed to update pet' }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const pet = await getPet(id);
  if (!pet || pet.owner_id !== user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const supabase = await createClient();
  const { error } = await supabase.from('pets').delete().eq('id', id).eq('owner_id', user.id);
  if (error) return NextResponse.json({ error: 'Failed to delete pet' }, { status: 500 });
  return NextResponse.json({ success: true });
}

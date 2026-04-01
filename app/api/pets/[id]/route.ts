import { NextResponse } from 'next/server';
import { apiError } from '@/lib/api-errors';
import { getAuthUser } from '@/lib/auth';
import { getPet, createPet } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';
import { petSchema } from '@/lib/validations';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!user) return apiError({ status: 401, code: 'UNAUTHORIZED', message: 'Unauthorized' });
  const { id } = await params;
  const pet = await getPet(id);
  if (!pet || pet.owner_id !== user.id) return apiError({ status: 404, code: 'PET_NOT_FOUND', message: 'Not found' });

  const body = await request.json().catch(() => null);
  const parsed = petSchema.safeParse(body);
  if (!parsed.success) return apiError({ status: 400, code: 'INVALID_INPUT', message: 'Neispravan pet payload.', details: parsed.error.flatten() });

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

  if (error || !data) return apiError({ status: 500, code: 'PET_UPDATE_FAILED', message: 'Failed to update pet' });
  return NextResponse.json(data);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!user) return apiError({ status: 401, code: 'UNAUTHORIZED', message: 'Unauthorized' });
  const { id } = await params;
  const pet = await getPet(id);
  if (!pet || pet.owner_id !== user.id) return apiError({ status: 404, code: 'PET_NOT_FOUND', message: 'Not found' });

  const supabase = await createClient();
  const { error } = await supabase.from('pets').delete().eq('id', id).eq('owner_id', user.id);
  if (error) return apiError({ status: 500, code: 'PET_DELETE_FAILED', message: 'Failed to delete pet' });
  return NextResponse.json({ success: true });
}

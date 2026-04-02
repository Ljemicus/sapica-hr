import { NextResponse } from 'next/server';
import { apiError } from '@/lib/api-errors';
import { getAuthUser } from '@/lib/auth';
import { getPassport, updatePassport } from '@/lib/db';
import { getPet } from '@/lib/db';
import { petPassportSchema } from '@/lib/validations';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ petId: string }> }
) {
  const user = await getAuthUser();
  if (!user) return apiError({ status: 401, code: 'UNAUTHORIZED', message: 'Unauthorized' });

  const { petId } = await params;
  const pet = await getPet(petId);
  if (!pet || pet.owner_id !== user.id) {
    return apiError({ status: 404, code: 'PET_NOT_FOUND', message: 'Not found' });
  }

  const passport = await getPassport(petId);
  if (!passport) return apiError({ status: 404, code: 'PASSPORT_NOT_FOUND', message: 'Not found' });
  return NextResponse.json(passport);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ petId: string }> }
) {
  const user = await getAuthUser();
  if (!user) return apiError({ status: 401, code: 'UNAUTHORIZED', message: 'Unauthorized' });

  const { petId } = await params;
  const pet = await getPet(petId);
  if (!pet || pet.owner_id !== user.id) {
    return apiError({ status: 404, code: 'PET_NOT_FOUND', message: 'Not found' });
  }

  const body = await request.json().catch(() => null);
  if (!body) return apiError({ status: 400, code: 'INVALID_JSON', message: 'Invalid JSON body' });

  const parsed = petPassportSchema.safeParse(body);
  if (!parsed.success) return apiError({ status: 400, code: 'INVALID_INPUT', message: 'Neispravan passport payload.', details: parsed.error.flatten() });

  const result = await updatePassport(petId, {
    vaccinations: parsed.data.vaccinations,
    allergies: parsed.data.allergies,
    medications: parsed.data.medications,
    vet_info: parsed.data.vet_info,
    notes: parsed.data.notes,
  });

  if (!result) return apiError({ status: 500, code: 'PASSPORT_UPDATE_FAILED', message: 'Failed to update passport' });
  return NextResponse.json(result);
}

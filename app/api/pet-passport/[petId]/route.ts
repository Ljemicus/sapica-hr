import { NextResponse } from 'next/server';
import { apiError } from '@/lib/api-errors';
import { getPassport } from '@/lib/db';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ petId: string }> }
) {
  const { petId } = await params;
  const passport = await getPassport(petId);
  if (!passport) return apiError({ status: 404, code: 'PASSPORT_NOT_FOUND', message: 'Not found' });
  return NextResponse.json(passport);
}

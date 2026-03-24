import { NextResponse } from 'next/server';
import { getPetPassport } from '@/lib/mock-data';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ petId: string }> }
) {
  const { petId } = await params;
  const passport = getPetPassport(petId);
  if (!passport) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(passport);
}

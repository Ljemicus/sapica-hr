import { NextResponse } from 'next/server';
import { getPassport } from '@/lib/db';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ petId: string }> }
) {
  const { petId } = await params;
  const passport = await getPassport(petId);
  if (!passport) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(passport);
}

import { NextResponse } from 'next/server';
import { getPrograms } from '@/lib/db';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const programs = await getPrograms(id);
  return NextResponse.json(programs);
}

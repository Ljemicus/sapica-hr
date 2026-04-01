import { NextResponse } from 'next/server';
import { getPrograms } from '@/lib/db';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (!rateLimit(`trainer:programs:${ip}`, 60, 60_000)) {
    return NextResponse.json({ error: 'Previše zahtjeva. Pokušajte kasnije.' }, { status: 429 });
  }

  const { id } = await params;
  const programs = await getPrograms(id);
  return NextResponse.json(programs);
}

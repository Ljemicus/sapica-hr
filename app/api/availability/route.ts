import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getAvailability, setAvailability } from '@/lib/db';
import { appLogger } from '@/lib/logger';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch (err) {
    appLogger.warn('availability.update', 'invalid JSON body', { error: String(err) });
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const { dates, available } = body;

  if (!Array.isArray(dates)) {
    return NextResponse.json({ error: 'dates must be an array' }, { status: 400 });
  }

  await setAvailability(user.id, dates, available ?? true);
  return NextResponse.json({ success: true });
}

export async function GET(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (!rateLimit(`availability:${ip}`, 120, 60_000)) {
    return NextResponse.json({ error: 'Previše zahtjeva. Pokušajte kasnije.' }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const sitterId = searchParams.get('sitter_id');
  if (!sitterId) return NextResponse.json({ error: 'sitter_id required' }, { status: 400 });

  const data = await getAvailability(sitterId);
  return NextResponse.json(data);
}

import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getAvailability, setAvailability } from '@/lib/db';

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { dates, available } = body;

  if (!Array.isArray(dates)) {
    return NextResponse.json({ error: 'dates must be an array' }, { status: 400 });
  }

  await setAvailability(user.id, dates, available ?? true);
  return NextResponse.json({ success: true });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sitterId = searchParams.get('sitter_id');
  if (!sitterId) return NextResponse.json({ error: 'sitter_id required' }, { status: 400 });

  const data = await getAvailability(sitterId);
  return NextResponse.json(data);
}

import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { mockAvailability, getAvailabilityForSitter } from '@/lib/mock-data';

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { dates, available } = body;

  if (!Array.isArray(dates)) {
    return NextResponse.json({ error: 'dates must be an array' }, { status: 400 });
  }

  // Upsert mock availability
  for (const date of dates) {
    const existing = mockAvailability.find(a => a.sitter_id === user.id && a.date === date);
    if (existing) {
      (existing as { available: boolean }).available = available ?? true;
    } else {
      mockAvailability.push({
        id: `avail-mock-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        sitter_id: user.id,
        date,
        available: available ?? true,
      });
    }
  }

  return NextResponse.json({ success: true });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sitterId = searchParams.get('sitter_id');
  if (!sitterId) return NextResponse.json({ error: 'sitter_id required' }, { status: 400 });

  const data = getAvailabilityForSitter(sitterId);
  return NextResponse.json(data);
}

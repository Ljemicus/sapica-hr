import { NextResponse } from 'next/server';
import { getGroomerAvailability, setGroomerAvailability } from '@/lib/db';
import type { GroomerAvailabilitySlot } from '@/lib/types';

type GroomerAvailabilityGetResponse = GroomerAvailabilitySlot[];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const groomerId = searchParams.get('groomer_id');
  const fromDate = searchParams.get('from_date') || undefined;
  const toDate = searchParams.get('to_date') || undefined;

  if (!groomerId) {
    return NextResponse.json({ error: 'groomer_id is required' }, { status: 400 });
  }

  const slots = await getGroomerAvailability(groomerId, fromDate, toDate);
  return NextResponse.json<GroomerAvailabilityGetResponse>(slots);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { groomer_id, slots } = body;

    if (!groomer_id || !slots || !Array.isArray(slots)) {
      return NextResponse.json(
        { error: 'groomer_id and slots[] are required' },
        { status: 400 }
      );
    }

    const result = await setGroomerAvailability(groomer_id, slots);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

import { NextResponse } from 'next/server';
import { getTrainer } from '@/lib/db';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;

  const trainer = await getTrainer(id);
  if (!trainer) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }

  return NextResponse.json({
    trainer,
    programs: [],
    reviews: [],
    availableDates: [],
  });
}

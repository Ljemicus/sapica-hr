import { NextResponse } from 'next/server';
import {
  getProviderGroomerAvailableDates,
  getProviderGroomerById,
  getProviderGroomerReviews,
} from '@/lib/db/provider-groomers';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;

  const groomer = await getProviderGroomerById(id);
  if (!groomer) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }

  const [reviews, availableDatesSet] = await Promise.all([
    getProviderGroomerReviews(id),
    getProviderGroomerAvailableDates(id),
  ]);

  return NextResponse.json({
    groomer,
    reviews,
    availableDates: Array.from(availableDatesSet),
  });
}

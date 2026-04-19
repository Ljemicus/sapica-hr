import { NextResponse } from 'next/server';
import {
  getProviderSitterAvailability,
  getProviderSitterById,
  getProviderSitterReviews,
} from '@/lib/db/provider-sitters';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;

  const profile = await getProviderSitterById(id);
  if (!profile) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }

  const [reviews, availability] = await Promise.all([
    getProviderSitterReviews(id),
    getProviderSitterAvailability(id),
  ]);

  return NextResponse.json({
    profile,
    reviews,
    availability,
  });
}

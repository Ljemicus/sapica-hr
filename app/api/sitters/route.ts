import { NextResponse } from 'next/server';
import { getSitterProfiles } from '@/lib/mock-data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city') || undefined;
  const service = searchParams.get('service') || undefined;
  const minRating = searchParams.get('min_rating') || undefined;
  const minPrice = searchParams.get('min_price') || undefined;
  const maxPrice = searchParams.get('max_price') || undefined;
  const sort = searchParams.get('sort') || undefined;

  const data = getSitterProfiles({ city, service, min_rating: minRating, min_price: minPrice, max_price: maxPrice, sort });
  return NextResponse.json(data);
}

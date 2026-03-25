import { NextResponse } from 'next/server';
import { getSitters } from '@/lib/db';
import type { ServiceType } from '@/lib/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city') || undefined;
  const service = (searchParams.get('service') || undefined) as ServiceType | undefined;
  const minRating = searchParams.get('min_rating');
  const minPrice = searchParams.get('min_price');
  const maxPrice = searchParams.get('max_price');
  const sort = searchParams.get('sort') || undefined;

  const data = await getSitters({
    city,
    service,
    min_rating: minRating ? Number(minRating) : undefined,
    min_price: minPrice ? Number(minPrice) : undefined,
    max_price: maxPrice ? Number(maxPrice) : undefined,
    sort: sort as 'rating' | 'reviews' | 'price_asc' | 'price_desc' | undefined,
  });
  return NextResponse.json(data);
}

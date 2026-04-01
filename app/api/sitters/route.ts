import { NextResponse } from 'next/server';
import { getSitters } from '@/lib/db';
import type { ServiceType } from '@/lib/types';
import { appLogger } from '@/lib/logger';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city') || undefined;
  const service = (searchParams.get('service') || undefined) as ServiceType | undefined;
  const minRating = searchParams.get('min_rating');
  const minPrice = searchParams.get('min_price');
  const maxPrice = searchParams.get('max_price');
  const sort = searchParams.get('sort') || undefined;
  const ip = request.headers.get('x-forwarded-for') || 'unknown';

  if (!rateLimit(`sitters:list:${ip}`, 60, 60_000)) {
    return NextResponse.json({ error: 'Previše zahtjeva. Pokušajte kasnije.' }, { status: 429 });
  }

  try {
    const data = await getSitters({
      city,
      service,
      min_rating: minRating ? Number(minRating) : undefined,
      min_price: minPrice ? Number(minPrice) : undefined,
      max_price: maxPrice ? Number(maxPrice) : undefined,
      sort: sort as 'rating' | 'reviews' | 'price_asc' | 'price_desc' | undefined,
    });
    return NextResponse.json(data);
  } catch (err) {
    appLogger.error('sitters.list', 'failed to fetch sitters', { error: String(err) });
    return NextResponse.json({ error: 'Failed to load sitters' }, { status: 500 });
  }
}

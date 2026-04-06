import { NextResponse } from 'next/server';
import { apiError } from '@/lib/api-errors';
import { getAuthUser } from '@/lib/auth';
import { getVetReviews, createVetReview, getUserVetReview } from '@/lib/db/vet-reviews';
import { vetReviewSchema } from '@/lib/validations';
import { appLogger } from '@/lib/logger';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: vetId } = await params;
  const { searchParams } = new URL(request.url);
  
  const limit = parseInt(searchParams.get('limit') || '10');
  const offset = parseInt(searchParams.get('offset') || '0');
  const serviceType = searchParams.get('service_type') as any;
  const verifiedOnly = searchParams.get('verified_only') === 'true';

  const reviews = await getVetReviews(vetId, {
    limit,
    offset,
    serviceType,
    verifiedOnly,
  });

  return NextResponse.json(reviews);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) {
    return apiError({ status: 401, code: 'UNAUTHORIZED', message: 'Morate biti prijavljeni' });
  }

  const { id: vetId } = await params;

  let body;
  try {
    body = await request.json();
  } catch {
    return apiError({ status: 400, code: 'INVALID_JSON', message: 'Neispravan JSON' });
  }

  const parsed = vetReviewSchema.safeParse({ ...body, vet_id: vetId });
  if (!parsed.success) {
    return apiError({
      status: 400,
      code: 'INVALID_INPUT',
      message: 'Neispravni podaci',
      details: parsed.error.flatten(),
    });
  }

  // Check if user already reviewed this vet
  const existingReview = await getUserVetReview(vetId, user.id);
  if (existingReview) {
    return apiError({
      status: 409,
      code: 'REVIEW_EXISTS',
      message: 'Već ste ostavili recenziju za ovog veterinara',
    });
  }

  const review = await createVetReview({
    vet_id: vetId,
    user_id: user.id,
    booking_id: null,
    rating: parsed.data.rating,
    comment: parsed.data.comment || null,
    service_type: parsed.data.service_type,
    price_paid: parsed.data.price_paid || null,
    visit_date: parsed.data.visit_date || null,
  });

  if (!review) {
    appLogger.error('vetReviews.create', 'Failed to create review', { vetId, userId: user.id });
    return apiError({ status: 500, code: 'CREATE_FAILED', message: 'Greška pri spremanju recenzije' });
  }

  return NextResponse.json(review, { status: 201 });
}

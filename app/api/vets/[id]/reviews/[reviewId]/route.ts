import { NextResponse } from 'next/server';
import { apiError } from '@/lib/api-errors';
import { getAuthUser } from '@/lib/auth';
import { updateVetReview, deleteVetReview } from '@/lib/db/vet-reviews';
import { vetReviewSchema } from '@/lib/validations';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; reviewId: string }> }
) {
  const user = await getAuthUser();
  if (!user) {
    return apiError({ status: 401, code: 'UNAUTHORIZED', message: 'Morate biti prijavljeni' });
  }

  const { reviewId } = await params;

  let body;
  try {
    body = await request.json();
  } catch {
    return apiError({ status: 400, code: 'INVALID_JSON', message: 'Neispravan JSON' });
  }

  const parsed = vetReviewSchema.partial().safeParse(body);
  if (!parsed.success) {
    return apiError({
      status: 400,
      code: 'INVALID_INPUT',
      message: 'Neispravni podaci',
      details: parsed.error.flatten(),
    });
  }

  const review = await updateVetReview(reviewId, user.id, {
    rating: parsed.data.rating,
    comment: parsed.data.comment,
    service_type: parsed.data.service_type,
    price_paid: parsed.data.price_paid,
    visit_date: parsed.data.visit_date,
  });

  if (!review) {
    return apiError({ status: 404, code: 'REVIEW_NOT_FOUND', message: 'Recenzija nije pronađena' });
  }

  return NextResponse.json(review);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; reviewId: string }> }
) {
  const user = await getAuthUser();
  if (!user) {
    return apiError({ status: 401, code: 'UNAUTHORIZED', message: 'Morate biti prijavljeni' });
  }

  const { reviewId } = await params;

  const success = await deleteVetReview(reviewId, user.id);
  if (!success) {
    return apiError({ status: 404, code: 'REVIEW_NOT_FOUND', message: 'Recenzija nije pronađena' });
  }

  return NextResponse.json({ success: true });
}

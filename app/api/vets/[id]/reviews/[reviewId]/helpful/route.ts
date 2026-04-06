import { NextResponse } from 'next/server';
import { apiError } from '@/lib/api-errors';
import { getAuthUser } from '@/lib/auth';
import { markReviewHelpful } from '@/lib/db/vet-reviews';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; reviewId: string }> }
) {
  const user = await getAuthUser();
  if (!user) {
    return apiError({ status: 401, code: 'UNAUTHORIZED', message: 'Morate biti prijavljeni' });
  }

  const { reviewId } = await params;

  const success = await markReviewHelpful(reviewId);
  if (!success) {
    return apiError({ status: 500, code: 'FAILED', message: 'Greška pri označavanju' });
  }

  return NextResponse.json({ success: true });
}

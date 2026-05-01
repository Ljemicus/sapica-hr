import { NextResponse } from 'next/server';
import {
  getProviderTrainerById,
  getProviderTrainerPrograms,
  getProviderTrainerReviews,
  getProviderTrainerAvailableDates,
} from '@/lib/db/provider-trainers';
import { sanitizeProviderReviews, sanitizeTrainerProfile, sanitizeTrainingPrograms } from '@/lib/public/provider-profile-sanitizers';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;

  const trainer = await getProviderTrainerById(id);
  if (!trainer) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }

  const [programs, reviews, availableDates] = await Promise.all([
    getProviderTrainerPrograms(id),
    getProviderTrainerReviews(id),
    getProviderTrainerAvailableDates(id),
  ]);

  return NextResponse.json({
    trainer: sanitizeTrainerProfile(trainer),
    programs: sanitizeTrainingPrograms(programs),
    reviews: sanitizeProviderReviews(reviews),
    availableDates,
  });
}

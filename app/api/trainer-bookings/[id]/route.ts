import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { updateTrainerBookingStatus, getTrainer } from '@/lib/db';
import type { TrainerBookingStatus } from '@/lib/types';
import { appLogger } from '@/lib/logger';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { status, trainerId } = body as { status: TrainerBookingStatus; trainerId?: string };

    const VALID_STATUSES: TrainerBookingStatus[] = ['pending', 'confirmed', 'rejected', 'completed', 'cancelled'];
    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    if (!trainerId) {
      return NextResponse.json({ error: 'trainerId is required for status updates' }, { status: 400 });
    }

    const trainer = await getTrainer(trainerId);
    const isAuthorizedTrainer = Boolean(trainer && trainer.user_id === user.id);

    if (!isAuthorizedTrainer && user.role !== 'admin') {
      appLogger.warn('trainerBookings.update', 'forbidden status update attempt', {
        bookingId: id,
        userId: user.id,
        trainerId,
        status,
      });
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const result = await updateTrainerBookingStatus(id, status);
    if (!result) {
      appLogger.warn('trainerBookings.update', 'status update failed – not found', { bookingId: id, status });
      return NextResponse.json({ error: 'Could not update booking' }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (err) {
    appLogger.error('trainerBookings.update', 'unexpected error', { bookingId: id, error: String(err) });
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

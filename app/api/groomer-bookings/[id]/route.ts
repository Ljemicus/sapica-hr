import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { updateGroomerBookingStatus, cancelGroomerBooking, getGroomer } from '@/lib/db';
import type { GroomerBookingStatus } from '@/lib/types';
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
    const { status, groomerId } = body as { status: GroomerBookingStatus; groomerId?: string };

    if (!status) {
      return NextResponse.json({ error: 'status is required' }, { status: 400 });
    }

    if (status === 'cancelled') {
      const result = await cancelGroomerBooking(id, user.id);
      if (!result) {
        appLogger.warn('groomerBookings.update', 'cancel failed – not found or not owner', { bookingId: id, userId: user.id });
        return NextResponse.json({ error: 'Booking not found or not yours' }, { status: 404 });
      }
      return NextResponse.json(result);
    }

    if (!groomerId) {
      return NextResponse.json({ error: 'groomerId is required for status updates' }, { status: 400 });
    }

    const groomer = await getGroomer(groomerId);
    const isAuthorizedGroomer = Boolean(groomer && groomer.user_id === user.id);

    if (!isAuthorizedGroomer && user.role !== 'admin') {
      appLogger.warn('groomerBookings.update', 'forbidden status update attempt', {
        bookingId: id,
        userId: user.id,
        groomerId,
        status,
      });
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const result = await updateGroomerBookingStatus(id, status);
    if (!result) {
      appLogger.warn('groomerBookings.update', 'status update failed – not found', { bookingId: id, status });
      return NextResponse.json({ error: 'Could not update booking' }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (err) {
    appLogger.error('groomerBookings.update', 'unexpected error', { bookingId: id, error: String(err) });
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

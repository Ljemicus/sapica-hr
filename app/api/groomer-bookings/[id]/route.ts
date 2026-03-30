import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { updateGroomerBookingStatus, cancelGroomerBooking } from '@/lib/db';
import type { GroomerBookingStatus } from '@/lib/types';

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
    const { status } = body as { status: GroomerBookingStatus };

    if (!status) {
      return NextResponse.json({ error: 'status is required' }, { status: 400 });
    }

    // If user is cancelling their own booking
    if (status === 'cancelled') {
      const result = await cancelGroomerBooking(id, user.id);
      if (!result) {
        return NextResponse.json({ error: 'Booking not found or not yours' }, { status: 404 });
      }
      return NextResponse.json(result);
    }

    // Otherwise it's a groomer updating status (confirmed/rejected/completed)
    const result = await updateGroomerBookingStatus(id, status);
    if (!result) {
      return NextResponse.json({ error: 'Could not update booking' }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

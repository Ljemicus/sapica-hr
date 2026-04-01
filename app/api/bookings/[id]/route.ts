import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getBooking, updateBooking } from '@/lib/db';
import type { Booking, BookingStatus } from '@/lib/types';

interface BookingRouteError {
  error: string;
}

const VALID_STATUSES: BookingStatus[] = ['accepted', 'rejected', 'completed', 'cancelled'];
const OWNER_ALLOWED = new Set<BookingStatus>(['cancelled']);
const SITTER_ALLOWED = new Set<BookingStatus>(['accepted', 'rejected', 'completed']);

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getAuthUser();
  if (!user) return NextResponse.json<BookingRouteError>({ error: 'Unauthorized' }, { status: 401 });

  const booking = await getBooking(id);
  if (!booking) return NextResponse.json<BookingRouteError>({ error: 'Booking not found' }, { status: 404 });
  if (booking.owner_id !== user.id && booking.sitter_id !== user.id && user.role !== 'admin') {
    return NextResponse.json<BookingRouteError>({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json<Booking>(booking);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getAuthUser();
  if (!user) return NextResponse.json<BookingRouteError>({ error: 'Unauthorized' }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<BookingRouteError>({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const { status } = body as { status?: BookingStatus };

  if (!status || !VALID_STATUSES.includes(status)) {
    return NextResponse.json<BookingRouteError>({ error: 'Invalid status' }, { status: 400 });
  }

  const booking = await getBooking(id);
  if (!booking) return NextResponse.json<BookingRouteError>({ error: 'Booking not found' }, { status: 404 });

  const isOwner = booking.owner_id === user.id;
  const isSitter = booking.sitter_id === user.id;
  if (!isOwner && !isSitter) {
    return NextResponse.json<BookingRouteError>({ error: 'Forbidden' }, { status: 403 });
  }

  if (isOwner && !OWNER_ALLOWED.has(status)) {
    return NextResponse.json<BookingRouteError>({ error: 'Owner može samo otkazati rezervaciju.' }, { status: 403 });
  }

  if (isSitter && !SITTER_ALLOWED.has(status)) {
    return NextResponse.json<BookingRouteError>({ error: 'Sitter ne može postaviti taj status.' }, { status: 403 });
  }

  if (status === 'completed' && booking.status !== 'accepted') {
    return NextResponse.json<BookingRouteError>({ error: 'Rezervacija mora biti prihvaćena prije završetka.' }, { status: 400 });
  }

  if ((status === 'accepted' || status === 'rejected') && booking.status !== 'pending') {
    return NextResponse.json<BookingRouteError>({ error: 'Samo pending rezervacije mogu biti prihvaćene ili odbijene.' }, { status: 400 });
  }

  const updated = await updateBooking(id, { status });
  if (!updated) return NextResponse.json<BookingRouteError>({ error: 'Booking update failed' }, { status: 500 });

  return NextResponse.json<Booking>(updated);
}

import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getBooking, updateBooking } from '@/lib/db';

const OWNER_ALLOWED = new Set(['cancelled']);
const SITTER_ALLOWED = new Set(['accepted', 'rejected', 'completed']);

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const { status } = body as { status?: 'accepted' | 'rejected' | 'completed' | 'cancelled' };

  if (!status || !['accepted', 'rejected', 'completed', 'cancelled'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const booking = await getBooking(id);
  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

  const isOwner = booking.owner_id === user.id;
  const isSitter = booking.sitter_id === user.id;
  if (!isOwner && !isSitter) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (isOwner && !OWNER_ALLOWED.has(status)) {
    return NextResponse.json({ error: 'Owner može samo otkazati rezervaciju.' }, { status: 403 });
  }

  if (isSitter && !SITTER_ALLOWED.has(status)) {
    return NextResponse.json({ error: 'Sitter ne može postaviti taj status.' }, { status: 403 });
  }

  if (status === 'completed' && booking.status !== 'accepted') {
    return NextResponse.json({ error: 'Rezervacija mora biti prihvaćena prije završetka.' }, { status: 400 });
  }

  if ((status === 'accepted' || status === 'rejected') && booking.status !== 'pending') {
    return NextResponse.json({ error: 'Samo pending rezervacije mogu biti prihvaćene ili odbijene.' }, { status: 400 });
  }

  const updated = await updateBooking(id, { status });
  if (!updated) return NextResponse.json({ error: 'Booking update failed' }, { status: 500 });

  return NextResponse.json(updated);
}

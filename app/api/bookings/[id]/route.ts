import { NextResponse } from 'next/server';
import { getMockUser } from '@/lib/mock-auth';
import { mockBookings } from '@/lib/mock-data';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getMockUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { status } = body;

  if (!['accepted', 'rejected', 'completed', 'cancelled'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const booking = mockBookings.find(b => b.id === id);
  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

  // Mutate in-memory
  (booking as { status: string }).status = status;

  return NextResponse.json(booking);
}

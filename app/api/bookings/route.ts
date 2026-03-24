import { NextResponse } from 'next/server';
import { getMockUser } from '@/lib/mock-auth';
import { mockBookings, mockSitterProfiles, getUserById, mockPets } from '@/lib/mock-data';
import { bookingSchema } from '@/lib/validations';

export async function GET() {
  const user = await getMockUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const field = user.role === 'sitter' ? 'sitter_id' : 'owner_id';
  const bookings = mockBookings
    .filter(b => b[field] === user.id)
    .map(b => ({
      ...b,
      owner: getUserById(b.owner_id),
      sitter: getUserById(b.sitter_id),
      pet: mockPets.find(p => p.id === b.pet_id),
    }));

  return NextResponse.json(bookings);
}

export async function POST(request: Request) {
  const user = await getMockUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { sitter_id, pet_id, service_type, start_date, end_date, note } = parsed.data;

  const sitterProfile = mockSitterProfiles.find(s => s.user_id === sitter_id);
  if (!sitterProfile) return NextResponse.json({ error: 'Sitter not found' }, { status: 404 });

  const pricePerDay = sitterProfile.prices[service_type as keyof typeof sitterProfile.prices] || 0;
  const start = new Date(start_date);
  const end = new Date(end_date);
  const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  const total_price = pricePerDay * days;

  const booking = {
    id: `book-mock-${Date.now()}`,
    owner_id: user.id,
    sitter_id,
    pet_id,
    service_type,
    start_date,
    end_date,
    total_price,
    note: note || null,
    status: 'pending' as const,
    created_at: new Date().toISOString(),
  };

  // Add to in-memory array (won't persist across requests in production, but works for demo)
  mockBookings.push(booking);

  return NextResponse.json(booking, { status: 201 });
}

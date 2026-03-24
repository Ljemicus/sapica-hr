import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { mockMessages, getMessagesForUser, mockUsers } from '@/lib/mock-data';
import { messageSchema } from '@/lib/validations';

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const messages = getMessagesForUser(user.id);
  return NextResponse.json(messages);
}

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const parsed = messageSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const sender = mockUsers.find(u => u.id === user.id)!;

  const message = {
    id: `msg-mock-${Date.now()}`,
    sender_id: user.id,
    receiver_id: parsed.data.receiver_id,
    booking_id: parsed.data.booking_id || null,
    content: parsed.data.content,
    image_url: null,
    read: false,
    created_at: new Date().toISOString(),
    sender,
  };

  mockMessages.push(message);
  return NextResponse.json(message, { status: 201 });
}

import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getConversation, getMessages, sendMessage } from '@/lib/db';
import { appLogger } from '@/lib/logger';
import { messageSchema } from '@/lib/validations';

export async function GET(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const partnerId = searchParams.get('partner_id');

  const messages = partnerId
    ? await getConversation(user.id, partnerId)
    : await getMessages(user.id);

  return NextResponse.json(messages);
}

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const parsed = messageSchema.safeParse(body);
  if (!parsed.success) {
    appLogger.warn('messages.send', 'Message validation failed');
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const message = await sendMessage({
    sender_id: user.id,
    receiver_id: parsed.data.receiver_id,
    booking_id: parsed.data.booking_id || null,
    content: parsed.data.content,
    image_url: null,
    read: false,
  });

  if (!message) {
    appLogger.error('messages.send', 'Failed to send message', {
      senderId: user.id,
      receiverId: parsed.data.receiver_id,
    });
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
  return NextResponse.json(message, { status: 201 });
}

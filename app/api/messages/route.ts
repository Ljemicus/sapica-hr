import { NextResponse } from 'next/server';
import { apiError } from '@/lib/api-errors';
import { getAuthUser } from '@/lib/auth';
import { getConversation, getMessages, sendMessage } from '@/lib/db';
import { appLogger } from '@/lib/logger';
import { messageSchema } from '@/lib/validations';

export async function GET(request: Request) {
  const user = await getAuthUser();
  if (!user) return apiError({ status: 401, code: 'UNAUTHORIZED', message: 'Unauthorized' });

  const { searchParams } = new URL(request.url);
  const partnerId = searchParams.get('partner_id');

  const messages = partnerId
    ? await getConversation(user.id, partnerId)
    : await getMessages(user.id);

  return NextResponse.json(messages);
}

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return apiError({ status: 401, code: 'UNAUTHORIZED', message: 'Unauthorized' });

  let body;
  try {
    body = await request.json();
  } catch {
    return apiError({ status: 400, code: 'INVALID_JSON', message: 'Invalid JSON body' });
  }
  const parsed = messageSchema.safeParse(body);
  if (!parsed.success) {
    appLogger.warn('messages.send', 'Message validation failed');
    return apiError({ status: 400, code: 'INVALID_INPUT', message: 'Neispravna poruka.', details: parsed.error.flatten() });
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
    return apiError({ status: 500, code: 'MESSAGE_SEND_FAILED', message: 'Failed to send message' });
  }
  return NextResponse.json(message, { status: 201 });
}

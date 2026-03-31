import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { createPetUpdate } from '@/lib/db';
import { z } from 'zod';

const schema = z.object({
  booking_id: z.string().uuid(),
  type: z.enum(['photo', 'video', 'text']),
  emoji: z.string().min(1).max(8),
  caption: z.string().min(1).max(500),
  photo_url: z.string().url().nullable().optional(),
});

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user || user.role !== 'sitter') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const update = await createPetUpdate({
    booking_id: parsed.data.booking_id,
    sitter_id: user.id,
    type: parsed.data.type,
    emoji: parsed.data.emoji,
    caption: parsed.data.caption,
    photo_url: parsed.data.photo_url ?? null,
  });

  if (!update) return NextResponse.json({ error: 'Failed to create update' }, { status: 500 });
  return NextResponse.json(update, { status: 201 });
}

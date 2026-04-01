import { NextResponse } from 'next/server';
import { apiError } from '@/lib/api-errors';
import { getAuthUser } from '@/lib/auth';
import { createPetUpdate } from '@/lib/db';
import { z } from 'zod';
import type { PetUpdate } from '@/lib/types';

const schema = z.object({
  booking_id: z.string().uuid(),
  type: z.enum(['photo', 'video', 'text']),
  emoji: z.string().min(1).max(8),
  caption: z.string().min(1).max(500),
  photo_url: z.string().url().nullable().optional(),
});

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user || user.role !== 'sitter') return apiError({ status: 401, code: 'UNAUTHORIZED', message: 'Unauthorized' });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return apiError({ status: 400, code: 'INVALID_INPUT', message: 'Neispravan pet update payload.', details: parsed.error.flatten() });

  const update = await createPetUpdate({
    booking_id: parsed.data.booking_id,
    sitter_id: user.id,
    type: parsed.data.type,
    emoji: parsed.data.emoji,
    caption: parsed.data.caption,
    photo_url: parsed.data.photo_url ?? null,
  });

  if (!update) return apiError({ status: 500, code: 'PET_UPDATE_CREATE_FAILED', message: 'Failed to create update' });
  return NextResponse.json<PetUpdate>(update, { status: 201 });
}

import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { markAsRead } from '@/lib/db';
import { z } from 'zod';

const schema = z.object({
  partner_id: z.string().uuid(),
});

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  await markAsRead(user.id, parsed.data.partner_id);
  return NextResponse.json({ success: true });
}

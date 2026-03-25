import { NextResponse } from 'next/server';
import { getWalksForUser } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const walks = await getWalksForUser(user.id);
  return NextResponse.json(walks);
}

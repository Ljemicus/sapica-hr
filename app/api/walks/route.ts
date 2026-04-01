import { NextResponse } from 'next/server';
import { getWalksForUser } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { appLogger } from '@/lib/logger';

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const walks = await getWalksForUser(user.id);
    return NextResponse.json(walks);
  } catch (err) {
    appLogger.error('walks.list', 'failed to fetch walks', { error: String(err), userId: user.id });
    return NextResponse.json({ error: 'Failed to load walks' }, { status: 500 });
  }
}

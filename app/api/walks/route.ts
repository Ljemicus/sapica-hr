import { NextResponse } from 'next/server';
import { getWalksForUser } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { appLogger } from '@/lib/logger';
import type { Walk } from '@/lib/types';

interface WalksRouteError {
  error: string;
}

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json<WalksRouteError>({ error: 'Unauthorized' }, { status: 401 });

  try {
    const walks = await getWalksForUser(user.id);
    return NextResponse.json<Walk[]>(walks);
  } catch (err) {
    appLogger.error('walks.list', 'failed to fetch walks', { error: String(err), userId: user.id });
    return NextResponse.json<WalksRouteError>({ error: 'Failed to load walks' }, { status: 500 });
  }
}

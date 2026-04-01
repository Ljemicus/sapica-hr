import { NextResponse } from 'next/server';
import { getGroomers } from '@/lib/db';
import type { GroomingServiceType } from '@/lib/types';
import { appLogger } from '@/lib/logger';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city') || undefined;
  const service = (searchParams.get('service') || undefined) as GroomingServiceType | undefined;

  try {
    const data = await getGroomers({ city, service });
    return NextResponse.json(data);
  } catch (err) {
    appLogger.error('groomers.list', 'failed to fetch groomers', { error: String(err) });
    return NextResponse.json({ error: 'Failed to load groomers' }, { status: 500 });
  }
}

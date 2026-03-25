import { NextResponse } from 'next/server';
import { getGroomers } from '@/lib/db';
import type { GroomingServiceType } from '@/lib/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city') || undefined;
  const service = (searchParams.get('service') || undefined) as GroomingServiceType | undefined;

  const data = await getGroomers({ city, service });
  return NextResponse.json(data);
}

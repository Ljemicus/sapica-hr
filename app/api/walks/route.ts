import { NextResponse } from 'next/server';
import { getWalksForUser } from '@/lib/mock-data';
import { getMockUser } from '@/lib/mock-auth';

export async function GET() {
  const user = await getMockUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const walks = getWalksForUser(user.id);
  return NextResponse.json(walks);
}

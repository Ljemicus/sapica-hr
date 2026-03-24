import { NextResponse } from 'next/server';
import { setMockUser } from '@/lib/mock-auth';
import { mockUsers } from '@/lib/mock-data';

export async function POST(request: Request) {
  const body = await request.json();
  const { user_id } = body;

  const user = mockUsers.find(u => u.id === user_id);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  await setMockUser(user_id);
  return NextResponse.json({ user });
}

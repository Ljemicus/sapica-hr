import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import type { User } from '@/lib/types';

interface AuthMeResponse {
  user: User | null;
}

export async function GET() {
  const user = await getAuthUser();
  const response: AuthMeResponse = { user };
  return NextResponse.json(response);
}

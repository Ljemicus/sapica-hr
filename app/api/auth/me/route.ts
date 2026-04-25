import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import type { AuthUser } from '@/lib/auth';

interface AuthMeResponse {
  user: AuthUser | null;
  needsOnboarding: boolean;
}

export async function GET() {
  const user = await getAuthUser();
  const response: AuthMeResponse = { user, needsOnboarding: Boolean(user?.profileMissing) };
  return NextResponse.json(response);
}

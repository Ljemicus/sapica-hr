import { NextResponse } from 'next/server';
import { clearMockUser } from '@/lib/mock-auth';

export async function POST() {
  await clearMockUser();
  return NextResponse.json({ success: true });
}

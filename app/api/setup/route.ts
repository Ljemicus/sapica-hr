import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    {
      error: 'Unavailable',
      message: 'This setup route is disabled. Use Supabase migrations/seed scripts or local CLI tooling instead.',
    },
    { status: 410 }
  );
}

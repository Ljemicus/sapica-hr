import { NextResponse } from 'next/server';

function disabled() {
  return NextResponse.json({ error: 'feature disabled' }, { status: 503 });
}

export const GET = disabled;
export const POST = disabled;
export const PUT = disabled;
export const PATCH = disabled;
export const DELETE = disabled;

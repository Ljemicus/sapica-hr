import { NextResponse } from 'next/server';

const CALENDAR_DISABLED_RESPONSE = {
  error: 'Calendar booking subsystem is temporarily disabled during recovery.',
  code: 'CALENDAR_TEMPORARILY_DISABLED',
};

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(CALENDAR_DISABLED_RESPONSE, { status: 503 });
}

export async function POST() {
  return NextResponse.json(CALENDAR_DISABLED_RESPONSE, { status: 503 });
}

export async function PATCH() {
  return NextResponse.json(CALENDAR_DISABLED_RESPONSE, { status: 503 });
}

export async function DELETE() {
  return NextResponse.json(CALENDAR_DISABLED_RESPONSE, { status: 503 });
}

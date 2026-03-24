import { NextResponse } from 'next/server';

// OAuth callback is not used in mock mode — redirect to login
export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  return NextResponse.redirect(`${origin}/prijava`);
}

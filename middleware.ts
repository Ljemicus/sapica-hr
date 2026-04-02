import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TRAINER_DEMO_RE = /^trainer[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}$/i;
const GROOMER_DEMO_RE = /^groomer[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}$/i;
const MOCK_TRAINER_RE = /^tr-\d+$/i;
const MOCK_GROOMER_RE = /^gr-\d+$/i;

function isAllowedTrainerId(id: string) {
  return UUID_RE.test(id) || TRAINER_DEMO_RE.test(id) || MOCK_TRAINER_RE.test(id);
}

function isAllowedGroomerId(id: string) {
  return UUID_RE.test(id) || GROOMER_DEMO_RE.test(id) || MOCK_GROOMER_RE.test(id);
}

function maybeHard404DynamicProfile(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/trener/')) {
    const id = pathname.slice('/trener/'.length);
    if (id && !isAllowedTrainerId(id)) {
      return NextResponse.rewrite(new URL('/hard-404', request.url), { status: 404 });
    }
  }

  if (pathname.startsWith('/groomer/')) {
    const id = pathname.slice('/groomer/'.length);
    if (id && !isAllowedGroomerId(id)) {
      return NextResponse.rewrite(new URL('/hard-404', request.url), { status: 404 });
    }
  }

  return null;
}

export async function middleware(request: NextRequest) {
  const forced404 = maybeHard404DynamicProfile(request);
  if (forced404) {
    return forced404;
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

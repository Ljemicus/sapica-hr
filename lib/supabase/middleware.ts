import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({ request });

  // Read mock user from cookie
  const mockUserId = request.cookies.get('mock_user_id')?.value;

  // Protected routes
  const protectedPaths = ['/dashboard', '/poruke', '/admin'];
  const isProtected = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtected && !mockUserId) {
    const url = request.nextUrl.clone();
    url.pathname = '/prijava';
    url.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Admin route protection — we need to check user role
  // Import mock users inline to check role
  if (request.nextUrl.pathname.startsWith('/admin') && mockUserId) {
    // We check role via a simple lookup; since this is mock, we hardcode admin ID
    const adminIds = ['bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'];
    if (!adminIds.includes(mockUserId)) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

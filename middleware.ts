import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const sessionResponse = await updateSession(request);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return sessionResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll() {
        // session cookie mutations are already handled by updateSession
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return sessionResponse;
  }

  const pathname = request.nextUrl.pathname;

  const needsPublisherProfile = pathname.startsWith('/dashboard/adoption') || pathname.startsWith('/dashboard/profile');
  const needsGroomerProfile = pathname.startsWith('/dashboard/groomer');
  const needsTrainerProfile = pathname.startsWith('/dashboard/trainer');

  if (needsPublisherProfile || needsGroomerProfile || needsTrainerProfile) {
    const { data: publisher } = await supabase
      .from('publisher_profiles')
      .select('type')
      .eq('user_id', user.id)
      .maybeSingle();

    if (pathname.startsWith('/dashboard/adoption')) {
      if (!publisher) {
        const url = request.nextUrl.clone();
        url.pathname = '/onboarding/publisher-type';
        return NextResponse.redirect(url);
      }

      if (publisher.type !== 'udomljavanje') {
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard/profile';
        return NextResponse.redirect(url);
      }
    }

    if (needsGroomerProfile) {
      const { data: groomer } = await supabase
        .from('groomers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!groomer) {
        const url = request.nextUrl.clone();
        url.pathname = '/onboarding/publisher-type';
        return NextResponse.redirect(url);
      }
    }

    if (needsTrainerProfile) {
      const { data: trainer } = await supabase
        .from('trainers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!trainer) {
        const url = request.nextUrl.clone();
        url.pathname = '/onboarding/provider';
        return NextResponse.redirect(url);
      }
    }
  }

  return sessionResponse;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/poruke/:path*',
    '/admin/:path*',
    '/omiljeni/:path*',
    '/onboarding/:path*',
  ],
};

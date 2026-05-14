import { NextResponse, type NextRequest } from 'next/server';
import { generateNonce, buildCSPHeader, CSP_NONCE_HEADER } from '@/lib/security/csp';
import { createServerClient } from '@supabase/ssr';
import { updateSession } from '@/lib/supabase/middleware';
import { generateRequestId, REQUEST_ID_HEADER } from '@/lib/request-context';
import { detectLocaleFromPathname, LOCALE_HEADER } from '@/lib/i18n/routing';
import { csrfMiddleware } from './middleware/csrf';

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

// Routes that should be excluded from CSRF protection
const CSRF_EXCLUDED_ROUTES = [
  '/api/webhooks/',
  '/api/auth/callback',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/auth/logout',
  '/api/admin/service-listings',
  '/api/service-listings/draft-disabled',
];

function isCsrfExcludedRoute(pathname: string): boolean {
  return CSRF_EXCLUDED_ROUTES.some(route => pathname.startsWith(route));
}

export async function proxy(request: NextRequest) {
  // Generate CSP nonce for this request
  const nonce = generateNonce();
  
  // Assign a request ID for end-to-end correlation across logs.
  // Honour an existing header (e.g. from an upstream load-balancer).
  const requestId = request.headers.get(REQUEST_ID_HEADER) || generateRequestId();
  const locale = detectLocaleFromPathname(request.nextUrl.pathname);
  request.headers.set(REQUEST_ID_HEADER, requestId);
  request.headers.set(LOCALE_HEADER, locale);

  if (request.nextUrl.pathname.startsWith('/admin/service-listings')) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    let isAdmin = false;

    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll() {
            // handled below by updateSession for normal requests
          },
        },
      });
      const { data: { user } } = await supabase.auth.getUser();
      isAdmin = user?.user_metadata?.role === 'admin';
    }

    if (!isAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = '/hard-404';
      const admin404 = NextResponse.rewrite(url, { status: 404 });
      admin404.headers.set(REQUEST_ID_HEADER, requestId);
      admin404.headers.set(LOCALE_HEADER, locale);
      admin404.headers.set('Content-Security-Policy', buildCSPHeader({ nonce }));
      admin404.headers.set(CSP_NONCE_HEADER, nonce);
      return admin404;
    }
  }

  // Apply CSRF protection (skip for excluded routes)
  if (!isCsrfExcludedRoute(request.nextUrl.pathname)) {
    const csrfResponse = await csrfMiddleware(request);
    if (csrfResponse) {
      csrfResponse.headers.set(REQUEST_ID_HEADER, requestId);
      csrfResponse.headers.set(LOCALE_HEADER, locale);
      // Add CSP headers
      const cspValue = buildCSPHeader({ nonce });
      csrfResponse.headers.set('Content-Security-Policy', cspValue);
      csrfResponse.headers.set(CSP_NONCE_HEADER, nonce);
      return csrfResponse;
    }
  }

  const forced404 = maybeHard404DynamicProfile(request);
  if (forced404) {
    forced404.headers.set(REQUEST_ID_HEADER, requestId);
    forced404.headers.set(LOCALE_HEADER, locale);
    // Add CSP headers
    const cspValue = buildCSPHeader({ nonce });
    forced404.headers.set('Content-Security-Policy', cspValue);
    forced404.headers.set(CSP_NONCE_HEADER, nonce);
    return forced404;
  }

  const response = await updateSession(request);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {
          // handled in updateSession
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;

    if (user) {
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
    }
  }

  response.headers.set(REQUEST_ID_HEADER, requestId);
  response.headers.set(LOCALE_HEADER, locale);
  
  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(self), interest-cohort=()'
  );
  
  // Add CSP header with nonce
  const cspValue = buildCSPHeader({ nonce });
  response.headers.set('Content-Security-Policy', cspValue);
  response.headers.set(CSP_NONCE_HEADER, nonce);
  
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

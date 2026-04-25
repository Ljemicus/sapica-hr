import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAuthUser, type AuthUser } from '@/lib/auth';
import { apiError } from '@/lib/api-errors';
import { checkRateLimit, getClientIdentifier, type RateLimitConfig } from '@/lib/upstash-rate-limit';

export const GDPR_EXPORT_RATE_LIMIT: RateLimitConfig = {
  identifier: 'gdpr:export',
  limit: 1,
  windowSeconds: 60 * 60,
};

export const GDPR_DELETE_RATE_LIMIT: RateLimitConfig = {
  identifier: 'gdpr:delete',
  limit: 1,
  windowSeconds: 24 * 60 * 60,
};

export type GdprGuardResult =
  | { ok: true; user: AuthUser; password: string }
  | { ok: false; response: ReturnType<typeof apiError> };

export async function parsePasswordPayload(request: Request): Promise<string | null> {
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    const body = await request.json().catch(() => null);
    return typeof body?.password === 'string' ? body.password : null;
  }

  if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
    const form = await request.formData().catch(() => null);
    const value = form?.get('password');
    return typeof value === 'string' ? value : null;
  }

  return null;
}

export async function requireFreshPasswordAndRateLimit(
  request: Request,
  rateLimit: RateLimitConfig,
): Promise<GdprGuardResult> {
  const user = await getAuthUser();
  if (!user) {
    return {
      ok: false,
      response: apiError({ status: 401, code: 'AUTH_REQUIRED', message: 'Prijava je potrebna.' }),
    };
  }

  const rateKey = `${user.id}:${getClientIdentifier(request)}`;
  const rate = await checkRateLimit(rateKey, rateLimit);
  if (!rate.success) {
    return {
      ok: false,
      response: apiError({
        status: 429,
        code: 'RATE_LIMITED',
        message: 'Previše zahtjeva. Pokušajte kasnije.',
        details: { retryAfter: rate.retryAfter },
      }),
    };
  }

  const password = await parsePasswordPayload(request);
  if (!password) {
    return {
      ok: false,
      response: apiError({
        status: 400,
        code: 'PASSWORD_REQUIRED',
        message: 'Za ovu radnju treba potvrditi lozinku.',
      }),
    };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      ok: false,
      response: apiError({ status: 503, code: 'AUTH_UNAVAILABLE', message: 'Autentifikacija nije dostupna.' }),
    };
  }

  const verifier = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await verifier.auth.signInWithPassword({
    email: user.email,
    password,
  });

  if (error || data.user?.id !== user.id) {
    return {
      ok: false,
      response: apiError({ status: 401, code: 'FRESH_AUTH_REQUIRED', message: 'Potvrda lozinke nije uspjela.' }),
    };
  }

  return { ok: true, user, password };
}

export async function getAuthenticatedSupabase() {
  return createClient();
}

export function getGdprAdminClient() {
  return createAdminClient();
}

export function jsonHeaders(extra?: HeadersInit): Headers {
  const headers = new Headers(extra);
  headers.set('cache-control', 'no-store');
  return headers;
}

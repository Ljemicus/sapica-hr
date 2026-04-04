import { NextResponse } from 'next/server';
import { apiError } from '@/lib/api-errors';
import type { LoginSuccessResponse } from '@/lib/auth-responses';
import { parseAuthRole } from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/db/helpers';
import { dispatchAlert } from '@/lib/alerting';
import { getRequestId, createScopedLogger } from '@/lib/request-context';
import { rateLimit } from '@/lib/rate-limit';
import { loginSchema } from '@/lib/validations';

export async function POST(request: Request) {
  const reqId = getRequestId(request);
  const log = createScopedLogger('auth.login', reqId);
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (!rateLimit(`login:${ip}`, 5, 60000)) {
    return apiError({ status: 429, code: 'RATE_LIMITED', message: 'Previše pokušaja.' });
  }

  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return apiError({ status: 400, code: 'INVALID_INPUT', message: 'Unesite ispravan email i lozinku.' });
  }

  if (!isSupabaseConfigured()) {
    return apiError({ status: 503, code: 'AUTH_UNAVAILABLE', message: 'Autentifikacija nije dostupna. Supabase nije konfiguriran.' });
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error || !data.user) {
    log.warn('Login failed', { email: parsed.data.email });
    dispatchAlert({
      severity: 'P2',
      service: 'auth.login',
      description: 'Login authentication failure',
      value: parsed.data.email,
      owner: 'auth',
    }).catch(() => {});
    return apiError({ status: 401, code: 'INVALID_CREDENTIALS', message: 'Pogrešan email ili lozinka.' });
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', data.user.id)
    .single();

  const { data: publisherProfile } = await supabase
    .from('publisher_profiles')
    .select('type')
    .eq('user_id', data.user.id)
    .maybeSingle();

  const role = parseAuthRole(profile?.role || data.user.user_metadata?.role);
  const defaultRedirect =
    role === 'admin' ? '/admin' :
    role === 'sitter' ? '/dashboard/sitter' :
    publisherProfile?.type === 'udomljavanje' ? '/dashboard/adoption' :
    publisherProfile?.type === 'groomer' ? '/dashboard/groomer' :
    publisherProfile?.type === 'trener' ? '/dashboard/trainer' :
    '/dashboard/vlasnik';

  const response: LoginSuccessResponse = { user: data.user, role, defaultRedirect };
  return NextResponse.json(response);
}

import { NextResponse } from 'next/server';
import { apiError } from '@/lib/api-errors';
import type { LoginSuccessResponse } from '@/lib/auth-responses';
import { getPrimaryRole, normalizeRoles } from '@/lib/auth';
import { getDefaultDashboardForEffectiveKind, getEffectiveUserKind } from '@/lib/effective-user-kind';
import { isSupabaseConfigured } from '@/lib/db/helpers';
import { dispatchAlert } from '@/lib/alerting';
import { getRequestId, createScopedLogger } from '@/lib/request-context';
import { checkRateLimit, RateLimits, getClientIdentifier } from '@/lib/upstash-rate-limit';
import { loginSchema } from '@/lib/validations';

export async function POST(request: Request) {
  const reqId = getRequestId(request);
  const log = createScopedLogger('auth.login', reqId);
  
  const ip = getClientIdentifier(request);
  const rateLimitResult = await checkRateLimit(ip, RateLimits.login);
  if (!rateLimitResult.success) {
    return apiError({ 
      status: 429, 
      code: 'RATE_LIMITED', 
      message: 'Previše pokušaja. Pokušajte ponovno kasnije.' 
    });
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

  const { data: rolesData } = await supabase
    .from('profile_roles')
    .select('role')
    .eq('profile_id', data.user.id);

  const roles = normalizeRoles((rolesData ?? []).map((row: { role: string }) => row.role));
  const role = getPrimaryRole(roles);

  const { data: publisherProfile } = await supabase
    .from('publisher_profiles')
    .select('type')
    .eq('user_id', data.user.id)
    .maybeSingle();

  const effectiveKind = getEffectiveUserKind({ authRole: role, publisherType: publisherProfile?.type ?? null });
  const defaultRedirect = roles.length === 0
    ? '/onboarding/profile'
    : getDefaultDashboardForEffectiveKind(effectiveKind);

  const response: LoginSuccessResponse = { user: data.user, role, defaultRedirect };
  return NextResponse.json(response);
}

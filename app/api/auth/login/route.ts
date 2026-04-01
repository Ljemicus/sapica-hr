import { NextResponse } from 'next/server';
import { apiError } from '@/lib/api-errors';
import { isSupabaseConfigured } from '@/lib/db/helpers';
import { appLogger } from '@/lib/logger';
import { rateLimit } from '@/lib/rate-limit';
import { loginSchema } from '@/lib/validations';

export async function POST(request: Request) {
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
    appLogger.warn('auth.login', 'Login failed', { email: parsed.data.email });
    return apiError({ status: 401, code: 'INVALID_CREDENTIALS', message: 'Pogrešan email ili lozinka.' });
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', data.user.id)
    .single();

  const role = profile?.role || data.user.user_metadata?.role || 'owner';
  const defaultRedirect =
    role === 'sitter' ? '/dashboard/sitter' :
    role === 'admin' ? '/admin' :
    '/dashboard/vlasnik';

  return NextResponse.json({ user: data.user, role, defaultRedirect });
}

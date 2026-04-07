import { apiError } from '@/lib/api-errors';
import { isSupabaseConfigured } from '@/lib/db/helpers';
import { appLogger } from '@/lib/logger';
import { dispatchAlert } from '@/lib/alerting';
import { checkRateLimit, RateLimits, getClientIdentifier } from '@/lib/upstash-rate-limit';
import { forgotPasswordSchema } from '@/lib/validations';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // Rate limiting with Redis/Upstash
  const ip = getClientIdentifier(request);
  const rateLimitResult = await checkRateLimit(ip, RateLimits.forgotPassword);
  if (!rateLimitResult.success) {
    appLogger.warn('auth.forgot-password', 'Rate limit hit', { ip });
    return apiError({ 
      status: 429, 
      code: 'RATE_LIMITED', 
      message: 'Previše pokušaja. Pokušajte ponovno kasnije.' 
    });
  }

  const body = await request.json().catch(() => null);
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return apiError({ status: 400, code: 'INVALID_INPUT', message: 'Unesite ispravan email.' });
  }

  if (!isSupabaseConfigured()) {
    appLogger.error('auth.forgot-password', 'Supabase not configured — auth unavailable');
    dispatchAlert({
      severity: 'P1',
      service: 'auth.forgot-password',
      description: 'Supabase auth unavailable — password reset broken for all users',
      owner: 'platform',
    }).catch(() => {});
    return apiError({ status: 503, code: 'AUTH_UNAVAILABLE', message: 'Autentifikacija nije dostupna.' });
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://petpark.hr';
  const redirectTo = `${baseUrl}/api/auth/callback?next=/nova-lozinka`;

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo,
  });

  if (error) {
    appLogger.warn('auth.forgot-password', 'Reset email failed', { email: parsed.data.email, error: error.message });
    dispatchAlert({
      severity: 'P2',
      service: 'auth.forgot-password',
      description: 'Password reset email delivery failed via Supabase',
      value: error.message,
      owner: 'platform',
    }).catch(() => {});
    // Don't reveal whether the email exists
  }

  // Always return success to prevent email enumeration
  return NextResponse.json({ ok: true });
}

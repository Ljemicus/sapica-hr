import { apiError } from '@/lib/api-errors';
import { isSupabaseConfigured } from '@/lib/db/helpers';
import { appLogger } from '@/lib/logger';
import { rateLimit } from '@/lib/rate-limit';
import { forgotPasswordSchema } from '@/lib/validations';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (!rateLimit(`forgot-password:${ip}`, 3, 60000)) {
    return apiError({ status: 429, code: 'RATE_LIMITED', message: 'Previše pokušaja. Pokušajte ponovno za minutu.' });
  }

  const body = await request.json().catch(() => null);
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return apiError({ status: 400, code: 'INVALID_INPUT', message: 'Unesite ispravan email.' });
  }

  if (!isSupabaseConfigured()) {
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
    // Don't reveal whether the email exists
  }

  // Always return success to prevent email enumeration
  return NextResponse.json({ ok: true });
}

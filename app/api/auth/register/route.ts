import { NextResponse } from 'next/server';
import { ensureSitterProfile, syncUserProfile, type AuthProfileSupabaseLike } from '@/lib/auth-profile';
import { apiError } from '@/lib/api-errors';
import type { RegisterSuccessResponse } from '@/lib/auth-responses';
import { isSupabaseConfigured } from '@/lib/db/helpers';
import { appLogger } from '@/lib/logger';
import { registerSchema } from '@/lib/validations';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (!rateLimit(`register:${ip}`, 5, 60_000)) {
    return apiError({ status: 429, code: 'RATE_LIMITED', message: 'Previše pokušaja registracije.' });
  }

  if (!isSupabaseConfigured()) {
    return apiError({ status: 503, code: 'AUTH_UNAVAILABLE', message: 'Autentifikacija nije dostupna.' });
  }

  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return apiError({ status: 400, code: 'INVALID_INPUT', message: 'Neispravan unos.', details: parsed.error.flatten() });
  }

  // Sanitise optional avatar_url – must be a valid http(s) URL or null
  let avatarUrl: string | null = null;
  if (typeof body?.avatar_url === 'string' && body.avatar_url.length > 0) {
    try {
      const parsedUrl = new URL(body.avatar_url);
      if (parsedUrl.protocol === 'https:' || parsedUrl.protocol === 'http:') {
        avatarUrl = body.avatar_url;
      }
    } catch { /* invalid URL → keep null */ }
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        name: parsed.data.name,
        role: parsed.data.role,
        city: parsed.data.city,
        avatar_url: avatarUrl,
      },
    },
  });

  if (error || !data.user) {
    appLogger.warn('auth.register', 'Registration failed', {
      email: parsed.data.email,
      reason: error?.message || 'unknown',
    });
    return apiError({ status: 400, code: 'REGISTER_FAILED', message: error?.message || 'Registracija nije uspjela' });
  }

  const authProfileSupabase = supabase as unknown as AuthProfileSupabaseLike;

  const profileError = await syncUserProfile({
    supabase: authProfileSupabase,
    user: {
      id: data.user.id,
      email: parsed.data.email,
      name: parsed.data.name,
      role: parsed.data.role,
      city: parsed.data.city,
      avatar_url: avatarUrl,
    },
  });
  if (profileError) {
    appLogger.error('auth.register', 'Failed to upsert user profile', { userId: data.user.id });
    return apiError({ status: 500, code: 'PROFILE_UPSERT_FAILED', message: 'Greška pri kreiranju profila' });
  }

  if (parsed.data.role === 'sitter') {
    const sitterError = await ensureSitterProfile({
      supabase: authProfileSupabase,
      userId: data.user.id,
      city: parsed.data.city,
    });
    if (sitterError) {
      appLogger.error('auth.register', 'Failed to create sitter profile', { userId: data.user.id });
      return apiError({ status: 500, code: 'SITTER_PROFILE_CREATE_FAILED', message: 'Greška pri kreiranju sitter profila' });
    }
  }

  const response: RegisterSuccessResponse = {
    user: data.user,
    session: data.session,
    needsEmailConfirmation: !data.session,
    role: parsed.data.role,
  };

  return NextResponse.json(response);
}

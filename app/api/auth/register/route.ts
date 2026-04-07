import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { ensureSitterProfile, syncUserProfile, type AuthProfileSupabaseLike } from '@/lib/auth-profile';
import { apiError } from '@/lib/api-errors';
import type { RegisterSuccessResponse } from '@/lib/auth-responses';
import { isSupabaseConfigured } from '@/lib/db/helpers';
import { dispatchAlert } from '@/lib/alerting';
import { appLogger } from '@/lib/logger';
import { registerSchema } from '@/lib/validations';
import { checkRateLimit, RateLimits, getClientIdentifier } from '@/lib/upstash-rate-limit';

export async function POST(request: Request) {
  // Rate limiting with Redis/Upstash
  const ip = getClientIdentifier(request);
  const rateLimitResult = await checkRateLimit(ip, RateLimits.register);
  if (!rateLimitResult.success) {
    return apiError({ 
      status: 429, 
      code: 'RATE_LIMITED', 
      message: 'Previše pokušaja registracije. Pokušajte ponovno kasnije.' 
    });
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
    dispatchAlert({
      severity: 'P3',
      service: 'auth.register',
      description: 'User registration failure',
      value: error?.message || 'unknown',
      owner: 'auth',
    }).catch(() => {});
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
    appLogger.warn('auth.register', 'Profile upsert failed after sign up; expecting DB trigger or callback sync to complete profile', {
      userId: data.user.id,
      reason: profileError.message || 'unknown',
    });
  }

  if (parsed.data.role === 'sitter') {
    const sitterError = await ensureSitterProfile({
      supabase: authProfileSupabase,
      userId: data.user.id,
      city: parsed.data.city,
    });
    if (sitterError) {
      appLogger.warn('auth.register', 'Sitter profile ensure failed after sign up; expecting DB trigger or callback sync to complete profile', {
        userId: data.user.id,
        reason: sitterError.message || 'unknown',
      });
    }
  }

  let session = data.session;
  let needsEmailConfirmation = !session;

  if (!session) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseAnonKey && serviceRoleKey) {
      try {
        const adminClient = createSupabaseClient(supabaseUrl, serviceRoleKey);
        const { error: confirmError } = await adminClient.auth.admin.updateUserById(data.user.id, {
          email_confirm: true,
        });

        if (!confirmError) {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: parsed.data.email,
            password: parsed.data.password,
          });

          if (!signInError && signInData.session) {
            session = signInData.session;
            needsEmailConfirmation = false;
          } else {
            appLogger.warn('auth.register', 'Post-signup auto sign-in failed after admin confirmation', {
              userId: data.user.id,
              reason: signInError?.message || 'unknown',
            });
          }
        } else {
          appLogger.warn('auth.register', 'Admin email confirmation failed after sign up', {
            userId: data.user.id,
            reason: confirmError.message || 'unknown',
          });
        }
      } catch (error) {
        appLogger.warn('auth.register', 'Automatic confirmation flow threw after sign up', {
          userId: data.user.id,
          reason: error instanceof Error ? error.message : 'unknown',
        });
      }
    }
  }

  const response: RegisterSuccessResponse = {
    user: data.user,
    session,
    needsEmailConfirmation,
    role: parsed.data.role,
  };

  return NextResponse.json(response);
}

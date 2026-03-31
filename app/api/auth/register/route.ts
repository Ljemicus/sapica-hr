import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/db/helpers';
import { appLogger } from '@/lib/logger';
import { registerSchema } from '@/lib/validations';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (!rateLimit(`register:${ip}`, 5, 60_000)) {
    return NextResponse.json({ error: 'Previše pokušaja registracije.' }, { status: 429 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Autentifikacija nije dostupna.' }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
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
        avatar_url: body?.avatar_url || null,
      },
    },
  });

  if (error || !data.user) {
    appLogger.warn('auth.register', 'Registration failed', {
      email: parsed.data.email,
      reason: error?.message || 'unknown',
    });
    return NextResponse.json({ error: error?.message || 'Registracija nije uspjela' }, { status: 400 });
  }

  const userPayload = {
    id: data.user.id,
    email: parsed.data.email,
    name: parsed.data.name,
    role: parsed.data.role,
    city: parsed.data.city,
    avatar_url: body?.avatar_url || null,
  };

  const { error: profileError } = await supabase.from('users').upsert(userPayload, { onConflict: 'id' });
  if (profileError) {
    appLogger.error('auth.register', 'Failed to upsert user profile', { userId: data.user.id });
    return NextResponse.json({ error: 'Greška pri kreiranju profila' }, { status: 500 });
  }

  if (parsed.data.role === 'sitter') {
    const { error: sitterError } = await supabase.from('sitter_profiles').upsert({
      user_id: data.user.id,
      city: parsed.data.city,
    }, { onConflict: 'user_id' });
    if (sitterError) {
      appLogger.error('auth.register', 'Failed to create sitter profile', { userId: data.user.id });
      return NextResponse.json({ error: 'Greška pri kreiranju sitter profila' }, { status: 500 });
    }
  }

  return NextResponse.json({
    user: data.user,
    session: data.session,
    needsEmailConfirmation: !data.session,
    role: parsed.data.role,
  });
}

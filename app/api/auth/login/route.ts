import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/db/helpers';
import { rateLimit } from '@/lib/rate-limit';
import { loginSchema } from '@/lib/validations';

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (!rateLimit(`login:${ip}`, 5, 60000)) {
    return NextResponse.json({ error: 'Previše pokušaja.' }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Unesite ispravan email i lozinku.' }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Autentifikacija nije dostupna. Supabase nije konfiguriran.' }, { status: 503 });
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error || !data.user) {
    return NextResponse.json({ error: 'Pogrešan email ili lozinka.' }, { status: 401 });
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

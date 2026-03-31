import { NextResponse } from 'next/server';
import { ensureSitterProfile, syncUserProfile } from '@/lib/auth-profile';
import { buildUserFromAuth } from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/db/helpers';
import { appLogger } from '@/lib/logger';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/';
  const requestedRole = searchParams.get('role');

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(`${origin}${next}`);
  }

  if (code) {
    const { createServerClient } = await import('@supabase/ssr');
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const fallbackUser = buildUserFromAuth(data.user);
      const role = requestedRole === 'sitter' || fallbackUser.role === 'sitter' ? 'sitter' : 'owner';

      await syncUserProfile({
        supabase,
        user: {
          id: fallbackUser.id,
          email: fallbackUser.email,
          name: fallbackUser.name,
          role,
          avatar_url: fallbackUser.avatar_url,
          city: fallbackUser.city,
        },
      });

      if (role === 'sitter') {
        await ensureSitterProfile({
          supabase,
          userId: fallbackUser.id,
          city: fallbackUser.city,
        });
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  appLogger.warn('auth.callback', 'Auth callback fell through to login redirect');
  return NextResponse.redirect(`${origin}/prijava`);
}

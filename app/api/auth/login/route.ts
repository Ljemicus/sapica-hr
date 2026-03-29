import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/db/helpers';
import { mockUsers } from '@/lib/mock-data';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (!rateLimit(`login:${ip}`, 5, 60000)) {
    return NextResponse.json({ error: 'Previše pokušaja.' }, { status: 429 });
  }

  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    // Mock auth: pronađi usera po emailu
    const mockUser = mockUsers.find((u) => u.email === email);
    if (!mockUser) {
      return NextResponse.json({ error: 'Korisnik nije pronađen' }, { status: 401 });
    }
    const response = NextResponse.json({ user: mockUser });
    response.cookies.set('mock_user_id', mockUser.id, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });
    return response;
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  return NextResponse.json({ user: data.user });
}

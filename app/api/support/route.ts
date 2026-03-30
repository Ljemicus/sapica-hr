import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAuthUser } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { z } from 'zod';

const supportSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(255),
  subject: z.enum(['bug', 'prijedlog', 'pitanje', 'ostalo']),
  message: z.string().min(10).max(5000),
  website: z.string().optional(), // honeypot
});

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const key = `support:${user?.id || 'anon'}:${ip}`;

    if (!rateLimit(key, 3, 10 * 60_000)) {
      return NextResponse.json({ error: 'Previše poruka. Pokušajte kasnije.' }, { status: 429 });
    }

    const body = await request.json();
    const parsed = supportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    if (parsed.data.website && parsed.data.website.trim().length > 0) {
      return NextResponse.json({ success: true });
    }

    if (user?.email && parsed.data.email.toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json({ error: 'Email se mora podudarati s prijavljenim računom.' }, { status: 403 });
    }

    const supabase = await createClient();
    const { error } = await supabase.from('support_tickets').insert({
      name: parsed.data.name,
      email: parsed.data.email,
      subject: parsed.data.subject,
      message: parsed.data.message,
      user_id: user?.id || null,
    });

    if (error) {
      return NextResponse.json({ error: 'Greška pri spremanju poruke.' }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

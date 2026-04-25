import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';

const WaitlistSchema = z.object({
  email: z.string().email().max(254),
  city: z.string().trim().max(120).optional().nullable(),
  service: z.string().trim().max(120).optional().nullable(),
  source_path: z.string().trim().max(240).optional().nullable(),
});

async function parsePayload(request: NextRequest) {
  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return request.json();

  const form = await request.formData();
  return {
    email: form.get('email'),
    city: form.get('city'),
    service: form.get('service'),
    source_path: form.get('source_path') || request.nextUrl.pathname,
  };
}

export async function POST(request: NextRequest) {
  const parsed = WaitlistSchema.safeParse(await parsePayload(request));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid waitlist request' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from('waitlist_requests').insert({
    ...parsed.data,
    source_path: parsed.data.source_path || request.nextUrl.pathname,
    user_agent: request.headers.get('user-agent'),
  });

  if (error) {
    return NextResponse.json({ error: 'Could not save waitlist request' }, { status: 500 });
  }

  if ((request.headers.get('accept') || '').includes('text/html')) {
    return new Response('<!doctype html><meta charset="utf-8"><title>PetPark waitlist</title><p>Hvala! Javimo se kad otvorimo dostupnost.</p><p><a href="/pretraga">Natrag na pretragu</a></p>', {
      headers: { 'content-type': 'text/html; charset=utf-8' },
    });
  }

  return NextResponse.json({ ok: true });
}

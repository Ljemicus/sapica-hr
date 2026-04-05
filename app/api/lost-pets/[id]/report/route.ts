import { NextResponse } from 'next/server';
import { apiError } from '@/lib/api-errors';
import { createClient } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/rate-limit';
import { logAdminAction } from '@/lib/db/audit-logs';
import { z } from 'zod';

const VALID_REASONS = ['spam', 'fake_listing', 'inappropriate_content', 'wrong_contact_info', 'duplicate', 'other'] as const;

const reportSchema = z.object({
  reason_code: z.enum(VALID_REASONS),
  details: z.string().max(500).optional(),
});

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

  // 3 reports per IP per minute
  if (!rateLimit(`lost-pet-report:${ip}`, 3, 60_000)) {
    return apiError({ status: 429, code: 'RATE_LIMITED', message: 'Previše prijava. Pokušajte ponovno za minutu.' });
  }

  try {
    const { id } = await context.params;
    const supabase = await createClient();

    // Require authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return apiError({ status: 401, code: 'AUTH_REQUIRED', message: 'Morate biti prijavljeni za prijavu oglasa.' });
    }

    const body = await request.json();
    const parsed = reportSchema.safeParse(body);

    if (!parsed.success) {
      return apiError({ status: 400, code: 'VALIDATION_ERROR', message: 'Neispravan razlog prijave.' });
    }

    // Verify listing exists
    const { data: pet } = await supabase.from('lost_pets').select('id').eq('id', id).single();
    if (!pet) {
      return apiError({ status: 404, code: 'NOT_FOUND', message: 'Oglas nije pronađen.' });
    }

    // Prevent duplicate: one report per user per listing (enforced by DB unique index too)
    const { data: existing } = await supabase
      .from('lost_pet_reports')
      .select('id')
      .eq('lost_pet_id', id)
      .eq('reporter_user_id', user.id)
      .limit(1);

    if (existing && existing.length > 0) {
      return apiError({ status: 409, code: 'ALREADY_REPORTED', message: 'Već ste prijavili ovaj oglas.' });
    }

    const { error } = await supabase.from('lost_pet_reports').insert({
      lost_pet_id: id,
      reporter_user_id: user.id,
      reporter_ip: ip,
      reason: parsed.data.details || parsed.data.reason_code,
      reason_code: parsed.data.reason_code,
      status: 'open',
    });

    if (error) {
      return apiError({ status: 500, code: 'INSERT_FAILED', message: 'Greška pri slanju prijave.' });
    }

    // Fire-and-forget: audit log
    logAdminAction({
      actorUserId: user.id,
      targetType: 'lost_pet',
      targetId: id,
      action: 'lost_pet_reported',
      metadata: { reason_code: parsed.data.reason_code },
    }).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch {
    return apiError({ status: 500, code: 'REPORT_FAILED', message: 'Greška pri slanju prijave.' });
  }
}

import { NextResponse } from 'next/server';
import { apiError } from '@/lib/api-errors';
import { createClient } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  // Rate limit contact reveals: 20 per IP per minute to curb scraping
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!rateLimit(`contact-reveal:${ip}`, 20, 60_000)) {
    return apiError({ status: 429, code: 'RATE_LIMITED', message: 'Previše zahtjeva. Pokušajte ponovno za minutu.' });
  }

  try {
    const { id } = await context.params;
    const supabase = await createClient();

    // Require authentication — contact info is not anonymous-accessible
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return apiError({ status: 401, code: 'AUTH_REQUIRED', message: 'Morate biti prijavljeni za prikaz kontakt podataka.' });
    }

    const { data, error } = await supabase
      .from('lost_pets')
      .select('contact_name, contact_phone, contact_email')
      .eq('id', id)
      .single();

    if (error || !data) {
      return apiError({ status: 404, code: 'LOST_PET_NOT_FOUND', message: 'Oglas nije pronađen.' });
    }

    return NextResponse.json({
      contact_name: data.contact_name || '',
      contact_phone: data.contact_phone || '',
      contact_email: data.contact_email || '',
    });
  } catch {
    return apiError({ status: 500, code: 'CONTACT_FETCH_FAILED', message: 'Kontakt nije dostupan.' });
  }
}

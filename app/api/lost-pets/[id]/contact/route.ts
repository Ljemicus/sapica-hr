import { NextResponse } from 'next/server';
import { apiError } from '@/lib/api-errors';
import { createClient } from '@/lib/supabase/server';

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('lost_pets')
      .select('contact_name, contact_phone, contact_email, hidden, user_id')
      .eq('id', id)
      .single();

    if (error || !data) {
      return apiError({ status: 404, code: 'LOST_PET_NOT_FOUND', message: 'Oglas nije pronađen.' });
    }

    // Don't leak contact info for hidden listings to unauthorized users
    if (data.hidden) {
      const { getAuthUser } = await import('@/lib/auth');
      const user = await getAuthUser();
      const isOwner = user?.id === data.user_id;
      const isAdmin = user?.role === 'admin';
      if (!isOwner && !isAdmin) {
        return apiError({ status: 404, code: 'LOST_PET_NOT_FOUND', message: 'Oglas nije pronađen.' });
      }
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

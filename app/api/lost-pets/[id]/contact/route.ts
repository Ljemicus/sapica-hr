import { NextRequest, NextResponse } from 'next/server';
import { apiError } from '@/lib/api-errors';
import { getAuthUser } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const user = await getAuthUser();

    if (!user) {
      return apiError({ status: 401, code: 'UNAUTHORIZED', message: 'Unauthorized' });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('lost_pets')
      .select('contact_name, contact_phone, contact_email, hidden, user_id')
      .eq('id', id)
      .single();

    if (error || !data) {
      return apiError({ status: 404, code: 'LOST_PET_NOT_FOUND', message: 'Oglas nije pronađen.' });
    }

    const isOwner = user.id === data.user_id;
    const isAdmin = user.isAdmin;
    if (!isOwner && !isAdmin) {
      return apiError({ status: 403, code: 'FORBIDDEN', message: 'Kontakt nije javno dostupan.' });
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

export async function POST(_request: NextRequest, _context: { params: Promise<{ id: string }> }) {
  return apiError({
    status: 405,
    code: 'METHOD_NOT_ALLOWED',
    message: 'Javni relay koristi /api/lost-pets/[id]/relay. Direktni kontakt ostaje dostupan samo vlasniku ili adminu.',
  });
}

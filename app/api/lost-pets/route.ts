import { NextResponse } from 'next/server';
import { apiError } from '@/lib/api-errors';
import { getAuthUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { lostPetReportSchema } from '@/lib/validations';

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return apiError({ status: 401, code: 'UNAUTHORIZED', message: 'Unauthorized' });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError({ status: 400, code: 'INVALID_JSON', message: 'Invalid JSON body' });
  }

  const parsed = lostPetReportSchema.safeParse(body);
  if (!parsed.success) {
    return apiError({ status: 400, code: 'INVALID_INPUT', message: 'Neispravna prijava nestanka.', details: parsed.error.flatten() });
  }

  try {
    const supabase = await createClient();
    const payload = {
      user_id: user.id,
      ...parsed.data,
      breed: parsed.data.breed || null,
      sex: parsed.data.sex || null,
      special_marks: parsed.data.special_marks || null,
      contact_email: parsed.data.contact_email || null,
      gallery: parsed.data.gallery || [],
      status: 'lost' as const,
    };

    const { data, error } = await supabase
      .from('lost_pets')
      .insert(payload)
      .select('id')
      .single();

    if (error || !data) {
      return apiError({ status: 500, code: 'LOST_PET_CREATE_FAILED', message: 'Prijava nije spremljena.' });
    }

    return NextResponse.json({ id: data.id }, { status: 201 });
  } catch {
    return apiError({ status: 500, code: 'LOST_PET_CREATE_FAILED', message: 'Prijava nije spremljena.' });
  }
}

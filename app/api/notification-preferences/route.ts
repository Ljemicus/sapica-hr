import { NextRequest, NextResponse } from 'next/server';
import { apiError } from '@/lib/api-errors';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return apiError({ status: 401, code: 'UNAUTHORIZED', message: 'Unauthorized' });

  const { data, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    return apiError({ status: 500, code: 'PREFERENCES_FETCH_FAILED', message: 'Failed to load notification preferences' });
  }

  return NextResponse.json(data ?? {
    user_id: user.id,
    email_enabled: true,
    push_enabled: true,
    sms_enabled: false,
    bookings_enabled: true,
    messages_enabled: true,
    promotions_enabled: true,
    lost_pets_enabled: true,
  });
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return apiError({ status: 401, code: 'UNAUTHORIZED', message: 'Unauthorized' });

  const body = await request.json();
  const payload = {
    user_id: user.id,
    email_enabled: Boolean(body.email_enabled),
    push_enabled: Boolean(body.push_enabled),
    sms_enabled: Boolean(body.sms_enabled),
    bookings_enabled: Boolean(body.bookings_enabled),
    messages_enabled: Boolean(body.messages_enabled),
    promotions_enabled: Boolean(body.promotions_enabled),
    lost_pets_enabled: Boolean(body.lost_pets_enabled),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('notification_preferences')
    .upsert(payload, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) {
    return apiError({ status: 500, code: 'PREFERENCES_SAVE_FAILED', message: 'Failed to save notification preferences' });
  }

  return NextResponse.json(data);
}

import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { createDashboardLink } from '@/lib/payment';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('sitter_profiles')
    .select('stripe_account_id, stripe_onboarding_complete')
    .eq('user_id', user.id)
    .single();

  if (!profile?.stripe_account_id) {
    return NextResponse.json(
      { error: 'Stripe račun nije povezan.' },
      { status: 400 }
    );
  }

  if (!profile.stripe_onboarding_complete) {
    return NextResponse.json(
      { error: 'Stripe onboarding nije dovršen.' },
      { status: 400 }
    );
  }

  try {
    const url = await createDashboardLink(profile.stripe_account_id);
    return NextResponse.json({ url });
  } catch (err) {
    console.error('[dashboard-link] Stripe error:', err);
    return NextResponse.json(
      { error: 'Greška pri generiranju linka.' },
      { status: 500 }
    );
  }
}

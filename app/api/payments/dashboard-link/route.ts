import { NextResponse } from 'next/server';
import { appLogger } from '@/lib/logger';
import { dispatchAlert } from '@/lib/alerting';
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
    appLogger.error('payments.dashboard-link', 'Stripe error', { error: String(err), userId: user.id });
    dispatchAlert({
      severity: 'P3',
      service: 'payments.dashboard-link',
      description: 'Stripe dashboard link generation failed — sitter cannot access payout dashboard',
      value: `user=${user.id}, account=${profile.stripe_account_id}`,
      owner: 'platform',
    });
    return NextResponse.json(
      { error: 'Greška pri generiranju linka.' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { appLogger } from '@/lib/logger';
import { dispatchAlert } from '@/lib/alerting';
import { getAuthUser } from '@/lib/auth';
import { createAccountLink } from '@/lib/payment';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Nemate pristup.' }, { status: 401 });
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('sitter_profiles')
    .select('stripe_account_id, stripe_onboarding_complete')
    .eq('user_id', user.id)
    .single();

  if (!profile?.stripe_account_id) {
    return NextResponse.json(
      { error: 'Stripe račun nije pronađen. Prvo povežite račun.' },
      { status: 400 }
    );
  }

  if (profile.stripe_onboarding_complete) {
    return NextResponse.json(
      { error: 'Onboarding je već dovršen.' },
      { status: 400 }
    );
  }

  try {
    const url = await createAccountLink(profile.stripe_account_id);
    return NextResponse.json({ url });
  } catch (err) {
    appLogger.error('payments.account-link', 'Stripe error', { error: String(err), userId: user.id });
    dispatchAlert({
      severity: 'P2',
      service: 'payments.account-link',
      description: 'Stripe onboarding link generation failed — sitter cannot complete onboarding',
      value: `user=${user.id}, account=${profile.stripe_account_id}`,
      owner: 'platform',
    });
    return NextResponse.json(
      { error: 'Greška pri generiranju linka za onboarding.' },
      { status: 500 }
    );
  }
}

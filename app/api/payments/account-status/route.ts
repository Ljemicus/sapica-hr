import { NextResponse } from 'next/server';
import { appLogger } from '@/lib/logger';
import { getAuthUser } from '@/lib/auth';
import { getAccountStatus } from '@/lib/payment';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Nemate pristup.' }, { status: 401 });
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('sitter_profiles')
    .select('stripe_account_id, stripe_onboarding_complete, payout_enabled')
    .eq('user_id', user.id)
    .single();

  if (!profile?.stripe_account_id) {
    return NextResponse.json({
      connected: false,
      chargesEnabled: false,
      payoutsEnabled: false,
      detailsSubmitted: false,
    });
  }

  try {
    const status = await getAccountStatus(profile.stripe_account_id);
    return NextResponse.json({ connected: true, ...status });
  } catch (err) {
    appLogger.warn('payments.account-status', 'Stripe status lookup failed, using cached profile', {
      error: String(err),
      stripeAccountId: profile.stripe_account_id,
    });
    return NextResponse.json({
      connected: true,
      chargesEnabled: profile.stripe_onboarding_complete || false,
      payoutsEnabled: profile.payout_enabled || false,
      detailsSubmitted: profile.stripe_onboarding_complete || false,
    });
  }
}

import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { createConnectAccount, createAccountLink, getAccountStatus } from '@/lib/payment';
import { createClient } from '@/lib/supabase/server';

// GET — return sitter's Stripe account status
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
    return NextResponse.json({
      connected: true,
      ...status,
    });
  } catch (err) {
    console.error('[Stripe] Account status error:', err);
    return NextResponse.json({
      connected: true,
      chargesEnabled: profile.stripe_onboarding_complete || false,
      payoutsEnabled: profile.payout_enabled || false,
      detailsSubmitted: profile.stripe_onboarding_complete || false,
    });
  }
}

// POST — create new Stripe Express account or generate new onboarding link
export async function POST() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Nemate pristup.' }, { status: 401 });
  }

  if (user.role !== 'sitter') {
    return NextResponse.json({ error: 'Samo čuvari mogu povezati Stripe račun.' }, { status: 403 });
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('sitter_profiles')
    .select('stripe_account_id, stripe_onboarding_complete')
    .eq('user_id', user.id)
    .single();

  try {
    // If account exists but onboarding incomplete, generate new link
    if (profile?.stripe_account_id && !profile.stripe_onboarding_complete) {
      const onboardingUrl = await createAccountLink(profile.stripe_account_id);
      return NextResponse.json({ onboardingUrl, accountId: profile.stripe_account_id });
    }

    // If already fully connected
    if (profile?.stripe_account_id && profile.stripe_onboarding_complete) {
      return NextResponse.json(
        { error: 'Stripe račun je već povezan.', alreadyConnected: true },
        { status: 400 }
      );
    }

    // Create new account
    const { accountId, onboardingUrl } = await createConnectAccount({
      id: user.id,
      email: user.email,
      name: user.name,
      country: 'HR',
    });

    // Save to DB
    await supabase
      .from('sitter_profiles')
      .update({ stripe_account_id: accountId })
      .eq('user_id', user.id);

    return NextResponse.json({ onboardingUrl, accountId });
  } catch (err) {
    console.error('[Stripe] Connect account error:', err);
    return NextResponse.json(
      { error: 'Greška pri kreiranju Stripe računa. Pokušajte ponovo.' },
      { status: 500 }
    );
  }
}

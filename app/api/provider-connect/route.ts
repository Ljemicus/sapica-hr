import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getProviderApplication, updateProviderStripeState } from '@/lib/db/provider-applications';
import {
  createProviderConnectAccount,
  getProviderConnectStatus,
  refreshProviderOnboardingLink,
} from '@/lib/provider-connect';

export async function POST() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Neautorizirano' }, { status: 401 });
  }

  const application = await getProviderApplication(user.id);
  if (!application) {
    return NextResponse.json({ error: 'Prvo spremite prijavu providera' }, { status: 400 });
  }

  const displayName = application.display_name || user.name || user.email;

  if (application.stripe_account_id) {
    const onboardingUrl = await refreshProviderOnboardingLink(application.stripe_account_id);
    if (!onboardingUrl) {
      return NextResponse.json({ error: 'Stripe trenutno nije konfiguriran' }, { status: 503 });
    }

    return NextResponse.json({
      accountId: application.stripe_account_id,
      onboardingUrl,
      reused: true,
    });
  }

  const result = await createProviderConnectAccount(user.id, user.email, displayName);
  if (!result) {
    return NextResponse.json({ error: 'Stripe trenutno nije konfiguriran' }, { status: 503 });
  }

  await updateProviderStripeState(user.id, {
    stripe_account_id: result.accountId,
    stripe_onboarding_complete: false,
    payout_enabled: false,
  });

  return NextResponse.json({ ...result, reused: false });
}

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Neautorizirano' }, { status: 401 });
  }

  const application = await getProviderApplication(user.id);
  if (!application?.stripe_account_id) {
    return NextResponse.json({ connected: false, status: null });
  }

  const status = await getProviderConnectStatus(application.stripe_account_id);
  if (!status) {
    return NextResponse.json({ connected: true, configured: false, status: null });
  }

  await updateProviderStripeState(user.id, {
    stripe_onboarding_complete: status.detailsSubmitted,
    payout_enabled: status.payoutsEnabled,
  });

  return NextResponse.json({
    connected: true,
    configured: true,
    status,
  });
}

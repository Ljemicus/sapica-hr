import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import { getProviderApplication } from '@/lib/db/provider-applications';
import { getProviderConnectStatus } from '@/lib/provider-connect';
import { updateProviderStripeState } from '@/lib/db/provider-applications';
import { ProviderOnboardingForm } from './provider-onboarding-form';

export const metadata: Metadata = {
  title: 'Onboarding providera | PetPark',
  description: 'Postani provider na PetParku i dovrši onboarding za isplate, usluge i profil.',
};

export default async function ProviderOnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await getAuthUser();

  if (!user) {
    redirect('/prijava?redirect=/onboarding/provider');
  }

  const params = await searchParams;
  const stripeReturn = params.stripe_complete === 'true' ? 'complete' : params.stripe_refresh === 'true' ? 'refresh' : null;

  let application = await getProviderApplication(user.id);

  // When returning from Stripe, sync the account status
  if (stripeReturn === 'complete' && application?.stripe_account_id) {
    const status = await getProviderConnectStatus(application.stripe_account_id);
    if (status) {
      application = await updateProviderStripeState(user.id, {
        stripe_onboarding_complete: status.detailsSubmitted,
        payout_enabled: status.payoutsEnabled,
      }) ?? application;
    }
  }

  return (
    <ProviderOnboardingForm
      user={user}
      initialApplication={application}
      stripeReturn={stripeReturn}
    />
  );
}

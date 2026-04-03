import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import { getProviderApplication } from '@/lib/db/provider-applications';
import { getProviderConnectStatus } from '@/lib/provider-connect';
import { updateProviderStripeState } from '@/lib/db/provider-applications';
import { getVerification } from '@/lib/db/provider-verifications';
import { ProviderOnboardingForm } from './provider-onboarding-form';
import { ProviderIdentityVerification } from '@/components/provider-identity-verification';

export const metadata: Metadata = {
  title: 'Onboarding providera | PetPark',
  description: 'Postani provider na PetParku i dovrši onboarding za isplate, usluge i profil.',
  robots: { index: false, follow: false },
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

  const identityVerification = application
    ? await getVerification(application.id, 'identity')
    : null;

  return (
    <div className="space-y-6">
      <ProviderOnboardingForm
        user={user}
        initialApplication={application}
        stripeReturn={stripeReturn}
      />
      {application && (
        <div className="container mx-auto px-4 max-w-2xl pb-8">
          <ProviderIdentityVerification verification={identityVerification} />
        </div>
      )}
    </div>
  );
}

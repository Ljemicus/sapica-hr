import { unstable_noStore as noStore } from 'next/cache';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import { BreederOnboardingWizard } from '../components/breeder-onboarding-wizard';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Dobrodošli — Uzgajivač | PetPark',
  description: 'Postani PetPark uzgajivač i poveži se s budućim vlasnicima.',
};

export default async function BreederOnboardingPage() {
  noStore();
  
  const user = await getAuthUser();
  if (!user) redirect('/prijava');
  
  // Allow both owners and breeders to access this onboarding
  // The profile type check would be handled by the parent dashboard

  return <BreederOnboardingWizard />;
}

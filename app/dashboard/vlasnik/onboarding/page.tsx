import { unstable_noStore as noStore } from 'next/cache';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import { OwnerOnboardingWizard } from '../components/owner-onboarding-wizard';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Dobrodošli — Vlasnik | PetPark',
  description: 'Dobrodošli u PetPark! Upoznajte platformu i dodajte svog prvog ljubimca.',
};

export default async function OwnerOnboardingPage() {
  noStore();
  
  const user = await getAuthUser();
  if (!user) redirect('/prijava');
  if (user.role !== 'owner') redirect('/dashboard/sitter');

  return <OwnerOnboardingWizard />;
}

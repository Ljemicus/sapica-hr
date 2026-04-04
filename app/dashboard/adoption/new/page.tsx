import { unstable_noStore as noStore } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getPublisherProfile } from '@/lib/db';
import AdoptionListingForm from '../adoption-listing-form';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Novi oglas za udomljavanje | PetPark' };

export default async function NewAdoptionListingPage() {
  noStore();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/prijava?redirect=%2Fdashboard%2Fadoption%2Fnew');
  }

  const publisher = await getPublisherProfile(user.id);
  if (!publisher) {
    redirect('/onboarding/publisher-type');
  }

  if (publisher.type !== 'udomljavanje') {
    redirect('/dashboard/profile');
  }

  return <AdoptionListingForm />;
}

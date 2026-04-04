import { getAdoptionListingsByPublisher, getPublisherProfile } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AdoptionDashboardClient } from './adoption-dashboard-client';

export default async function AdoptionDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/prijava');
  }

  const publisher = await getPublisherProfile(user.id);
  if (!publisher) {
    redirect('/onboarding/publisher-type');
  }

  if (publisher.type !== 'udomljavanje') {
    redirect('/dashboard/profile');
  }

  const listings = await getAdoptionListingsByPublisher(publisher.id);

  return <AdoptionDashboardClient initialListings={listings} />;
}

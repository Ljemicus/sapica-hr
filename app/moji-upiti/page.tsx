import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { MyRequestsPage } from '@/components/shared/petpark/my-requests-page';
import { getAuthUser } from '@/lib/auth';
import { getOwnerBookingRequestSummaries } from '@/lib/petpark/booking-requests/read-owner';

export const metadata: Metadata = {
  title: 'Moji upiti | PetPark',
  description: 'Pregled upita koje si poslao pružateljima PetPark usluga.',
};

export default async function MojiUpitiRoute() {
  const user = await getAuthUser();
  if (!user) redirect('/prijava?redirect=%2Fmoji-upiti');

  const requests = await getOwnerBookingRequestSummaries(user.id);

  return <MyRequestsPage requests={requests} />;
}

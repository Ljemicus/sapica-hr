import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { MyRequestsPage } from '@/components/shared/petpark/my-requests-page';
import { getAuthUser } from '@/lib/auth';
import { getOwnerBookingRequestSummaries } from '@/lib/petpark/booking-requests/read-owner';

export const metadata: Metadata = {
  title: 'Moji upiti | PetPark',
  description: 'Pregled upita koje si poslao pružateljima PetPark usluga.',
};

type MojiUpitiRouteProps = {
  searchParams: Promise<{ request?: string }>;
};

export default async function MojiUpitiRoute({ searchParams }: MojiUpitiRouteProps) {
  const user = await getAuthUser();
  if (!user) redirect('/prijava?redirect=%2Fmoji-upiti');

  const [requests, params] = await Promise.all([
    getOwnerBookingRequestSummaries(user.id),
    searchParams,
  ]);

  return <MyRequestsPage requests={requests} selectedRequestId={params.request} />;
}

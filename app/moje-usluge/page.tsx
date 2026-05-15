import type { Metadata } from 'next';
import { MyServicesPage } from '@/components/shared/petpark/my-services-page';
import { getOwnedServiceListingSummaries } from '@/lib/petpark/service-listings/read-owned';
import { getOwnedBookingRequestSummaries } from '@/lib/petpark/booking-requests/db';

export const metadata: Metadata = {
  title: 'Moje usluge | PetPark',
  description: 'Provider dashboard za upravljanje PetPark uslugama, rezervacijama, recenzijama i prihodima.',
};

type MojeUslugeRouteProps = {
  searchParams: Promise<{ request?: string }>;
};

export default async function MojeUslugeRoute({ searchParams }: MojeUslugeRouteProps) {
  const [providerServices, bookingRequests, params] = await Promise.all([
    getOwnedServiceListingSummaries(),
    getOwnedBookingRequestSummaries(),
    searchParams,
  ]);

  return <MyServicesPage providerServices={providerServices} bookingRequests={bookingRequests} selectedRequestId={params.request} />;
}

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import AdoptionListingForm from '../../adoption-listing-form';
import type { AdoptionListing } from '@/lib/types';

export default function EditAdoptionListingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [listing, setListing] = useState<AdoptionListing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/adoption-listings/${id}`);
      if (res.ok) {
        setListing(await res.json());
      } else {
        toast.error('Oglas nije pronađen');
        router.push('/dashboard/adoption');
      }
      setLoading(false);
    })();
  }, [id, router]);

  if (loading) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <LoadingSpinner className="py-12" />
      </div>
    );
  }

  if (!listing) return null;

  return <AdoptionListingForm listing={listing} />;
}

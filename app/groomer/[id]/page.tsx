import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getGroomer, getGroomerReviews, getAvailability } from '@/lib/db';
import { GroomerProfile } from './groomer-profile';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';

interface GroomerPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: GroomerPageProps): Promise<Metadata> {
  const { id } = await params;
  const groomer = await getGroomer(id);
  return {
    title: groomer ? `${groomer.name} — Grooming u ${groomer.city}` : 'Groomer profil',
    description: groomer ? `Pogledajte profil groomera ${groomer.name}. Zakažite termin za uljepšavanje ljubimca.` : '',
  };
}

export default async function GroomerPage({ params }: GroomerPageProps) {
  const { id } = await params;
  const groomer = await getGroomer(id);
  if (!groomer) return notFound();

  const reviews = await getGroomerReviews(id);

  // Query real availability from Supabase, convert to boolean[] for next 14 days
  const availabilityRecords = await getAvailability(id);
  const availableDates = new Set(
    availabilityRecords.filter(a => a.available).map(a => a.date)
  );
  const today = new Date();
  const availability = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    return availableDates.has(dateStr);
  });

  return (
    <>
      <Breadcrumbs items={[
        { label: 'Grooming', href: '/njega' },
        { label: groomer.name, href: `/groomer/${id}` },
      ]} />
      <GroomerProfile groomer={groomer} reviews={reviews} availability={availability} />
    </>
  );
}

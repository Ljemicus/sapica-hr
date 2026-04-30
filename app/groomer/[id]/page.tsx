import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { robotsMeta, shouldIndexGroomer } from '@/lib/seo/indexability';
import { getProviderGroomerById } from '@/lib/db/provider-groomers';
import { toPublicGroomer } from '@/lib/public-profiles';
import { GroomerProfileLoader } from './groomer-profile-loader';

interface GroomerPageProps {
  params: Promise<{ id: string }>;
}

async function createGroomerShell(id: string) {
  const groomer = await getProviderGroomerById(id);
  if (groomer) return toPublicGroomer(groomer);

  return {
    id,
    name: 'Profil groomera',
    city: 'Hrvatska',
    description: 'Podaci o groomeru učitavaju se.',
    specializations: ['kupanje'],
    certificates: [],
    certified: false,
    rating: 0,
    reviewCount: 0,
    priceFrom: null,
    services: ['kupanje'],
    availability: [],
    profileImage: null,
    verified: false,
    category: 'groomer' as const,
    specialization: 'oba' as const,
    prices: { sisanje: 0, kupanje: 0, trimanje: 0, nokti: 0, cetkanje: 0 } as Record<string, number>,
    workingHours: undefined,
  };
}

export async function generateMetadata({ params }: GroomerPageProps): Promise<Metadata> {
  const { id } = await params;
  const groomer = await createGroomerShell(id);
  return {
    title: { absolute: `${groomer.name} | PetPark` },
    description: groomer.description || 'Profil groomera na PetParku.',
    alternates: { canonical: `/groomer/${id}` },
    robots: robotsMeta(shouldIndexGroomer({
      id: groomer.id, name: groomer.name, city: groomer.city, services: groomer.services as any,
      prices: groomer.prices as any, specialization: groomer.specialization as any,
      rating: groomer.rating, review_count: groomer.reviewCount, verified: groomer.verified,
      bio: groomer.description || '',
    })),
  };
}

export default async function GroomerPage({ params }: GroomerPageProps) {
  const { id } = await params;
  const groomer = await createGroomerShell(id);

  return (
    <>
      <Breadcrumbs items={[
        { label: 'Grooming', href: '/njega' },
        { label: groomer.name, href: `/groomer/${id}` },
      ]} />
      <GroomerProfileLoader id={id} initialGroomer={groomer} />
    </>
  );
}

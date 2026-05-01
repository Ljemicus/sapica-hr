import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { robotsMeta, shouldIndexGroomer } from '@/lib/seo/indexability';
import type { Groomer } from '@/lib/types';
import { getProviderGroomerById } from '@/lib/db/provider-groomers';
import { sanitizeGroomerProfile } from '@/lib/public/provider-profile-sanitizers';
import { GroomerProfileLoader } from './groomer-profile-loader';

interface GroomerPageProps {
  params: Promise<{ id: string }>;
}

async function createGroomerShell(id: string): Promise<Groomer> {
  const groomer = await getProviderGroomerById(id);
  if (groomer) return groomer;

  return {
    id,
    name: 'Profil groomera',
    city: 'Hrvatska',
    services: ['kupanje'],
    prices: { sisanje: 0, kupanje: 0, trimanje: 0, nokti: 0, cetkanje: 0 },
    rating: 0,
    review_count: 0,
    bio: 'Podaci o groomeru učitavaju se.',
    verified: false,
    specialization: 'oba',
    address: '',
    phone: '',
    email: '',
  };
}

export async function generateMetadata({ params }: GroomerPageProps): Promise<Metadata> {
  const { id } = await params;
  const groomer = await createGroomerShell(id);
  return {
    title: { absolute: `${groomer.name} | PetPark` },
    description: groomer.bio || 'Profil groomera na PetParku.',
    alternates: { canonical: `/groomer/${id}` },
    robots: robotsMeta(shouldIndexGroomer(groomer)),
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
      <GroomerProfileLoader id={id} initialGroomer={sanitizeGroomerProfile(groomer)!} />
    </>
  );
}

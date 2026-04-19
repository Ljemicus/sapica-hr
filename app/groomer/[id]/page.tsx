import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { robotsMeta } from '@/lib/seo/indexability';
import type { Groomer } from '@/lib/types';
import { GroomerProfileLoader } from './groomer-profile-loader';

interface GroomerPageProps {
  params: Promise<{ id: string }>;
}

function createGroomerShell(id: string): Groomer {
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
  return {
    title: `Profil groomera ${id}`,
    description: 'Profil groomera na PetParku.',
    robots: robotsMeta(false),
  };
}

export default async function GroomerPage({ params }: GroomerPageProps) {
  const { id } = await params;
  const groomer = createGroomerShell(id);

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

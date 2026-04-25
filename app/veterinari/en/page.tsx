import type { Metadata } from 'next';
import { UskoroState } from '@/components/shared/uskoro-state';

export const metadata: Metadata = {
  title: { absolute: 'Veterinarians coming soon | PetPark' },
  description: 'The veterinary directory will go live when there is a verified content pipeline.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <UskoroState title="Veterinarians coming soon" description="The veterinary directory will go live when there is a verified content pipeline." />;
}

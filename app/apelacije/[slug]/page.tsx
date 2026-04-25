import type { Metadata } from 'next';
import { UskoroState } from '@/components/shared/uskoro-state';

export const metadata: Metadata = {
  title: { absolute: 'Apelacija uskoro | PetPark' },
  description: 'Ova apelacija je privremeno skrivena dok ne potvrdimo podatke i donation flow.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <UskoroState title="Apelacija uskoro" description="Ova apelacija je privremeno skrivena dok ne potvrdimo podatke i donation flow." />;
}

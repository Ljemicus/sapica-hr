import type { Metadata } from 'next';
import { UskoroState } from '@/components/shared/uskoro-state';

export const metadata: Metadata = {
  title: { absolute: 'Profil veterinara uskoro | PetPark' },
  description: 'Profil veterinara je privremeno skriven dok ne potvrdimo podatke.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <UskoroState title="Profil veterinara uskoro" description="Profil veterinara je privremeno skriven dok ne potvrdimo podatke." />;
}

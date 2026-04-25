import type { Metadata } from 'next';
import { UskoroState } from '@/components/shared/uskoro-state';

export const metadata: Metadata = {
  title: { absolute: 'Članak zajednice uskoro | PetPark' },
  description: 'Ovaj community sadržaj je privremeno skriven dok ne završimo javni content pipeline.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <UskoroState title="Članak zajednice uskoro" description="Ovaj community sadržaj je privremeno skriven dok ne završimo javni content pipeline." />;
}

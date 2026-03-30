import type { Metadata } from 'next';
import { getSitters } from '@/lib/db';
import { OmiljeniContent } from './omiljeni-content';

export const metadata: Metadata = {
  title: 'Omiljeni sitteri',
  description: 'Vaši omiljeni sitteri na jednom mjestu.',
};

export default async function OmiljeniPage() {
  const sitters = await getSitters();
  return <OmiljeniContent sitters={sitters} />;
}

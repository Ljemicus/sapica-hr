import { Metadata } from 'next';
import { AIMatchingContent } from './ai-matching-content';

export const metadata: Metadata = {
  title: 'AI Pronalaženje Čuvara | PetPark',
  description: 'Naš AI uspoređuje iskustvo, ocjene, vrijeme odgovora i lokaciju kako bi predložio prikladne čuvare za vašeg ljubimca.',
  openGraph: {
    title: 'AI Pronalaženje Čuvara | PetPark',
    description: 'Pronađite prikladnog čuvara uz pomoć umjetne inteligencije.',
  },
};

export default function AIMatchingPage() {
  return <AIMatchingContent />;
}

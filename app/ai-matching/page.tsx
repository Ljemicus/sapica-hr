import { Metadata } from 'next';
import { AIMatchingContent } from './ai-matching-content';

export const metadata: Metadata = {
  title: 'AI Pronalaženje Čuvara | PetPark',
  description: 'Naš AI analizira iskustvo, ocjene, vrijeme odgovora i lokaciju da pronađe najboljeg čuvara za vašeg ljubimca.',
  openGraph: {
    title: 'AI Pronalaženje Čuvara | PetPark',
    description: 'Pronađite savršenog čuvara uz pomoć umjetne inteligencije.',
  },
};

export default function AIMatchingPage() {
  return <AIMatchingContent />;
}

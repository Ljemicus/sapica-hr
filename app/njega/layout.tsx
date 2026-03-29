import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Grooming saloni za pse i mačke',
  description: 'Pronađite profesionalne grooming salone za šišanje, kupanje, trimanje i njegu noktiju vašeg ljubimca u Hrvatskoj.',
  keywords: ['grooming', 'šišanje pasa', 'kupanje pasa', 'trimanje', 'njega ljubimaca', 'grooming salon'],
  openGraph: {
    title: 'Grooming saloni za pse i mačke | PetPark',
    description: 'Pronađite profesionalne grooming salone za šišanje, kupanje i njegu vašeg ljubimca.',
    url: 'https://petpark.hr/njega',
    type: 'website',
  },
};

export default function NjegaLayout({ children }: { children: React.ReactNode }) {
  return children;
}

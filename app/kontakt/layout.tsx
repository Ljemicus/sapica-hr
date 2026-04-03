import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kontakt — javite nam se',
  description: 'Imate pitanje, prijedlog ili trebate pomoć? Javite nam se putem kontakt obrasca ili na info@petpark.hr.',
  keywords: ['kontakt', 'podrška', 'PetPark kontakt', 'pomoć'],
  openGraph: {
    title: 'Kontakt — javite nam se | PetPark',
    description: 'Imate pitanje ili trebate pomoć? Javite nam se putem kontakt obrasca.',
    url: 'https://petpark.hr/kontakt',
    type: 'website',
  },
  alternates: { canonical: 'https://petpark.hr/kontakt' },
};

export default function KontaktLayout({ children }: { children: React.ReactNode }) {
  return children;
}

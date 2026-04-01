import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kontaktirajte PetPark',
  description: 'Imate pitanje, prijedlog ili trebate pomoć? Javite nam se putem kontakt obrasca ili na petparkhr@gmail.com.',
  keywords: ['kontakt', 'podrška', 'PetPark kontakt', 'pomoć'],
  openGraph: {
    title: 'Kontaktirajte PetPark',
    description: 'Imate pitanje ili trebate pomoć? Javite nam se putem kontakt obrasca.',
    url: 'https://petpark.hr/kontakt',
    type: 'website',
  },
};

export default function KontaktLayout({ children }: { children: React.ReactNode }) {
  return children;
}

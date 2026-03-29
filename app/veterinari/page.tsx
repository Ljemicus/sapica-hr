import type { Metadata } from 'next';
import { VeterinariContent } from './veterinari-content';

export const metadata: Metadata = {
  title: 'Veterinarske ordinacije u Hrvatskoj',
  description: 'Pronađite pouzdane veterinarske ordinacije u vašem gradu. Pregled klinika s ocjenama, radnim vremenom i kontakt podacima.',
  keywords: ['veterinar', 'veterinarska ordinacija', 'veterinar zagreb', 'veterinar split', 'veterinarska klinika'],
  openGraph: {
    title: 'Veterinarske ordinacije u Hrvatskoj | PetPark',
    description: 'Pronađite pouzdane veterinarske ordinacije u vašem gradu s ocjenama i kontakt podacima.',
    url: 'https://petpark.hr/veterinari',
    type: 'website',
  },
};

export default function VeterinariPage() {
  return <VeterinariContent />;
}

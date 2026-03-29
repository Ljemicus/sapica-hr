import type { Metadata } from 'next';
import { VeterinariContent } from './veterinari-content';

export const metadata: Metadata = {
  title: 'Veterinari — Veterinarske ordinacije u Hrvatskoj',
  description: 'Pronađite pouzdane veterinarske ordinacije u vašem gradu. Pregled klinika s ocjenama, radnim vremenom i kontakt podacima.',
};

export default function VeterinariPage() {
  return <VeterinariContent />;
}

import type { Metadata } from 'next';
import { CartContent } from './cart-content';

export const metadata: Metadata = {
  title: 'Košarica',
  description: 'Vaša košarica — pregledajte i dovršite kupovinu na PetPark Shopu.',
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return <CartContent />;
}

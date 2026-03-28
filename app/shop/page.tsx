import type { Metadata } from 'next';
import { ShopContent } from './shop-content';

export const metadata: Metadata = {
  title: 'Shop — Sve za vašeg ljubimca',
  description: 'PetPark webshop — hrana, igračke, povodci, krevetići i sve ostalo što vaš ljubimac treba. Dostava po cijeloj Hrvatskoj.',
};

export default function ShopPage() {
  return <ShopContent />;
}

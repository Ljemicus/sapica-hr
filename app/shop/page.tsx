import type { Metadata } from 'next';
import { getProducts } from '@/lib/db';
import { ShopContent } from './shop-content';

export const metadata: Metadata = {
  title: 'Pet Shop — hrana, igračke, oprema',
  description: 'PetPark webshop — hrana, igračke, povodci, krevetići i sve ostalo što vaš ljubimac treba. Dostava po cijeloj Hrvatskoj.',
  keywords: ['pet shop', 'hrana za pse', 'igračke za pse', 'oprema za ljubimce', 'pet shop hrvatska'],
  openGraph: {
    title: 'Pet Shop — hrana, igračke, oprema | PetPark',
    description: 'Hrana, igračke, povodci, krevetići i sve ostalo što vaš ljubimac treba. Dostava po cijeloj Hrvatskoj.',
    url: 'https://petpark.hr/shop',
    type: 'website',
  },
  alternates: { canonical: 'https://petpark.hr/shop' },
};

export default async function ShopPage() {
  const products = await getProducts();
  return <ShopContent products={products} />;
}

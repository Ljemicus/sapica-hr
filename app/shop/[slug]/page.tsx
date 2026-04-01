import { cache } from 'react';
import type { Metadata } from 'next';
import { getProductPageData } from './product-page-data';
import { ProductDetail } from './product-detail';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';

const getCachedProductBySlug = cache(async (slug: string) => (await getProductPageData(slug)).product);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getCachedProductBySlug(slug);
  if (!product) return { title: 'Proizvod nije pronađen' };
  return {
    title: `${product.name} — ${product.brand}`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { product, reviews, related } = await getProductPageData(slug);
  if (!product) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    brand: { '@type': 'Brand', name: product.brand },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'EUR',
      availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumbs items={[
        { label: 'Shop', href: '/shop' },
        { label: product.name, href: `/shop/${slug}` },
      ]} />
      <ProductDetail product={product} reviews={reviews} related={related} />
    </>
  );
}

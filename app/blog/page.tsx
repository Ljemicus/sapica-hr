import type { Metadata } from 'next';
import { getArticles } from '@/lib/db/content';
import { BlogContent } from './blog-content';
import type { BlogCategory } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Blog — savjeti za vlasnike ljubimaca',
  description: 'Korisni članci i savjeti o zdravlju, prehrani, školovanju pasa i putovanju s ljubimcima. Stručni sadržaj za sve vlasnike.',
  keywords: ['blog ljubimci', 'savjeti za pse', 'savjeti za mačke', 'zdravlje ljubimaca', 'prehrana pasa'],
  openGraph: {
    title: 'Blog — savjeti za vlasnike ljubimaca | PetPark',
    description: 'Korisni članci i savjeti o zdravlju, prehrani, školovanju pasa i putovanju s ljubimcima.',
    url: 'https://petpark.hr/blog',
    type: 'website',
  },
  alternates: { canonical: 'https://petpark.hr/blog' },
};

interface BlogPageProps {
  searchParams: Promise<{ category?: string; kategorija?: string }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const activeCategory = (params.category ?? params.kategorija) as BlogCategory | undefined;
  const articles = await getArticles(activeCategory);

  return <BlogContent articles={articles} initialCategory={activeCategory} />;
}

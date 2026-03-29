import type { Metadata } from 'next';
import { getArticles } from '@/lib/db';
import { BlogContent } from './blog-content';
import type { BlogCategory } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Blog — savjeti za vlasnike ljubimaca',
  description: 'Korisni članci i savjeti o zdravlju, prehrani, školovanju pasa i putovanju s ljubimcima.',
};

interface BlogPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const articles = await getArticles(params.category as BlogCategory | undefined);

  return <BlogContent articles={articles} initialCategory={params.category} />;
}

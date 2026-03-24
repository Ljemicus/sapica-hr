import type { Metadata } from 'next';
import { getArticles } from '@/lib/mock-data';
import { BlogContent } from './blog-content';

export const metadata: Metadata = {
  title: 'Blog — savjeti za vlasnike ljubimaca',
  description: 'Korisni članci i savjeti o zdravlju, prehrani, dresuri i putovanju s ljubimcima.',
};

interface BlogPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const articles = getArticles(params.category);

  return <BlogContent articles={articles} initialCategory={params.category} />;
}

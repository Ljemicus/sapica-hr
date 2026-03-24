import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getArticleBySlug, getRelatedArticles } from '@/lib/mock-data';
import { ArticleContent } from './article-content';

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  return {
    title: article ? article.title : 'Članak',
    description: article ? article.excerpt : '',
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return notFound();
  const related = getRelatedArticles(slug, 3);
  return <ArticleContent article={article} relatedArticles={related} />;
}

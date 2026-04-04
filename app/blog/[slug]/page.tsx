import { notFound } from 'next/navigation';
import { cache } from 'react';
import type { Metadata } from 'next';
import { getArticles, getArticleComments } from '@/lib/db';
import { getArticlePageData } from './article-page-data';
import { ArticleContent } from './article-content';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { getAuthUser } from '@/lib/auth';
import { BLOG_CATEGORY_LABELS } from '@/lib/types';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://petpark.hr';

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

const getCachedArticle = cache(async (slug: string) => (await getArticlePageData(slug)).article);

export const dynamicParams = false;

export async function generateStaticParams() {
  const articles = await getArticles();
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getCachedArticle(slug);
  if (!article) notFound();
  return {
    title: `${article.title} | PetPark`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      url: `${BASE_URL}/blog/${slug}`,
      siteName: 'PetPark',
      locale: 'hr_HR',
      publishedTime: article.date,
      modifiedTime: article.updatedAt ?? article.date,
      authors: [article.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
    },
    alternates: {
      canonical: `${BASE_URL}/blog/${slug}`,
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const [{ article, related }, comments, user] = await Promise.all([
    getArticlePageData(slug),
    getArticleComments(slug),
    getAuthUser(),
  ]);
  if (!article) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.excerpt,
    author: {
      '@type': 'Person',
      name: article.author,
    },
    datePublished: article.date,
    dateModified: article.updatedAt ?? article.date,
    publisher: {
      '@type': 'Organization',
      name: 'PetPark',
      url: BASE_URL,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}/blog/${slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumbs items={[
        { label: 'Blog', href: '/blog' },
        { label: BLOG_CATEGORY_LABELS[article.category], href: `/blog?category=${article.category}` },
        { label: article.title, href: `/blog/${slug}` },
      ]} />
      <ArticleContent
        article={article}
        relatedArticles={related}
        comments={comments}
        currentUser={user ? { id: user.id, name: user.name, avatar_url: user.avatar_url, role: user.role } : null}
      />
    </>
  );
}

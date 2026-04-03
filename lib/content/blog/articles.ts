import type { Article, BlogCategory } from '@/lib/types';

/**
 * Editorial blog content.
 * Intentionally separated from mock/demo data so future cleanup passes
 * do not accidentally disable real PetPark articles.
 *
 * This source is intentionally empty for now and will be filled with
 * new editorial content later.
 */
export const blogArticles: Article[] = [];

export function getArticleBySlug(slug: string) {
  return blogArticles.find((a) => a.slug === slug) || null;
}

export function getArticles(category?: BlogCategory) {
  let result = [...blogArticles];
  if (category) result = result.filter((a) => a.category === category);
  return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getRelatedArticles(slug: string, limit = 3) {
  const article = getArticleBySlug(slug);
  if (!article) return [];
  return blogArticles
    .filter((a) => a.slug !== slug && a.category === article.category)
    .slice(0, limit)
    .concat(blogArticles.filter((a) => a.slug !== slug && a.category !== article.category).slice(0, limit))
    .slice(0, limit);
}

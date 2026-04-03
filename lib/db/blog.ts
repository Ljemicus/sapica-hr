/**
 * Blog data layer.
 * Seeded blog/article content disabled — returns empty results.
 * Will be re-enabled when real editorial content is available.
 */
import type { Article, BlogCategory } from '@/lib/types';

export async function getArticles(_category?: BlogCategory): Promise<Article[]> {
  return [];
}

export async function getArticle(_slug: string): Promise<Article | null> {
  return null;
}

export async function getRelatedArticles(
  _slug: string,
  _limit: number = 3
): Promise<Article[]> {
  return [];
}

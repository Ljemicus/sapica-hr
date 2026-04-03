/**
 * Blog data layer.
 * These articles are intentional editorial content and should remain publicly visible.
 */
import type { Article, BlogCategory } from '@/lib/types';
import {
  getArticles as getEditorialArticles,
  getArticleBySlug,
  getRelatedArticles as getEditorialRelatedArticles,
} from '@/lib/content/blog/articles';

export async function getArticles(category?: BlogCategory): Promise<Article[]> {
  return getEditorialArticles(category);
}

export async function getArticle(slug: string): Promise<Article | null> {
  return getArticleBySlug(slug) ?? null;
}

export async function getRelatedArticles(
  slug: string,
  limit: number = 3
): Promise<Article[]> {
  return getEditorialRelatedArticles(slug, limit);
}

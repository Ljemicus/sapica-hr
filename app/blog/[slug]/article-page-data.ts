import { getArticle, getRelatedArticles } from '@/lib/db/content';

export async function getArticlePageData(slug: string) {
  const article = await getArticle(slug);
  if (!article) {
    return { article: null, related: [] };
  }

  const related = await getRelatedArticles(slug, 3);
  return { article, related };
}

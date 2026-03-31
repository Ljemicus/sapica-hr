import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from './helpers';
import {
  getArticles as mockGetArticles,
  getArticleBySlug as mockGetArticle,
  getRelatedArticles as mockGetRelated,
} from '@/lib/mock-data';
import type { Article, BlogCategory } from '@/lib/types';

export async function getArticles(category?: BlogCategory): Promise<Article[]> {
  if (!isSupabaseConfigured()) {
    return mockGetArticles(category);
  }
  try {
    const supabase = await createClient();
    let query = supabase.from('articles').select('slug, title, excerpt, body, author, date, category, emoji').order('date', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error || !data) return mockGetArticles(category);
    return data as Article[];
  } catch {
    return mockGetArticles(category);
  }
}

export async function getArticle(slug: string): Promise<Article | null> {
  if (!isSupabaseConfigured()) {
    return mockGetArticle(slug) ?? null;
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('articles')
      .select('slug, title, excerpt, body, author, date, category, emoji')
      .eq('slug', slug)
      .single();
    if (error || !data) return mockGetArticle(slug) ?? null;
    return data as Article;
  } catch {
    return mockGetArticle(slug) ?? null;
  }
}

export async function getRelatedArticles(
  slug: string,
  limit: number = 3
): Promise<Article[]> {
  if (!isSupabaseConfigured()) {
    return mockGetRelated(slug, limit);
  }
  try {
    const supabase = await createClient();

    const { data: current, error: currentError } = await supabase
      .from('articles')
      .select('category')
      .eq('slug', slug)
      .single();

    if (currentError || !current) return mockGetRelated(slug, limit);

    const { data: sameCat, error: sameCatError } = await supabase
      .from('articles')
      .select('slug, title, excerpt, body, author, date, category, emoji')
      .eq('category', current.category)
      .neq('slug', slug)
      .order('date', { ascending: false })
      .limit(limit);

    const related = (sameCatError || !sameCat ? [] : sameCat) as Article[];

    if (related.length < limit) {
      const excludeSlugs = [slug, ...related.map((a) => a.slug)];
      const { data: others, error: othersError } = await supabase
        .from('articles')
        .select('slug, title, excerpt, body, author, date, category, emoji')
        .not('slug', 'in', `(${excludeSlugs.join(',')})`)
        .order('date', { ascending: false })
        .limit(limit - related.length);

      if (!othersError && others) {
        related.push(...(others as Article[]));
      }
    }

    return related;
  } catch {
    return mockGetRelated(slug, limit);
  }
}

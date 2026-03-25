import { createClient } from '@/lib/supabase/server';
import type { Article, BlogCategory } from '@/lib/types';

export async function getArticles(category?: BlogCategory): Promise<Article[]> {
  try {
    const supabase = await createClient();
    let query = supabase.from('articles').select('*').order('date', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error || !data) return [];
    return data as Article[];
  } catch {
    return [];
  }
}

export async function getArticle(slug: string): Promise<Article | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .single();
    if (error || !data) return null;
    return data as Article;
  } catch {
    return null;
  }
}

export async function getRelatedArticles(
  slug: string,
  limit: number = 3
): Promise<Article[]> {
  try {
    const supabase = await createClient();

    // First get the current article to find its category
    const { data: current, error: currentError } = await supabase
      .from('articles')
      .select('category')
      .eq('slug', slug)
      .single();

    if (currentError || !current) return [];

    // Get articles in same category first
    const { data: sameCat, error: sameCatError } = await supabase
      .from('articles')
      .select('*')
      .eq('category', current.category)
      .neq('slug', slug)
      .order('date', { ascending: false })
      .limit(limit);

    const related = (sameCatError || !sameCat ? [] : sameCat) as Article[];

    // If not enough, fill with other articles
    if (related.length < limit) {
      const excludeSlugs = [slug, ...related.map((a) => a.slug)];
      const { data: others, error: othersError } = await supabase
        .from('articles')
        .select('*')
        .not('slug', 'in', `(${excludeSlugs.join(',')})`)
        .order('date', { ascending: false })
        .limit(limit - related.length);

      if (!othersError && others) {
        related.push(...(others as Article[]));
      }
    }

    return related;
  } catch {
    return [];
  }
}

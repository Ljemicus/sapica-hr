import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from './helpers';
import {
  mockProducts,
  getProductBySlug as mockGetBySlug,
  getProductsByCategory as mockGetByCategory,
  getProductReviews as mockGetReviews,
  getRelatedProducts as mockGetRelated,
} from '@/lib/mock-data';
import type { Product, ProductCategory, ProductReview } from '@/lib/types';

interface ProductFilters {
  category?: ProductCategory;
  search?: string;
}

function mapDbProduct(row: Record<string, unknown>): Product {
  return {
    id: row.id as string,
    slug: row.slug as string,
    name: row.name as string,
    category: row.category as ProductCategory,
    price: Number(row.price),
    originalPrice: row.original_price ? Number(row.original_price) : undefined,
    description: (row.description as string) || '',
    emoji: (row.emoji as string) || '🐾',
    brand: (row.brand as string) || '',
    rating: Number(row.rating) || 0,
    reviewCount: Number(row.review_count) || 0,
    inStock: row.in_stock as boolean,
    variants: (row.variants as Product['variants']) || [],
    specs: (row.specs as Record<string, string>) || {},
  };
}

export async function getProducts(filters?: ProductFilters): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    if (filters?.category) return mockGetByCategory(filters.category);
    return mockProducts;
  }
  try {
    const supabase = await createClient();
    let query = supabase.from('products').select('*').order('rating', { ascending: false });

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    const { data, error } = await query;
    if (error || !data) {
      if (filters?.category) return mockGetByCategory(filters.category);
      return mockProducts;
    }
    return data.map(mapDbProduct);
  } catch {
    if (filters?.category) return mockGetByCategory(filters.category);
    return mockProducts;
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!isSupabaseConfigured()) {
    return mockGetBySlug(slug) ?? null;
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .single();
    if (error || !data) return mockGetBySlug(slug) ?? null;
    return mapDbProduct(data);
  } catch {
    return mockGetBySlug(slug) ?? null;
  }
}

export async function getProductReviews(productId: string): Promise<ProductReview[]> {
  if (!isSupabaseConfigured()) {
    return mockGetReviews(productId);
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('product_reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
    if (error || !data) return mockGetReviews(productId);
    return data.map((r) => ({
      id: r.id,
      productId: r.product_id,
      authorName: r.author_name,
      authorInitial: r.author_name?.charAt(0) || '?',
      rating: r.rating,
      comment: r.comment || '',
      createdAt: r.created_at,
    }));
  } catch {
    return mockGetReviews(productId);
  }
}

export async function getRelatedProducts(
  productId: string,
  limit: number = 4
): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    return mockGetRelated(productId, limit);
  }
  try {
    const supabase = await createClient();
    const { data: current, error: currentError } = await supabase
      .from('products')
      .select('category')
      .eq('id', productId)
      .single();

    if (currentError || !current) return mockGetRelated(productId, limit);

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', current.category)
      .neq('id', productId)
      .order('rating', { ascending: false })
      .limit(limit);

    if (error || !data) return mockGetRelated(productId, limit);
    return data.map(mapDbProduct);
  } catch {
    return mockGetRelated(productId, limit);
  }
}

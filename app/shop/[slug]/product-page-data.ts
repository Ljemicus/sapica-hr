import { getProductBySlug, getProductReviews, getRelatedProducts } from '@/lib/db/content';

export async function getProductPageData(slug: string) {
  const product = await getProductBySlug(slug);
  if (!product) {
    return { product: null, reviews: [], related: [] };
  }

  const [reviews, related] = await Promise.all([
    getProductReviews(product.id),
    getRelatedProducts(product.id),
  ]);

  return {
    product,
    reviews,
    related,
  };
}

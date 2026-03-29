'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Star, ShoppingCart, Minus, Plus, ChevronRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { getProductBySlug, getProductReviews, getRelatedProducts } from '@/lib/mock-data';
import { PRODUCT_CATEGORY_LABELS, PRODUCT_CATEGORY_EMOJI } from '@/lib/types';
import { useCart } from '@/lib/cart-context';

export function ProductDetail({ slug }: { slug: string }) {
  const product = getProductBySlug(slug);
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(product?.variants[0]?.value ?? '');

  if (!product) return null;

  const reviews = getProductReviews(product.id);
  const related = getRelatedProducts(product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedVariant || undefined);
    toast.success(`${product.name} dodan u košaricu!`, {
      description: `Količina: ${quantity}${selectedVariant ? ` — ${selectedVariant}` : ''}`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/shop" className="hover:text-orange-500 transition-colors">Shop</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href={`/shop?category=${product.category}`} className="hover:text-orange-500 transition-colors">
              {PRODUCT_CATEGORY_LABELS[product.category]}
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-gray-900 font-medium truncate">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Link href="/shop" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-orange-500 mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Natrag na shop
        </Link>

        {/* Product */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Image */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl flex items-center justify-center aspect-square text-[8rem] md:text-[12rem] shadow-sm">
            {product.emoji}
          </div>

          {/* Info */}
          <div>
            <Badge variant="secondary" className="mb-3 text-orange-600 bg-orange-50 border-0">
              {PRODUCT_CATEGORY_EMOJI[product.category]} {PRODUCT_CATEGORY_LABELS[product.category]}
            </Badge>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{product.name}</h1>
            <p className="text-sm text-muted-foreground mb-3">{product.brand}</p>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < Math.round(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                ))}
              </div>
              <span className="text-sm text-gray-600">{product.rating} ({product.reviewCount} recenzija)</span>
            </div>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-orange-600">{product.price} €</span>
              {product.originalPrice && (
                <>
                  <span className="text-lg text-gray-400 line-through">{product.originalPrice} €</span>
                  <Badge className="bg-red-500 text-white text-xs">
                    -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                  </Badge>
                </>
              )}
            </div>

            <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>

            {/* Variants */}
            {product.variants.length > 0 && (
              <div className="mb-6">
                <label className="text-sm font-medium mb-2 block">{product.variants[0].label}</label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map(v => (
                    <button
                      key={v.value}
                      onClick={() => setSelectedVariant(v.value)}
                      className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                        selectedVariant === v.value
                          ? 'border-orange-500 bg-orange-50 text-orange-700 font-medium'
                          : 'border-gray-200 hover:border-orange-300 text-gray-700'
                      }`}
                    >
                      {v.value}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <label className="text-sm font-medium mb-2 block">Količina</label>
              <div className="flex items-center gap-3">
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2.5 hover:bg-gray-50 transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2.5 hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                {product.inStock ? (
                  <span className="text-sm text-green-600 font-medium">✓ Na skladištu</span>
                ) : (
                  <span className="text-sm text-red-500 font-medium">✗ Nema na skladištu</span>
                )}
              </div>
            </div>

            {/* Add to cart */}
            <Button
              size="lg"
              className="w-full bg-orange-500 hover:bg-orange-600 text-lg py-6 shadow-lg shadow-orange-200/50"
              onClick={handleAddToCart}
              disabled={!product.inStock}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Dodaj u košaricu
            </Button>
          </div>
        </div>

        {/* Specs */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <h2 className="font-bold text-lg mb-4">Specifikacije</h2>
              <div className="space-y-3">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                    <span className="text-sm text-gray-500">{key}</span>
                    <span className="text-sm font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reviews */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <h2 className="font-bold text-lg mb-4">Recenzije ({reviews.length})</h2>
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map(review => (
                    <div key={review.id} className="pb-4 border-b border-gray-100 last:border-0">
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-300 text-white text-xs">
                            {review.authorInitial}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{review.authorName}</p>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                            ))}
                          </div>
                        </div>
                        <span className="ml-auto text-xs text-gray-400">{review.createdAt}</span>
                      </div>
                      <p className="text-sm text-gray-600">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Još nema recenzija za ovaj proizvod.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mb-12">
            <h2 className="font-bold text-xl mb-6">Povezani proizvodi</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map(p => (
                <Card key={p.id} className="group card-hover border-0 shadow-sm overflow-hidden">
                  <Link href={`/shop/${p.slug}`}>
                    <div className="aspect-square bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center text-5xl group-hover:scale-105 transition-transform">
                      {p.emoji}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-sm mb-1 line-clamp-2 group-hover:text-orange-600 transition-colors">{p.name}</h3>
                      <p className="text-xs text-muted-foreground mb-1">{p.brand}</p>
                      <span className="font-bold text-orange-600">{p.price} €</span>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

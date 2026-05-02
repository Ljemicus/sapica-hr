'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, SlidersHorizontal, Grid3X3, List, Star, ShoppingCart, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
// Products passed as props from server component
import { PRODUCT_CATEGORY_LABELS, PRODUCT_CATEGORY_EMOJI, type ProductCategory, type Product } from '@/lib/types';
import { useCart } from '@/lib/cart-context';

const CATEGORIES = Object.keys(PRODUCT_CATEGORY_LABELS) as ProductCategory[];

type SortOption = 'popular' | 'price-asc' | 'price-desc' | 'new' | 'rating';
const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'popular', label: 'Popularnost' },
  { value: 'price-asc', label: 'Cijena: niža prvo' },
  { value: 'price-desc', label: 'Cijena: viša prvo' },
  { value: 'rating', label: 'Ocjena' },
  { value: 'new', label: 'Novo' },
];



function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  return (
    <Card className="group card-hover h-full border-0 shadow-sm overflow-hidden">
      <Link href={`/shop/${product.slug}`}>
        <div className="aspect-square bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center text-6xl group-hover:scale-105 transition-transform">
          {product.emoji}
        </div>
      </Link>
      <CardContent className="p-4">
        <div className="flex items-center gap-1 mb-1">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span className="text-xs text-gray-600">{product.rating} ({product.reviewCount})</span>
        </div>
        <Link href={`/shop/${product.slug}`}>
          <h3 className="font-semibold text-sm mb-1 line-clamp-2 group-hover:text-orange-600 transition-colors">{product.name}</h3>
        </Link>
        <p className="text-xs text-muted-foreground mb-2">{product.brand}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-orange-600">{product.price} €</span>
            {product.originalPrice && (
              <span className="text-xs text-gray-400 line-through">{product.originalPrice} €</span>
            )}
          </div>
          <Button
            size="sm"
            className="h-8 w-8 p-0 bg-orange-500 hover:bg-orange-600"
            onClick={(e) => { e.preventDefault(); addToCart(product); }}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function FilterSidebar({
  selectedCategory, setSelectedCategory,
  selectedBrand, setSelectedBrand,
  priceMin, setPriceMin,
  priceMax, setPriceMax,
  sort, setSort,
  onReset,
  brands,
  getCategoryCount,
}: {
  selectedCategory: ProductCategory | null; setSelectedCategory: (c: ProductCategory | null) => void;
  selectedBrand: string | null; setSelectedBrand: (b: string | null) => void;
  priceMin: string; setPriceMin: (v: string) => void;
  priceMax: string; setPriceMax: (v: string) => void;
  sort: SortOption; setSort: (s: SortOption) => void;
  onReset: () => void;
  brands: string[];
  getCategoryCount: (cat: ProductCategory) => number;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filteri</h3>
        <button onClick={onReset} className="text-xs text-orange-500 hover:text-orange-600">Poništi sve</button>
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">Kategorija</Label>
        <div className="space-y-1.5">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-colors ${
                selectedCategory === cat ? 'bg-orange-50 text-orange-700 font-medium' : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <span>{PRODUCT_CATEGORY_EMOJI[cat]} {PRODUCT_CATEGORY_LABELS[cat]}</span>
              <span className="text-xs text-gray-400">{getCategoryCount(cat)}</span>
            </button>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <Label className="text-sm font-medium mb-2 block">Cijena (€)</Label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={priceMin}
            onChange={e => setPriceMin(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border text-sm"
          />
          <span className="text-gray-400">—</span>
          <input
            type="number"
            placeholder="Max"
            value={priceMax}
            onChange={e => setPriceMax(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border text-sm"
          />
        </div>
      </div>

      <Separator />

      <div>
        <Label className="text-sm font-medium mb-2 block">Brand</Label>
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {brands.map(brand => (
            <button
              key={brand}
              onClick={() => setSelectedBrand(selectedBrand === brand ? null : brand)}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                selectedBrand === brand ? 'bg-orange-50 text-orange-700 font-medium' : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              {brand}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <Label className="text-sm font-medium mb-2 block">Sortiraj</Label>
        <div className="space-y-1.5">
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setSort(opt.value)}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                sort === opt.value ? 'bg-orange-50 text-orange-700 font-medium' : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ShopContent({ products }: { products: Product[] }) {
  const BRANDS = useMemo(() => [...new Set(products.map(p => p.brand))].sort(), [products]);
  const featuredProducts = useMemo(() => products.filter(p => p.reviewCount > 70).slice(0, 8), [products]);

  function getCategoryCount(cat: ProductCategory) {
    return products.filter(p => p.category === cat).length;
  }
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [sort, setSort] = useState<SortOption>('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);

  const resetFilters = () => {
    setSelectedCategory(null);
    setSelectedBrand(null);
    setPriceMin('');
    setPriceMax('');
    setSort('popular');
    setSearchQuery('');
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }
    if (selectedCategory) result = result.filter(p => p.category === selectedCategory);
    if (selectedBrand) result = result.filter(p => p.brand === selectedBrand);
    if (priceMin) result = result.filter(p => p.price >= Number(priceMin));
    if (priceMax) result = result.filter(p => p.price <= Number(priceMax));

    switch (sort) {
      case 'price-asc': result.sort((a, b) => a.price - b.price); break;
      case 'price-desc': result.sort((a, b) => b.price - a.price); break;
      case 'rating': result.sort((a, b) => b.rating - a.rating); break;
      case 'new': result.sort((a, b) => b.id.localeCompare(a.id)); break;
      default: result.sort((a, b) => b.reviewCount - a.reviewCount);
    }

    return result;
  }, [products, selectedCategory, selectedBrand, priceMin, priceMax, sort, searchQuery]);

  const activeFilterCount = [selectedCategory, selectedBrand, priceMin, priceMax].filter(Boolean).length;

  const filterProps = {
    selectedCategory, setSelectedCategory,
    selectedBrand, setSelectedBrand,
    priceMin, setPriceMin,
    priceMax, setPriceMax,
    sort, setSort,
    onReset: resetFilters,
    brands: BRANDS,
    getCategoryCount,
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-orange-500 via-orange-400 to-amber-400 text-white py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-3 animate-fade-in-up">
            PetPark Shop — Sve za vašeg ljubimca 🛍️
          </h1>
          <p className="text-orange-100 text-lg max-w-xl mx-auto mb-6 animate-fade-in-up delay-100">
            Pregledajte proizvode za svog ljubimca — od hrane do igračaka, sve na jednom mjestu.
          </p>
          <div className="max-w-md mx-auto relative animate-fade-in-up delay-200">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Pretražite proizvode..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white text-gray-900 shadow-lg border-0 focus:ring-2 focus:ring-orange-300 outline-none"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all ${
                  selectedCategory === cat
                    ? 'bg-orange-50 ring-2 ring-orange-300 scale-[1.02]'
                    : 'hover:bg-gray-50 hover:scale-[1.02]'
                }`}
              >
                <span className="text-2xl md:text-3xl">{PRODUCT_CATEGORY_EMOJI[cat]}</span>
                <span className="text-xs font-medium text-gray-700">{PRODUCT_CATEGORY_LABELS[cat]}</span>
                <span className="text-[10px] text-gray-400">{getCategoryCount(cat)}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured */}
      {!selectedCategory && !searchQuery && (
        <section className="py-10 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <Badge variant="secondary" className="mb-2 text-orange-600 bg-orange-50 border-0">Najpopularnije</Badge>
                <h2 className="text-2xl font-bold">Popularni proizvodi</h2>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featuredProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Products + Filters */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              {/* Mobile filter trigger */}
              <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
                <SheetTrigger render={<Button variant="outline" size="sm" className="lg:hidden" />}>
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filteri
                    {activeFilterCount > 0 && (
                      <Badge className="ml-1.5 h-5 w-5 p-0 flex items-center justify-center bg-orange-500 text-[10px]">{activeFilterCount}</Badge>
                    )}
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] overflow-y-auto">
                  <SheetTitle className="sr-only">Filteri</SheetTitle>
                  <div className="mt-6">
                    <FilterSidebar {...filterProps} />
                  </div>
                </SheetContent>
              </Sheet>

              <p className="text-sm text-gray-500">
                {filteredProducts.length} proizvod{filteredProducts.length === 1 ? '' : 'a'}
              </p>

              {activeFilterCount > 0 && (
                <button onClick={resetFilters} className="text-xs text-orange-500 hover:text-orange-600 flex items-center gap-1">
                  <X className="h-3 w-3" /> Poništi filtere
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-400'}`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-400'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
              <div className="relative">
                <select
                  value={sort}
                  onChange={e => setSort(e.target.value as SortOption)}
                  className="appearance-none bg-white border rounded-lg pl-3 pr-8 py-2 text-sm cursor-pointer"
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="flex gap-8">
            {/* Desktop sidebar */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-20 bg-white rounded-xl p-5 shadow-sm border">
                <FilterSidebar {...filterProps} />
              </div>
            </aside>

            {/* Product grid */}
            <div className="flex-1">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-4xl mb-3">🐾</p>
                  <p className="text-gray-500">Nema proizvoda koji odgovaraju filterima.</p>
                  <Button variant="outline" className="mt-4" onClick={resetFilters}>Poništi filtere</Button>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {filteredProducts.map(p => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredProducts.map(p => (
                    <ListProductCard key={p.id} product={p} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ListProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  return (
    <Card className="border-0 shadow-sm overflow-hidden">
      <div className="flex">
        <Link href={`/shop/${product.slug}`} className="w-32 h-32 flex-shrink-0 bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center text-4xl">
          {product.emoji}
        </Link>
        <CardContent className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{PRODUCT_CATEGORY_LABELS[product.category]}</Badge>
              <span className="text-xs text-gray-500">{product.brand}</span>
            </div>
            <Link href={`/shop/${product.slug}`}>
              <h3 className="font-semibold text-sm hover:text-orange-600 transition-colors">{product.name}</h3>
            </Link>
            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{product.description}</p>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="text-xs">{product.rating}</span>
              <span className="font-bold text-orange-600">{product.price} €</span>
              {product.originalPrice && (
                <span className="text-xs text-gray-400 line-through">{product.originalPrice} €</span>
              )}
            </div>
            <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-xs h-8" onClick={() => addToCart(product)}>
              <ShoppingCart className="h-3.5 w-3.5 mr-1" />
              Dodaj
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}

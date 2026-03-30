'use client';

import { useState, useMemo } from 'react';
import {
  MapPin,
  Search,
  Star,
  Heart,
  ExternalLink,
  PawPrint,
  Plus,
  Coffee,
  UtensilsCrossed,
  Waves,
  TreePine,
  Hotel,
  ShoppingBag,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  type DogFriendlyLocation,
  CATEGORY_LABELS,
  CITY_LIST,
} from '@/lib/db/dog-friendly';
import { toast } from 'sonner';

const CATEGORY_ICONS: Record<DogFriendlyLocation['category'], React.ReactNode> = {
  cafe: <Coffee className="h-3.5 w-3.5" />,
  restaurant: <UtensilsCrossed className="h-3.5 w-3.5" />,
  beach: <Waves className="h-3.5 w-3.5" />,
  park: <TreePine className="h-3.5 w-3.5" />,
  hotel: <Hotel className="h-3.5 w-3.5" />,
  shop: <ShoppingBag className="h-3.5 w-3.5" />,
};

const CATEGORY_COLORS: Record<DogFriendlyLocation['category'], string> = {
  cafe: 'bg-amber-100 text-amber-700 border-amber-200',
  restaurant: 'bg-rose-100 text-rose-700 border-rose-200',
  beach: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  park: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  hotel: 'bg-violet-100 text-violet-700 border-violet-200',
  shop: 'bg-pink-100 text-pink-700 border-pink-200',
};

const ALL_CATEGORIES: DogFriendlyLocation['category'][] = [
  'cafe',
  'restaurant',
  'beach',
  'park',
  'hotel',
  'shop',
];

export function DogFriendlyContent({ locations }: { locations: DogFriendlyLocation[] }) {
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('Sve');
  const [selectedCategory, setSelectedCategory] = useState<string>('Sve');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    category: '',
    address: '',
    whyDogFriendly: '',
  });

  const filteredLocations = useMemo(() => {
    return locations.filter((loc) => {
      if (selectedCity !== 'Sve' && loc.city !== selectedCity) return false;
      if (selectedCategory !== 'Sve' && loc.category !== selectedCategory) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          loc.name.toLowerCase().includes(q) ||
          loc.city.toLowerCase().includes(q) ||
          loc.address.toLowerCase().includes(q) ||
          loc.description.toLowerCase().includes(q) ||
          loc.tags.some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [locations, search, selectedCity, selectedCategory]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSubmitSuggestion = () => {
    if (!formData.name || !formData.city || !formData.category) {
      toast.error('Molimo ispunite obavezna polja.');
      return;
    }
    toast.success('Hvala! Provjerit ćemo i dodati lokaciju.');
    setFormData({ name: '', city: '', category: '', address: '', whyDogFriendly: '' });
    setDialogOpen(false);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.round(rating)
            ? 'fill-yellow-400 text-yellow-400'
            : 'fill-gray-200 text-gray-200'
        }`}
      />
    ));
  };

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Dog-Friendly Lokacije u Hrvatskoj',
    description: 'Kompletni vodič za dog-friendly lokacije u Hrvatskoj',
    numberOfItems: locations.length,
    itemListElement: locations.map((loc, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'LocalBusiness',
        name: loc.name,
        address: {
          '@type': 'PostalAddress',
          streetAddress: loc.address,
          addressLocality: loc.city,
          addressCountry: 'HR',
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: loc.rating,
          reviewCount: loc.reviewCount,
        },
        url: loc.googleMapsUrl,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-500 to-cyan-500 py-20 md:py-28">
        {/* Paw pattern overlay */}
        <div className="paw-pattern absolute inset-0 opacity-[0.05]" />

        {/* Floating blobs */}
        <div className="absolute top-10 left-10 h-64 w-64 rounded-full bg-teal-400/30 mix-blend-multiply blur-3xl animate-float" />
        <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-emerald-400/30 mix-blend-multiply blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-cyan-400/20 mix-blend-multiply blur-3xl animate-float" style={{ animationDelay: '2s' }} />

        <div className="container mx-auto px-4 text-center relative z-10">
          <Badge className="mb-6 bg-white/20 text-white border-white/30 backdrop-blur-sm px-4 py-2 text-sm">
            <PawPrint className="h-4 w-4 mr-2" />
            35+ lokacija u 7 gradova
          </Badge>

          <h1 className="text-4xl md:text-6xl font-bold font-[var(--font-heading)] tracking-tight text-white mb-4">
            Dog-Friendly{' '}
            <span className="text-gradient">Lokacije</span>
          </h1>

          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-10">
            Pronađite mjesta koja vole pse koliko i vi
          </p>

          {/* Search input */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Pretraži lokacije, gradove, tagove..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-14 rounded-2xl bg-white/95 backdrop-blur-sm border-0 text-gray-900 placeholder:text-gray-400 shadow-lg text-base"
            />
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          {/* City pills */}
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider self-center mr-2">Grad:</span>
            {['Sve', ...CITY_LIST].map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCity === city
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                    : 'bg-white hover:bg-gray-50 text-gray-600 border border-gray-200'
                }`}
              >
                {city}
              </button>
            ))}
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider self-center mr-2">Vrsta:</span>
            {['Sve', ...ALL_CATEGORIES].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 inline-flex items-center gap-1.5 ${
                  selectedCategory === cat
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                    : 'bg-white hover:bg-gray-50 text-gray-600 border border-gray-200'
                }`}
              >
                {cat !== 'Sve' && CATEGORY_ICONS[cat as DogFriendlyLocation['category']]}
                {cat === 'Sve' ? 'Sve' : CATEGORY_LABELS[cat as DogFriendlyLocation['category']]}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Results count + Suggest button */}
      <section className="container mx-auto px-4 pt-8 pb-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Pronađeno{' '}
            <span className="font-semibold text-foreground">{filteredLocations.length}</span>{' '}
            {filteredLocations.length === 1 ? 'lokacija' : 'lokacija'}
          </p>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger render={<Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-5 shadow-md shadow-orange-200/50" />}>
              <Plus className="h-4 w-4 mr-2" />
              Predloži lokaciju
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-[var(--font-heading)] text-xl">
                  Predloži novu dog-friendly lokaciju
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="suggest-name">Naziv lokacije *</Label>
                  <Input
                    id="suggest-name"
                    placeholder="npr. Cafe Mačak"
                    value={formData.name}
                    onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="suggest-city">Grad *</Label>
                  <Select
                    value={formData.city}
                    onValueChange={(v) => setFormData((p) => ({ ...p, city: v ?? '' }))}
                  >
                    <SelectTrigger className="mt-1.5" id="suggest-city">
                      <SelectValue placeholder="Odaberite grad" />
                    </SelectTrigger>
                    <SelectContent>
                      {CITY_LIST.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="suggest-category">Kategorija *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(v) => setFormData((p) => ({ ...p, category: v ?? '' }))}
                  >
                    <SelectTrigger className="mt-1.5" id="suggest-category">
                      <SelectValue placeholder="Odaberite kategoriju" />
                    </SelectTrigger>
                    <SelectContent>
                      {ALL_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {CATEGORY_LABELS[cat]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="suggest-address">Adresa</Label>
                  <Input
                    id="suggest-address"
                    placeholder="npr. Ilica 50, Zagreb"
                    value={formData.address}
                    onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="suggest-why">Zašto je dog-friendly?</Label>
                  <Textarea
                    id="suggest-why"
                    placeholder="Opišite zašto je ovo mjesto super za pse..."
                    value={formData.whyDogFriendly}
                    onChange={(e) => setFormData((p) => ({ ...p, whyDogFriendly: e.target.value }))}
                    className="mt-1.5"
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleSubmitSuggestion}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl"
                >
                  Pošalji prijedlog
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      {/* Location Cards */}
      <section className="container mx-auto px-4 pb-16">
        <h2 className="sr-only">Popularne dog-friendly lokacije</h2>

        {filteredLocations.length === 0 ? (
          <div className="text-center py-20">
            <PawPrint className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-lg text-muted-foreground font-medium">Nema rezultata za odabrane filtere.</p>
            <p className="text-sm text-muted-foreground mt-1">Pokušajte promijeniti grad ili kategoriju.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLocations.map((location, index) => (
              <Card
                key={location.id}
                className="rounded-2xl border-0 shadow-sm card-hover animate-fade-in-up overflow-hidden"
                style={{ animationDelay: `${Math.min(index * 80, 600)}ms` }}
              >
                {/* Top gradient bar */}
                <div className={`h-2 bg-gradient-to-r ${location.imageGradient}`} />

                <CardContent className="p-6 relative">
                  {/* Category badge */}
                  <div className="absolute top-4 right-4">
                    <Badge
                      variant="outline"
                      className={`${CATEGORY_COLORS[location.category]} border text-xs font-medium inline-flex items-center gap-1`}
                    >
                      {CATEGORY_ICONS[location.category]}
                      {CATEGORY_LABELS[location.category]}
                    </Badge>
                  </div>

                  {/* Name */}
                  <h3 className="font-bold text-lg font-[var(--font-heading)] leading-tight pr-28 mb-2">
                    {location.name}
                  </h3>

                  {/* City */}
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-1">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-teal-500" />
                    <span className="font-medium text-foreground">{location.city}</span>
                  </div>

                  {/* Address */}
                  <p className="text-sm text-muted-foreground ml-5 mb-3">{location.address}</p>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-0.5">{renderStars(location.rating)}</div>
                    <span className="text-sm font-semibold text-foreground">{location.rating}</span>
                    <span className="text-xs text-muted-foreground">
                      ({location.reviewCount} recenzija)
                    </span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {location.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-gray-100 text-gray-600 rounded-full text-xs px-2.5 py-0.5 font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {location.description}
                  </p>

                  {/* Bottom actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <a
                      href={location.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
                    >
                      <MapPin className="h-4 w-4" />
                      Otvori na karti
                      <ExternalLink className="h-3 w-3" />
                    </a>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleFavorite(location.id)}
                      className="h-9 w-9 rounded-full hover:bg-red-50"
                    >
                      <Heart
                        className={`h-5 w-5 transition-all ${
                          favorites.has(location.id)
                            ? 'fill-red-500 text-red-500 scale-110'
                            : 'text-gray-400 hover:text-red-400'
                        }`}
                      />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* City SEO sections */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold font-[var(--font-heading)] text-center mb-12">
            Dog-friendly vodič po{' '}
            <span className="text-gradient">gradovima</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CITY_LIST.map((city) => {
              const cityLocations = locations.filter((l) => l.city === city);
              const categories = [...new Set(cityLocations.map((l) => l.category))];
              return (
                <Card key={city} className="rounded-2xl border-0 shadow-sm card-hover">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold font-[var(--font-heading)] mb-2">
                      {city}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {cityLocations.length} dog-friendly lokacija
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {categories.map((cat) => (
                        <Badge
                          key={cat}
                          variant="outline"
                          className={`${CATEGORY_COLORS[cat]} border text-xs`}
                        >
                          {CATEGORY_LABELS[cat]}
                        </Badge>
                      ))}
                    </div>
                    <Button
                      variant="ghost"
                      className="mt-4 text-teal-600 hover:text-teal-700 hover:bg-teal-50 p-0 h-auto font-medium text-sm"
                      onClick={() => {
                        setSelectedCity(city);
                        setSelectedCategory('Sve');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      Pogledaj lokacije →
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

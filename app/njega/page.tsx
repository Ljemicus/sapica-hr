'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Star, MapPin, Shield, Scissors, Droplets, Sparkles, ChevronRight, X, Filter, SlidersHorizontal, Search, GraduationCap, ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import {
  GROOMING_SERVICE_LABELS, GROOMER_SPECIALIZATION_LABELS,
  CITIES,
  type GroomingServiceType, type Groomer,
} from '@/lib/types';

const gradients = [
  'from-pink-400 to-rose-300',
  'from-purple-400 to-fuchsia-300',
  'from-teal-400 to-cyan-300',
  'from-orange-400 to-amber-300',
  'from-blue-400 to-indigo-300',
  'from-emerald-400 to-teal-300',
];

export default function GroomingPage() {
  const [city, setCity] = useState('');
  const [service, setService] = useState('');
  const [groomers, setGroomers] = useState<Groomer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGroomers() {
      try {
        const params = new URLSearchParams();
        if (city) params.set('city', city);
        if (service) params.set('service', service);
        const res = await fetch(`/api/groomers?${params.toString()}`);
        if (res.ok) {
          setGroomers(await res.json());
        }
      } catch {
        setGroomers([]);
      } finally {
        setLoading(false);
      }
    }
    fetchGroomers();
  }, [city, service]);

  const activeFilterCount = [city, service].filter(Boolean).length;

  const clearFilters = () => { setCity(''); setService(''); };

  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-sm font-semibold mb-2 block">Grad</Label>
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm transition-colors focus:border-orange-300 focus:ring-1 focus:ring-orange-200 dark:focus:border-orange-700"
        >
          <option value="">Svi gradovi</option>
          {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <Label className="text-sm font-semibold mb-2 block">Vrsta usluge</Label>
        <div className="space-y-2">
          {(Object.entries(GROOMING_SERVICE_LABELS) as [GroomingServiceType, string][]).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2.5 cursor-pointer group">
              <input type="radio" name="gservice" value={key} checked={service === key}
                onChange={(e) => setService(e.target.value)} className="accent-orange-500 w-4 h-4" />
              <span className="text-sm group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">{label}</span>
            </label>
          ))}
          {service && (
            <button onClick={() => setService('')} className="text-xs text-orange-500 hover:underline mt-1">
              Poništi odabir
            </button>
          )}
        </div>
      </div>
      <Separator />
      <div className="flex gap-2">
        {activeFilterCount > 0 && (
          <Button variant="outline" onClick={clearFilters} className="flex-1 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 hover:border-red-200 rounded-xl">
            <X className="h-4 w-4 mr-1" /> Poništi
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-pink-950/20 dark:via-background dark:to-purple-950/20">
        <div className="absolute inset-0 paw-pattern opacity-[0.03]" />
        <div className="container mx-auto px-4 py-14 md:py-20 relative">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-5 bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300 hover:bg-pink-100 dark:hover:bg-pink-900/40 border-0 text-sm px-5 py-2 animate-fade-in-up rounded-full font-semibold">
              <Scissors className="h-3.5 w-3.5 mr-1.5" />
              Njega ljubimaca
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-5 animate-fade-in-up delay-100 font-[var(--font-heading)]">
              Pronađite savršeni{' '}
              <span className="text-gradient">salon za njegu</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground mb-6 animate-fade-in-up delay-200 leading-relaxed max-w-xl mx-auto">
              Od šišanja do kupanja — pronađite verificirane groomere u vašem gradu.
              Vaš ljubimac zaslužuje premium njegu.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-10 md:py-14">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <Badge variant="secondary" className="mb-3 text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/30 border-0 rounded-full font-semibold">Cijene</Badge>
            <h2 className="text-2xl md:text-3xl font-extrabold font-[var(--font-heading)]">Orijentacijski cjenik</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 max-w-4xl mx-auto">
            {[
              { name: 'Osnovno kupanje', price: 'od 20€', desc: 'Kupanje, sušenje i četkanje', icon: Droplets, color: 'from-blue-500 to-cyan-500' },
              { name: 'Šišanje + kupanje', price: 'od 35€', desc: 'Kompletna njega s modeliranjem', icon: Scissors, color: 'from-pink-500 to-rose-500', popular: true },
              { name: 'Rezanje noktiju', price: 'od 10€', desc: 'Sigurno skraćivanje noktiju', icon: Sparkles, color: 'from-purple-500 to-violet-500' },
            ].map((item) => (
              <Card key={item.name} className={`overflow-hidden border-0 shadow-sm rounded-2xl card-hover relative ${item.popular ? 'ring-2 ring-orange-400 dark:ring-orange-600' : ''}`}>
                {item.popular && (
                  <div className="absolute top-0 right-0">
                    <Badge className="bg-orange-500 text-white rounded-none rounded-bl-xl rounded-tr-2xl text-xs font-bold px-3 py-1">Popularno</Badge>
                  </div>
                )}
                <CardContent className="p-6 text-center">
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} text-white mb-4 shadow-lg`}>
                    <item.icon className="h-7 w-7" />
                  </div>
                  <h3 className="font-bold text-lg mb-1 font-[var(--font-heading)]">{item.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{item.desc}</p>
                  <p className="text-2xl font-extrabold text-orange-500 font-[var(--font-heading)]">{item.price}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground italic mt-4">
            Konačne cijene određuju pružatelji usluga na svojim profilima
          </p>
        </div>
      </section>

      {/* Listings */}
      <div className="container mx-auto px-4 py-8">
        <div className="sticky top-14 z-30 -mx-4 px-4 py-4 glass-strong border-b border-border/50 mb-6 -mt-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold font-[var(--font-heading)]">Grooming saloni</h2>
              <p className="text-muted-foreground text-sm">
                {groomers.length} {groomers.length === 1 ? 'salon pronađen' : 'salona pronađeno'}
                {city && ` u gradu ${city}`}
              </p>
            </div>
            <Sheet>
              <SheetTrigger render={<Button variant="outline" size="sm" />} className="md:hidden relative rounded-xl">
                <SlidersHorizontal className="h-4 w-4 mr-1" />
                Filteri
                {activeFilterCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-orange-500 text-xs rounded-full">
                    {activeFilterCount}
                  </Badge>
                )}
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] overflow-y-auto">
                <SheetTitle className="mb-4">Filteri</SheetTitle>
                <FilterPanel />
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-6 animate-fade-in">
            {city && (
              <Badge variant="secondary" className="gap-1 bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-950/50 rounded-full">
                <MapPin className="h-3 w-3" />{city}
                <X className="h-3 w-3 cursor-pointer ml-1" onClick={() => setCity('')} />
              </Badge>
            )}
            {service && (
              <Badge variant="secondary" className="gap-1 bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-950/50 rounded-full">
                {GROOMING_SERVICE_LABELS[service as GroomingServiceType]}
                <X className="h-3 w-3 cursor-pointer ml-1" onClick={() => setService('')} />
              </Badge>
            )}
            <button onClick={clearFilters} className="text-xs text-orange-500 hover:underline self-center ml-1">
              Ukloni sve
            </button>
          </div>
        )}

        <div className="flex gap-8">
          <aside className="hidden md:block w-64 flex-shrink-0">
            <Card className="p-5 sticky top-32 border-0 shadow-sm rounded-2xl">
              <h3 className="font-semibold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider text-muted-foreground">
                <Filter className="h-4 w-4" />
                Filteri
              </h3>
              <FilterPanel />
            </Card>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-fade-in">
              {groomers.map((groomer, i) => (
                <GroomerCard key={groomer.id} groomer={groomer} index={i} />
              ))}
            </div>
            <p className="col-span-full text-center text-sm text-muted-foreground italic py-2">
              Cijene određuju pružatelji usluga na svojim profilima
            </p>
            {groomers.length === 0 && !loading && (
              <div className="text-center py-20">
                <Scissors className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nema pronađenih salona</h3>
                <p className="text-muted-foreground mb-4">Pokušajte promijeniti filtere.</p>
                <Button variant="outline" onClick={clearFilters} className="hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:text-orange-600 rounded-xl">
                  Poništi filtere
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cross-links to related services */}
      <section className="py-10 md:py-14 bg-warm-section">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-8 font-[var(--font-heading)]">Istražite druge usluge</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <Link href="/pretraga" className="group">
              <div className="flex items-center gap-4 p-5 rounded-2xl border border-border/50 bg-background hover:border-orange-300 hover:shadow-md transition-all">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-500">
                  <Search className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm group-hover:text-orange-500 transition-colors">Čuvanje ljubimaca</h3>
                  <p className="text-xs text-muted-foreground">Pouzdani sitteri u vašem gradu</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-orange-500 transition-colors" />
              </div>
            </Link>
            <Link href="/dresura" className="group">
              <div className="flex items-center gap-4 p-5 rounded-2xl border border-border/50 bg-background hover:border-indigo-300 hover:shadow-md transition-all">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-500">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm group-hover:text-indigo-500 transition-colors">Školovanje pasa</h3>
                  <p className="text-xs text-muted-foreground">Profesionalni treneri i programi</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-indigo-500 transition-colors" />
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function GroomerCard({ groomer, index }: { groomer: Groomer; index: number }) {
  const gradient = gradients[groomer.name.charCodeAt(0) % gradients.length];
  return (
    <Link href={`/groomer/${groomer.id}`}>
    <Card className={`group card-hover overflow-hidden cursor-pointer border-0 shadow-sm rounded-2xl animate-fade-in-up delay-${((index % 3) + 1) * 100}`}>
      <CardContent className="p-0">
        <div className={`relative h-36 md:h-40 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
          <div className="absolute inset-0 paw-pattern opacity-10" />
          <Avatar className="h-18 w-18 md:h-20 md:w-20 border-4 border-white shadow-lg group-hover:scale-110 transition-transform duration-300">
            <AvatarFallback className="bg-white/90 dark:bg-gray-800/90 text-foreground text-xl font-bold">
              {groomer.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="absolute top-3 right-3 flex gap-1.5">
            {groomer.verified && (
              <Badge className="bg-white/90 dark:bg-gray-900/80 text-teal-600 dark:text-teal-400 text-xs shadow-sm hover:bg-white/90 rounded-full px-2.5">
                <Shield className="h-3 w-3 mr-1" />Verificiran
              </Badge>
            )}
          </div>
          <div className="absolute top-3 left-3">
            <Badge className="bg-white/90 dark:bg-gray-900/80 text-purple-600 dark:text-purple-400 text-xs shadow-sm hover:bg-white/90 rounded-full px-2.5">
              {GROOMER_SPECIALIZATION_LABELS[groomer.specialization]}
            </Badge>
          </div>
        </div>
        <div className="p-4 md:p-5 space-y-2.5">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-base md:text-lg group-hover:text-orange-500 transition-colors font-[var(--font-heading)]">{groomer.name}</h3>
              <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-full">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span className="text-sm font-bold text-amber-700 dark:text-amber-400">{groomer.rating.toFixed(1)}</span>
                <span className="text-xs text-amber-600/70 dark:text-amber-400/60">({groomer.review_count})</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-teal-500" />{groomer.city}
            </div>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{groomer.bio}</p>
          <div className="flex flex-wrap gap-1">
            {groomer.services.map((s) => (
              <Badge key={s} variant="secondary" className="text-xs font-normal bg-accent rounded-full">
                {GROOMING_SERVICE_LABELS[s]}
              </Badge>
            ))}
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-border/50">
            <span className="text-sm text-muted-foreground">Cijene na profilu</span>
            <span className="text-xs text-muted-foreground flex items-center gap-1 group-hover:text-orange-500 transition-colors">
              Pogledaj profil <ChevronRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
    </Link>
  );
}

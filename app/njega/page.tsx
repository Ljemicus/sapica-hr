'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Star, MapPin, Shield, Scissors, Droplets, SprayCan, Sparkles, ChevronRight, X, Filter, SlidersHorizontal,
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
import { getGroomers } from '@/lib/mock-data';

const serviceIcons: Record<GroomingServiceType, React.ElementType> = {
  sisanje: Scissors,
  kupanje: Droplets,
  trimanje: SprayCan,
  nokti: Sparkles,
  spa: Sparkles,
};

const gradients = [
  'from-pink-400 to-rose-300',
  'from-purple-400 to-fuchsia-300',
  'from-teal-400 to-cyan-300',
  'from-orange-400 to-amber-300',
  'from-blue-400 to-indigo-300',
  'from-green-400 to-emerald-300',
];

export default function GroomingPage() {
  const [city, setCity] = useState('');
  const [service, setService] = useState('');

  const groomers = getGroomers({ city: city || undefined, service: service || undefined });

  const activeFilterCount = [city, service].filter(Boolean).length;

  const clearFilters = () => { setCity(''); setService(''); };

  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-sm font-medium mb-2 block">Grad</Label>
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm transition-colors focus:border-orange-300 focus:ring-1 focus:ring-orange-200"
        >
          <option value="">Svi gradovi</option>
          {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <Label className="text-sm font-medium mb-2 block">Vrsta usluge</Label>
        <div className="space-y-2">
          {(Object.entries(GROOMING_SERVICE_LABELS) as [GroomingServiceType, string][]).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2.5 cursor-pointer group">
              <input type="radio" name="gservice" value={key} checked={service === key}
                onChange={(e) => setService(e.target.value)} className="accent-orange-500 w-4 h-4" />
              <span className="text-sm group-hover:text-orange-600 transition-colors">{label}</span>
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
          <Button variant="outline" onClick={clearFilters} className="flex-1 hover:bg-red-50 hover:text-red-600 hover:border-red-200">
            <X className="h-4 w-4 mr-1" /> Poništi
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="absolute inset-0 paw-pattern opacity-[0.03]" />
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-6 bg-pink-100 text-pink-700 hover:bg-pink-100 border-0 text-sm px-5 py-2 animate-fade-in-up">
              <Scissors className="h-3.5 w-3.5 mr-1.5" />
              Njega ljubimaca
            </Badge>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 animate-fade-in-up delay-100">
              Pronađite savršeni{' '}
              <span className="text-gradient">salon za njegu</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 animate-fade-in-up delay-200 leading-relaxed">
              Od šišanja do spa tretmana — pronađite verificirane groomere u vašem gradu.
              Vaš ljubimac zaslužuje premium njegu.
            </p>
          </div>
        </div>
      </section>

      {/* Listings */}
      <div className="container mx-auto px-4 py-8">
        <div className="sticky top-14 z-30 -mx-4 px-4 py-4 bg-white/95 backdrop-blur-sm border-b border-gray-100 mb-6 -mt-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Grooming saloni</h2>
              <p className="text-muted-foreground text-sm">
                {groomers.length} {groomers.length === 1 ? 'salon pronađen' : 'salona pronađeno'}
                {city && ` u gradu ${city}`}
              </p>
            </div>
            <Sheet>
              <SheetTrigger render={<Button variant="outline" size="sm" />} className="md:hidden relative">
                <SlidersHorizontal className="h-4 w-4 mr-1" />
                Filteri
                {activeFilterCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-orange-500 text-xs">
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
              <Badge variant="secondary" className="gap-1 bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100">
                <MapPin className="h-3 w-3" />{city}
                <X className="h-3 w-3 cursor-pointer ml-1" onClick={() => setCity('')} />
              </Badge>
            )}
            {service && (
              <Badge variant="secondary" className="gap-1 bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {groomers.map((groomer, i) => (
                <GroomerCard key={groomer.id} groomer={groomer} index={i} />
              ))}
            </div>
            {groomers.length === 0 && (
              <div className="text-center py-20">
                <Scissors className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nema pronađenih salona</h3>
                <p className="text-muted-foreground mb-4">Pokušajte promijeniti filtere.</p>
                <Button variant="outline" onClick={clearFilters} className="hover:bg-orange-50 hover:text-orange-600">
                  Poništi filtere
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function GroomerCard({ groomer, index }: { groomer: Groomer; index: number }) {
  const gradient = gradients[groomer.name.charCodeAt(0) % gradients.length];
  const lowestPrice = Math.min(...Object.values(groomer.prices).filter(p => p > 0));

  return (
    <Card className={`group card-hover overflow-hidden cursor-pointer border-0 shadow-sm rounded-2xl animate-fade-in-up delay-${((index % 3) + 1) * 100}`}>
      <CardContent className="p-0">
        <div className={`relative h-40 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
          <div className="absolute inset-0 paw-pattern opacity-10" />
          <Avatar className="h-20 w-20 border-4 border-white shadow-lg group-hover:scale-110 transition-transform duration-300">
            <AvatarFallback className="bg-white/90 text-gray-700 text-xl font-bold">
              {groomer.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="absolute top-3 right-3 flex gap-1.5">
            {groomer.verified && (
              <Badge className="bg-white/90 text-blue-600 text-xs shadow-sm hover:bg-white/90 rounded-full px-2.5">
                <Shield className="h-3 w-3 mr-1" />Verificiran
              </Badge>
            )}
          </div>
          <div className="absolute top-3 left-3">
            <Badge className="bg-white/90 text-purple-600 text-xs shadow-sm hover:bg-white/90 rounded-full px-2.5">
              {GROOMER_SPECIALIZATION_LABELS[groomer.specialization]}
            </Badge>
          </div>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-lg group-hover:text-orange-500 transition-colors">{groomer.name}</h3>
              <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span className="text-sm font-semibold text-amber-700">{groomer.rating.toFixed(1)}</span>
                <span className="text-xs text-amber-600/70">({groomer.reviews})</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />{groomer.city}
            </div>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{groomer.bio}</p>
          <div className="flex flex-wrap gap-1">
            {groomer.services.map((s) => (
              <Badge key={s} variant="secondary" className="text-xs font-normal bg-gray-50">
                {GROOMING_SERVICE_LABELS[s]}
              </Badge>
            ))}
          </div>
          <div className="flex items-center justify-between pt-3 border-t">
            <span className="text-xl font-extrabold text-orange-500">od {lowestPrice}&euro;</span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              Pogledaj profil <ChevronRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

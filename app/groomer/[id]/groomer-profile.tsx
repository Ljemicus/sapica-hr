'use client';

import { useRouter } from 'next/navigation';
import {
  Star, MapPin, Shield, ChevronLeft, Scissors, Droplets, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { StarRating } from '@/components/shared/star-rating';
import { GROOMING_SERVICE_LABELS, GROOMER_SPECIALIZATION_LABELS, type Groomer, type GroomingServiceType } from '@/lib/types';

const serviceIcons: Record<GroomingServiceType, React.ElementType> = {
  'sisanje': Scissors,
  'kupanje': Droplets,
  'trimanje': Scissors,
  'nokti': Scissors,
  'spa': Sparkles,
};

const serviceColors: Record<GroomingServiceType, string> = {
  'sisanje': 'from-pink-500 to-rose-500',
  'kupanje': 'from-blue-500 to-cyan-500',
  'trimanje': 'from-purple-500 to-pink-500',
  'nokti': 'from-orange-500 to-amber-500',
  'spa': 'from-teal-500 to-emerald-500',
};

const gradients = [
  'from-pink-400 to-rose-300',
  'from-purple-400 to-pink-300',
  'from-orange-400 to-amber-300',
  'from-teal-400 to-cyan-300',
];

export function GroomerProfile({ groomer }: { groomer: Groomer }) {
  const router = useRouter();
  const gradient = gradients[groomer.name.charCodeAt(0) % gradients.length];
  const lowestPrice = Math.min(...Object.values(groomer.prices).filter(p => p > 0));

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4 -ml-2 hover:bg-orange-50 hover:text-orange-600">
        <ChevronLeft className="h-4 w-4 mr-1" />
        Natrag
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <Card className="overflow-hidden border-0 shadow-sm">
            <div className={`h-32 bg-gradient-to-br ${gradient} relative`}>
              <div className="absolute inset-0 paw-pattern opacity-10" />
            </div>
            <CardContent className="p-6 -mt-16 relative">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="avatar-gradient-border w-fit h-fit flex-shrink-0">
                  <Avatar className="h-28 w-28 border-4 border-white shadow-lg">
                    <AvatarFallback className="bg-white text-gray-700 text-3xl font-bold">
                      {groomer.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 pt-2 sm:pt-8">
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div>
                      <h1 className="text-2xl font-bold">{groomer.name}</h1>
                      <div className="flex items-center gap-2 text-muted-foreground mt-1">
                        <MapPin className="h-4 w-4" />
                        <span>{groomer.city}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {groomer.verified && (
                        <Badge className="bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-50 animate-fade-in">
                          <Shield className="h-3 w-3 mr-1" />
                          Verificiran
                        </Badge>
                      )}
                      <Badge className="bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-50 animate-fade-in delay-100">
                        {GROOMER_SPECIALIZATION_LABELS[groomer.specialization]}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3 flex-wrap">
                    <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1 rounded-full">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="font-semibold">{groomer.rating.toFixed(1)}</span>
                      <span className="text-sm text-amber-700/70">({groomer.reviews} recenzija)</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bio */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">O nama</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{groomer.bio}</p>
            </CardContent>
          </Card>

          {/* Services & Prices */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Usluge i cijene</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {groomer.services.map((service) => {
                  const Icon = serviceIcons[service];
                  const color = serviceColors[service];
                  return (
                    <div key={service} className="flex items-center justify-between p-4 rounded-xl border bg-white hover:shadow-md transition-shadow group">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-medium">{GROOMING_SERVICE_LABELS[service]}</span>
                      </div>
                      <span className="font-bold text-lg text-orange-500">
                        {groomer.prices[service]}&euro;
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Reviews placeholder */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                Recenzije
                <Badge variant="secondary" className="bg-orange-50 text-orange-600">{groomer.reviews}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Marina K.', rating: 5, text: 'Izvrsna usluga! Moj pas izgleda predivno nakon šišanja. Preporučujem svima!' },
                  { name: 'Tomislav B.', rating: 5, text: 'Profesionalno i nježno. Mačka se uopće nije bojala. Definitivno se vraćamo.' },
                  { name: 'Ana P.', rating: 4, text: 'Dobra usluga za pristupačnu cijenu. Jedino malo duže čekanje na termin.' },
                ].map((review, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-300 text-white text-xs">
                          {review.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{review.name}</span>
                          <StarRating rating={review.rating} size="sm" />
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground pl-12 leading-relaxed">{review.text}</p>
                    {i < 2 && <div className="border-b border-gray-100 mt-4" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="sticky top-20 border-0 shadow-sm">
            <CardContent className="p-6 space-y-5">
              <div className="text-center py-2">
                <span className="text-4xl font-extrabold text-gradient">od {lowestPrice}&euro;</span>
                <span className="text-muted-foreground block text-sm mt-1">po usluzi</span>
              </div>
              <Button className="w-full bg-orange-500 hover:bg-orange-600 btn-hover shadow-md shadow-orange-200/50" size="lg">
                <Scissors className="h-4 w-4 mr-2" />
                Zakaži termin
              </Button>
              <Button variant="outline" className="w-full hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200" size="lg">
                Kontaktiraj
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

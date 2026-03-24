'use client';

import { useRouter } from 'next/navigation';
import {
  Star, MapPin, Award, ChevronLeft, GraduationCap, Clock, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { StarRating } from '@/components/shared/star-rating';
import { TRAINING_TYPE_LABELS, type Trainer, type TrainingProgram } from '@/lib/types';

const gradients = [
  'from-blue-400 to-cyan-300',
  'from-green-400 to-emerald-300',
  'from-purple-400 to-pink-300',
  'from-orange-400 to-amber-300',
];

export function TrainerProfile({ trainer, programs }: { trainer: Trainer; programs: TrainingProgram[] }) {
  const router = useRouter();
  const gradient = gradients[trainer.name.charCodeAt(0) % gradients.length];

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
                      {trainer.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 pt-2 sm:pt-8">
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div>
                      <h1 className="text-2xl font-bold">{trainer.name}</h1>
                      <div className="flex items-center gap-2 text-muted-foreground mt-1">
                        <MapPin className="h-4 w-4" />
                        <span>{trainer.city}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {trainer.certified && (
                        <Badge className="bg-green-50 text-green-600 border border-green-200 hover:bg-green-50 animate-fade-in">
                          <Award className="h-3 w-3 mr-1" />
                          Certificirani trener
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3 flex-wrap">
                    <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1 rounded-full">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="font-semibold">{trainer.rating.toFixed(1)}</span>
                      <span className="text-sm text-amber-700/70">({trainer.reviews} recenzija)</span>
                    </div>
                    {trainer.certificates.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {trainer.certificates.map((cert) => (
                          <Badge key={cert} variant="secondary" className="text-xs bg-blue-50 text-blue-600 border-0">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bio */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">O meni</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{trainer.bio}</p>
            </CardContent>
          </Card>

          {/* Specializations */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Specijalizacije</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {trainer.specializations.map((spec) => (
                  <Badge key={spec} className="bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 text-sm px-3 py-1">
                    {TRAINING_TYPE_LABELS[spec]}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Training Programs */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                Programi
                <Badge variant="secondary" className="bg-orange-50 text-orange-600">{programs.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {programs.map((program) => (
                  <div key={program.id} className="p-4 rounded-xl border bg-white hover:shadow-md transition-shadow group">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold group-hover:text-orange-500 transition-colors">{program.name}</h3>
                        <Badge variant="secondary" className="text-xs mt-1 bg-gray-50">
                          {TRAINING_TYPE_LABELS[program.type]}
                        </Badge>
                      </div>
                      <span className="text-xl font-extrabold text-orange-500">{program.price}&euro;</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">{program.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {program.duration_weeks} tjedana
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {program.sessions} sesija
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reviews placeholder */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                Recenzije
                <Badge variant="secondary" className="bg-orange-50 text-orange-600">{trainer.reviews}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Ivan M.', rating: 5, text: 'Marko je nevjerojatan trener! Naš pas je za 8 tjedana naučio sve osnove. Preporučujem svima!' },
                  { name: 'Petra S.', rating: 5, text: 'Konačno trener koji razumije da svaki pas uči drugačije. Strpljiv i profesionalan pristup.' },
                  { name: 'Ana K.', rating: 4, text: 'Odličan program za štence. Naša mala Bella sada sluša na svaki poziv.' },
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
                <span className="text-4xl font-extrabold text-gradient">{trainer.price_per_hour}&euro;</span>
                <span className="text-muted-foreground block text-sm mt-1">po satu</span>
              </div>
              <Button className="w-full bg-orange-500 hover:bg-orange-600 btn-hover shadow-md shadow-orange-200/50" size="lg">
                <GraduationCap className="h-4 w-4 mr-2" />
                Zakaži trening
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

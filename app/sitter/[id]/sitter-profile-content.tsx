'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { hr } from 'date-fns/locale';
import {
  Star, MapPin, Clock, Shield, Award, Calendar, MessageCircle,
  Heart, ChevronLeft, CheckCircle2, Home, Dog, House, Eye, Sun
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { StarRating } from '@/components/shared/star-rating';
import { SERVICE_LABELS, type SitterProfile, type User, type PublicSitterReview, type Availability, type ServiceType, type Pet } from '@/lib/types';
import { useUser } from '@/hooks/use-user';
import { AvailabilityCalendar } from '@/components/shared/availability-calendar';
import { BookingDialog } from './booking-dialog';

const serviceIcons: Record<ServiceType, React.ElementType> = {
  'boarding': Home,
  'walking': Dog,
  'house-sitting': House,
  'drop-in': Eye,
  'daycare': Sun,
};

const serviceColors: Record<ServiceType, string> = {
  'boarding': 'from-orange-500 to-amber-500',
  'walking': 'from-green-500 to-emerald-500',
  'house-sitting': 'from-blue-500 to-cyan-500',
  'drop-in': 'from-purple-500 to-pink-500',
  'daycare': 'from-rose-500 to-orange-500',
};

interface SitterProfileContentProps {
  profile: SitterProfile & { user: User };
  reviews: PublicSitterReview[];
  availability: Availability[];
  bookingPets: Pet[];
  bookingUserId: string | null;
}

export function SitterProfileContent({ profile, reviews, availability, bookingPets, bookingUserId }: SitterProfileContentProps) {
  const { user } = useUser();
  const [showBooking, setShowBooking] = useState(false);
  const router = useRouter();

  const availableDates = new Set(availability.map((a) => a.date));

  const gradient = profile.user?.name
    ? ['from-orange-400 to-amber-300', 'from-teal-400 to-cyan-300', 'from-purple-400 to-pink-300', 'from-emerald-400 to-teal-300'][profile.user.name.charCodeAt(0) % 4]
    : 'from-orange-400 to-amber-300';

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4 -ml-2 hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:text-orange-600">
        <ChevronLeft className="h-4 w-4 mr-1" />
        Natrag
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Header */}
          <Card className="overflow-hidden border-0 shadow-sm">
            <div className={`h-32 bg-gradient-to-br ${gradient} relative`}>
              <div className="absolute inset-0 paw-pattern opacity-10" />
            </div>
            <CardContent className="p-6 -mt-16 relative">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="avatar-gradient-border w-fit h-fit flex-shrink-0">
                  <Avatar className="h-28 w-28 border-4 border-white shadow-lg">
                    <AvatarImage src={profile.user?.avatar_url || ''} alt={profile.user?.name} />
                    <AvatarFallback className="bg-white text-gray-700 text-3xl font-bold">
                      {profile.user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 pt-2 sm:pt-8">
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div>
                      <h1 className="text-2xl font-bold">{profile.user?.name}</h1>
                      <div className="flex items-center gap-2 text-muted-foreground mt-1">
                        <MapPin className="h-4 w-4" />
                        <span>{profile.city}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {profile.verified && (
                        <Badge className="bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800 hover:bg-teal-50 dark:hover:bg-teal-950/30 animate-fade-in">
                          <Shield className="h-3 w-3 mr-1" />
                          Verificiran
                        </Badge>
                      )}
                      {profile.superhost && (
                        <Badge className="bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950/30 animate-fade-in delay-100">
                          <Award className="h-3 w-3 mr-1" />
                          Superhost
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3 flex-wrap">
                    <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1 rounded-full">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="font-semibold">{profile.rating_avg.toFixed(1)}</span>
                      <span className="text-sm text-amber-700/70">({profile.review_count} recenzija)</span>
                    </div>
                    {profile.response_time && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        Odgovara {profile.response_time}
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      {profile.experience_years} god. iskustva
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Photo Gallery Placeholder */}
          <Card className="border-0 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-4 gap-1 h-48">
                {[gradient, 'from-gray-200 to-gray-300', 'from-gray-100 to-gray-200', 'from-gray-200 to-gray-100'].map((g, i) => (
                  <div key={i} className={`bg-gradient-to-br ${g} flex items-center justify-center ${i === 0 ? 'col-span-2 row-span-1' : ''}`}>
                    <span className="text-white/60 text-xs font-medium">
                      {i === 0 ? `${profile.user?.name?.charAt(0)}` : ''}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Bio */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">O meni</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{profile.bio}</p>
            </CardContent>
          </Card>

          {/* Services & Prices */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Usluge i cijene</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {profile.services.map((service) => {
                  const Icon = serviceIcons[service] || Heart;
                  const color = serviceColors[service] || 'from-orange-500 to-amber-500';
                  return (
                    <div
                      key={service}
                      className="flex items-center justify-between p-4 rounded-xl border bg-white hover:shadow-md transition-shadow group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-medium">{SERVICE_LABELS[service]}</span>
                      </div>
                      <span className="font-bold text-lg text-orange-500">
                        {profile.prices[service]}&euro;
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Availability Calendar */}
          <AvailabilityCalendar availableDates={availableDates} />

          {/* Reviews */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                Recenzije
                <Badge variant="secondary" className="bg-orange-50 text-orange-600">{reviews.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reviews.length === 0 ? (
                <p className="text-muted-foreground text-center py-6">Još nema recenzija</p>
              ) : (
                <div className="space-y-5">
                  {reviews.map((review) => (
                    <div key={review.id} className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={review.reviewer?.avatar_url || ''} />
                          <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-300 text-white text-xs">
                            {review.reviewer?.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{review.reviewer?.name}</span>
                            <StarRating rating={review.rating} size="sm" />
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{SERVICE_LABELS[review.booking?.service_type as ServiceType]}</span>
                            <span>&middot;</span>
                            <span>{format(new Date(review.created_at), 'd. MMMM yyyy.', { locale: hr })}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground pl-12 leading-relaxed">{review.comment}</p>
                      <Separator className="mt-4" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="sticky top-20 border-0 shadow-sm">
            <CardContent className="p-6 space-y-5">
              <div className="text-center py-2">
                <span className="text-4xl font-extrabold text-gradient">
                  od {Math.min(...Object.values(profile.prices).filter((p): p is number => typeof p === 'number' && p > 0))}&euro;
                </span>
                <span className="text-muted-foreground block text-sm mt-1">po usluzi</span>
              </div>

              {user && user.role === 'owner' ? (
                <>
                  <Button
                    className="w-full bg-orange-500 hover:bg-orange-600 btn-hover shadow-md shadow-orange-200/50"
                    size="lg"
                    onClick={() => setShowBooking(true)}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Rezerviraj
                  </Button>
                  <Link href={`/poruke?to=${profile.user_id}`}>
                    <Button variant="outline" className="w-full hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:text-orange-600 hover:border-orange-200" size="lg">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Kontaktiraj
                    </Button>
                  </Link>
                </>
              ) : !user ? (
                <Link href={`/prijava?redirect=/sitter/${profile.user_id}`}>
                  <Button className="w-full bg-orange-500 hover:bg-orange-600 btn-hover" size="lg">
                    Prijavi se za rezervaciju
                  </Button>
                </Link>
              ) : null}

              <Separator />

              {/* Availability Calendar Preview */}
              <div>
                <h3 className="font-medium text-sm mb-3 flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-orange-500" />
                  Dostupnost (sljedećih 14 dana)
                </h3>
                <div className="grid grid-cols-7 gap-1.5">
                  {Array.from({ length: 14 }, (_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() + i);
                    const dateStr = date.toISOString().split('T')[0];
                    const isAvailable = availableDates.has(dateStr);
                    return (
                      <div
                        key={i}
                        className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-all ${
                          isAvailable
                            ? 'bg-green-100 text-green-700 shadow-sm'
                            : 'bg-red-50 text-red-300'
                        }`}
                        title={`${format(date, 'd.M.')} — ${isAvailable ? 'Dostupan' : 'Nedostupan'}`}
                      >
                        {date.getDate()}
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-green-100 border border-green-200" />
                    <span>Dostupan</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-red-50 border border-red-100" />
                    <span>Nedostupan</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {showBooking && user && (
        <BookingDialog
          open={showBooking}
          onOpenChange={setShowBooking}
          profile={profile}
          userId={bookingUserId || user.id}
          pets={bookingPets}
        />
      )}
    </div>
  );
}

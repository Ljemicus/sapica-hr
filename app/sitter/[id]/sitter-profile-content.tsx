'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { hr } from 'date-fns/locale';
import {
  Star, MapPin, Clock, Shield, Award, Calendar, MessageCircle,
  Heart, ChevronLeft, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { StarRating } from '@/components/shared/star-rating';
import { SERVICE_LABELS, type SitterProfile, type User, type Review, type Availability, type ServiceType } from '@/lib/types';
import { useUser } from '@/hooks/use-user';
import { BookingDialog } from './booking-dialog';

interface SitterProfileContentProps {
  profile: SitterProfile & { user: User };
  reviews: (Review & { reviewer: { name: string; avatar_url: string | null }; booking: { service_type: string } })[];
  availability: Availability[];
}

export function SitterProfileContent({ profile, reviews, availability }: SitterProfileContentProps) {
  const { user } = useUser();
  const [showBooking, setShowBooking] = useState(false);
  const router = useRouter();

  const availableDates = new Set(availability.map((a) => a.date));

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4 -ml-2">
        <ChevronLeft className="h-4 w-4 mr-1" />
        Natrag
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-6">
                <Avatar className="h-28 w-28 border-4 border-orange-100">
                  <AvatarImage src={profile.user?.avatar_url || ''} alt={profile.user?.name} />
                  <AvatarFallback className="bg-orange-200 text-orange-700 text-3xl">
                    {profile.user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-2xl font-bold">{profile.user?.name}</h1>
                      <div className="flex items-center gap-2 text-muted-foreground mt-1">
                        <MapPin className="h-4 w-4" />
                        <span>{profile.city}</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {profile.verified && (
                        <Badge className="bg-blue-500">
                          <Shield className="h-3 w-3 mr-1" />
                          Verificiran
                        </Badge>
                      )}
                      {profile.superhost && (
                        <Badge className="bg-amber-500">
                          <Award className="h-3 w-3 mr-1" />
                          Superhost
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1">
                      <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                      <span className="font-semibold">{profile.rating_avg.toFixed(1)}</span>
                      <span className="text-sm text-muted-foreground">({profile.review_count} recenzija)</span>
                    </div>
                    {profile.response_time && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        Odgovara {profile.response_time}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    {profile.experience_years} godina iskustva
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bio */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">O meni</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{profile.bio}</p>
            </CardContent>
          </Card>

          {/* Services & Prices */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Usluge i cijene</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {profile.services.map((service) => (
                  <div
                    key={service}
                    className="flex items-center justify-between p-3 rounded-lg border bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                        <Heart className="h-4 w-4 text-orange-500" />
                      </div>
                      <span className="font-medium text-sm">{SERVICE_LABELS[service]}</span>
                    </div>
                    <span className="font-bold text-orange-500">
                      {profile.prices[service]}&euro;
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reviews */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                Recenzije
                <Badge variant="secondary">{reviews.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reviews.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Još nema recenzija</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={review.reviewer?.avatar_url || ''} />
                          <AvatarFallback className="bg-orange-100 text-orange-600 text-xs">
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
                      <p className="text-sm text-muted-foreground pl-11">{review.comment}</p>
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
          <Card className="sticky top-24">
            <CardContent className="p-6 space-y-4">
              <div className="text-center">
                <span className="text-3xl font-bold text-orange-500">
                  od {Math.min(...Object.values(profile.prices).filter((p): p is number => typeof p === 'number'))}&euro;
                </span>
                <span className="text-muted-foreground">/usluga</span>
              </div>

              {user && user.role === 'owner' ? (
                <>
                  <Button
                    className="w-full bg-orange-500 hover:bg-orange-600"
                    size="lg"
                    onClick={() => setShowBooking(true)}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Rezerviraj
                  </Button>
                  <Link href={`/poruke?to=${profile.user_id}`}>
                    <Button variant="outline" className="w-full" size="lg">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Kontaktiraj
                    </Button>
                  </Link>
                </>
              ) : !user ? (
                <Link href={`/prijava?redirect=/sitter/${profile.user_id}`}>
                  <Button className="w-full bg-orange-500 hover:bg-orange-600" size="lg">
                    Prijavi se za rezervaciju
                  </Button>
                </Link>
              ) : null}

              <Separator />

              {/* Availability Calendar Preview */}
              <div>
                <h3 className="font-medium text-sm mb-2 flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Dostupnost (sljedećih 14 dana)
                </h3>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 14 }, (_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() + i);
                    const dateStr = date.toISOString().split('T')[0];
                    const isAvailable = availableDates.has(dateStr);
                    return (
                      <div
                        key={i}
                        className={`aspect-square rounded-md flex items-center justify-center text-xs font-medium ${
                          isAvailable
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-50 text-red-400'
                        }`}
                        title={`${format(date, 'd.M.')} — ${isAvailable ? 'Dostupan' : 'Nedostupan'}`}
                      >
                        {date.getDate()}
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-green-100" /> Dostupan
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-red-50" /> Nedostupan
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
          userId={user.id}
        />
      )}
    </div>
  );
}

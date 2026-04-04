'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { enUS, hr } from 'date-fns/locale';
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
import { useLanguage } from '@/lib/i18n/context';
import { BookingDialog } from './booking-dialog';

const serviceIcons: Record<ServiceType, React.ElementType> = {
  boarding: Home,
  walking: Dog,
  'house-sitting': House,
  'drop-in': Eye,
  daycare: Sun,
};

const serviceColors: Record<ServiceType, string> = {
  boarding: 'from-orange-500 to-amber-500',
  walking: 'from-green-500 to-emerald-500',
  'house-sitting': 'from-blue-500 to-cyan-500',
  'drop-in': 'from-purple-500 to-pink-500',
  daycare: 'from-rose-500 to-orange-500',
};

const SERVICE_LABELS_EN: Record<ServiceType, string> = {
  boarding: 'Boarding',
  walking: 'Walks',
  'house-sitting': 'House sitting',
  'drop-in': 'Drop-in visit',
  daycare: 'Day care',
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
  const { language } = useLanguage();
  const isEn = language === 'en';
  const locale = isEn ? enUS : hr;
  const tService = (service: ServiceType) => isEn ? SERVICE_LABELS_EN[service] : SERVICE_LABELS[service];

  const copy = {
    back: isEn ? 'Back' : 'Natrag',
    trustedSitter: isEn ? 'Trusted sitter' : 'Provjeren sitter',
    verifiedProfile: isEn ? 'Verified profile' : 'Verificiran profil',
    topPick: isEn ? 'Top pick' : 'Top izbor',
    reviewsLabel: isEn ? 'reviews' : 'recenzija',
    responds: isEn ? 'Replies' : 'Odgovara',
    yearsExperience: isEn ? 'yrs experience' : 'god. iskustva',
    about: isEn ? 'About the sitter' : 'O sitteru',
    bioFallback: isEn ? 'This sitter has not added a bio yet.' : 'Ovaj sitter još nije dodao opis.',
    services: isEn ? 'Services and estimated pricing' : 'Usluge i okvirne cijene',
    reviewsTitle: isEn ? 'Reviews' : 'Recenzije',
    noReviews: isEn ? 'No reviews yet' : 'Još nema recenzija',
    from: isEn ? 'from' : 'već od',
    depending: isEn ? 'depending on service and timing' : 'ovisno o usluzi i terminu',
    sendBooking: isEn ? 'Send booking request' : 'Pošalji upit za rezervaciju',
    sendMessage: isEn ? 'Send message' : 'Pošalji poruku',
    signInSend: isEn ? 'Sign in to send a request' : 'Prijavi se za slanje upita',
    next14: isEn ? 'Availability for the next 14 days' : 'Dostupnost u idućih 14 dana',
    available: isEn ? 'Available' : 'Dostupan',
    unavailable: isEn ? 'Unavailable' : 'Nedostupan',
  };

  const availableDates = new Set(availability.map((a) => a.date));
  const gradient = profile.user?.name
    ? ['from-orange-400 to-amber-300', 'from-teal-400 to-cyan-300', 'from-purple-400 to-pink-300', 'from-emerald-400 to-teal-300'][profile.user.name.charCodeAt(0) % 4]
    : 'from-orange-400 to-amber-300';

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4 -ml-2 hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:text-orange-600">
        <ChevronLeft className="h-4 w-4 mr-1" />
        {copy.back}
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden border-0 shadow-sm">
            <div className={`h-36 bg-gradient-to-br ${gradient} relative overflow-hidden`}>
              {profile.photos?.[0] ? (
                <>
                  <img src={profile.photos[0]} alt={`${profile.user?.name} cover`} className="absolute inset-0 h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-black/20" />
                </>
              ) : null}
              <div className="absolute inset-0 paw-pattern opacity-10" />
              <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between text-white/90 text-sm font-medium">
                <span>{profile.city}</span>
                <span className="rounded-full bg-white/90 px-3 py-1 text-orange-600 shadow-sm">{copy.trustedSitter}</span>
              </div>
            </div>
            <CardContent className="p-6 -mt-16 relative">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="avatar-gradient-border w-fit h-fit flex-shrink-0">
                  <Avatar className="h-28 w-28 border-4 border-white shadow-lg">
                    <AvatarImage src={profile.user?.avatar_url || ''} alt={profile.user?.name} />
                    <AvatarFallback className="bg-white text-gray-700 text-3xl font-bold">{profile.user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 pt-2 sm:pt-8">
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div>
                      <h1 className="text-2xl font-bold">{profile.user?.name}</h1>
                      <div className="flex items-center gap-2 text-muted-foreground mt-1"><MapPin className="h-4 w-4" /><span>{profile.city}</span></div>
                    </div>
                    <div className="flex gap-2">
                      {profile.verified && <Badge className="bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800 hover:bg-teal-50 dark:hover:bg-teal-950/30 animate-fade-in"><Shield className="h-3 w-3 mr-1" />{copy.verifiedProfile}</Badge>}
                      {profile.superhost && <Badge className="bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950/30 animate-fade-in delay-100"><Award className="h-3 w-3 mr-1" />{copy.topPick}</Badge>}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3 flex-wrap">
                    <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1 rounded-full"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /><span className="font-semibold">{profile.rating_avg.toFixed(1)}</span><span className="text-sm text-amber-700/70">({profile.review_count} {copy.reviewsLabel})</span></div>
                    {profile.response_time && <div className="flex items-center gap-1 text-sm text-muted-foreground"><Clock className="h-4 w-4" />{copy.responds} {profile.response_time}</div>}
                    <div className="flex items-center gap-1 text-sm text-muted-foreground"><CheckCircle2 className="h-4 w-4 text-green-500" />{profile.experience_years} {copy.yearsExperience}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm"><CardHeader><CardTitle className="text-lg">{copy.about}</CardTitle></CardHeader><CardContent><p className="text-muted-foreground leading-relaxed">{profile.bio || copy.bioFallback}</p></CardContent></Card>

          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-lg">{copy.services}</CardTitle></CardHeader>
            <CardContent><div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{profile.services.map((service) => { const Icon = serviceIcons[service] || Heart; const color = serviceColors[service] || 'from-orange-500 to-amber-500'; return <div key={service} className="flex items-center justify-between p-4 rounded-xl border bg-white hover:shadow-md transition-shadow group"><div className="flex items-center gap-3"><div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}><Icon className="h-5 w-5 text-white" /></div><span className="font-medium">{tService(service)}</span></div><span className="font-bold text-lg text-orange-500">{profile.prices[service]}&euro;</span></div>; })}</div></CardContent>
          </Card>

          <AvailabilityCalendar availableDates={availableDates} />

          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-lg flex items-center gap-2">{copy.reviewsTitle}<Badge variant="secondary" className="bg-orange-50 text-orange-600">{reviews.length}</Badge></CardTitle></CardHeader>
            <CardContent>{reviews.length === 0 ? <p className="text-muted-foreground text-center py-6">{copy.noReviews}</p> : <div className="space-y-5">{reviews.map((review) => <div key={review.id} className="space-y-2"><div className="flex items-center gap-3"><Avatar className="h-9 w-9"><AvatarImage src={review.reviewer?.avatar_url || ''} /><AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-300 text-white text-xs">{review.reviewer?.name?.charAt(0)}</AvatarFallback></Avatar><div className="flex-1"><div className="flex items-center gap-2"><span className="font-medium text-sm">{review.reviewer?.name}</span><StarRating rating={review.rating} size="sm" /></div><div className="flex items-center gap-2 text-xs text-muted-foreground"><span>{tService(review.booking?.service_type as ServiceType)}</span><span>&middot;</span><span>{format(new Date(review.created_at), isEn ? 'MMMM d, yyyy' : 'd. MMMM yyyy.', { locale })}</span></div></div></div><p className="text-sm text-muted-foreground pl-12 leading-relaxed">{review.comment}</p><Separator className="mt-4" /></div>)}</div>}</CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="sticky top-20 border-0 shadow-sm"><CardContent className="p-6 space-y-5"><div className="text-center py-2"><span className="text-4xl font-extrabold text-gradient">{copy.from} {Math.min(...Object.values(profile.prices).filter((p): p is number => typeof p === 'number' && p > 0))}&euro;</span><span className="text-muted-foreground block text-sm mt-1">{copy.depending}</span></div><div className="grid grid-cols-2 gap-2"><div className="rounded-xl bg-orange-50 px-3 py-2 text-center"><div className="text-lg font-bold text-orange-600">{profile.review_count}</div><div className="text-xs text-muted-foreground">{copy.reviewsLabel}</div></div><div className="rounded-xl bg-teal-50 px-3 py-2 text-center"><div className="text-lg font-bold text-teal-600">{profile.experience_years}</div><div className="text-xs text-muted-foreground">{copy.yearsExperience}</div></div></div>{user && user.role === 'owner' ? <><Button className="w-full bg-orange-500 hover:bg-orange-600 btn-hover shadow-md shadow-orange-200/50" size="lg" onClick={() => setShowBooking(true)}><Calendar className="h-4 w-4 mr-2" />{copy.sendBooking}</Button><Link href={`/poruke?to=${profile.user_id}`}><Button variant="outline" className="w-full hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:text-orange-600 hover:border-orange-200" size="lg"><MessageCircle className="h-4 w-4 mr-2" />{copy.sendMessage}</Button></Link></> : !user ? <Link href={`/prijava?redirect=/sitter/${profile.user_id}`}><Button className="w-full bg-orange-500 hover:bg-orange-600 btn-hover" size="lg">{copy.signInSend}</Button></Link> : null}<Separator /><div><h3 className="font-medium text-sm mb-3 flex items-center gap-1.5"><Calendar className="h-4 w-4 text-orange-500" />{copy.next14}</h3><div className="grid grid-cols-7 gap-1.5">{Array.from({ length: 14 }, (_, i) => { const date = new Date(); date.setDate(date.getDate() + i); const dateStr = date.toISOString().split('T')[0]; const isAvailable = availableDates.has(dateStr); return <div key={i} className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-all ${isAvailable ? 'bg-green-100 text-green-700 shadow-sm' : 'bg-gray-100 text-gray-400'}`} title={`${format(date, 'd.M.')} — ${isAvailable ? copy.available : copy.unavailable}`}>{date.getDate()}</div>; })}</div><div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground"><div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-green-100 border border-green-200" /><span>{copy.available}</span></div><div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-gray-100 border border-gray-200" /><span>{copy.unavailable}</span></div></div></div></CardContent></Card>
        </div>
      </div>

      {showBooking && user && <BookingDialog open={showBooking} onOpenChange={setShowBooking} profile={profile} userId={bookingUserId || user.id} pets={bookingPets} />}
    </div>
  );
}

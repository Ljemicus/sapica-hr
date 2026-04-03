'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { hr } from 'date-fns/locale';
import {
  Star, MapPin, Shield, ChevronLeft, Scissors, Droplets, Sparkles,
  Calendar, MessageCircle, Share2, Check, Clock, Phone, Mail, MapPinned,
  ClipboardList
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { StarRating } from '@/components/shared/star-rating';
import { AvailabilityCalendar } from '@/components/shared/availability-calendar';
import { GROOMING_SERVICE_LABELS, GROOMER_SPECIALIZATION_LABELS, type Groomer, type GroomingServiceType, type GroomerAvailabilitySlot } from '@/lib/types';
import {
  formatAddress, formatPriceRange, getServiceDescription, getActiveServices,
  groomerSummary, getBioPlaceholder, getNoServicesMessage, hasContactInfo,
  getOrderedDays, formatWorkingHours, hasWorkingHours,
} from '@/lib/profile-helpers';
import { useUser } from '@/hooks/use-user';
import { GroomerBookingDialog } from './booking-dialog';

interface GroomerReview {
  id: string;
  groomer_id: string;
  author_name: string;
  author_initial: string;
  rating: number;
  comment: string;
  created_at: string;
}

const serviceIcons: Record<GroomingServiceType, React.ElementType> = {
  'sisanje': Scissors,
  'kupanje': Droplets,
  'trimanje': Scissors,
  'nokti': Scissors,
  'cetkanje': Sparkles,
};

const serviceColors: Record<GroomingServiceType, string> = {
  'sisanje': 'from-pink-500 to-rose-500',
  'kupanje': 'from-blue-500 to-cyan-500',
  'trimanje': 'from-purple-500 to-pink-500',
  'nokti': 'from-orange-500 to-amber-500',
  'cetkanje': 'from-teal-500 to-emerald-500',
};

const gradients = [
  'from-pink-400 to-rose-300',
  'from-purple-400 to-pink-300',
  'from-orange-400 to-amber-300',
  'from-teal-400 to-cyan-300',
];

interface GroomerProfileProps {
  groomer: Groomer;
  reviews: GroomerReview[];
  availableDates: Set<string>;
}

export function GroomerProfile({ groomer, reviews, availableDates }: GroomerProfileProps) {
  const { user } = useUser();
  const router = useRouter();
  const [showBooking, setShowBooking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [availabilitySlots, setAvailabilitySlots] = useState<GroomerAvailabilitySlot[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [preselectedSlot, setPreselectedSlot] = useState<GroomerAvailabilitySlot | null>(null);
  const gradient = gradients[groomer.name.charCodeAt(0) % gradients.length];
  const lowestPrice = Math.min(...Object.values(groomer.prices).filter(p => p > 0));

  useEffect(() => {
    const loadSlots = async () => {
      const fromDate = new Date().toISOString().split('T')[0];
      const toDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 60).toISOString().split('T')[0];
      setAvailabilityLoading(true);
      try {
        const r = await fetch(`/api/groomer-availability?groomer_id=${groomer.id}&from_date=${fromDate}&to_date=${toDate}`);
        const data = await r.json();
        setAvailabilitySlots(Array.isArray(data) ? data : []);
      } catch {
        setAvailabilitySlots([]);
      } finally {
        setAvailabilityLoading(false);
      }
    };
    loadSlots();
  }, [groomer.id]);

  const selectedDateSlots = useMemo(
    () => availabilitySlots.filter((slot) => slot.date === selectedDate),
    [availabilitySlots, selectedDate]
  );

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link kopiran!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Nije moguće kopirati link');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" onClick={() => router.back()} className="-ml-2 hover:bg-orange-50 hover:text-orange-600">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Natrag
        </Button>
        <Button variant="ghost" size="sm" onClick={handleShare} className="hover:bg-orange-50 hover:text-orange-600">
          {copied ? <Check className="h-4 w-4 mr-1" /> : <Share2 className="h-4 w-4 mr-1" />}
          {copied ? 'Kopirano!' : 'Podijeli'}
        </Button>
      </div>

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
                          Verificiran profil
                        </Badge>
                      )}
                      <Badge className="bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-50 animate-fade-in delay-100">
                        {GROOMER_SPECIALIZATION_LABELS[groomer.specialization]}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-3 flex-wrap">
                    <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1 rounded-full">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="font-semibold">{groomer.rating.toFixed(1)}</span>
                      <span className="text-sm text-amber-700/70">({groomer.review_count} recenzija)</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-pink-50 px-3 py-1 rounded-full">
                      <ClipboardList className="h-4 w-4 text-pink-500" />
                      <span className="text-sm text-pink-700">{groomer.services.length} usluga</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bio */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">O groomeru</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {groomer.bio || getBioPlaceholder('groomer')}
              </p>
              <p className="text-xs text-muted-foreground/60 mt-3">
                {groomerSummary(groomer)}
              </p>
            </CardContent>
          </Card>

          {/* Contact Info */}
          {hasContactInfo(groomer) ? (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Kontakt informacije</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {groomer.phone && (
                    <a href={`tel:${groomer.phone}`} className="flex items-center gap-3 p-3 rounded-xl border bg-white hover:bg-orange-50 hover:border-orange-200 transition-colors group">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                        <Phone className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Telefon</div>
                        <span className="font-medium">{groomer.phone}</span>
                      </div>
                    </a>
                  )}
                  {groomer.email && (
                    <a href={`mailto:${groomer.email}`} className="flex items-center gap-3 p-3 rounded-xl border bg-white hover:bg-orange-50 hover:border-orange-200 transition-colors group">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                        <Mail className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Email</div>
                        <span className="font-medium">{groomer.email}</span>
                      </div>
                    </a>
                  )}
                  {(groomer.address || groomer.city) && (
                    <div className="flex items-center gap-3 p-3 rounded-xl border bg-white">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-sm">
                        <MapPinned className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Adresa</div>
                        <span className="font-medium">{formatAddress(groomer.address, groomer.city)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Kontakt informacije</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Kontakt informacije nisu navedene. Koristite gumb &quot;Kontaktiraj&quot; za upit.</p>
              </CardContent>
            </Card>
          )}

          {/* Services & Prices */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Usluge i okvirne cijene</CardTitle>
                <span className="text-sm text-muted-foreground">{formatPriceRange(groomer.prices)}</span>
              </div>
            </CardHeader>
            <CardContent>
              {getActiveServices(groomer).length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">{getNoServicesMessage()}</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {getActiveServices(groomer).map((service) => {
                    const Icon = serviceIcons[service];
                    const color = serviceColors[service];
                    return (
                      <div key={service} className="flex items-center justify-between p-4 rounded-xl border bg-white hover:shadow-md transition-shadow group">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <span className="font-medium block">{GROOMING_SERVICE_LABELS[service]}</span>
                            <span className="text-xs text-muted-foreground">{getServiceDescription(service)}</span>
                          </div>
                        </div>
                        <span className="font-bold text-lg text-orange-500 flex-shrink-0 ml-2">
                          već od {groomer.prices[service]}&euro;
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Availability Calendar */}
          <AvailabilityCalendar
            availableDates={availableDates}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-500" />
                Slobodni termini
              </CardTitle>
            </CardHeader>
            <CardContent>
              {availabilityLoading ? (
                <p className="text-sm text-muted-foreground">Učitavam termine...</p>
              ) : !selectedDate ? (
                <p className="text-sm text-muted-foreground">Klikni na slobodan datum iznad da vidiš termine.</p>
              ) : selectedDateSlots.length === 0 ? (
                <p className="text-sm text-muted-foreground">Za odabrani datum trenutno nema slobodnih termina.</p>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm font-medium">
                    {format(new Date(selectedDate + 'T00:00:00'), 'd. MMMM yyyy.', { locale: hr })}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {selectedDateSlots.map((slot) => (
                      <button
                        key={slot.id}
                        type="button"
                        className="rounded-xl border bg-white p-3 text-left hover:border-orange-300 hover:bg-orange-50 transition-all"
                        onClick={() => {
                          setPreselectedSlot(slot);
                          setShowBooking(true);
                        }}
                      >
                        <div className="font-semibold text-sm text-orange-600">
                          {slot.start_time.slice(0, 5)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          do {slot.end_time.slice(0, 5)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

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
                <div className="text-center py-8">
                  <Star className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-muted-foreground font-medium">Još nema recenzija</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">Budite prvi koji će ocijeniti ovog groomera</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {reviews.map((review, i) => (
                    <div key={review.id} className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-300 text-white text-xs">
                            {review.author_initial}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{review.author_name}</span>
                            <StarRating rating={review.rating} size="sm" />
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(review.created_at), 'd. MMMM yyyy.', { locale: hr })}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground pl-12 leading-relaxed">{review.comment}</p>
                      {i < reviews.length - 1 && <Separator className="mt-4" />}
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
                <span className="text-4xl font-extrabold text-gradient">od {lowestPrice}&euro;</span>
                <span className="text-muted-foreground block text-sm mt-1">po usluzi</span>
              </div>

              {user ? (
                <>
                  <Button
                    className="w-full bg-orange-500 hover:bg-orange-600 btn-hover shadow-md shadow-orange-200/50"
                    size="lg"
                    onClick={() => setShowBooking(true)}
                  >
                    <Scissors className="h-4 w-4 mr-2" />
                    Zakaži termin
                  </Button>
                  <Link href={`/poruke?groomer=${groomer.id}`}>
                    <Button variant="outline" className="w-full hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200" size="lg">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Kontaktiraj
                    </Button>
                  </Link>
                </>
              ) : (
                <Link href={`/prijava?redirect=/groomer/${groomer.id}`}>
                  <Button className="w-full bg-orange-500 hover:bg-orange-600 btn-hover" size="lg">
                    Prijavi se za zakazivanje
                  </Button>
                </Link>
              )}

              {hasWorkingHours(groomer) && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-medium text-sm mb-3 flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-orange-500" />
                      Radno vrijeme
                    </h3>
                    <div className="space-y-1.5">
                      {getOrderedDays().map((day) => {
                        const hours = groomer.working_hours?.[day];
                        return (
                          <div key={day} className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{day}</span>
                            {hours ? (
                              <span className="font-medium">{formatWorkingHours(hours)}</span>
                            ) : (
                              <span className="text-muted-foreground/50">Zatvoreno</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

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

      {showBooking && (
        <GroomerBookingDialog
          open={showBooking}
          onOpenChange={(open) => {
            setShowBooking(open);
            if (!open) setPreselectedSlot(null);
          }}
          groomer={groomer}
          initialDate={selectedDate || undefined}
          initialSlot={preselectedSlot}
        />
      )}
    </div>
  );
}

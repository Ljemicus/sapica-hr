'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { hr } from 'date-fns/locale';
import {
  Star, MapPin, Award, ChevronLeft, GraduationCap, Clock, Calendar,
  MessageCircle, CheckCircle2, Share2, Check, Phone, Mail, MapPinned,
  BookOpen
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { StarRating } from '@/components/shared/star-rating';
import { AvailabilityCalendar } from '@/components/shared/availability-calendar';
import { TRAINING_TYPE_LABELS, type Trainer, type TrainingProgram } from '@/lib/types';
import {
  formatAddress, getTrainingDescription, trainerSummary,
  getBioPlaceholder, getNoProgramsMessage, hasContactInfo,
} from '@/lib/profile-helpers';
import { useUser } from '@/hooks/use-user';
import { TrainerBookingDialog } from './booking-dialog';

interface TrainerReview {
  id: string;
  trainer_id: string;
  author_name: string;
  author_initial: string;
  rating: number;
  comment: string;
  created_at: string;
}

const gradients = [
  'from-blue-400 to-cyan-300',
  'from-green-400 to-emerald-300',
  'from-purple-400 to-pink-300',
  'from-orange-400 to-amber-300',
];

interface TrainerProfileProps {
  trainer: Trainer;
  programs: TrainingProgram[];
  reviews: TrainerReview[];
  availableDates: Set<string>;
}

export function TrainerProfile({ trainer, programs, reviews, availableDates }: TrainerProfileProps) {
  const { user } = useUser();
  const router = useRouter();
  const [showBooking, setShowBooking] = useState(false);
  const [copied, setCopied] = useState(false);
  const gradient = gradients[trainer.name.charCodeAt(0) % gradients.length];

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
            <div className={`h-36 bg-gradient-to-br ${gradient} relative overflow-hidden`}>
              <div className="absolute inset-0 paw-pattern opacity-10" />
              <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between text-white/90 text-sm font-medium">
                <span>{trainer.city}</span>
                <span className="rounded-full bg-white/90 px-3 py-1 text-indigo-600 shadow-sm">Trener pasa</span>
              </div>
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
                  <div className="flex items-center gap-3 mt-3 flex-wrap">
                    <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1 rounded-full">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="font-semibold">{trainer.rating.toFixed(1)}</span>
                      <span className="text-sm text-amber-700/70">({trainer.review_count} recenzija)</span>
                    </div>
                    {programs.length > 0 && (
                      <div className="flex items-center gap-1.5 bg-indigo-50 px-3 py-1 rounded-full">
                        <BookOpen className="h-4 w-4 text-indigo-500" />
                        <span className="text-sm text-indigo-700">{programs.length} programa</span>
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
              <CardTitle className="text-lg">O treneru</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {trainer.bio || getBioPlaceholder('trainer')}
              </p>
              <p className="text-xs text-muted-foreground/60 mt-3">
                {trainerSummary(trainer)}
              </p>
            </CardContent>
          </Card>

          {/* Contact Info */}
          {hasContactInfo(trainer) ? (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Kontakt informacije</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {trainer.phone && (
                    <a href={`tel:${trainer.phone}`} className="flex items-center gap-3 p-3 rounded-xl border bg-white hover:bg-orange-50 hover:border-orange-200 transition-colors group">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                        <Phone className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Telefon</div>
                        <span className="font-medium">{trainer.phone}</span>
                      </div>
                    </a>
                  )}
                  {trainer.email && (
                    <a href={`mailto:${trainer.email}`} className="flex items-center gap-3 p-3 rounded-xl border bg-white hover:bg-orange-50 hover:border-orange-200 transition-colors group">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                        <Mail className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Email</div>
                        <span className="font-medium">{trainer.email}</span>
                      </div>
                    </a>
                  )}
                  {(trainer.address || trainer.city) && (
                    <div className="flex items-center gap-3 p-3 rounded-xl border bg-white">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-sm">
                        <MapPinned className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">{trainer.address ? 'Adresa' : 'Grad'}</div>
                        <span className="font-medium">{formatAddress(trainer.address, trainer.city)}</span>
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
                <p className="text-sm text-muted-foreground">Kontakt informacije nisu navedene. Koristite gumb za poruku ili upit za termin.</p>
              </CardContent>
            </Card>
          )}

          {/* Specializations */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Specijalizacije</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {trainer.specializations.map((spec) => (
                  <div key={spec} className="flex items-start gap-3 p-3 rounded-xl border bg-white">
                    <Badge className="bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 text-sm px-3 py-1 flex-shrink-0">
                      {TRAINING_TYPE_LABELS[spec]}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{getTrainingDescription(spec)}</span>
                  </div>
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
              {programs.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-muted-foreground font-medium">Još nema objavljenih programa treninga</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">{getNoProgramsMessage()}</p>
                </div>
              ) : (
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
              )}
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
                <div className="text-center py-8">
                  <Star className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-muted-foreground font-medium">Još nema recenzija</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">Budite prvi koji će podijeliti iskustvo s ovim trenerom</p>
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

          {/* Certificates */}
          {trainer.certificates.length > 0 && (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Certifikati</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {trainer.certificates.map((cert) => (
                    <div key={cert} className="flex items-center gap-3 p-3 rounded-xl border bg-white">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-sm">
                        <CheckCircle2 className="h-5 w-5 text-white" />
                      </div>
                      <span className="font-medium">{cert}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="sticky top-20 border-0 shadow-sm">
            <CardContent className="p-6 space-y-5">
              <div className="text-center py-2">
                <span className="text-4xl font-extrabold text-gradient">{trainer.price_per_hour}&euro;</span>
                <span className="text-muted-foreground block text-sm mt-1">po satu</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-indigo-50 px-3 py-2 text-center">
                  <div className="text-lg font-bold text-indigo-600">{programs.length}</div>
                  <div className="text-xs text-muted-foreground">programa</div>
                </div>
                <div className="rounded-xl bg-amber-50 px-3 py-2 text-center">
                  <div className="text-lg font-bold text-amber-600">{trainer.review_count}</div>
                  <div className="text-xs text-muted-foreground">recenzija</div>
                </div>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center p-2 rounded-lg bg-orange-50">
                  <span className="text-lg font-bold text-orange-600">{trainer.specializations.length}</span>
                  <span className="text-xs text-muted-foreground block">specijalizacija</span>
                </div>
                <div className="text-center p-2 rounded-lg bg-blue-50">
                  <span className="text-lg font-bold text-blue-600">{trainer.certificates.length}</span>
                  <span className="text-xs text-muted-foreground block">certifikata</span>
                </div>
              </div>

              {user ? (
                <>
                  <Button
                    className="w-full bg-orange-500 hover:bg-orange-600 btn-hover shadow-md shadow-orange-200/50"
                    size="lg"
                    onClick={() => setShowBooking(true)}
                  >
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Zakaži trening
                  </Button>
                  <Link href={`/poruke?trainer=${trainer.id}`}>
                    <Button variant="outline" className="w-full hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200" size="lg">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Kontaktiraj
                    </Button>
                  </Link>
                </>
              ) : (
                <Link href={`/prijava?redirect=/trener/${trainer.id}`}>
                  <Button className="w-full bg-orange-500 hover:bg-orange-600 btn-hover" size="lg">
                    Prijavi se za zakazivanje
                  </Button>
                </Link>
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
        <TrainerBookingDialog
          open={showBooking}
          onOpenChange={setShowBooking}
          trainer={trainer}
          programs={programs}
        />
      )}
    </div>
  );
}

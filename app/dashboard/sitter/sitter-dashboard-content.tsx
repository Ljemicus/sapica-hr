'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, addMonths, subMonths } from 'date-fns';
import { hr } from 'date-fns/locale';
import { Edit, Calendar, Star, DollarSign, ClipboardList, CheckCircle, XCircle, ChevronLeft, ChevronRight, User, TrendingUp, BarChart3, Eye, MessageSquare, Lightbulb, Camera, ImagePlus, Navigation, Send, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { EmptyState } from '@/components/shared/empty-state';
import { StarRating } from '@/components/shared/star-rating';
import { ImageUpload } from '@/components/shared/image-upload';
import { createClient } from '@/lib/supabase/client';
import { STATUS_LABELS, SERVICE_LABELS, CITIES, type User as UserType, type SitterProfile, type Booking, type Review, type Availability, type BookingStatus, type ServiceType, type PetUpdate, type UpdateType } from '@/lib/types';
import { toast } from 'sonner';

const statusColors: Record<BookingStatus, string> = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  accepted: 'bg-blue-50 text-blue-700 border-blue-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-gray-50 text-gray-700 border-gray-200',
};

interface Props {
  user: UserType;
  profile: SitterProfile | null;
  bookings: (Booking & { owner: { name: string; avatar_url: string | null; email: string }; pet: { name: string; species: string; breed: string | null; special_needs: string | null } })[];
  reviews: (Review & { reviewer: { name: string; avatar_url: string | null } })[];
  availability: Availability[];
  recentUpdates?: PetUpdate[];
}

const EMOJI_OPTIONS = ['😊', '🐾', '🐶', '🐱', '❤️', '🏃‍♂️', '😴', '🍽️', '☀️', '🌧️'];

export function SitterDashboardContent({ user, profile, bookings, reviews, availability, recentUpdates = [] }: Props) {
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [updateBookingId, setUpdateBookingId] = useState<string>('');
  const [updateCaption, setUpdateCaption] = useState('');
  const [updateEmoji, setUpdateEmoji] = useState('🐾');
  const [updateType, setUpdateType] = useState<UpdateType>('photo');
  const [updatePhotoUrls, setUpdatePhotoUrls] = useState<string[]>([]);
  const [sendingUpdate, setSendingUpdate] = useState(false);
  const [sentUpdates, setSentUpdates] = useState<PetUpdate[]>(recentUpdates);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [profileForm, setProfileForm] = useState({
    bio: profile?.bio || '',
    experience_years: profile?.experience_years?.toString() || '0',
    services: profile?.services || [],
    prices: (profile?.prices || {}) as Record<string, number>,
    city: profile?.city || user.city || '',
  });
  const router = useRouter();
  const supabase = createClient();

  const availableDates = new Set(availability.filter(a => a.available).map(a => a.date));

  const toggleService = (service: ServiceType) => {
    const services = profileForm.services.includes(service)
      ? profileForm.services.filter(s => s !== service)
      : [...profileForm.services, service];
    setProfileForm({ ...profileForm, services });
  };

  const saveProfile = async () => {
    if (!profileForm.bio || profileForm.services.length === 0) {
      toast.error('Ispunite bio i odaberite barem jednu uslugu');
      return;
    }
    setLoading(true);
    const data = { bio: profileForm.bio, experience_years: parseInt(profileForm.experience_years), services: profileForm.services, prices: profileForm.prices, city: profileForm.city, user_id: user.id };

    const { error } = profile
      ? await supabase.from('sitter_profiles').update(data).eq('user_id', user.id)
      : await supabase.from('sitter_profiles').insert(data);

    if (error) toast.error('Greška pri spremanju profila');
    else { toast.success('Profil spremljen!'); setShowProfileDialog(false); router.refresh(); }
    setLoading(false);
  };

  const updateBookingStatus = async (bookingId: string, status: BookingStatus) => {
    const { error } = await supabase.from('bookings').update({ status }).eq('id', bookingId);
    if (error) toast.error('Greška pri ažuriranju statusa');
    else { toast.success(`Rezervacija ${STATUS_LABELS[status].toLowerCase()}`); router.refresh(); }
  };

  const toggleAvailability = async (dateStr: string) => {
    const isAvailable = availableDates.has(dateStr);
    if (isAvailable) {
      await supabase.from('availability').delete().eq('sitter_id', user.id).eq('date', dateStr);
    } else {
      await supabase.from('availability').upsert({ sitter_id: user.id, date: dateStr, available: true });
    }
    router.refresh();
  };

  const openUpdateDialog = (bookingId: string) => {
    setUpdateBookingId(bookingId);
    setUpdateCaption('');
    setUpdateEmoji('🐾');
    setUpdateType('photo');
    setUpdatePhotoUrls([]);
    setShowUpdateDialog(true);
  };

  const sendUpdate = async () => {
    if (!updateCaption.trim()) {
      toast.error('Unesite opis ažuriranja');
      return;
    }
    setSendingUpdate(true);
    const { error, data } = await supabase
      .from('pet_updates')
      .insert({
        booking_id: updateBookingId,
        sitter_id: user.id,
        type: updateType,
        emoji: updateEmoji,
        caption: updateCaption,
        photo_url: updatePhotoUrls[0] || null,
      })
      .select()
      .single();

    if (error) {
      toast.error('Greška pri slanju ažuriranja');
      setSendingUpdate(false);
      return;
    } else if (data) {
      setSentUpdates(prev => [data as PetUpdate, ...prev].slice(0, 5));
    }

    toast.success('Ažuriranje poslano! Vlasnik će biti obaviješten.');
    setShowUpdateDialog(false);
    setSendingUpdate(false);
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDay = monthStart.getDay();

  const completedBookings = bookings.filter(b => b.status === 'completed');
  const totalEarnings = completedBookings.reduce((sum, b) => sum + b.total_price, 0);
  const thisMonthEarnings = completedBookings
    .filter(b => new Date(b.end_date).getMonth() === new Date().getMonth() && new Date(b.end_date).getFullYear() === new Date().getFullYear())
    .reduce((sum, b) => sum + b.total_price, 0);

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const upcomingBookings = bookings.filter(b => b.status === 'accepted' && new Date(b.start_date) >= new Date());

  // Earnings chart data (last 6 months)
  const monthlyEarnings: { month: string; amount: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthStr = format(d, 'MMM', { locale: hr });
    const amount = completedBookings
      .filter(b => {
        const bd = new Date(b.end_date);
        return bd.getMonth() === d.getMonth() && bd.getFullYear() === d.getFullYear();
      })
      .reduce((sum, b) => sum + b.total_price, 0);
    monthlyEarnings.push({ month: monthStr, amount });
  }
  const maxEarning = Math.max(...monthlyEarnings.map(e => e.amount), 1);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-3xl font-bold tracking-tight">Bok, {user.name.split(' ')[0]}!</h1>
        <p className="text-muted-foreground mt-1">Upravljajte svojim sitter profilom</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Prosječna ocjena', value: profile?.rating_avg?.toFixed(1) || '0.0', icon: Star, color: 'from-amber-500 to-orange-500', suffix: '' },
          { label: 'Recenzija', value: profile?.review_count || 0, icon: Star, color: 'from-blue-500 to-cyan-500', suffix: '' },
          { label: 'Ukupna zarada', value: totalEarnings, icon: TrendingUp, color: 'from-green-500 to-emerald-500', suffix: '€' },
          { label: 'Na čekanju', value: pendingBookings.length, icon: ClipboardList, color: 'from-purple-500 to-pink-500', suffix: '' },
        ].map((stat, i) => (
          <Card key={stat.label} className={`border-0 shadow-sm animate-fade-in-up delay-${(i + 1) * 100}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-sm flex-shrink-0`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}{stat.suffix}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="bookings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 h-12">
          <TabsTrigger value="bookings" className="text-xs sm:text-sm gap-1 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700"><ClipboardList className="h-4 w-4 hidden sm:block" /> Rezervacije</TabsTrigger>
          <TabsTrigger value="calendar" className="text-xs sm:text-sm gap-1 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700"><Calendar className="h-4 w-4 hidden sm:block" /> Kalendar</TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs sm:text-sm gap-1 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700"><BarChart3 className="h-4 w-4 hidden sm:block" /> Analitika</TabsTrigger>
          <TabsTrigger value="profile" className="text-xs sm:text-sm gap-1 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700"><User className="h-4 w-4 hidden sm:block" /> Profil</TabsTrigger>
          <TabsTrigger value="reviews" className="text-xs sm:text-sm gap-1 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700"><Star className="h-4 w-4 hidden sm:block" /> Recenzije</TabsTrigger>
          <TabsTrigger value="earnings" className="text-xs sm:text-sm gap-1 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700"><DollarSign className="h-4 w-4 hidden sm:block" /> Zarada</TabsTrigger>
        </TabsList>

        {/* BOOKINGS TAB */}
        <TabsContent value="bookings" className="space-y-6 animate-fade-in">
          {pendingBookings.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                Zahtjevi na čekanju ({pendingBookings.length})
              </h3>
              {pendingBookings.map((booking) => (
                <Card key={booking.id} className="border-0 shadow-sm border-l-4 border-l-yellow-400 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={booking.owner?.avatar_url || ''} />
                          <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-300 text-white text-sm">{booking.owner?.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{booking.owner?.name}</p>
                          <p className="text-sm text-muted-foreground">{SERVICE_LABELS[booking.service_type as ServiceType]} · {booking.pet?.name} ({booking.pet?.species === 'dog' ? 'Pas' : 'Mačka'})</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(booking.start_date), 'd. MMM', { locale: hr })} — {format(new Date(booking.end_date), 'd. MMM yyyy.', { locale: hr })}</p>
                          {booking.pet?.special_needs && <p className="text-xs text-amber-600 mt-1 bg-amber-50 rounded px-2 py-0.5 inline-block">⚠️ {booking.pet.special_needs}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-orange-500 text-lg">{booking.total_price}€</span>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 btn-hover shadow-sm" onClick={() => updateBookingStatus(booking.id, 'accepted')}>
                          <CheckCircle className="h-4 w-4 mr-1" /> Prihvati
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-500 hover:bg-red-50 hover:border-red-200" onClick={() => updateBookingStatus(booking.id, 'rejected')}>
                          <XCircle className="h-4 w-4 mr-1" /> Odbij
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {upcomingBookings.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                Nadolazeće ({upcomingBookings.length})
              </h3>
              {upcomingBookings.map((booking) => (
                <Card key={booking.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={booking.owner?.avatar_url || ''} />
                          <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-300 text-white text-sm">{booking.owner?.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{booking.owner?.name}</p>
                          <p className="text-sm text-muted-foreground">{SERVICE_LABELS[booking.service_type as ServiceType]} · {booking.pet?.name}</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(booking.start_date), 'd. MMM', { locale: hr })} — {format(new Date(booking.end_date), 'd. MMM yyyy.', { locale: hr })}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={`${statusColors.accepted} border`}>{STATUS_LABELS.accepted}</Badge>
                        <p className="font-bold text-orange-500 mt-1">{booking.total_price}€</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3 pt-3 border-t">
                      <Link href="/dashboard/sitter/setnja" className="flex-1">
                        <Button size="sm" className="w-full bg-green-600 hover:bg-green-700 btn-hover">
                          <Navigation className="h-4 w-4 mr-1" /> Započni šetnju
                        </Button>
                      </Link>
                      <Button size="sm" variant="outline" className="flex-1 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200" onClick={() => openUpdateDialog(booking.id)}>
                        <Camera className="h-4 w-4 mr-1" /> Pošalji ažuriranje
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {bookings.filter(b => b.status !== 'pending' && !(b.status === 'accepted' && new Date(b.start_date) >= new Date())).length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Sve rezervacije</h3>
              {bookings.filter(b => b.status !== 'pending' && !(b.status === 'accepted' && new Date(b.start_date) >= new Date())).map((booking) => (
                <Card key={booking.id} className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={booking.owner?.avatar_url || ''} />
                          <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-300 text-white text-sm">{booking.owner?.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{booking.owner?.name}</p>
                          <p className="text-sm text-muted-foreground">{SERVICE_LABELS[booking.service_type as ServiceType]} · {booking.pet?.name}</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(booking.start_date), 'd. MMM', { locale: hr })} — {format(new Date(booking.end_date), 'd. MMM yyyy.', { locale: hr })}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={`${statusColors[booking.status as BookingStatus]} border`}>{STATUS_LABELS[booking.status as BookingStatus]}</Badge>
                        <p className="font-bold text-orange-500 mt-1">{booking.total_price}€</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {bookings.length === 0 && (
            <EmptyState icon={ClipboardList} title="Nema rezervacija" description="Kada vlasnici rezerviraju vaše usluge, vidjet ćete ih ovdje." />
          )}

          {/* Sent Updates */}
          {sentUpdates.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-400" />
                Poslana ažuriranja ({sentUpdates.length})
              </h3>
              {sentUpdates.slice(0, 5).map((update) => (
                <Card key={update.id} className="border-0 shadow-sm">
                  <CardContent className="p-3 flex items-center gap-3">
                    {update.photo_url ? (
                      <div className="h-12 w-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={update.photo_url} alt="" className="h-full w-full object-cover" />
                      </div>
                    ) : (
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center flex-shrink-0 border border-orange-100/50">
                        <span className="text-2xl">{update.emoji}</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{update.caption}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          {update.type === 'photo' ? 'Foto' : update.type === 'video' ? 'Video' : 'Tekst'}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {format(new Date(update.created_at), 'd. MMM, HH:mm', { locale: hr })}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* CALENDAR TAB */}
        <TabsContent value="calendar" className="animate-fade-in">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Dostupnost</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="hover:bg-orange-50" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="font-medium min-w-[140px] text-center capitalize">
                    {format(currentMonth, 'LLLL yyyy.', { locale: hr })}
                  </span>
                  <Button variant="ghost" size="icon" className="hover:bg-orange-50" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Kliknite na dan da označite dostupnost</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Ned', 'Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub'].map((day) => (
                  <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-2 uppercase tracking-wider">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {Array.from({ length: startDay }, (_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {days.map((day) => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const isAvailable = availableDates.has(dateStr);
                  const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));
                  return (
                    <button
                      key={dateStr}
                      disabled={isPast}
                      onClick={() => toggleAvailability(dateStr)}
                      className={`aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all ${
                        isPast
                          ? 'text-gray-300 cursor-not-allowed'
                          : isAvailable
                          ? 'bg-green-500 text-white hover:bg-green-600 shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      } ${isToday(day) ? 'ring-2 ring-orange-500 ring-offset-2' : ''}`}
                    >
                      {day.getDate()}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-6 mt-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-md bg-green-500" /> Dostupan
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-md bg-gray-100 border" /> Nedostupan
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-md border-2 border-orange-500" /> Danas
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ANALYTICS TAB */}
        <TabsContent value="analytics" className="space-y-6 animate-fade-in">
          {/* Analytics Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Pregledi profila', value: 47, subtitle: 'ovaj tjedan', icon: Eye, color: 'from-blue-500 to-cyan-500' },
              { label: 'Upiti', value: 12, subtitle: 'ovaj mjesec', icon: MessageSquare, color: 'from-purple-500 to-pink-500' },
              { label: 'Ukupne rezervacije', value: completedBookings.length + pendingBookings.length + upcomingBookings.length, subtitle: 'sve', icon: Calendar, color: 'from-green-500 to-emerald-500' },
              { label: 'Prosječna ocjena', value: profile?.rating_avg?.toFixed(1) || '0.0', subtitle: `${profile?.review_count || 0} recenzija`, icon: Star, color: 'from-amber-500 to-orange-500' },
            ].map((stat, i) => (
              <Card key={stat.label} className={`border-0 shadow-sm animate-fade-in-up delay-${(i + 1) * 100}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-sm flex-shrink-0`}>
                      <stat.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                      <p className="text-[10px] text-muted-foreground/60">{stat.subtitle}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Motivational text */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-orange-800 dark:text-orange-300">
                🔥 Tvoj profil je pregledan <span className="font-bold">47 puta</span> ovaj tjedan — to je 15% više nego prošli tjedan!
              </p>
            </CardContent>
          </Card>

          {/* Bookings per month bar chart */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-white" />
                </div>
                Rezervacije po mjesecima
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const bookingsPerMonth: { month: string; count: number }[] = [];
                for (let i = 5; i >= 0; i--) {
                  const d = new Date();
                  d.setMonth(d.getMonth() - i);
                  const monthStr = format(d, 'MMM', { locale: hr });
                  const count = bookings.filter(b => {
                    const bd = new Date(b.start_date);
                    return bd.getMonth() === d.getMonth() && bd.getFullYear() === d.getFullYear();
                  }).length;
                  bookingsPerMonth.push({ month: monthStr, count });
                }
                const maxCount = Math.max(...bookingsPerMonth.map(e => e.count), 1);
                return (
                  <div className="flex items-end justify-between gap-3 h-40">
                    {bookingsPerMonth.map((data, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground">{data.count > 0 ? data.count : ''}</span>
                        <div className="w-full relative" style={{ height: '100px' }}>
                          <div
                            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t-lg transition-all duration-500"
                            style={{ height: `${maxCount > 0 ? (data.count / maxCount) * 100 : 0}%`, minHeight: data.count > 0 ? '4px' : '0' }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground capitalize">{data.month}</span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          {/* Tips Section */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                  <Lightbulb className="h-4 w-4 text-white" />
                </div>
                Savjeti za poboljšanje profila
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { icon: ImagePlus, text: 'Dodaj još slika da povećaš preglede profila', color: 'text-blue-500' },
                { icon: Camera, text: 'Profili sa 5+ slika dobivaju 3x više upita', color: 'text-purple-500' },
                { icon: MessageSquare, text: 'Odgovaraj na upite unutar 1h za bolji ranking', color: 'text-green-500' },
                { icon: Star, text: 'Zamoli zadovoljne klijente da ostave recenziju', color: 'text-amber-500' },
              ].map((tip, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50">
                  <tip.icon className={`h-5 w-5 ${tip.color} flex-shrink-0`} />
                  <p className="text-sm">{tip.text}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* PROFILE TAB */}
        <TabsContent value="profile" className="animate-fade-in">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Moj profil</CardTitle>
                <Button onClick={() => setShowProfileDialog(true)} variant="outline" size="sm" className="hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200">
                  <Edit className="h-4 w-4 mr-1" /> Uredi
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile ? (
                <>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Bio</h4>
                    <p className="text-sm leading-relaxed">{profile.bio || 'Nije postavljeno'}</p>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Iskustvo</h4>
                    <p className="text-sm">{profile.experience_years} godina</p>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Usluge i cijene</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.services.map((s) => (
                        <Badge key={s} variant="secondary" className="bg-orange-50 text-orange-700 border-orange-200">
                          {SERVICE_LABELS[s]} — {profile.prices[s]}€
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Grad</h4>
                    <p className="text-sm">{profile.city || 'Nije postavljeno'}</p>
                  </div>
                  <div className="flex gap-2">
                    {profile.verified && <Badge className="bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-50">✓ Verificiran</Badge>}
                    {profile.superhost && <Badge className="bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-50">★ Superhost</Badge>}
                  </div>
                </>
              ) : (
                <EmptyState
                  icon={User}
                  title="Profil nije postavljen"
                  description="Postavite svoj sitter profil da biste primali rezervacije."
                  action={<Button onClick={() => setShowProfileDialog(true)} className="bg-orange-500 hover:bg-orange-600 btn-hover">Postavi profil</Button>}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* REVIEWS TAB */}
        <TabsContent value="reviews" className="space-y-4 animate-fade-in">
          {reviews.length === 0 ? (
            <EmptyState icon={Star} title="Još nema recenzija" description="Recenzije od vaših klijenata će se pojaviti ovdje." />
          ) : (
            reviews.map((review) => (
              <Card key={review.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={review.reviewer?.avatar_url || ''} />
                      <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-300 text-white text-sm">{review.reviewer?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{review.reviewer?.name}</span>
                        <StarRating rating={review.rating} size="sm" />
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
                      <p className="text-xs text-muted-foreground mt-2">{format(new Date(review.created_at), 'd. MMMM yyyy.', { locale: hr })}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* EARNINGS TAB */}
        <TabsContent value="earnings" className="animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-emerald-50">
              <CardContent className="p-6 text-center">
                <p className="text-sm text-muted-foreground mb-1">Ovaj mjesec</p>
                <p className="text-4xl font-extrabold text-green-600">{thisMonthEarnings}€</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-cyan-50">
              <CardContent className="p-6 text-center">
                <p className="text-sm text-muted-foreground mb-1">Ukupno</p>
                <p className="text-4xl font-extrabold text-blue-600">{totalEarnings}€</p>
              </CardContent>
            </Card>
          </div>

          {/* CSS Bar Chart */}
          <Card className="border-0 shadow-sm mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Zarada po mjesecima</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between gap-3 h-40">
                {monthlyEarnings.map((data, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">{data.amount > 0 ? `${data.amount}€` : ''}</span>
                    <div className="w-full relative" style={{ height: '100px' }}>
                      <div
                        className="bar-chart-bar absolute bottom-0 left-0 right-0 bg-gradient-to-t from-orange-500 to-amber-400"
                        style={{ height: `${maxEarning > 0 ? (data.amount / maxEarning) * 100 : 0}%`, minHeight: data.amount > 0 ? '4px' : '0' }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground capitalize">{data.month}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Završene rezervacije</CardTitle>
            </CardHeader>
            <CardContent>
              {completedBookings.length === 0 ? (
                <p className="text-muted-foreground text-center py-6">Nema završenih rezervacija</p>
              ) : (
                <div className="space-y-3">
                  {completedBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between py-3 border-b last:border-0">
                      <div>
                        <p className="font-medium text-sm">{booking.owner?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {SERVICE_LABELS[booking.service_type as ServiceType]} · {format(new Date(booking.end_date), 'd. MMM yyyy.', { locale: hr })}
                        </p>
                      </div>
                      <span className="font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm">+{booking.total_price}€</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Send Update Dialog */}
      <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Pošalji ažuriranje</DialogTitle>
            <DialogDescription>Vlasnik će biti obaviješten o ažuriranju</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Type Selector */}
            <div className="space-y-2">
              <Label>Vrsta ažuriranja</Label>
              <div className="flex gap-2">
                {([
                  { type: 'photo' as UpdateType, label: 'Fotografija', icon: Image },
                  { type: 'text' as UpdateType, label: 'Tekst', icon: MessageSquare },
                  { type: 'video' as UpdateType, label: 'Video', icon: Camera, disabled: true },
                ]).map(({ type, label, icon: Icon, disabled }) => (
                  <button
                    key={type}
                    onClick={() => !disabled && setUpdateType(type)}
                    disabled={disabled}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                      updateType === type
                        ? 'bg-orange-500 text-white'
                        : disabled
                        ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                    {disabled && <span className="text-[10px]">(uskoro)</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Emoji Picker */}
            <div className="space-y-2">
              <Label>Emoji</Label>
              <div className="flex gap-2 flex-wrap">
                {EMOJI_OPTIONS.map(e => (
                  <button
                    key={e}
                    onClick={() => setUpdateEmoji(e)}
                    className={`text-2xl p-1.5 rounded-lg transition-colors ${
                      updateEmoji === e ? 'bg-orange-100 ring-2 ring-orange-300' : 'hover:bg-gray-100'
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {/* Caption */}
            <div className="space-y-2">
              <Label>Opis *</Label>
              <Textarea
                value={updateCaption}
                onChange={(e) => setUpdateCaption(e.target.value)}
                placeholder="Opišite što se trenutno događa..."
                rows={3}
                className="focus:border-orange-300"
              />
            </div>

            {/* Photo Upload */}
            {updateType === 'photo' && (
              <div className="space-y-2">
                <Label>Fotografija</Label>
                <ImageUpload
                  variant="dropzone"
                  maxFiles={1}
                  bucket="pet-photos"
                  entityId={user.id}
                  onUploadComplete={(urls) => setUpdatePhotoUrls(urls)}
                />
              </div>
            )}

            <Button
              className="w-full bg-orange-500 hover:bg-orange-600 btn-hover"
              onClick={sendUpdate}
              disabled={!updateCaption.trim() || sendingUpdate}
            >
              {sendingUpdate ? 'Slanje...' : (
                <>
                  <Send className="h-4 w-4 mr-2" /> Pošalji
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Profile Edit Dialog */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Uredi profil</DialogTitle>
            <DialogDescription>Ažurirajte svoj sitter profil</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-center">
              <ImageUpload
                variant="avatar"
                bucket="avatars"
                entityId={user.id}
                currentImageUrl={user.avatar_url}
                fallbackText={user.name?.charAt(0) || '?'}
                onUploadComplete={(urls) => { /* TODO: update user avatar_url in DB */ }}
              />
            </div>
            <p className="text-center text-xs text-muted-foreground -mt-2">Profilna fotografija</p>
            <div className="space-y-2">
              <Label>Bio *</Label>
              <Textarea value={profileForm.bio} onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })} placeholder="Opišite se i svoje iskustvo s ljubimcima..." rows={4} className="focus:border-orange-300" />
            </div>
            <div className="space-y-2">
              <Label>Godine iskustva</Label>
              <Input type="number" value={profileForm.experience_years} onChange={(e) => setProfileForm({ ...profileForm, experience_years: e.target.value })} className="focus:border-orange-300" />
            </div>
            <div className="space-y-2">
              <Label>Grad</Label>
              <select value={profileForm.city} onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-orange-300">
                <option value="">Odaberite grad</option>
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Usluge *</Label>
              <div className="space-y-2">
                {(Object.entries(SERVICE_LABELS) as [ServiceType, string][]).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between p-3 rounded-xl border hover:border-orange-200 transition-colors">
                    <div className="flex items-center gap-2">
                      <Switch checked={profileForm.services.includes(key)} onCheckedChange={() => toggleService(key)} />
                      <span className="text-sm">{label}</span>
                    </div>
                    {profileForm.services.includes(key) && (
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          className="w-20 h-8 text-sm focus:border-orange-300"
                          placeholder="€"
                          value={profileForm.prices[key] || ''}
                          onChange={(e) => setProfileForm({
                            ...profileForm,
                            prices: { ...profileForm.prices, [key]: parseInt(e.target.value) || 0 }
                          })}
                        />
                        <span className="text-sm text-muted-foreground">€</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <Button onClick={saveProfile} className="w-full bg-orange-500 hover:bg-orange-600 btn-hover" disabled={loading}>
              {loading ? 'Spremanje...' : 'Spremi profil'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

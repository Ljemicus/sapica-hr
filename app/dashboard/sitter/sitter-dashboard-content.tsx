'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, addMonths, subMonths } from 'date-fns';
import { hr } from 'date-fns/locale';
import { Edit, Calendar, Star, DollarSign, ClipboardList, CheckCircle, XCircle, ChevronLeft, ChevronRight, User } from 'lucide-react';
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
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { StarRating } from '@/components/shared/star-rating';
import { createClient } from '@/lib/supabase/client';
import { STATUS_LABELS, SERVICE_LABELS, CITIES, type User as UserType, type SitterProfile, type Booking, type Review, type Availability, type BookingStatus, type ServiceType } from '@/lib/types';
import { toast } from 'sonner';

const statusColors: Record<BookingStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  accepted: 'bg-blue-100 text-blue-700',
  rejected: 'bg-red-100 text-red-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-700',
};

interface Props {
  user: UserType;
  profile: SitterProfile | null;
  bookings: (Booking & { owner: { name: string; avatar_url: string | null; email: string }; pet: { name: string; species: string; breed: string | null; special_needs: string | null } })[];
  reviews: (Review & { reviewer: { name: string; avatar_url: string | null } })[];
  availability: Availability[];
}

export function SitterDashboardContent({ user, profile, bookings, reviews, availability }: Props) {
  const [showProfileDialog, setShowProfileDialog] = useState(false);
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
    const data = {
      bio: profileForm.bio,
      experience_years: parseInt(profileForm.experience_years),
      services: profileForm.services,
      prices: profileForm.prices,
      city: profileForm.city,
      user_id: user.id,
    };

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

  // Calendar helpers
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDay = monthStart.getDay(); // 0 = Sunday

  // Earnings calculation
  const completedBookings = bookings.filter(b => b.status === 'completed');
  const totalEarnings = completedBookings.reduce((sum, b) => sum + b.total_price, 0);
  const thisMonthEarnings = completedBookings
    .filter(b => new Date(b.end_date).getMonth() === new Date().getMonth() && new Date(b.end_date).getFullYear() === new Date().getFullYear())
    .reduce((sum, b) => sum + b.total_price, 0);

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const upcomingBookings = bookings.filter(b => b.status === 'accepted' && new Date(b.start_date) >= new Date());

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <PageHeader title={`Bok, ${user.name.split(' ')[0]}!`} description="Upravljajte svojim sitter profilom" />

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-orange-500">{profile?.rating_avg?.toFixed(1) || '0.0'}</p>
            <p className="text-xs text-muted-foreground">Prosječna ocjena</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{profile?.review_count || 0}</p>
            <p className="text-xs text-muted-foreground">Recenzija</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{totalEarnings}€</p>
            <p className="text-xs text-muted-foreground">Ukupna zarada</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{pendingBookings.length}</p>
            <p className="text-xs text-muted-foreground">Na čekanju</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="bookings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="bookings" className="text-xs sm:text-sm gap-1"><ClipboardList className="h-4 w-4 hidden sm:block" /> Rezervacije</TabsTrigger>
          <TabsTrigger value="calendar" className="text-xs sm:text-sm gap-1"><Calendar className="h-4 w-4 hidden sm:block" /> Kalendar</TabsTrigger>
          <TabsTrigger value="profile" className="text-xs sm:text-sm gap-1"><User className="h-4 w-4 hidden sm:block" /> Profil</TabsTrigger>
          <TabsTrigger value="reviews" className="text-xs sm:text-sm gap-1"><Star className="h-4 w-4 hidden sm:block" /> Recenzije</TabsTrigger>
          <TabsTrigger value="earnings" className="text-xs sm:text-sm gap-1"><DollarSign className="h-4 w-4 hidden sm:block" /> Zarada</TabsTrigger>
        </TabsList>

        {/* BOOKINGS TAB */}
        <TabsContent value="bookings" className="space-y-4">
          {pendingBookings.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Zahtjevi na čekanju</h3>
              {pendingBookings.map((booking) => (
                <Card key={booking.id} className="border-yellow-200 bg-yellow-50/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={booking.owner?.avatar_url || ''} />
                          <AvatarFallback className="bg-orange-100 text-orange-600">{booking.owner?.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{booking.owner?.name}</p>
                          <p className="text-sm text-muted-foreground">{SERVICE_LABELS[booking.service_type as ServiceType]} · {booking.pet?.name} ({booking.pet?.species === 'dog' ? 'Pas' : 'Mačka'})</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(booking.start_date), 'd. MMM', { locale: hr })} — {format(new Date(booking.end_date), 'd. MMM yyyy.', { locale: hr })}</p>
                          {booking.pet?.special_needs && <p className="text-xs text-amber-600 mt-1">⚠️ {booking.pet.special_needs}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-orange-500">{booking.total_price}€</span>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => updateBookingStatus(booking.id, 'accepted')}>
                          <CheckCircle className="h-4 w-4 mr-1" /> Prihvati
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-500" onClick={() => updateBookingStatus(booking.id, 'rejected')}>
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
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Nadolazeće</h3>
              {upcomingBookings.map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={booking.owner?.avatar_url || ''} />
                          <AvatarFallback className="bg-orange-100 text-orange-600">{booking.owner?.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{booking.owner?.name}</p>
                          <p className="text-sm text-muted-foreground">{SERVICE_LABELS[booking.service_type as ServiceType]} · {booking.pet?.name}</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(booking.start_date), 'd. MMM', { locale: hr })} — {format(new Date(booking.end_date), 'd. MMM yyyy.', { locale: hr })}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={statusColors.accepted}>{STATUS_LABELS.accepted}</Badge>
                        <p className="font-semibold text-orange-500 mt-1">{booking.total_price}€</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {bookings.filter(b => b.status !== 'pending' && !(b.status === 'accepted' && new Date(b.start_date) >= new Date())).length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Sve rezervacije</h3>
              {bookings.filter(b => b.status !== 'pending' && !(b.status === 'accepted' && new Date(b.start_date) >= new Date())).map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={booking.owner?.avatar_url || ''} />
                          <AvatarFallback className="bg-orange-100 text-orange-600">{booking.owner?.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{booking.owner?.name}</p>
                          <p className="text-sm text-muted-foreground">{SERVICE_LABELS[booking.service_type as ServiceType]} · {booking.pet?.name}</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(booking.start_date), 'd. MMM', { locale: hr })} — {format(new Date(booking.end_date), 'd. MMM yyyy.', { locale: hr })}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={statusColors[booking.status as BookingStatus]}>{STATUS_LABELS[booking.status as BookingStatus]}</Badge>
                        <p className="font-semibold text-orange-500 mt-1">{booking.total_price}€</p>
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
        </TabsContent>

        {/* CALENDAR TAB */}
        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Dostupnost</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="font-medium min-w-[140px] text-center">
                    {format(currentMonth, 'LLLL yyyy.', { locale: hr })}
                  </span>
                  <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Kliknite na dan da označite dostupnost</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Ned', 'Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub'].map((day) => (
                  <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
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
                      className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                        isPast
                          ? 'text-gray-300 cursor-not-allowed'
                          : isAvailable
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      } ${isToday(day) ? 'ring-2 ring-orange-500' : ''}`}
                    >
                      {day.getDate()}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 rounded bg-green-500" /> Dostupan
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 rounded bg-gray-100" /> Nedostupan
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PROFILE TAB */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Moj profil</CardTitle>
                <Button onClick={() => setShowProfileDialog(true)} variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-1" /> Uredi
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile ? (
                <>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Bio</h4>
                    <p className="text-sm">{profile.bio || 'Nije postavljeno'}</p>
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
                        <Badge key={s} variant="secondary">
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
                    {profile.verified && <Badge className="bg-blue-500">✓ Verificiran</Badge>}
                    {profile.superhost && <Badge className="bg-amber-500">★ Superhost</Badge>}
                  </div>
                </>
              ) : (
                <EmptyState
                  icon={User}
                  title="Profil nije postavljen"
                  description="Postavite svoj sitter profil da biste primali rezervacije."
                  action={<Button onClick={() => setShowProfileDialog(true)} className="bg-orange-500 hover:bg-orange-600">Postavi profil</Button>}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* REVIEWS TAB */}
        <TabsContent value="reviews" className="space-y-4">
          {reviews.length === 0 ? (
            <EmptyState icon={Star} title="Još nema recenzija" description="Recenzije od vaših klijenata će se pojaviti ovdje." />
          ) : (
            reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={review.reviewer?.avatar_url || ''} />
                      <AvatarFallback className="bg-orange-100 text-orange-600">{review.reviewer?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{review.reviewer?.name}</span>
                        <StarRating rating={review.rating} size="sm" />
                      </div>
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                      <p className="text-xs text-muted-foreground mt-1">{format(new Date(review.created_at), 'd. MMMM yyyy.', { locale: hr })}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* EARNINGS TAB */}
        <TabsContent value="earnings">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-sm text-muted-foreground mb-1">Ovaj mjesec</p>
                <p className="text-3xl font-bold text-green-600">{thisMonthEarnings}€</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-sm text-muted-foreground mb-1">Ukupno</p>
                <p className="text-3xl font-bold text-green-600">{totalEarnings}€</p>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Završene rezervacije</CardTitle>
            </CardHeader>
            <CardContent>
              {completedBookings.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Nema završenih rezervacija</p>
              ) : (
                <div className="space-y-3">
                  {completedBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="font-medium text-sm">{booking.owner?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {SERVICE_LABELS[booking.service_type as ServiceType]} · {format(new Date(booking.end_date), 'd. MMM yyyy.', { locale: hr })}
                        </p>
                      </div>
                      <span className="font-semibold text-green-600">+{booking.total_price}€</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Profile Edit Dialog */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Uredi profil</DialogTitle>
            <DialogDescription>Ažurirajte svoj sitter profil</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Bio *</Label>
              <Textarea value={profileForm.bio} onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })} placeholder="Opišite se i svoje iskustvo s ljubimcima..." rows={4} />
            </div>
            <div className="space-y-2">
              <Label>Godine iskustva</Label>
              <Input type="number" value={profileForm.experience_years} onChange={(e) => setProfileForm({ ...profileForm, experience_years: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Grad</Label>
              <select value={profileForm.city} onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">Odaberite grad</option>
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Usluge *</Label>
              <div className="space-y-2">
                {(Object.entries(SERVICE_LABELS) as [ServiceType, string][]).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between p-2 rounded border">
                    <div className="flex items-center gap-2">
                      <Switch checked={profileForm.services.includes(key)} onCheckedChange={() => toggleService(key)} />
                      <span className="text-sm">{label}</span>
                    </div>
                    {profileForm.services.includes(key) && (
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          className="w-20 h-8 text-sm"
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
            <Button onClick={saveProfile} className="w-full bg-orange-500 hover:bg-orange-600" disabled={loading}>
              {loading ? 'Spremanje...' : 'Spremi profil'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

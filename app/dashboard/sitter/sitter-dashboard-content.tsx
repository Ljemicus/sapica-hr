'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format, addMonths, subMonths } from 'date-fns';
import { hr } from 'date-fns/locale';
import { Calendar, Star, DollarSign, ClipboardList, User, BarChart3 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { STATUS_LABELS, type User as UserType, type SitterProfile, type Booking, type Review, type Availability, type BookingStatus, type ServiceType, type PetUpdate, type UpdateType } from '@/lib/types';
import { toast } from 'sonner';
import { SitterDashboardStats } from './components/sitter-dashboard-stats';
import { SitterBookingsTab } from './components/sitter-bookings-tab';
import { SitterCalendarTab } from './components/sitter-calendar-tab';
import { SitterAnalyticsTab } from './components/sitter-analytics-tab';
import { SitterProfileTab } from './components/sitter-profile-tab';
import { SitterReviewsTab } from './components/sitter-reviews-tab';
import { SitterEarningsTab } from './components/sitter-earnings-tab';
import { SitterDashboardDialogs } from './components/sitter-dashboard-dialogs';
import { SitterOnboardingWizard } from './components/sitter-onboarding-wizard';

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

  // Check if profile is incomplete (new sitter)
  const isNewSitter = !profile || !profile.bio || profile.bio.length < 50 || profile.services.length === 0;

  const availableDates = new Set(availability.filter((a) => a.available).map((a) => a.date));

  const toggleService = (service: ServiceType) => {
    const services = profileForm.services.includes(service)
      ? profileForm.services.filter((s) => s !== service)
      : [...profileForm.services, service];
    setProfileForm({ ...profileForm, services });
  };

  const saveProfile = async () => {
    if (!profileForm.bio || profileForm.services.length === 0) {
      toast.error('Ispunite bio i odaberite barem jednu uslugu');
      return;
    }
    setLoading(true);
    const response = await fetch('/api/sitter-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bio: profileForm.bio,
        experience_years: parseInt(profileForm.experience_years),
        services: profileForm.services,
        prices: profileForm.prices,
        city: profileForm.city,
      }),
    });

    if (!response.ok) toast.error('Greška pri spremanju profila');
    else {
      toast.success('Profil spremljen!');
      setShowProfileDialog(false);
      router.refresh();
    }
    setLoading(false);
  };

  const updateBookingStatus = async (bookingId: string, status: BookingStatus) => {
    const response = await fetch(`/api/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) toast.error('Greška pri ažuriranju statusa');
    else {
      toast.success(`Rezervacija ${STATUS_LABELS[status].toLowerCase()}`);
      router.refresh();
    }
  };

  const toggleAvailability = async (dateStr: string) => {
    const isAvailable = availableDates.has(dateStr);
    const response = await fetch('/api/availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dates: [dateStr], available: !isAvailable }),
    });
    if (!response.ok) {
      toast.error('Greška pri ažuriranju dostupnosti');
      return;
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
    const response = await fetch('/api/pet-updates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        booking_id: updateBookingId,
        type: updateType,
        emoji: updateEmoji,
        caption: updateCaption,
        photo_url: updatePhotoUrls[0] || null,
      }),
    });

    if (!response.ok) {
      toast.error('Greška pri slanju ažuriranja');
      setSendingUpdate(false);
      return;
    }
    const data = await response.json();
    if (data) {
      setSentUpdates((prev) => [data as PetUpdate, ...prev].slice(0, 5));
    }

    toast.success('Ažuriranje poslano! Vlasnik će biti obaviješten.');
    setShowUpdateDialog(false);
    setSendingUpdate(false);
  };

  const completedBookings = bookings.filter((b) => b.status === 'completed');
  const totalEarnings = completedBookings.reduce((sum, b) => sum + b.total_price, 0);
  const thisMonthEarnings = completedBookings
    .filter((b) => new Date(b.end_date).getMonth() === new Date().getMonth() && new Date(b.end_date).getFullYear() === new Date().getFullYear())
    .reduce((sum, b) => sum + b.total_price, 0);

  const pendingBookings = bookings.filter((b) => b.status === 'pending');
  const upcomingBookings = bookings.filter((b) => b.status === 'accepted' && new Date(b.start_date) >= new Date());

  const monthlyEarnings: { month: string; amount: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthStr = format(d, 'MMM', { locale: hr });
    const amount = completedBookings
      .filter((b) => {
        const bd = new Date(b.end_date);
        return bd.getMonth() === d.getMonth() && bd.getFullYear() === d.getFullYear();
      })
      .reduce((sum, b) => sum + b.total_price, 0);
    monthlyEarnings.push({ month: monthStr, amount });
  }
  const maxEarning = Math.max(...monthlyEarnings.map((e) => e.amount), 1);

  return (
    <>
      {isNewSitter && <SitterOnboardingWizard />}
      <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-3xl font-bold tracking-tight">Bok, {user.name.split(' ')[0]}!</h1>
        <p className="text-muted-foreground mt-1">Upravljajte rezervacijama, dostupnošću i profilom bez lutanja po sekcijama.</p>
      </div>

      <div className="rounded-2xl border bg-gradient-to-r from-orange-50 to-amber-50 p-4 mb-6 animate-fade-in-up delay-300">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-foreground">Što traži pažnju?</p>
            <p className="text-sm text-muted-foreground">Brzo reagirajte na nove upite, održavajte kalendar ažurnim i šaljite kratke updateove vlasnicima.</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{pendingBookings.length} na čekanju</span>
            <span>•</span>
            <span>{upcomingBookings.length} nadolazećih</span>
            <span>•</span>
            <span>{reviews.length} recenzija</span>
          </div>
        </div>
      </div>

      <SitterDashboardStats profile={profile} totalEarnings={totalEarnings} pendingCount={pendingBookings.length} />

      <Tabs defaultValue="bookings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 h-12">
          <TabsTrigger value="bookings" className="text-xs sm:text-sm gap-1 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700"><ClipboardList className="h-4 w-4 hidden sm:block" /> Rezervacije</TabsTrigger>
          <TabsTrigger value="calendar" className="text-xs sm:text-sm gap-1 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700"><Calendar className="h-4 w-4 hidden sm:block" /> Kalendar</TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs sm:text-sm gap-1 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700"><BarChart3 className="h-4 w-4 hidden sm:block" /> Analitika</TabsTrigger>
          <TabsTrigger value="profile" className="text-xs sm:text-sm gap-1 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700"><User className="h-4 w-4 hidden sm:block" /> Profil</TabsTrigger>
          <TabsTrigger value="reviews" className="text-xs sm:text-sm gap-1 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700"><Star className="h-4 w-4 hidden sm:block" /> Recenzije</TabsTrigger>
          <TabsTrigger value="earnings" className="text-xs sm:text-sm gap-1 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700"><DollarSign className="h-4 w-4 hidden sm:block" /> Zarada</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings">
          <SitterBookingsTab
            bookings={bookings}
            pendingBookings={pendingBookings}
            upcomingBookings={upcomingBookings}
            sentUpdates={sentUpdates}
            onUpdateStatus={updateBookingStatus}
            onOpenUpdateDialog={openUpdateDialog}
          />
        </TabsContent>

        <TabsContent value="calendar" className="animate-fade-in">
          <SitterCalendarTab
            currentMonth={currentMonth}
            availableDates={availableDates}
            onPreviousMonth={() => setCurrentMonth(subMonths(currentMonth, 1))}
            onNextMonth={() => setCurrentMonth(addMonths(currentMonth, 1))}
            onToggleAvailability={toggleAvailability}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <SitterAnalyticsTab
            bookings={bookings}
            completedBookingsCount={completedBookings.length}
            pendingBookingsCount={pendingBookings.length}
            upcomingBookingsCount={upcomingBookings.length}
            profile={profile}
          />
        </TabsContent>

        <TabsContent value="profile" className="animate-fade-in">
          <SitterProfileTab profile={profile} onEdit={() => setShowProfileDialog(true)} />
        </TabsContent>

        <TabsContent value="reviews">
          <SitterReviewsTab reviews={reviews} />
        </TabsContent>

        <TabsContent value="earnings">
          <SitterEarningsTab
            thisMonthEarnings={thisMonthEarnings}
            totalEarnings={totalEarnings}
            monthlyEarnings={monthlyEarnings}
            maxEarning={maxEarning}
            completedBookings={completedBookings}
          />
        </TabsContent>
      </Tabs>

      <SitterDashboardDialogs
        showUpdateDialog={showUpdateDialog}
        onShowUpdateDialogChange={setShowUpdateDialog}
        showProfileDialog={showProfileDialog}
        onShowProfileDialogChange={setShowProfileDialog}
        updateType={updateType}
        onUpdateTypeChange={setUpdateType}
        updateEmoji={updateEmoji}
        onUpdateEmojiChange={setUpdateEmoji}
        updateCaption={updateCaption}
        onUpdateCaptionChange={setUpdateCaption}
        updatePhotoUrls={updatePhotoUrls}
        onUpdatePhotoUrlsChange={setUpdatePhotoUrls}
        sendingUpdate={sendingUpdate}
        onSendUpdate={sendUpdate}
        loading={loading}
        onSaveProfile={saveProfile}
        profileForm={profileForm}
        onProfileFormChange={setProfileForm}
        onToggleService={toggleService}
        user={user}
        emojiOptions={EMOJI_OPTIONS}
        onAvatarUploaded={() => router.refresh()}
      />
    </div>
    </>
  );
}

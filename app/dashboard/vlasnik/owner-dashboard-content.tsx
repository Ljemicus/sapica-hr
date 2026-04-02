'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Calendar, CalendarCheck, HeartHandshake, PawPrint, Plus, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type Pet, type Species } from '@/lib/types';
import { toast } from 'sonner';
import { OwnerDashboardStats } from './components/owner-dashboard-stats';
import { OwnerActiveWalks } from './components/owner-active-walks';
import { OwnerPetsTab } from './components/owner-pets-tab';
import { OwnerBookingsTab } from './components/owner-bookings-tab';
import { OwnerReviewsTab } from './components/owner-reviews-tab';
import { OwnerDashboardDialogs } from './components/owner-dashboard-dialogs';
import type { OwnerDashboardBooking, OwnerDashboardProps } from './components/owner-dashboard-types';

export function OwnerDashboardContent({ user, pets, bookings, reviewedBookingIds, activeWalks }: OwnerDashboardProps) {
  const [showPetDialog, setShowPetDialog] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewBooking, setReviewBooking] = useState<OwnerDashboardBooking | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [petForm, setPetForm] = useState({ name: '', species: 'dog' as Species, breed: '', age: '', weight: '', special_needs: '', photo_url: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const openAddPet = () => {
    setEditingPet(null);
    setPetForm({ name: '', species: 'dog', breed: '', age: '', weight: '', special_needs: '', photo_url: '' });
    setShowPetDialog(true);
  };

  const openEditPet = (pet: Pet) => {
    setEditingPet(pet);
    setPetForm({
      name: pet.name,
      species: pet.species,
      breed: pet.breed || '',
      age: pet.age?.toString() || '',
      weight: pet.weight?.toString() || '',
      special_needs: pet.special_needs || '',
      photo_url: pet.photo_url || '',
    });
    setShowPetDialog(true);
  };

  const savePet = async () => {
    if (!petForm.name) {
      toast.error('Unesite ime ljubimca');
      return;
    }
    setLoading(true);
    const data = {
      name: petForm.name,
      species: petForm.species,
      breed: petForm.breed || null,
      age: petForm.age ? parseInt(petForm.age) : null,
      weight: petForm.weight ? parseFloat(petForm.weight) : null,
      special_needs: petForm.special_needs || null,
      photo_url: petForm.photo_url || null,
      owner_id: user.id,
    };

    let success = false;
    if (editingPet) {
      const response = await fetch(`/api/pets/${editingPet.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) toast.error('Greška pri ažuriranju');
      else { toast.success('Ljubimac ažuriran!'); success = true; }
    } else {
      const response = await fetch('/api/pets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) toast.error('Greška pri dodavanju');
      else { toast.success('Ljubimac dodan!'); success = true; }
    }
    setLoading(false);
    if (success) {
      setShowPetDialog(false);
      router.refresh();
    }
  };

  const deletePet = async (petId: string) => {
    if (!confirm('Jeste li sigurni da želite obrisati ovog ljubimca?')) return;
    const response = await fetch(`/api/pets/${petId}`, { method: 'DELETE' });
    if (!response.ok) toast.error('Greška pri brisanju');
    else {
      toast.success('Ljubimac obrisan');
      router.refresh();
    }
  };

  const cancelBooking = async (bookingId: string) => {
    if (!confirm('Jeste li sigurni da želite otkazati ovu rezervaciju?')) return;
    const response = await fetch(`/api/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'cancelled' }),
    });
    if (!response.ok) toast.error('Greška pri otkazivanju');
    else {
      toast.success('Rezervacija otkazana');
      router.refresh();
    }
  };

  const submitReview = async () => {
    if (!reviewBooking || !reviewComment.trim()) {
      toast.error('Unesite komentar');
      return;
    }
    setLoading(true);
    const response = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ booking_id: reviewBooking.id, rating: reviewRating, comment: reviewComment }),
    });
    if (!response.ok) toast.error('Greška pri slanju recenzije');
    else {
      toast.success('Recenzija poslana!');
      setShowReviewDialog(false);
      router.refresh();
    }
    setLoading(false);
  };

  const unreviewedBookings = bookings.filter((b) => b.status === 'completed' && !reviewedBookingIds.includes(b.id));
  const activeBookings = bookings.filter((b) => b.status === 'accepted' || b.status === 'pending').length;
  const completedCount = bookings.filter((b) => b.status === 'completed').length;
  const totalSpent = bookings.filter((b) => b.status === 'completed').reduce((sum, b) => sum + b.total_price, 0);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-3xl font-bold tracking-tight">Bok, {user.name.split(' ')[0]}!</h1>
        <p className="text-muted-foreground mt-1">Upravljajte svojim ljubimcima i rezervacijama</p>
      </div>

      <OwnerDashboardStats
        petsCount={pets.length}
        activeBookingsCount={activeBookings}
        completedCount={completedCount}
        totalSpent={totalSpent}
      />

      <div className="flex gap-3 mb-8 animate-fade-in-up delay-500">
        <Button onClick={openAddPet} className="bg-orange-500 hover:bg-orange-600 btn-hover shadow-sm">
          <Plus className="h-4 w-4 mr-1" /> Dodaj ljubimca
        </Button>
        <a href="/pretraga">
          <Button variant="outline" className="hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200">
            Pretraži sittere <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </a>
        <a href="/dashboard/vlasnik/rezervacije">
          <Button variant="outline" className="hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200">
            <CalendarCheck className="h-4 w-4 mr-1" /> Rezervacije
          </Button>
        </a>
        <a href="/dashboard/adoption">
          <Button variant="outline" className="hover:bg-pink-50 hover:text-pink-600 hover:border-pink-200">
            <HeartHandshake className="h-4 w-4 mr-1" /> Udomljavanje
          </Button>
        </a>
      </div>

      <OwnerActiveWalks activeWalks={activeWalks} />

      <Tabs defaultValue="pets" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-12">
          <TabsTrigger value="pets" className="gap-1.5 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700"><PawPrint className="h-4 w-4" /> Ljubimci</TabsTrigger>
          <TabsTrigger value="bookings" className="gap-1.5 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700"><Calendar className="h-4 w-4" /> Rezervacije</TabsTrigger>
          <TabsTrigger value="reviews" className="gap-1.5 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700">
            <Star className="h-4 w-4" /> Recenzije
            {unreviewedBookings.length > 0 && (
              <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center bg-orange-500 text-xs">{unreviewedBookings.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pets" className="space-y-4 animate-fade-in">
          <OwnerPetsTab pets={pets} onAddPet={openAddPet} onEditPet={openEditPet} onDeletePet={deletePet} />
        </TabsContent>

        <TabsContent value="bookings" className="space-y-4 animate-fade-in">
          <OwnerBookingsTab bookings={bookings} onCancelBooking={cancelBooking} />
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4 animate-fade-in">
          <OwnerReviewsTab
            unreviewedBookings={unreviewedBookings}
            onReview={(booking) => {
              setReviewBooking(booking);
              setReviewRating(5);
              setReviewComment('');
              setShowReviewDialog(true);
            }}
          />
        </TabsContent>
      </Tabs>

      <OwnerDashboardDialogs
        showPetDialog={showPetDialog}
        onShowPetDialogChange={setShowPetDialog}
        editingPet={editingPet}
        petForm={petForm}
        onPetFormChange={setPetForm}
        onSavePet={savePet}
        showReviewDialog={showReviewDialog}
        onShowReviewDialogChange={setShowReviewDialog}
        reviewBooking={reviewBooking}
        reviewRating={reviewRating}
        onReviewRatingChange={setReviewRating}
        reviewComment={reviewComment}
        onReviewCommentChange={setReviewComment}
        onSubmitReview={submitReview}
        loading={loading}
      />
    </div>
  );
}

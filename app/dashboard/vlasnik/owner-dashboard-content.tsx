'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { hr } from 'date-fns/locale';
import { Plus, PawPrint, Calendar, Star, Trash2, Edit, Dog, Cat, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { StarRating } from '@/components/shared/star-rating';
import { createClient } from '@/lib/supabase/client';
import { STATUS_LABELS, SPECIES_LABELS, SERVICE_LABELS, type User, type Pet, type Booking, type BookingStatus, type ServiceType, type Species } from '@/lib/types';
import { toast } from 'sonner';

const speciesIcons: Record<Species, React.ElementType> = { dog: Dog, cat: Cat, other: HelpCircle };
const statusColors: Record<BookingStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  accepted: 'bg-blue-100 text-blue-700',
  rejected: 'bg-red-100 text-red-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-700',
};

interface Props {
  user: User;
  pets: Pet[];
  bookings: (Booking & { sitter: { name: string; avatar_url: string | null }; pet: { name: string; species: string } })[];
  reviewedBookingIds: string[];
}

export function OwnerDashboardContent({ user, pets, bookings, reviewedBookingIds }: Props) {
  const [showPetDialog, setShowPetDialog] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewBooking, setReviewBooking] = useState<Props['bookings'][0] | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [petForm, setPetForm] = useState({ name: '', species: 'dog' as Species, breed: '', age: '', weight: '', special_needs: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const openAddPet = () => {
    setEditingPet(null);
    setPetForm({ name: '', species: 'dog', breed: '', age: '', weight: '', special_needs: '' });
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
    });
    setShowPetDialog(true);
  };

  const savePet = async () => {
    if (!petForm.name) { toast.error('Unesite ime ljubimca'); return; }
    setLoading(true);
    const data = {
      name: petForm.name,
      species: petForm.species,
      breed: petForm.breed || null,
      age: petForm.age ? parseInt(petForm.age) : null,
      weight: petForm.weight ? parseFloat(petForm.weight) : null,
      special_needs: petForm.special_needs || null,
      owner_id: user.id,
    };

    if (editingPet) {
      const { error } = await supabase.from('pets').update(data).eq('id', editingPet.id);
      if (error) toast.error('Greška pri ažuriranju');
      else toast.success('Ljubimac ažuriran!');
    } else {
      const { error } = await supabase.from('pets').insert(data);
      if (error) toast.error('Greška pri dodavanju');
      else toast.success('Ljubimac dodan!');
    }
    setShowPetDialog(false);
    setLoading(false);
    router.refresh();
  };

  const deletePet = async (petId: string) => {
    if (!confirm('Jeste li sigurni da želite obrisati ovog ljubimca?')) return;
    const { error } = await supabase.from('pets').delete().eq('id', petId);
    if (error) toast.error('Greška pri brisanju');
    else { toast.success('Ljubimac obrisan'); router.refresh(); }
  };

  const cancelBooking = async (bookingId: string) => {
    if (!confirm('Jeste li sigurni da želite otkazati ovu rezervaciju?')) return;
    const { error } = await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', bookingId);
    if (error) toast.error('Greška pri otkazivanju');
    else { toast.success('Rezervacija otkazana'); router.refresh(); }
  };

  const submitReview = async () => {
    if (!reviewBooking || !reviewComment.trim()) { toast.error('Unesite komentar'); return; }
    setLoading(true);
    const { error } = await supabase.from('reviews').insert({
      booking_id: reviewBooking.id,
      reviewer_id: user.id,
      reviewee_id: reviewBooking.sitter_id,
      rating: reviewRating,
      comment: reviewComment,
    });
    if (error) toast.error('Greška pri slanju recenzije');
    else { toast.success('Recenzija poslana!'); setShowReviewDialog(false); router.refresh(); }
    setLoading(false);
  };

  const unreviewedBookings = bookings.filter(b => b.status === 'completed' && !reviewedBookingIds.includes(b.id));

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <PageHeader title={`Bok, ${user.name.split(' ')[0]}! 👋`} description="Upravljajte svojim ljubimcima i rezervacijama" />

      <Tabs defaultValue="pets" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pets" className="gap-1"><PawPrint className="h-4 w-4" /> Ljubimci</TabsTrigger>
          <TabsTrigger value="bookings" className="gap-1"><Calendar className="h-4 w-4" /> Rezervacije</TabsTrigger>
          <TabsTrigger value="reviews" className="gap-1">
            <Star className="h-4 w-4" /> Recenzije
            {unreviewedBookings.length > 0 && (
              <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center bg-orange-500 text-xs">{unreviewedBookings.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* PETS TAB */}
        <TabsContent value="pets" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={openAddPet} className="bg-orange-500 hover:bg-orange-600">
              <Plus className="h-4 w-4 mr-1" /> Dodaj ljubimca
            </Button>
          </div>
          {pets.length === 0 ? (
            <EmptyState icon={PawPrint} title="Nemate dodanih ljubimaca" description="Dodajte svog prvog ljubimca da biste mogli napraviti rezervaciju." action={<Button onClick={openAddPet} className="bg-orange-500 hover:bg-orange-600"><Plus className="h-4 w-4 mr-1" /> Dodaj ljubimca</Button>} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {pets.map((pet) => {
                const Icon = speciesIcons[pet.species];
                return (
                  <Card key={pet.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                          <Icon className="h-6 w-6 text-orange-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">{pet.name}</h3>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditPet(pet)}>
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => deletePet(pet.id)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{SPECIES_LABELS[pet.species]}{pet.breed ? ` · ${pet.breed}` : ''}</p>
                          <div className="flex gap-2 mt-1 text-xs text-muted-foreground">
                            {pet.age && <span>{pet.age} god.</span>}
                            {pet.weight && <span>{pet.weight} kg</span>}
                          </div>
                          {pet.special_needs && (
                            <p className="text-xs text-amber-600 mt-1">⚠️ {pet.special_needs}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* BOOKINGS TAB */}
        <TabsContent value="bookings" className="space-y-4">
          {bookings.length === 0 ? (
            <EmptyState icon={Calendar} title="Nemate rezervacija" description="Pretražite sittere i napravite svoju prvu rezervaciju." action={<a href="/pretraga"><Button className="bg-orange-500 hover:bg-orange-600">Pretraži sittere</Button></a>} />
          ) : (
            <div className="space-y-3">
              {bookings.map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={booking.sitter?.avatar_url || ''} />
                          <AvatarFallback className="bg-orange-100 text-orange-600">{booking.sitter?.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{booking.sitter?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {SERVICE_LABELS[booking.service_type as ServiceType]} · {booking.pet?.name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-2">
                        <Badge className={statusColors[booking.status as BookingStatus]}>
                          {STATUS_LABELS[booking.status as BookingStatus]}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t text-sm">
                      <span className="text-muted-foreground">
                        {format(new Date(booking.start_date), 'd. MMM', { locale: hr })} — {format(new Date(booking.end_date), 'd. MMM yyyy.', { locale: hr })}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-orange-500">{booking.total_price}€</span>
                        {(booking.status === 'pending' || booking.status === 'accepted') && (
                          <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600" onClick={() => cancelBooking(booking.id)}>
                            Otkaži
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* REVIEWS TAB */}
        <TabsContent value="reviews" className="space-y-4">
          {unreviewedBookings.length === 0 ? (
            <EmptyState icon={Star} title="Sve je recenzirano!" description="Nemate završenih rezervacija koje čekaju recenziju." />
          ) : (
            <div className="space-y-3">
              {unreviewedBookings.map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={booking.sitter?.avatar_url || ''} />
                          <AvatarFallback className="bg-orange-100 text-orange-600">{booking.sitter?.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{booking.sitter?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {SERVICE_LABELS[booking.service_type as ServiceType]} · {format(new Date(booking.start_date), 'd. MMM yyyy.', { locale: hr })}
                          </p>
                        </div>
                      </div>
                      <Button
                        className="bg-orange-500 hover:bg-orange-600"
                        size="sm"
                        onClick={() => { setReviewBooking(booking); setReviewRating(5); setReviewComment(''); setShowReviewDialog(true); }}
                      >
                        <Star className="h-4 w-4 mr-1" /> Ostavi recenziju
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Pet Dialog */}
      <Dialog open={showPetDialog} onOpenChange={setShowPetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPet ? 'Uredi ljubimca' : 'Dodaj ljubimca'}</DialogTitle>
            <DialogDescription>Unesite podatke o vašem ljubimcu</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Ime *</Label>
              <Input value={petForm.name} onChange={(e) => setPetForm({ ...petForm, name: e.target.value })} placeholder="Ime ljubimca" />
            </div>
            <div className="space-y-2">
              <Label>Vrsta *</Label>
              <select value={petForm.species} onChange={(e) => setPetForm({ ...petForm, species: e.target.value as Species })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="dog">🐕 Pas</option>
                <option value="cat">🐈 Mačka</option>
                <option value="other">🐾 Ostalo</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Pasmina</Label>
              <Input value={petForm.breed} onChange={(e) => setPetForm({ ...petForm, breed: e.target.value })} placeholder="npr. Labrador" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Dob (godine)</Label>
                <Input type="number" value={petForm.age} onChange={(e) => setPetForm({ ...petForm, age: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Težina (kg)</Label>
                <Input type="number" value={petForm.weight} onChange={(e) => setPetForm({ ...petForm, weight: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Posebne potrebe</Label>
              <Textarea value={petForm.special_needs} onChange={(e) => setPetForm({ ...petForm, special_needs: e.target.value })} placeholder="Alergije, lijekovi, posebne navike..." />
            </div>
            <Button onClick={savePet} className="w-full bg-orange-500 hover:bg-orange-600" disabled={loading}>
              {loading ? 'Spremanje...' : editingPet ? 'Spremi promjene' : 'Dodaj ljubimca'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ostavi recenziju</DialogTitle>
            <DialogDescription>Za: {reviewBooking?.sitter?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Ocjena</Label>
              <div className="flex justify-center py-2">
                <StarRating rating={reviewRating} size="lg" interactive onRatingChange={setReviewRating} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Komentar</Label>
              <Textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} placeholder="Opišite vaše iskustvo..." rows={4} />
            </div>
            <Button onClick={submitReview} className="w-full bg-orange-500 hover:bg-orange-600" disabled={loading}>
              {loading ? 'Šaljem...' : 'Pošalji recenziju'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

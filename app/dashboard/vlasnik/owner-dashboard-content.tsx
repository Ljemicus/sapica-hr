'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { hr } from 'date-fns/locale';
import Link from 'next/link';
import { Plus, PawPrint, Calendar, Star, Trash2, Edit, Dog, Cat, HelpCircle, ArrowRight, Clock, MapPin, FileHeart, CalendarCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { EmptyState } from '@/components/shared/empty-state';
import { StarRating } from '@/components/shared/star-rating';
import { ImageUpload } from '@/components/shared/image-upload';
import { createClient } from '@/lib/supabase/client';
import { STATUS_LABELS, SPECIES_LABELS, SERVICE_LABELS, type User, type Pet, type Booking, type BookingStatus, type ServiceType, type Species, type Walk } from '@/lib/types';
import { toast } from 'sonner';

const speciesIcons: Record<Species, React.ElementType> = { dog: Dog, cat: Cat, other: HelpCircle };
const speciesGradients: Record<Species, string> = {
  dog: 'from-orange-400 to-amber-300',
  cat: 'from-purple-400 to-pink-300',
  other: 'from-blue-400 to-cyan-300',
};
const statusColors: Record<BookingStatus, string> = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  accepted: 'bg-blue-50 text-blue-700 border-blue-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-gray-50 text-gray-700 border-gray-200',
};
const statusDotColors: Record<BookingStatus, string> = {
  pending: 'bg-yellow-400',
  accepted: 'bg-blue-400',
  rejected: 'bg-red-400',
  completed: 'bg-green-400',
  cancelled: 'bg-gray-400',
};

interface Props {
  user: User;
  pets: Pet[];
  bookings: (Booking & { sitter: { name: string; avatar_url: string | null }; pet: { name: string; species: string } })[];
  reviewedBookingIds: string[];
  activeWalks: (Walk & { sitterName: string; petName: string })[];
}

export function OwnerDashboardContent({ user, pets, bookings, reviewedBookingIds, activeWalks }: Props) {
  const [showPetDialog, setShowPetDialog] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewBooking, setReviewBooking] = useState<Props['bookings'][0] | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [petForm, setPetForm] = useState({ name: '', species: 'dog' as Species, breed: '', age: '', weight: '', special_needs: '', photo_url: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const openAddPet = () => {
    setEditingPet(null);
    setPetForm({ name: '', species: 'dog', breed: '', age: '', weight: '', special_needs: '', photo_url: '' });
    setShowPetDialog(true);
  };

  const openEditPet = (pet: Pet) => {
    setEditingPet(pet);
    setPetForm({ name: pet.name, species: pet.species, breed: pet.breed || '', age: pet.age?.toString() || '', weight: pet.weight?.toString() || '', special_needs: pet.special_needs || '', photo_url: (pet as unknown as Record<string, unknown>).photo_url as string || '' });
    setShowPetDialog(true);
  };

  const savePet = async () => {
    if (!petForm.name) { toast.error('Unesite ime ljubimca'); return; }
    setLoading(true);
    const data = { name: petForm.name, species: petForm.species, breed: petForm.breed || null, age: petForm.age ? parseInt(petForm.age) : null, weight: petForm.weight ? parseFloat(petForm.weight) : null, special_needs: petForm.special_needs || null, photo_url: petForm.photo_url || null, owner_id: user.id };

    if (editingPet) {
      const response = await fetch(`/api/pets/${editingPet.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) toast.error('Greška pri ažuriranju');
      else toast.success('Ljubimac ažuriran!');
    } else {
      const response = await fetch('/api/pets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) toast.error('Greška pri dodavanju');
      else toast.success('Ljubimac dodan!');
    }
    setShowPetDialog(false);
    setLoading(false);
    router.refresh();
  };

  const deletePet = async (petId: string) => {
    if (!confirm('Jeste li sigurni da želite obrisati ovog ljubimca?')) return;
    const response = await fetch(`/api/pets/${petId}`, { method: 'DELETE' });
    if (!response.ok) toast.error('Greška pri brisanju');
    else { toast.success('Ljubimac obrisan'); router.refresh(); }
  };

  const cancelBooking = async (bookingId: string) => {
    if (!confirm('Jeste li sigurni da želite otkazati ovu rezervaciju?')) return;
    const response = await fetch(`/api/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'cancelled' }),
    });
    if (!response.ok) toast.error('Greška pri otkazivanju');
    else { toast.success('Rezervacija otkazana'); router.refresh(); }
  };

  const submitReview = async () => {
    if (!reviewBooking || !reviewComment.trim()) { toast.error('Unesite komentar'); return; }
    setLoading(true);
    const response = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ booking_id: reviewBooking.id, rating: reviewRating, comment: reviewComment }),
    });
    if (!response.ok) toast.error('Greška pri slanju recenzije');
    else { toast.success('Recenzija poslana!'); setShowReviewDialog(false); router.refresh(); }
    setLoading(false);
  };

  const unreviewedBookings = bookings.filter(b => b.status === 'completed' && !reviewedBookingIds.includes(b.id));

  // Stats
  const activeBookings = bookings.filter(b => b.status === 'accepted' || b.status === 'pending').length;
  const completedCount = bookings.filter(b => b.status === 'completed').length;
  const totalSpent = bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.total_price, 0);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-3xl font-bold tracking-tight">Bok, {user.name.split(' ')[0]}!</h1>
        <p className="text-muted-foreground mt-1">Upravljajte svojim ljubimcima i rezervacijama</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Ljubimaca', value: pets.length, icon: PawPrint, color: 'from-orange-500 to-amber-500' },
          { label: 'Aktivne rez.', value: activeBookings, icon: Clock, color: 'from-blue-500 to-cyan-500' },
          { label: 'Završene rez.', value: completedCount, icon: Calendar, color: 'from-green-500 to-emerald-500' },
          { label: 'Ukupno potrošeno', value: `${totalSpent}€`, icon: Star, color: 'from-purple-500 to-pink-500' },
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
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
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
      </div>

      {/* Active Walks */}
      {activeWalks.length > 0 && (
        <div className="mb-8 animate-fade-in-up delay-500">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Aktivne šetnje ({activeWalks.length})
          </h3>
          <div className="space-y-3">
            {activeWalks.map(walk => (
              <Card key={walk.id} className="border-0 shadow-sm border-l-4 border-l-green-400">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-sm">
                        <MapPin className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">{walk.petName} šeće s {walk.sitterName}</p>
                        <p className="text-xs text-muted-foreground">{walk.distance_km} km • U tijeku</p>
                      </div>
                    </div>
                    <Link href={`/setnja/${walk.id}`}>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 btn-hover">
                        <MapPin className="h-4 w-4 mr-1" /> Prati uživo
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

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

        {/* PETS TAB */}
        <TabsContent value="pets" className="space-y-4 animate-fade-in">
          {pets.length === 0 ? (
            <EmptyState icon={PawPrint} title="Nemate dodanih ljubimaca" description="Dodajte svog prvog ljubimca da biste mogli napraviti rezervaciju." action={<Button onClick={openAddPet} className="bg-orange-500 hover:bg-orange-600 btn-hover"><Plus className="h-4 w-4 mr-1" /> Dodaj ljubimca</Button>} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {pets.map((pet) => {
                const Icon = speciesIcons[pet.species];
                const gradient = speciesGradients[pet.species];
                return (
                  <Card key={pet.id} className="border-0 shadow-sm card-hover overflow-hidden">
                    <CardContent className="p-0">
                      <div className={`h-3 bg-gradient-to-r ${gradient}`} />
                      <div className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-lg">{pet.name}</h3>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-orange-50 hover:text-orange-600" onClick={() => openEditPet(pet)}>
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => deletePet(pet.id)}>
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">{SPECIES_LABELS[pet.species]}{pet.breed ? ` · ${pet.breed}` : ''}</p>
                            <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                              {pet.age && <Badge variant="secondary" className="text-xs bg-gray-50">{pet.age} god.</Badge>}
                              {pet.weight && <Badge variant="secondary" className="text-xs bg-gray-50">{pet.weight} kg</Badge>}
                            </div>
                            {pet.special_needs && (
                              <p className="text-xs text-amber-600 mt-2 bg-amber-50 rounded-lg p-2">⚠️ {pet.special_needs}</p>
                            )}
                            <div className="mt-2">
                              <Link href={`/ljubimac/${pet.id}/karton`}>
                                <Button variant="outline" size="sm" className="text-xs hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200">
                                  <FileHeart className="h-3 w-3 mr-1" /> Zdravstveni karton
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* BOOKINGS TAB — Timeline Style */}
        <TabsContent value="bookings" className="space-y-4 animate-fade-in">
          {bookings.length === 0 ? (
            <EmptyState icon={Calendar} title="Nemate rezervacija" description="Pretražite sittere i napravite svoju prvu rezervaciju." action={<a href="/pretraga"><Button className="bg-orange-500 hover:bg-orange-600 btn-hover">Pretraži sittere</Button></a>} />
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-5 top-0 bottom-0 w-px bg-gray-200 hidden sm:block" />
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="relative flex gap-4">
                    {/* Timeline dot */}
                    <div className="hidden sm:flex flex-col items-center pt-5">
                      <div className={`w-3 h-3 rounded-full ${statusDotColors[booking.status as BookingStatus]} ring-4 ring-white z-10`} />
                    </div>
                    <Card className="flex-1 border-0 shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={booking.sitter?.avatar_url || ''} />
                              <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-300 text-white text-sm">{booking.sitter?.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{booking.sitter?.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {SERVICE_LABELS[booking.service_type as ServiceType]} · {booking.pet?.name}
                              </p>
                            </div>
                          </div>
                          <Badge className={`${statusColors[booking.status as BookingStatus]} border`}>
                            {STATUS_LABELS[booking.status as BookingStatus]}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t text-sm">
                          <span className="text-muted-foreground">
                            {format(new Date(booking.start_date), 'd. MMM', { locale: hr })} — {format(new Date(booking.end_date), 'd. MMM yyyy.', { locale: hr })}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-orange-500">{booking.total_price}€</span>
                            {(booking.status === 'pending' || booking.status === 'accepted') && (
                              <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200" onClick={() => cancelBooking(booking.id)}>
                                Otkaži
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* REVIEWS TAB */}
        <TabsContent value="reviews" className="space-y-4 animate-fade-in">
          {unreviewedBookings.length === 0 ? (
            <EmptyState icon={Star} title="Sve je recenzirano!" description="Nemate završenih rezervacija koje čekaju recenziju." />
          ) : (
            <div className="space-y-3">
              {unreviewedBookings.map((booking) => (
                <Card key={booking.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={booking.sitter?.avatar_url || ''} />
                          <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-300 text-white text-sm">{booking.sitter?.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{booking.sitter?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {SERVICE_LABELS[booking.service_type as ServiceType]} · {format(new Date(booking.start_date), 'd. MMM yyyy.', { locale: hr })}
                          </p>
                        </div>
                      </div>
                      <Button
                        className="bg-orange-500 hover:bg-orange-600 btn-hover"
                        size="sm"
                        onClick={() => { setReviewBooking(booking); setReviewRating(5); setReviewComment(''); setShowReviewDialog(true); }}
                      >
                        <Star className="h-4 w-4 mr-1" /> Ocijeni
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
              <Input value={petForm.name} onChange={(e) => setPetForm({ ...petForm, name: e.target.value })} placeholder="Ime ljubimca" className="focus:border-orange-300" />
            </div>
            <div className="space-y-2">
              <Label>Vrsta *</Label>
              <div className="grid grid-cols-3 gap-2">
                {([['dog', 'Pas', Dog], ['cat', 'Mačka', Cat], ['other', 'Ostalo', HelpCircle]] as const).map(([value, label, Icon]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPetForm({ ...petForm, species: value as Species })}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      petForm.species === value ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-200'
                    }`}
                  >
                    <Icon className="h-6 w-6 mx-auto mb-1 text-orange-500" />
                    <p className="text-xs font-medium">{label}</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Pasmina</Label>
              <Input value={petForm.breed} onChange={(e) => setPetForm({ ...petForm, breed: e.target.value })} placeholder="npr. Labrador" className="focus:border-orange-300" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Dob (godine)</Label>
                <Input type="number" value={petForm.age} onChange={(e) => setPetForm({ ...petForm, age: e.target.value })} className="focus:border-orange-300" />
              </div>
              <div className="space-y-2">
                <Label>Težina (kg)</Label>
                <Input type="number" value={petForm.weight} onChange={(e) => setPetForm({ ...petForm, weight: e.target.value })} className="focus:border-orange-300" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Posebne potrebe</Label>
              <Textarea value={petForm.special_needs} onChange={(e) => setPetForm({ ...petForm, special_needs: e.target.value })} placeholder="Alergije, lijekovi, posebne navike..." className="focus:border-orange-300" />
            </div>
            <div className="space-y-2">
              <Label>Fotografija ljubimca</Label>
              <ImageUpload variant="square" bucket="pet-photos" entityId={editingPet?.id || 'new'} onUploadComplete={(urls) => { if (urls[0]) setPetForm(prev => ({ ...prev, photo_url: urls[0] })); }} />
            </div>
            <Button onClick={savePet} className="w-full bg-orange-500 hover:bg-orange-600 btn-hover" disabled={loading}>
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
              <div className="flex justify-center py-3 bg-orange-50/50 rounded-xl">
                <StarRating rating={reviewRating} size="lg" interactive onRatingChange={setReviewRating} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Komentar</Label>
              <Textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} placeholder="Opišite vaše iskustvo..." rows={4} className="focus:border-orange-300" />
            </div>
            <Button onClick={submitReview} className="w-full bg-orange-500 hover:bg-orange-600 btn-hover" disabled={loading}>
              {loading ? 'Šaljem...' : 'Pošalji recenziju'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

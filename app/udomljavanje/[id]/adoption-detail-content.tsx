'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Heart, MapPin, Phone, Mail, Clock, Share2, Copy,
  Check, Syringe, Cpu, Baby, PawPrint, Scissors,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useAdoptionFavorites } from '@/hooks/use-adoption-favorites';
import {
  getAdoptionPetById,
  getShelterById,
  getPetsByShelter,
  formatAge,
  getAgeCategoryLabel,
  SPECIES_EMOJI,
  SPECIES_LABEL,
  GENDER_LABEL,
  SIZE_LABEL,
} from '@/lib/db/adoption';

interface Props {
  petId: string;
}

export function AdoptionDetailContent({ petId }: Props) {
  const pet = getAdoptionPetById(petId)!;
  const shelter = getShelterById(pet.shelter_id)!;
  const otherPets = getPetsByShelter(pet.shelter_id).filter((p) => p.id !== pet.id).slice(0, 3);

  const { toggleFavorite, isFavorite } = useAdoptionFavorites();
  const [copied, setCopied] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success('Link kopiran!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setFormOpen(false);
      toast.success('Vaš upit je poslan! Azil će vas kontaktirati.');
    }, 1000);
  };

  const statusBadges = [
    { label: 'Steriliziran/a', active: pet.sterilized, icon: Scissors },
    { label: 'Cijepljen/a', active: pet.vaccinated, icon: Syringe },
    { label: 'Mikročipiran/a', active: pet.microchipped, icon: Cpu },
    { label: 'Dobar s djecom', active: pet.good_with_kids, icon: Baby },
    { label: 'Dobar s drugim ljubimcima', active: pet.good_with_pets, icon: PawPrint },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/50 via-white to-pink-50/30 dark:from-purple-950/10 dark:via-background dark:to-pink-950/10">
      {/* Hero image */}
      <div className={`relative h-64 md:h-80 bg-gradient-to-br ${pet.image_gradient} flex items-center justify-center`}>
        <div className="absolute inset-0 paw-pattern opacity-10" />
        <span className="text-8xl md:text-9xl">{SPECIES_EMOJI[pet.species]}</span>
        {pet.urgent && (
          <div className="absolute top-4 left-4">
            <Badge className="bg-red-500 text-white font-bold rounded-full flex items-center gap-1.5 text-sm px-3 py-1">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              Hitno traži dom
            </Badge>
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Back link */}
        <Link href="/udomljavanje" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" />
          Natrag na sve ljubimce
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Name & actions */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl md:text-4xl font-extrabold font-[var(--font-heading)]">{pet.name}</h1>
                  <span className="text-2xl">{SPECIES_EMOJI[pet.species]}</span>
                </div>
                <p className="text-lg text-muted-foreground">{pet.breed}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleFavorite(pet.id)}
                  className={`p-2.5 rounded-full transition-all duration-200 ${
                    isFavorite(pet.id)
                      ? 'bg-red-500 text-white shadow-lg shadow-red-200/50'
                      : 'bg-white text-gray-400 hover:text-red-500 hover:bg-white shadow-sm border border-gray-200'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isFavorite(pet.id) ? 'fill-white' : ''}`} />
                </button>
                <button
                  onClick={handleCopyLink}
                  className="p-2.5 rounded-full bg-white text-gray-400 hover:text-purple-500 hover:bg-white shadow-sm border border-gray-200 transition-all"
                >
                  {copied ? <Check className="h-5 w-5 text-green-500" /> : <Share2 className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Vrsta', value: SPECIES_LABEL[pet.species] },
                { label: 'Dob', value: formatAge(pet.age_months) },
                { label: 'Spol', value: GENDER_LABEL[pet.gender] },
                { label: 'Veličina', value: SIZE_LABEL[pet.size] },
                { label: 'Težina', value: `${pet.weight_kg} kg` },
                { label: 'Boja', value: pet.color },
                { label: 'Kategorija', value: getAgeCategoryLabel(pet.age_months) },
                { label: 'Lokacija', value: pet.city },
              ].map((item) => (
                <div key={item.label} className="bg-white dark:bg-card rounded-xl p-3 border border-gray-100 dark:border-border">
                  <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                  <p className="font-semibold text-sm">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Status badges */}
            <div className="flex flex-wrap gap-2">
              {statusBadges.map((badge) => (
                <Badge
                  key={badge.label}
                  className={`rounded-full text-sm px-3 py-1 flex items-center gap-1.5 ${
                    badge.active
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 border-0'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-gray-100 border-0'
                  }`}
                >
                  <badge.icon className="h-3.5 w-3.5" />
                  {badge.label}
                  {badge.active ? <Check className="h-3 w-3" /> : null}
                </Badge>
              ))}
            </div>

            {/* Description */}
            <Card className="border-0 shadow-sm rounded-2xl">
              <CardContent className="p-6">
                <h2 className="font-bold text-lg mb-3 font-[var(--font-heading)]">O {pet.name}</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">{pet.description}</p>
                <h3 className="font-semibold text-sm mb-2">Osobnost</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{pet.personality}</p>
                {pet.special_needs && (
                  <>
                    <h3 className="font-semibold text-sm mb-2 mt-4 text-amber-600 dark:text-amber-400">Posebne potrebe</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{pet.special_needs}</p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* CTA */}
            <Dialog open={formOpen} onOpenChange={setFormOpen}>
              <DialogTrigger render={<Button size="lg" className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-lg py-6 shadow-xl shadow-purple-200/50 dark:shadow-purple-900/30 rounded-xl" />}>
                  <Heart className="h-5 w-5 mr-2 fill-white" />
                  Pošalji upit za udomljavanje
              </DialogTrigger>
              <DialogContent className="sm:max-w-md rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="font-[var(--font-heading)] text-xl">
                    Upit za udomljavanje — {pet.name}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                  <div>
                    <Label htmlFor="name">Ime i prezime</Label>
                    <Input id="name" required placeholder="Vaše ime" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" required placeholder="vas@email.com" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefon</Label>
                    <Input id="phone" type="tel" required placeholder="+385 91 234 5678" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="message">Poruka (zašto želite udomiti)</Label>
                    <Textarea id="message" required placeholder="Opišite zašto želite udomiti ovog ljubimca..." className="mt-1" rows={3} />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" className="rounded border-gray-300" />
                      Imam iskustva s ljubimcima
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" className="rounded border-gray-300" />
                      Imam vrt/dvorište
                    </label>
                  </div>
                  <Button type="submit" disabled={submitting} className="w-full bg-purple-500 hover:bg-purple-600 font-semibold rounded-xl">
                    {submitting ? 'Šaljem...' : 'Pošalji upit'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Shelter info */}
            <Card className="border-0 shadow-sm rounded-2xl">
              <CardContent className="p-6">
                <h2 className="font-bold text-lg mb-4 font-[var(--font-heading)]">Azil / Udruga</h2>
                <div className="space-y-3">
                  <p className="font-semibold text-purple-600 dark:text-purple-400">{shelter.name}</p>
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 text-purple-400 flex-shrink-0 mt-0.5" />
                    {shelter.address}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4 text-purple-400 flex-shrink-0" />
                    {shelter.phone}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4 text-purple-400 flex-shrink-0" />
                    {shelter.email}
                  </div>
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 text-purple-400 flex-shrink-0 mt-0.5" />
                    {shelter.working_hours}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Share */}
            <Card className="border-0 shadow-sm rounded-2xl">
              <CardContent className="p-6">
                <h2 className="font-bold text-sm mb-3">Podijelite</h2>
                <Button variant="outline" onClick={handleCopyLink} className="w-full rounded-xl">
                  {copied ? <Check className="h-4 w-4 mr-2 text-green-500" /> : <Copy className="h-4 w-4 mr-2" />}
                  {copied ? 'Kopirano!' : 'Kopiraj link'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Other pets from same shelter */}
        {otherPets.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-extrabold mb-6 font-[var(--font-heading)]">Više od {shelter.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {otherPets.map((p) => (
                <Link key={p.id} href={`/udomljavanje/${p.id}`}>
                  <Card className="group card-hover cursor-pointer overflow-hidden border-0 shadow-sm rounded-2xl">
                    <CardContent className="p-0">
                      <div className={`relative h-40 bg-gradient-to-br ${p.image_gradient} flex items-center justify-center`}>
                        <div className="absolute inset-0 paw-pattern opacity-10" />
                        <span className="text-5xl group-hover:scale-110 transition-transform duration-300">
                          {SPECIES_EMOJI[p.species]}
                        </span>
                        {p.urgent && (
                          <Badge className="absolute top-3 left-3 bg-red-500 text-white font-bold rounded-full flex items-center gap-1.5">
                            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                            Hitno
                          </Badge>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold group-hover:text-purple-500 transition-colors font-[var(--font-heading)]">{p.name}</h3>
                        <p className="text-sm text-muted-foreground">{p.breed}</p>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                          <MapPin className="h-3 w-3" />
                          {p.city}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

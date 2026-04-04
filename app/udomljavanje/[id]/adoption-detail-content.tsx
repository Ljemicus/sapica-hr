'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft, Heart, MapPin, Share2, Copy,
  Check, Syringe, Cpu, Baby, PawPrint, Scissors, ChevronLeft, ChevronRight,
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
import type { AdoptionListing } from '@/lib/types';
import {
  ADOPTION_SPECIES_LABELS,
  ADOPTION_SPECIES_EMOJI,
  ADOPTION_GENDER_LABELS,
  ADOPTION_SIZE_LABELS,
} from '@/lib/types';

function formatAge(months: number | null): string {
  if (months == null) return 'Nepoznato';
  if (months < 12) return `${months} mj.`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return rem > 0 ? `${years} g. ${rem} mj.` : `${years} g.`;
}

const SPECIES_GRADIENTS: Record<string, string> = {
  dog: 'from-amber-300 to-orange-400',
  cat: 'from-purple-300 to-pink-400',
  rabbit: 'from-green-300 to-teal-400',
  other: 'from-blue-300 to-indigo-400',
};

export function AdoptionDetailContent({ listing, relatedListings = [] }: { listing: AdoptionListing; relatedListings?: AdoptionListing[] }) {
  const { toggleFavorite, isFavorite } = useAdoptionFavorites();
  const [copied, setCopied] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  const images = listing.images ?? [];
  const gradient = SPECIES_GRADIENTS[listing.species] ?? SPECIES_GRADIENTS.other;
  const publisher = listing.publisher;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success('Link kopiran!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const body = {
      listing_id: listing.id,
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      message: formData.get('message'),
      has_experience: formData.get('has_experience') === 'on',
      has_yard: formData.get('has_yard') === 'on',
    };

    try {
      const res = await fetch('/api/adoption-listings/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        toast.success('Vaš upit je poslan! Kontaktirat ćemo vas uskoro.');
        e.currentTarget.reset();
        setFormOpen(false);
      } else {
        toast.error('Greška pri slanju upita. Pokušajte ponovo.');
      }
    } catch {
      toast.error('Mrežna greška. Pokušajte ponovo.');
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadges = [
    { label: 'Steriliziran/a', active: listing.sterilized, icon: Scissors },
    { label: 'Cijepljen/a', active: listing.vaccinated, icon: Syringe },
    { label: 'Mikročipiran/a', active: listing.microchipped, icon: Cpu },
    { label: 'Dobar s djecom', active: listing.good_with_kids, icon: Baby },
    { label: 'Dobar s drugim ljubimcima', active: listing.good_with_pets, icon: PawPrint },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/50 via-white to-pink-50/30 dark:from-purple-950/10 dark:via-background dark:to-pink-950/10">
      {/* Image gallery / hero */}
      {images.length > 0 ? (
        <div className="relative h-72 md:h-96 bg-gray-100">
          <Image
            src={images[currentImage].url}
            alt={images[currentImage].alt || listing.name}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          {images.length > 1 && (
            <>
              <button
                onClick={() => setCurrentImage((p) => (p - 1 + images.length) % images.length)}
                aria-label="Prethodna fotografija"
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setCurrentImage((p) => (p + 1) % images.length)}
                aria-label="Sljedeća fotografija"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5" role="tablist" aria-label="Fotografije">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImage(i)}
                    role="tab"
                    aria-selected={i === currentImage}
                    aria-label={`Fotografija ${i + 1} od ${images.length}`}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === currentImage ? 'bg-white w-4' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
          {listing.is_urgent && (
            <div className="absolute top-4 left-4">
              <Badge className="bg-red-500 text-white font-bold rounded-full flex items-center gap-1.5 text-sm px-3 py-1">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                Hitno traži dom
              </Badge>
            </div>
          )}
        </div>
      ) : (
        <div className={`relative h-64 md:h-80 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
          <div className="absolute inset-0 paw-pattern opacity-10" />
          <span className="text-8xl md:text-9xl">{ADOPTION_SPECIES_EMOJI[listing.species]}</span>
          {listing.is_urgent && (
            <div className="absolute top-4 left-4">
              <Badge className="bg-red-500 text-white font-bold rounded-full flex items-center gap-1.5 text-sm px-3 py-1">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                Hitno traži dom
              </Badge>
            </div>
          )}
        </div>
      )}

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="container mx-auto px-4 -mt-6 relative z-10">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map((img, i) => (
              <button
                key={img.url}
                onClick={() => setCurrentImage(i)}
                aria-label={`Prikaži fotografiju ${i + 1}`}
                className={`relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                  i === currentImage ? 'border-purple-500 shadow-md' : 'border-white/80 opacity-70 hover:opacity-100'
                }`}
              >
                <Image src={img.url} alt={img.alt || ''} fill sizes="64px" className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

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
                  <h1 className="text-3xl md:text-4xl font-extrabold font-[var(--font-heading)]">{listing.name}</h1>
                  <span className="text-2xl">{ADOPTION_SPECIES_EMOJI[listing.species]}</span>
                </div>
                {listing.breed && (
                  <p className="text-lg text-muted-foreground">{listing.breed}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleFavorite(listing.id)}
                  aria-label={isFavorite(listing.id) ? `Ukloni ${listing.name} iz favorita` : `Dodaj ${listing.name} u favorite`}
                  className={`p-2.5 rounded-full transition-all duration-200 ${
                    isFavorite(listing.id)
                      ? 'bg-red-500 text-white shadow-lg shadow-red-200/50'
                      : 'bg-white text-gray-400 hover:text-red-500 hover:bg-white shadow-sm border border-gray-200'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isFavorite(listing.id) ? 'fill-white' : ''}`} />
                </button>
                <button
                  onClick={handleCopyLink}
                  aria-label={copied ? 'Link kopiran' : 'Kopiraj link'}
                  className="p-2.5 rounded-full bg-white text-gray-400 hover:text-purple-500 hover:bg-white shadow-sm border border-gray-200 transition-all"
                >
                  {copied ? <Check className="h-5 w-5 text-green-500" /> : <Share2 className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Vrsta', value: ADOPTION_SPECIES_LABELS[listing.species] },
                { label: 'Dob', value: formatAge(listing.age_months) },
                listing.gender ? { label: 'Spol', value: ADOPTION_GENDER_LABELS[listing.gender] } : null,
                listing.size ? { label: 'Veličina', value: ADOPTION_SIZE_LABELS[listing.size] } : null,
                listing.weight_kg ? { label: 'Težina', value: `${listing.weight_kg} kg` } : null,
                listing.color ? { label: 'Boja', value: listing.color } : null,
                { label: 'Lokacija', value: listing.city },
              ].filter(Boolean).map((item) => (
                <div key={item!.label} className="bg-white dark:bg-card rounded-xl p-3 border border-gray-100 dark:border-border">
                  <p className="text-xs text-muted-foreground mb-1">{item!.label}</p>
                  <p className="font-semibold text-sm">{item!.value}</p>
                </div>
              ))}
            </div>

            {/* Status badges */}
            <div className="flex flex-wrap gap-2">
              {statusBadges.filter((b) => b.active !== null).map((badge) => (
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
                <h2 className="font-bold text-lg mb-3 font-[var(--font-heading)]">O {listing.name}</h2>
                <p className="text-muted-foreground leading-relaxed mb-4 whitespace-pre-line">{listing.description}</p>
                {listing.personality && (
                  <>
                    <h3 className="font-semibold text-sm mb-2">Osobnost</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{listing.personality}</p>
                  </>
                )}
                {listing.special_needs && (
                  <>
                    <h3 className="font-semibold text-sm mb-2 mt-4 text-amber-600 dark:text-amber-400">Posebne potrebe</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{listing.special_needs}</p>
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
                    Upit za udomljavanje — {listing.name}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                  <div>
                    <Label htmlFor="inquiry-name">Ime i prezime</Label>
                    <Input id="inquiry-name" name="name" required placeholder="Vaše ime" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="inquiry-email">Email</Label>
                    <Input id="inquiry-email" name="email" type="email" required placeholder="vas@email.com" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="inquiry-phone">Telefon</Label>
                    <Input id="inquiry-phone" name="phone" type="tel" required placeholder="+385 91 234 5678" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="inquiry-message">Poruka (zašto želite udomiti)</Label>
                    <Textarea id="inquiry-message" name="message" required minLength={10} placeholder="Opišite zašto želite udomiti ovog ljubimca..." className="mt-1" rows={3} />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" name="has_experience" className="rounded border-gray-300" />
                      Imam iskustva s ljubimcima
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" name="has_yard" className="rounded border-gray-300" />
                      Imam vrt/dvorište
                    </label>
                  </div>
                  <Button type="submit" disabled={submitting} className="w-full bg-purple-500 hover:bg-purple-600 font-semibold rounded-xl">
                    {submitting ? 'Šaljem...' : 'Pošalji upit'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
            {publisher && relatedListings.length > 0 && (
              <Card className="border-0 shadow-sm rounded-2xl">
                <CardContent className="p-6">
                  <h2 className="font-bold text-lg mb-3 font-[var(--font-heading)]">Više ljubimaca iz ove udruge</h2>
                  <div className="space-y-3">
                    {relatedListings.map((item) => (
                      <Link
                        key={item.id}
                        href={`/udomljavanje/${item.id}`}
                        className="block rounded-xl border border-border/60 p-3 hover:bg-muted/40 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-sm">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.breed || 'Ljubimac za udomljavanje'} · {item.city}</p>
                          </div>
                          <span className="text-lg">{ADOPTION_SPECIES_EMOJI[item.species]}</span>
                        </div>
                      </Link>
                    ))}
                    <Link
                      href={`/udomljavanje/udruga/${publisher.id}`}
                      className="inline-flex items-center text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                    >
                      Pogledaj sve ljubimce ove udruge
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publisher info — animal first, publisher as trust/support context */}
            <Card className="border-0 shadow-sm rounded-2xl">
              <CardContent className="p-6">
                <h2 className="font-bold text-lg mb-4 font-[var(--font-heading)]">O životinji brine</h2>
                <div className="space-y-3">
                  {publisher ? (
                    <>
                      <div>
                        <p className="font-semibold text-purple-600 dark:text-purple-400">{publisher.display_name}</p>
                        <div className="flex items-start gap-2 text-sm text-muted-foreground mt-1">
                          <MapPin className="h-4 w-4 text-purple-400 flex-shrink-0 mt-0.5" />
                          {publisher.city || listing.city}
                        </div>
                      </div>
                      {publisher.bio && (
                        <p className="text-sm text-muted-foreground leading-relaxed">{publisher.bio}</p>
                      )}
                      <Link
                        href={`/udomljavanje/udruga/${publisher.id}`}
                        className="inline-flex w-full items-center justify-center rounded-xl border border-purple-200 px-4 py-2 text-sm font-medium text-purple-600 transition-colors hover:bg-purple-50 dark:border-purple-800 dark:text-purple-400 dark:hover:bg-purple-950/20"
                      >
                        Pogledaj udrugu
                      </Link>
                    </>
                  ) : (
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 text-purple-400 flex-shrink-0 mt-0.5" />
                      {listing.city}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Pošaljite upit putem obrasca kako biste kontaktirali udrugu ili skrbnika koji brine o {listing.name}.
                  </p>
                  <Button
                    variant="outline"
                    className="w-full rounded-xl text-purple-600 border-purple-200 hover:bg-purple-50 dark:text-purple-400 dark:border-purple-800 dark:hover:bg-purple-950/20"
                    onClick={() => setFormOpen(true)}
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Pošalji upit
                  </Button>
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
      </div>
    </div>
  );
}

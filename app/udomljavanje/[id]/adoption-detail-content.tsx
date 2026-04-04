'use client';

import { useMemo, useState } from 'react';
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
import { useLanguage } from '@/lib/i18n/context';
import type { AdoptionListing } from '@/lib/types';
import {
  ADOPTION_SPECIES_LABELS,
  ADOPTION_SPECIES_EMOJI,
  ADOPTION_GENDER_LABELS,
  ADOPTION_SIZE_LABELS,
} from '@/lib/types';

function formatAge(months: number | null, isEn: boolean): string {
  if (months == null) return isEn ? 'Unknown' : 'Nepoznato';
  if (months < 12) return isEn ? `${months} mo` : `${months} mj.`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return rem > 0 ? (isEn ? `${years} yr ${rem} mo` : `${years} g. ${rem} mj.`) : (isEn ? `${years} yr` : `${years} g.`);
}

const SPECIES_GRADIENTS: Record<string, string> = {
  dog: 'from-amber-300 to-orange-400',
  cat: 'from-purple-300 to-pink-400',
  rabbit: 'from-green-300 to-teal-400',
  other: 'from-blue-300 to-indigo-400',
};

export function AdoptionDetailContent({ listing, relatedListings = [] }: { listing: AdoptionListing; relatedListings?: AdoptionListing[] }) {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const { toggleFavorite, isFavorite } = useAdoptionFavorites();
  const speciesLabels = isEn ? { dog: 'Dog', cat: 'Cat', rabbit: 'Rabbit', other: 'Other' } : ADOPTION_SPECIES_LABELS;
  const genderLabels = isEn ? { male: 'Male', female: 'Female' } : ADOPTION_GENDER_LABELS;
  const sizeLabels = isEn ? { small: 'Small', medium: 'Medium', large: 'Large' } : ADOPTION_SIZE_LABELS;
  const [copied, setCopied] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [submissionState, setSubmissionState] = useState<'idle' | 'success'>('idle');

  const images = listing.images ?? [];
  const gradient = SPECIES_GRADIENTS[listing.species] ?? SPECIES_GRADIENTS.other;
  const publisher = listing.publisher;
  const inquiryHighlights = useMemo(() => [
    isEn ? 'Predstavi zašto želiš baš ovog ljubimca.' : 'Predstavi zašto želiš baš ovog ljubimca.',
    isEn ? 'Napiši imaš li iskustva i kakve uvjete nudiš.' : 'Napiši imaš li iskustva i kakve uvjete nudiš.',
    isEn ? 'Udruga ili skrbnik javit će ti se nakon pregleda upita.' : 'Udruga ili skrbnik javit će ti se nakon pregleda upita.',
  ], [isEn]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success(isEn ? 'Link copied!' : 'Link kopiran!');
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
      const data = await res.json().catch(() => null);
      if (res.ok) {
        setSubmissionState('success');
        toast.success(isEn ? 'Your inquiry has been sent. We’ll contact you soon.' : 'Vaš upit je poslan! Kontaktirat ćemo vas uskoro.');
        e.currentTarget.reset();
        setFormOpen(false);
      } else {
        const validationErrors = data?.details
          ? Object.values(data.details).flat().filter(Boolean).join(' · ')
          : null;
        toast.error(validationErrors || data?.error || (isEn ? 'There was an error sending your inquiry. Please try again.' : 'Greška pri slanju upita. Pokušajte ponovo.'));
      }
    } catch {
      toast.error(isEn ? 'Network error. Please try again.' : 'Mrežna greška. Pokušajte ponovo.');
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadges = [
    { label: isEn ? 'Spayed / neutered' : 'Steriliziran/a', active: listing.sterilized, icon: Scissors },
    { label: isEn ? 'Vaccinated' : 'Cijepljen/a', active: listing.vaccinated, icon: Syringe },
    { label: isEn ? 'Microchipped' : 'Mikročipiran/a', active: listing.microchipped, icon: Cpu },
    { label: isEn ? 'Good with kids' : 'Dobar s djecom', active: listing.good_with_kids, icon: Baby },
    { label: isEn ? 'Good with other pets' : 'Dobar s drugim ljubimcima', active: listing.good_with_pets, icon: PawPrint },
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
                aria-label={isEn ? 'Previous photo' : 'Prethodna fotografija'}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setCurrentImage((p) => (p + 1) % images.length)}
                aria-label={isEn ? 'Next photo' : 'Sljedeća fotografija'}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5" role="tablist" aria-label={isEn ? 'Photos' : 'Fotografije'}>
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImage(i)}
                    role="tab"
                    aria-selected={i === currentImage}
                    aria-label={isEn ? `Photo ${i + 1} of ${images.length}` : `Fotografija ${i + 1} od ${images.length}`}
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
                {isEn ? 'Urgently needs a home' : 'Hitno traži dom'}
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
                {isEn ? 'Urgently needs a home' : 'Hitno traži dom'}
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
                aria-label={isEn ? `Show photo ${i + 1}` : `Prikaži fotografiju ${i + 1}`}
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
          {isEn ? 'Back to all pets' : 'Natrag na sve ljubimce'}
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
                  aria-label={isFavorite(listing.id) ? (isEn ? `Remove ${listing.name} from favorites` : `Ukloni ${listing.name} iz favorita`) : (isEn ? `Add ${listing.name} to favorites` : `Dodaj ${listing.name} u favorite`)}
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
                  aria-label={copied ? (isEn ? 'Link copied' : 'Link kopiran') : (isEn ? 'Copy link' : 'Kopiraj link')}
                  className="p-2.5 rounded-full bg-white text-gray-400 hover:text-purple-500 hover:bg-white shadow-sm border border-gray-200 transition-all"
                >
                  {copied ? <Check className="h-5 w-5 text-green-500" /> : <Share2 className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: isEn ? 'Species' : 'Vrsta', value: speciesLabels[listing.species] },
                { label: isEn ? 'Age' : 'Dob', value: formatAge(listing.age_months, isEn) },
                listing.gender ? { label: isEn ? 'Gender' : 'Spol', value: genderLabels[listing.gender] } : null,
                listing.size ? { label: isEn ? 'Size' : 'Veličina', value: sizeLabels[listing.size] } : null,
                listing.weight_kg ? { label: isEn ? 'Weight' : 'Težina', value: `${listing.weight_kg} kg` } : null,
                listing.color ? { label: isEn ? 'Color' : 'Boja', value: listing.color } : null,
                { label: isEn ? 'Location' : 'Lokacija', value: listing.city },
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
                <h2 className="font-bold text-lg mb-3 font-[var(--font-heading)]">{isEn ? `About ${listing.name}` : `O ${listing.name}`}</h2>
                <p className="text-muted-foreground leading-relaxed mb-4 whitespace-pre-line">{listing.description}</p>
                {listing.personality && (
                  <>
                    <h3 className="font-semibold text-sm mb-2">{isEn ? 'Personality' : 'Osobnost'}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{listing.personality}</p>
                  </>
                )}
                {listing.special_needs && (
                  <>
                    <h3 className="font-semibold text-sm mb-2 mt-4 text-amber-600 dark:text-amber-400">{isEn ? 'Special needs' : 'Posebne potrebe'}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{listing.special_needs}</p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* CTA */}
            <Card className="border-0 shadow-sm rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="font-bold text-xl font-[var(--font-heading)] mb-2">{isEn ? `Interested in ${listing.name}?` : `Zanima te ${listing.name}?`}</h2>
                    <p className="text-sm text-muted-foreground mb-3">
                      {isEn ? 'Send a short inquiry and explain what kind of home you can offer.' : 'Pošalji kratak upit i napiši kakav dom možeš ponuditi ovom ljubimcu.'}
                    </p>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {inquiryHighlights.map((item) => (
                        <li key={item}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex flex-col gap-2 min-w-[220px]">
                    <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold shadow-xl shadow-purple-200/50 dark:shadow-purple-900/30 rounded-xl" onClick={() => setFormOpen(true)}>
                      <Heart className="h-5 w-5 mr-2 fill-white" />
                      {isEn ? 'Send adoption inquiry' : 'Pošalji upit za udomljavanje'}
                    </Button>
                    {publisher && (
                      <Link
                        href={`/udomljavanje/udruga/${publisher.id}`}
                        className="inline-flex items-center justify-center rounded-xl border border-purple-200 px-4 py-3 text-sm font-medium text-purple-600 transition-colors hover:bg-purple-50 dark:border-purple-800 dark:text-purple-400 dark:hover:bg-purple-950/20"
                      >
                        {isEn ? 'View rescue profile' : 'Pogledaj udrugu'}
                      </Link>
                    )}
                  </div>
                </div>
                {submissionState === 'success' && (
                  <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300">
                    {isEn ? 'Inquiry sent. If the pet is still available, the rescue or caregiver should contact you soon.' : 'Upit je poslan. Ako je ljubimac još dostupan, udruga ili skrbnik bi ti se trebali uskoro javiti.'}
                  </div>
                )}
              </CardContent>
            </Card>
            <Dialog open={formOpen} onOpenChange={setFormOpen}>
              <DialogTrigger render={<Button size="lg" className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-lg py-6 shadow-xl shadow-purple-200/50 dark:shadow-purple-900/30 rounded-xl" />}>
                <Heart className="h-5 w-5 mr-2 fill-white" />
                {isEn ? 'Send adoption inquiry' : 'Pošalji upit za udomljavanje'}
              </DialogTrigger>
              <DialogContent className="sm:max-w-md rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="font-[var(--font-heading)] text-xl">
                    {isEn ? `Adoption inquiry — ${listing.name}` : `Upit za udomljavanje — ${listing.name}`}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                  <div>
                    <Label htmlFor="inquiry-name">{isEn ? 'Full name' : 'Ime i prezime'}</Label>
                    <Input id="inquiry-name" name="name" required placeholder={isEn ? 'Your name' : 'Vaše ime'} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="inquiry-email">Email</Label>
                    <Input id="inquiry-email" name="email" type="email" required placeholder="vas@email.com" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="inquiry-phone">{isEn ? 'Phone' : 'Telefon'}</Label>
                    <Input id="inquiry-phone" name="phone" type="tel" required placeholder="+385 91 234 5678" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="inquiry-message">{isEn ? 'Message (why you want to adopt)' : 'Poruka (zašto želite udomiti)'}</Label>
                    <Textarea id="inquiry-message" name="message" required minLength={10} placeholder={isEn ? 'Tell us why you would like to adopt this pet...' : 'Opišite zašto želite udomiti ovog ljubimca...'} className="mt-1" rows={3} />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" name="has_experience" className="rounded border-gray-300" />
                      {isEn ? 'I have experience with pets' : 'Imam iskustva s ljubimcima'}
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" name="has_yard" className="rounded border-gray-300" />
                      {isEn ? 'I have a yard / garden' : 'Imam vrt/dvorište'}
                    </label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isEn ? 'Your inquiry is stored in PetPark and forwarded to the rescue or caregiver responsible for this pet.' : 'Tvoj upit se sprema u PetPark i prosljeđuje udruzi ili skrbniku koji brine o ovom ljubimcu.'}
                  </p>
                  <Button type="submit" disabled={submitting} className="w-full bg-purple-500 hover:bg-purple-600 font-semibold rounded-xl">
                    {submitting ? (isEn ? 'Sending...' : 'Šaljem...') : (isEn ? 'Send inquiry' : 'Pošalji upit')}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
            {publisher && relatedListings.length > 0 && (
              <Card className="border-0 shadow-sm rounded-2xl">
                <CardContent className="p-6">
                  <h2 className="font-bold text-lg mb-3 font-[var(--font-heading)]">{isEn ? 'More pets from this rescue' : 'Više ljubimaca iz ove udruge'}</h2>
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
                            <p className="text-xs text-muted-foreground">{item.breed || (isEn ? 'Pet for adoption' : 'Ljubimac za udomljavanje')} · {item.city}</p>
                          </div>
                          <span className="text-lg">{ADOPTION_SPECIES_EMOJI[item.species]}</span>
                        </div>
                      </Link>
                    ))}
                    <Link
                      href={`/udomljavanje/udruga/${publisher.id}`}
                      className="inline-flex items-center text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                    >
                      {isEn ? 'View all pets from this rescue' : 'Pogledaj sve ljubimce ove udruge'}
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
                <h2 className="font-bold text-lg mb-4 font-[var(--font-heading)]">{isEn ? 'Care provided by' : 'O životinji brine'}</h2>
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
                        {isEn ? 'View rescue profile' : 'Pogledaj udrugu'}
                      </Link>
                    </>
                  ) : (
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 text-purple-400 flex-shrink-0 mt-0.5" />
                      {listing.city}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {isEn ? `Send an inquiry through the form to contact the rescue or caregiver looking after ${listing.name}.` : `Pošaljite upit putem obrasca kako biste kontaktirali udrugu ili skrbnika koji brine o ${listing.name}.`}
                  </p>
                  <Button
                    variant="outline"
                    className="w-full rounded-xl text-purple-600 border-purple-200 hover:bg-purple-50 dark:text-purple-400 dark:border-purple-800 dark:hover:bg-purple-950/20"
                    onClick={() => setFormOpen(true)}
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    {isEn ? 'Send inquiry' : 'Pošalji upit'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Share */}
            <Card className="border-0 shadow-sm rounded-2xl">
              <CardContent className="p-6">
                <h2 className="font-bold text-sm mb-3">{isEn ? 'Share' : 'Podijelite'}</h2>
                <Button variant="outline" onClick={handleCopyLink} className="w-full rounded-xl">
                  {copied ? <Check className="h-4 w-4 mr-2 text-green-500" /> : <Copy className="h-4 w-4 mr-2" />}
                  {copied ? (isEn ? 'Copied!' : 'Kopirano!') : (isEn ? 'Copy link' : 'Kopiraj link')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

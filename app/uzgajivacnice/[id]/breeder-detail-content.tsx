'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Star, MapPin, Shield, Award, Phone, Mail, ChevronLeft,
  Image as ImageIcon, MessageSquare, Send, Share2, Check,
  ArrowRight, Heart, Clock, PawPrint,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { Breeder } from '@/lib/db/breeders';
import { getLocaleSegment } from '@/lib/i18n/routing';
import { useLanguage } from '@/lib/i18n/context';

interface BreederDetailContentProps {
  breeder: Breeder;
  relatedBreeders: Breeder[];
}

export function BreederDetailContent({ breeder, relatedBreeders }: BreederDetailContentProps) {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const localeSegment = getLocaleSegment(language);
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const copy = {
    back: isEn ? 'Back' : 'Natrag',
    share: isEn ? 'Share' : 'Podijeli',
    copied: isEn ? 'Copied!' : 'Kopirano!',
    linkCopied: isEn ? 'Link copied!' : 'Link kopiran!',
    copyFail: isEn ? 'Could not copy the link' : 'Nije moguće kopirati link',
    registeredBreeder: isEn ? 'Registered breeder' : 'Registriran uzgajivač',
    fciRegistered: isEn ? 'FCI registered' : 'FCI registriran',
    certified: isEn ? 'Certified' : 'Certificiran',
    reviews: isEn ? 'reviews' : 'recenzija',
    yrsExperience: isEn ? 'yrs experience' : 'god. iskustva',
    aboutKicker: isEn ? 'Get to know' : 'Upoznajte',
    about: isEn ? 'About the breeder' : 'O uzgajivačnici',
    ratingLabel: isEn ? 'Rating' : 'Ocjena',
    breedsLabel: isEn ? 'Breeds' : 'Pasmine',
    reviewsLabel: isEn ? 'Reviews' : 'Recenzije',
    contactKicker: isEn ? 'Reach out' : 'Kontaktirajte nas',
    contact: isEn ? 'Contact information' : 'Kontakt informacije',
    phone: isEn ? 'Phone' : 'Telefon',
    email: 'Email',
    location: isEn ? 'Location' : 'Lokacija',
    breedsKicker: isEn ? 'Our family' : 'Naša obitelj',
    breedsTitle: isEn ? 'Breeds we raise' : 'Pasmine koje uzgajamo',
    littersKicker: isEn ? 'New arrivals' : 'Novi dolasci',
    littersTitle: isEn ? 'Available litters' : 'Dostupna legla',
    noLitters: isEn ? 'No available litters' : 'Nema dostupnih legala',
    noLittersText: isEn ? 'There are currently no available litters. Contact the breeder for upcoming plans.' : 'Trenutno nema dostupnih legala. Kontaktirajte uzgajivača za nadolazeće planove.',
    galleryKicker: isEn ? 'See more' : 'Pogledajte',
    gallery: isEn ? 'Gallery' : 'Galerija',
    reviewsKicker: isEn ? 'What others say' : 'Što kažu drugi',
    reviewsTitle: isEn ? 'Reviews' : 'Recenzije',
    noReviews: isEn ? 'No reviews yet' : 'Još nema recenzija',
    beFirst: isEn ? 'Be the first to share an experience with this breeder' : 'Budite prvi koji će podijeliti iskustvo s ovim uzgajivačem',
    available: isEn ? 'Available' : 'Dostupno',
    reserved: isEn ? 'Reserved' : 'Rezervirano',
    soon: isEn ? 'Soon' : 'Uskoro',
    kittens: isEn ? 'kittens' : 'mačića',
    puppies: isEn ? 'puppies' : 'štenaca',
    weeks: isEn ? 'weeks' : 'tjedana',
    sendInquiry: isEn ? 'Send inquiry' : 'Pošalji upit',
    contactBtn: isEn ? 'Send a message' : 'Pošalji poruku',
    fromPrice: isEn ? 'from' : 'od',
    priceDepends: isEn ? 'depending on breed & litter' : 'ovisno o pasmini i leglu',
    experience: isEn ? 'Experience' : 'Iskustvo',
    years: isEn ? 'years' : 'godina',
    species: isEn ? 'Species' : 'Vrsta',
    littersCount: isEn ? 'litters' : 'legala',
    discoverKicker: isEn ? 'Discover more' : 'Otkrijte više',
    moreBreeders: isEn ? 'More breeders' : 'Više uzgajivača',
    croatia: isEn ? 'Croatia' : 'Hrvatska',
    cat: isEn ? 'Cat' : 'Mačka',
    dog: isEn ? 'Dog' : 'Pas',
    dogs: isEn ? 'Dogs' : 'Psi',
    cats: isEn ? 'Cats' : 'Mačke',
    dogsAndCats: isEn ? 'Dogs & Cats' : 'Psi i mačke',
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success(copy.linkCopied);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(copy.copyFail);
    }
  };

  const minPrice = breeder.availableLitters.length > 0
    ? Math.min(...breeder.availableLitters.map((l) => l.priceFrom))
    : null;

  const speciesLabel = breeder.species === 'dog' ? copy.dogs : breeder.species === 'cat' ? copy.cats : copy.dogsAndCats;

  return (
    <div className="concept-zero">
      {/* ── Cinematic Hero ── */}
      <section className="relative overflow-hidden min-h-[70vh] md:min-h-[75vh] flex flex-col">
        <div className="absolute inset-0 detail-hero-gradient" />
        <div className="absolute inset-0 paw-pattern opacity-[0.04]" />

        {/* Navigation bar */}
        <div className="container mx-auto px-6 md:px-10 lg:px-16 relative z-10 pt-6 md:pt-8">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="rounded-full h-10 px-4 text-foreground/70 hover:text-foreground hover:bg-foreground/5"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              {copy.back}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="rounded-full h-10 px-4 text-foreground/70 hover:text-foreground hover:bg-foreground/5"
            >
              {copied ? <Check className="h-4 w-4 mr-1" /> : <Share2 className="h-4 w-4 mr-1" />}
              {copied ? copy.copied : copy.share}
            </Button>
          </div>
        </div>

        {/* Hero content — pushed to bottom */}
        <div className="flex-1" />
        <div className="container mx-auto px-6 md:px-10 lg:px-16 relative z-10 pb-12 md:pb-16 lg:pb-20">
          <div className="max-w-3xl">
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-5 animate-fade-in-up">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-3.5 py-1.5 shadow-sm bg-warm-peach text-orange-700 dark:bg-warm-orange/20 dark:text-orange-400">
                <PawPrint className="h-3 w-3" />
                {breeder.species === 'cat' ? copy.cat : breeder.species === 'both' ? copy.dogsAndCats : copy.dog}
              </span>
              {breeder.verified && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-3.5 py-1.5 shadow-sm bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                  <Shield className="h-3 w-3" />
                  {copy.registeredBreeder}
                </span>
              )}
              {breeder.fciRegistered && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-3.5 py-1.5 shadow-sm bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  <Award className="h-3 w-3" />
                  {copy.fciRegistered}
                </span>
              )}
              {breeder.certified && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-3.5 py-1.5 shadow-sm bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
                  <Award className="h-3 w-3" />
                  {copy.certified}
                </span>
              )}
            </div>

            {/* Identity */}
            <div className="flex items-end gap-5 md:gap-6 animate-fade-in-up delay-100">
              <div className="avatar-gradient-border flex-shrink-0 animate-scale-in">
                <Avatar className="h-24 w-24 md:h-28 md:w-28 lg:h-32 lg:w-32 border-4 border-white shadow-2xl">
                  <AvatarFallback className="bg-white text-gray-700 text-3xl md:text-4xl font-bold">
                    {breeder.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="pb-1">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold font-[var(--font-heading)] leading-[1.05] mb-3">
                  {breeder.name}
                </h1>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    {breeder.city}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    {breeder.rating.toFixed(1)}
                    <span className="opacity-70">({breeder.reviewCount})</span>
                  </span>
                  {breeder.yearsExperience > 0 && (
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 flex-shrink-0" />
                      {breeder.yearsExperience} {copy.yrsExperience}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Content Grid ── */}
      <div className="container mx-auto px-6 md:px-10 lg:px-16 py-12 md:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-14">

          {/* ── Main Content ── */}
          <div className="lg:col-span-2 space-y-10 md:space-y-12">

            {/* About */}
            <section className="animate-fade-in-up">
              <p className="text-sm uppercase tracking-[0.25em] text-warm-orange mb-3 font-semibold">{copy.aboutKicker}</p>
              <h2 className="text-2xl md:text-3xl font-extrabold font-[var(--font-heading)] leading-tight mb-5">{copy.about}</h2>
              <div className="detail-section-card p-7 md:p-8">
                <p className="text-muted-foreground leading-relaxed text-[15px] md:text-base">{breeder.bio}</p>
                <div className="grid grid-cols-3 gap-4 mt-7 pt-6 border-t border-border/30">
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-extrabold text-gradient font-[var(--font-heading)]">
                      {breeder.rating.toFixed(1)}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium mt-1">{copy.ratingLabel}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-extrabold text-gradient font-[var(--font-heading)]">
                      {breeder.breeds.length}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium mt-1">{copy.breedsLabel}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-extrabold text-gradient font-[var(--font-heading)]">
                      {breeder.reviewCount}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium mt-1">{copy.reviewsLabel}</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Contact */}
            <section className="animate-fade-in-up delay-100">
              <p className="text-sm uppercase tracking-[0.25em] text-warm-orange mb-3 font-semibold">{copy.contactKicker}</p>
              <h2 className="text-2xl md:text-3xl font-extrabold font-[var(--font-heading)] leading-tight mb-6">{copy.contact}</h2>
              <div className="space-y-3">
                {breeder.phone && (
                  <a href={`tel:${breeder.phone}`} className="detail-section-card p-5 flex items-center gap-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-500">
                      <Phone className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground font-medium">{copy.phone}</div>
                      <span className="font-semibold">{breeder.phone}</span>
                    </div>
                  </a>
                )}
                {breeder.email && (
                  <a href={`mailto:${breeder.email}`} className="detail-section-card p-5 flex items-center gap-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-500">
                      <Mail className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground font-medium">{copy.email}</div>
                      <span className="font-semibold">{breeder.email}</span>
                    </div>
                  </a>
                )}
                <div className="detail-section-card p-5 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-sm">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-medium">{copy.location}</div>
                    <span className="font-semibold">{breeder.city}, {copy.croatia}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Breeds */}
            <section className="animate-fade-in-up delay-200">
              <p className="text-sm uppercase tracking-[0.25em] text-warm-orange mb-3 font-semibold">{copy.breedsKicker}</p>
              <h2 className="text-2xl md:text-3xl font-extrabold font-[var(--font-heading)] leading-tight flex items-center gap-3 mb-6">
                {copy.breedsTitle}
                <Badge className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-0 text-sm px-3 py-0.5">
                  {breeder.breeds.length}
                </Badge>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {breeder.breeds.map((breedName) => (
                  <div key={breedName} className="detail-section-card overflow-hidden group">
                    <div className={`h-36 bg-gradient-to-br ${breeder.gradient} opacity-60 flex items-center justify-center group-hover:opacity-80 transition-opacity duration-500`}>
                      <ImageIcon className="h-10 w-10 text-white/50" />
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-[15px] font-[var(--font-heading)] group-hover:text-orange-500 transition-colors">{breedName}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {breeder.species === 'cat' ? copy.cat : copy.dog}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Available litters */}
            <section className="animate-fade-in-up delay-300">
              <p className="text-sm uppercase tracking-[0.25em] text-warm-orange mb-3 font-semibold">{copy.littersKicker}</p>
              <h2 className="text-2xl md:text-3xl font-extrabold font-[var(--font-heading)] leading-tight flex items-center gap-3 mb-6">
                {copy.littersTitle}
                <Badge className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-0 text-sm px-3 py-0.5">
                  {breeder.availableLitters.length}
                </Badge>
              </h2>
              {breeder.availableLitters.length === 0 ? (
                <div className="detail-section-card p-10 md:p-12 text-center">
                  <div className="inline-flex h-16 w-16 rounded-full bg-warm-peach dark:bg-warm-orange/15 items-center justify-center mb-5">
                    <Heart className="h-7 w-7 text-warm-orange" />
                  </div>
                  <p className="text-foreground font-bold text-lg font-[var(--font-heading)] mb-2">{copy.noLitters}</p>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">{copy.noLittersText}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {breeder.availableLitters.map((litter, i) => (
                    <div key={i} className="detail-section-card p-6 group">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-lg group-hover:text-orange-500 transition-colors font-[var(--font-heading)]">{litter.breed}</h3>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1.5">
                            <span>{litter.count} {breeder.species === 'cat' ? copy.kittens : copy.puppies}</span>
                            {litter.ageWeeks > 0 && <span>{litter.ageWeeks} {copy.weeks}</span>}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge
                            className={`text-[10px] rounded-full font-semibold ${
                              litter.status === 'available'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                                : litter.status === 'reserved'
                                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                            }`}
                          >
                            {litter.status === 'available' ? copy.available : litter.status === 'reserved' ? copy.reserved : copy.soon}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-border/30">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <PawPrint className="h-3.5 w-3.5 text-warm-orange" />
                          {breeder.species === 'cat' ? copy.cat : copy.dog}
                        </div>
                        <span className="text-xl font-extrabold text-gradient font-[var(--font-heading)]">{litter.priceFrom}€ – {litter.priceTo}€</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Gallery */}
            <section className="animate-fade-in-up delay-300">
              <p className="text-sm uppercase tracking-[0.25em] text-warm-orange mb-3 font-semibold">{copy.galleryKicker}</p>
              <h2 className="text-2xl md:text-3xl font-extrabold font-[var(--font-heading)] leading-tight mb-6">{copy.gallery}</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className={`aspect-square rounded-2xl bg-gradient-to-br ${breeder.gradient} opacity-40 flex items-center justify-center hover:opacity-60 transition-opacity duration-500 ${
                      i === 0 ? 'md:col-span-2 md:row-span-2' : ''
                    }`}
                  >
                    <ImageIcon className={`text-white/50 ${i === 0 ? 'h-12 w-12' : 'h-8 w-8'}`} />
                  </div>
                ))}
              </div>
            </section>

            {/* Reviews */}
            <section className="animate-fade-in-up delay-300">
              <p className="text-sm uppercase tracking-[0.25em] text-warm-orange mb-3 font-semibold">{copy.reviewsKicker}</p>
              <h2 className="text-2xl md:text-3xl font-extrabold font-[var(--font-heading)] leading-tight flex items-center gap-3 mb-6">
                {copy.reviewsTitle}
                <Badge className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-0 text-sm px-3 py-0.5">
                  {breeder.reviewCount}
                </Badge>
              </h2>

              {breeder.reviewCount === 0 ? (
                <div className="detail-section-card p-10 md:p-12 text-center">
                  <div className="inline-flex h-16 w-16 rounded-full bg-warm-peach dark:bg-warm-orange/15 items-center justify-center mb-5">
                    <Star className="h-7 w-7 text-warm-orange" />
                  </div>
                  <p className="text-foreground font-bold text-lg font-[var(--font-heading)] mb-2">{copy.noReviews}</p>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">{copy.beFirst}</p>
                </div>
              ) : (
                <div className="space-y-0">
                  {[
                    {
                      name: 'Marko T.',
                      initial: 'M',
                      rating: 5,
                      text: isEn ? 'Excellent breeder. Our puppy is healthy and well socialized. Highly recommended.' : 'Odličan uzgajivač! Naš štene je zdrav i dobro socijaliziran. Preporučujem svima.',
                    },
                    {
                      name: 'Ana K.',
                      initial: 'A',
                      rating: 5,
                      text: isEn ? 'Professional approach, answers every question, and provides support even after the purchase.' : 'Profesionalan pristup, odgovaraju na sva pitanja i pružaju podršku i nakon kupnje.',
                    },
                    {
                      name: 'Ivan M.',
                      initial: 'I',
                      rating: 4,
                      text: isEn ? 'Good communication and healthy pets. The price is fair for the quality.' : 'Dobra komunikacija i zdravi ljubimci. Cijena je korektna za kvalitetu.',
                    },
                    {
                      name: 'Petra S.',
                      initial: 'P',
                      rating: 5,
                      text: isEn ? 'We immediately felt trust with this breeder. The puppy arrived with all paperwork and in excellent health.' : 'Uzgajivač s kojim smo odmah osjetili povjerenje. Štene je stiglo sa svim papirima i u odličnom zdravstvenom stanju.',
                    },
                  ].map((review, i) => (
                    <div key={review.name} className={`detail-section-card p-6 md:p-7 ${i > 0 ? 'mt-4' : ''}`}>
                      <div className="flex items-start gap-4">
                        <Avatar className="h-11 w-11 border-2 border-border/20 flex-shrink-0">
                          <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-300 text-white text-sm font-semibold">
                            {review.initial}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-bold text-sm">{review.name}</span>
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, j) => (
                                <Star key={j} className={`h-3.5 w-3.5 ${j < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200 dark:text-gray-700'}`} />
                              ))}
                            </div>
                          </div>
                          <p className="text-[15px] text-muted-foreground leading-relaxed">{review.text}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* ── Premium Sidebar ── */}
          <div className="space-y-6">
            <div className="detail-sidebar-panel sticky top-20 p-7 md:p-8 space-y-7">

              {/* Price hero */}
              {minPrice !== null && (
                <>
                  <div className="text-center">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1">{copy.fromPrice}</p>
                    <div className="text-5xl md:text-6xl font-extrabold text-gradient font-[var(--font-heading)] leading-none">
                      {minPrice}&euro;
                    </div>
                    <p className="text-muted-foreground text-xs mt-2.5">{copy.priceDepends}</p>
                  </div>
                  <Separator className="opacity-50" />
                </>
              )}

              {/* Primary CTA */}
              <div className="space-y-3">
                <ContactFormDialog breeder={breeder} isEn={isEn}>
                  <Button
                    className="w-full bg-orange-500 hover:bg-orange-600 btn-hover shadow-lg shadow-orange-200/50 dark:shadow-orange-900/20 rounded-full h-13 text-[15px] font-bold"
                    size="lg"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    {copy.sendInquiry}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </ContactFormDialog>
                {breeder.phone && (
                  <a href={`tel:${breeder.phone}`} className="block">
                    <Button
                      variant="outline"
                      className="w-full hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:text-orange-600 hover:border-orange-300 rounded-full h-12 text-[15px] font-semibold"
                      size="lg"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      {copy.phone}
                    </Button>
                  </a>
                )}
              </div>

              <Separator className="opacity-50" />

              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-warm-peach dark:bg-warm-orange/15 px-4 py-4 text-center">
                  <div className="text-2xl font-extrabold text-orange-600 dark:text-orange-400 font-[var(--font-heading)]">{breeder.breeds.length}</div>
                  <div className="text-[11px] text-muted-foreground font-medium mt-1 uppercase tracking-wider">{copy.breedsLabel}</div>
                </div>
                <div className="rounded-2xl bg-teal-50 dark:bg-teal-900/20 px-4 py-4 text-center">
                  <div className="text-2xl font-extrabold text-teal-600 dark:text-teal-400 font-[var(--font-heading)]">{breeder.reviewCount}</div>
                  <div className="text-[11px] text-muted-foreground font-medium mt-1 uppercase tracking-wider">{copy.reviewsLabel}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 px-4 py-4 text-center">
                  <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 font-[var(--font-heading)]">{breeder.availableLitters.length}</div>
                  <div className="text-[11px] text-muted-foreground font-medium mt-1 uppercase tracking-wider">{copy.littersCount}</div>
                </div>
                <div className="rounded-2xl bg-blue-50 dark:bg-blue-900/20 px-4 py-4 text-center">
                  <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 font-[var(--font-heading)]">
                    {breeder.yearsExperience > 0 ? breeder.yearsExperience : '—'}
                  </div>
                  <div className="text-[11px] text-muted-foreground font-medium mt-1 uppercase tracking-wider">{copy.years}</div>
                </div>
              </div>

              <Separator className="opacity-50" />

              {/* Species + certifications */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{copy.species}</span>
                  <span className="font-semibold">{speciesLabel}</span>
                </div>
                {breeder.verified && (
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="h-4 w-4 text-emerald-500" />
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">{copy.registeredBreeder}</span>
                  </div>
                )}
                {breeder.fciRegistered && (
                  <div className="flex items-center gap-2 text-sm">
                    <Award className="h-4 w-4 text-blue-500" />
                    <span className="font-semibold text-blue-600 dark:text-blue-400">{copy.fciRegistered}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related breeders */}
        {relatedBreeders.length > 0 && (
          <section className="mt-20 pt-12 border-t border-border/30">
            <p className="text-sm uppercase tracking-[0.25em] text-warm-orange mb-3 font-semibold">{copy.discoverKicker}</p>
            <h2 className="text-2xl md:text-3xl font-extrabold font-[var(--font-heading)] leading-tight mb-8">{copy.moreBreeders}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedBreeders.map((b) => (
                <Link key={b.id} href={`/uzgajivacnice${localeSegment}/${b.id}`} className="group">
                  <Card className="overflow-hidden border border-border/30 rounded-2xl provider-card">
                    <CardContent className="p-0">
                      <div className={`h-28 bg-gradient-to-br ${b.gradient} flex items-center justify-center relative`}>
                        <div className="absolute inset-0 paw-pattern opacity-[0.06]" />
                        <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors duration-500" />
                        <Avatar className="h-16 w-16 border-3 border-white shadow-xl relative group-hover:scale-105 transition-transform duration-500">
                          <AvatarFallback className="bg-white/90 text-gray-700 text-xl font-bold">
                            {b.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="p-5">
                        <h3 className="font-bold text-[15px] group-hover:text-orange-500 transition-colors font-[var(--font-heading)]">{b.name}</h3>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1.5">
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{b.city}</span>
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            {b.rating.toFixed(1)}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {b.breeds.slice(0, 2).map((breed) => (
                            <Badge key={breed} variant="secondary" className="text-[10px] font-normal rounded-full">
                              {breed}
                            </Badge>
                          ))}
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

function ContactFormDialog({ breeder, isEn, children }: { breeder: Breeder; isEn: boolean; children: React.ReactNode }) {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <Dialog>
      <DialogTrigger render={children as React.ReactElement}>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-[var(--font-heading)] text-xl">
            {isEn ? `Send inquiry — ${breeder.name}` : `Pošalji upit — ${breeder.name}`}
          </DialogTitle>
        </DialogHeader>
        {sent ? (
          <div className="text-center py-10">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
              <Send className="h-8 w-8 text-emerald-500" />
            </div>
            <h3 className="font-bold text-lg mb-2 font-[var(--font-heading)]">{isEn ? 'Inquiry sent!' : 'Upit poslan!'}</h3>
            <p className="text-sm text-muted-foreground">{isEn ? 'The breeder will get back to you as soon as possible.' : 'Uzgajivač će vam odgovoriti u najkraćem roku.'}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="contact-name" className="text-sm font-medium">{isEn ? 'Full name' : 'Ime i prezime'}</Label>
              <Input id="contact-name" required className="mt-1 rounded-xl" />
            </div>
            <div>
              <Label htmlFor="contact-email" className="text-sm font-medium">Email</Label>
              <Input id="contact-email" type="email" required className="mt-1 rounded-xl" />
            </div>
            <div>
              <Label htmlFor="contact-phone" className="text-sm font-medium">{isEn ? 'Phone' : 'Telefon'}</Label>
              <Input id="contact-phone" type="tel" className="mt-1 rounded-xl" />
            </div>
            <div>
              <Label htmlFor="contact-breed" className="text-sm font-medium">{isEn ? 'Which breed are you interested in?' : 'Koja pasmina vas zanima?'}</Label>
              <select id="contact-breed" className="premium-select mt-1">
                {breeder.breeds.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="contact-message" className="text-sm font-medium">{isEn ? 'Message' : 'Poruka'}</Label>
              <Textarea id="contact-message" required rows={3} className="mt-1 rounded-xl" placeholder={isEn ? 'Write your inquiry...' : 'Napišite vaš upit...'} />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" className="rounded border-input accent-orange-500" />
                {isEn ? 'I have experience with this breed' : 'Imam iskustva s pasminom'}
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" className="rounded border-input accent-orange-500" />
                {isEn ? 'I have a yard / garden' : 'Imam vrt/dvorište'}
              </label>
            </div>
            <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 btn-hover shadow-lg shadow-orange-200/50 dark:shadow-orange-900/20 rounded-xl h-12 text-[15px] font-semibold">
              <Send className="h-4 w-4 mr-2" />
              {isEn ? 'Send inquiry' : 'Pošalji upit'}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

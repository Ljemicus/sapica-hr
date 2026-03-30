'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Star, MapPin, Shield, Award, Phone, Mail, Clock, Baby, ChevronRight,
  Image as ImageIcon, MessageSquare, Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { Breeder } from '@/lib/mock-breeders';

interface BreederDetailContentProps {
  breeder: Breeder;
  relatedBreeders: Breeder[];
}

export function BreederDetailContent({ breeder, relatedBreeders }: BreederDetailContentProps) {
  return (
    <div>
      {/* Header */}
      <section className={`relative overflow-hidden bg-gradient-to-br ${breeder.gradient}`}>
        <div className="absolute inset-0 paw-pattern opacity-10" />
        <div className="container mx-auto px-4 py-12 md:py-16 relative">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Avatar className="h-28 w-28 border-4 border-white shadow-lg">
              <AvatarFallback className="bg-white/90 text-gray-700 text-4xl font-bold">
                {breeder.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-center md:text-left">
              <h1 className="text-2xl md:text-4xl font-extrabold text-white mb-2 font-[var(--font-heading)] drop-shadow-sm">
                {breeder.name}
              </h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-white/90">
                <span className="flex items-center gap-1 text-sm"><MapPin className="h-4 w-4" />{breeder.city}</span>
                <span className="flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-amber-300 text-amber-300" />
                  {breeder.rating.toFixed(1)} ({breeder.reviewCount} recenzija)
                </span>
                <span className="flex items-center gap-1 text-sm"><Clock className="h-4 w-4" />{breeder.yearsExperience} god. iskustva</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                {breeder.verified && (
                  <Badge className="bg-white/90 text-green-600 text-xs shadow-sm hover:bg-white/90 rounded-full px-3">
                    <Shield className="h-3 w-3 mr-1" />Registriran uzgajivač
                  </Badge>
                )}
                {breeder.fciRegistered && (
                  <Badge className="bg-white/90 text-blue-600 text-xs shadow-sm hover:bg-white/90 rounded-full px-3">
                    <Award className="h-3 w-3 mr-1" />FCI registriran
                  </Badge>
                )}
                {breeder.certified && (
                  <Badge className="bg-white/90 text-purple-600 text-xs shadow-sm hover:bg-white/90 rounded-full px-3">
                    Certificiran
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Bio */}
            <Card className="border-0 shadow-sm rounded-2xl">
              <CardContent className="p-6">
                <h2 className="text-lg font-bold mb-3 font-[var(--font-heading)]">O uzgajivačnici</h2>
                <p className="text-muted-foreground leading-relaxed">{breeder.bio}</p>
              </CardContent>
            </Card>

            {/* Breeds */}
            <Card className="border-0 shadow-sm rounded-2xl">
              <CardContent className="p-6">
                <h2 className="text-lg font-bold mb-4 font-[var(--font-heading)]">Pasmine koje uzgajamo</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {breeder.breeds.map((breedName) => (
                    <div key={breedName} className="rounded-xl overflow-hidden border border-border/50">
                      <div className={`h-32 bg-gradient-to-br ${breeder.gradient} opacity-60 flex items-center justify-center`}>
                        <ImageIcon className="h-10 w-10 text-white/50" />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-sm">{breedName}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {breeder.species === 'cat' ? 'Mačka' : 'Pas'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Available litters */}
            <Card className="border-0 shadow-sm rounded-2xl">
              <CardContent className="p-6">
                <h2 className="text-lg font-bold mb-4 font-[var(--font-heading)]">Dostupna legla</h2>
                {breeder.availableLitters.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Trenutno nema dostupnih legala.</p>
                ) : (
                  <div className="space-y-3">
                    {breeder.availableLitters.map((litter, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-accent border border-border/50">
                        <div>
                          <h3 className="font-semibold text-sm">{litter.breed}</h3>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                            <span>{litter.count} {breeder.species === 'cat' ? 'mačića' : 'štenaca'}</span>
                            {litter.ageWeeks > 0 && <span>{litter.ageWeeks} tjedana</span>}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge
                            className={`text-[10px] rounded-full ${
                              litter.status === 'available'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                                : litter.status === 'reserved'
                                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                            }`}
                          >
                            {litter.status === 'available' ? 'Dostupno' : litter.status === 'reserved' ? 'Rezervirano' : 'Uskoro'}
                          </Badge>
                          <p className="text-sm font-semibold mt-1">{litter.priceFrom}€ – {litter.priceTo}€</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Gallery placeholder */}
            <Card className="border-0 shadow-sm rounded-2xl">
              <CardContent className="p-6">
                <h2 className="text-lg font-bold mb-4 font-[var(--font-heading)]">Galerija</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className={`aspect-square rounded-xl bg-gradient-to-br ${breeder.gradient} opacity-40 flex items-center justify-center`}>
                      <ImageIcon className="h-8 w-8 text-white/50" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card className="border-0 shadow-sm rounded-2xl">
              <CardContent className="p-6">
                <h2 className="text-lg font-bold mb-4 font-[var(--font-heading)]">Recenzije</h2>
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-4xl font-bold">{breeder.rating.toFixed(1)}</div>
                  <div>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-5 w-5 ${i < Math.round(breeder.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{breeder.reviewCount} recenzija</p>
                  </div>
                </div>
                {/* Mock reviews */}
                {[
                  { name: 'Marko T.', rating: 5, text: 'Odličan uzgajivač! Naš štene je zdrav i dobro socijaliziran. Preporučujem svima.' },
                  { name: 'Ana K.', rating: 5, text: 'Profesionalan pristup, odgovaraju na sva pitanja i pružaju podršku i nakon kupnje.' },
                  { name: 'Ivan M.', rating: 4, text: 'Dobra komunikacija i zdravi ljubimci. Cijena je korektna za kvalitetu.' },
                ].map((review) => (
                  <div key={review.name} className="py-4 border-b border-border/50 last:border-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">{review.name}</span>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{review.text}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact info */}
            <Card className="border-0 shadow-sm rounded-2xl sticky top-20">
              <CardContent className="p-6 space-y-4">
                <h2 className="text-lg font-bold font-[var(--font-heading)]">Kontakt</h2>
                <div className="space-y-3">
                  <a href={`tel:${breeder.phone}`} className="flex items-center gap-3 text-sm hover:text-orange-500 transition-colors">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-500">
                      <Phone className="h-4 w-4" />
                    </div>
                    {breeder.phone}
                  </a>
                  <a href={`mailto:${breeder.email}`} className="flex items-center gap-3 text-sm hover:text-orange-500 transition-colors">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-500">
                      <Mail className="h-4 w-4" />
                    </div>
                    {breeder.email}
                  </a>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-500">
                      <MapPin className="h-4 w-4" />
                    </div>
                    {breeder.city}, Hrvatska
                  </div>
                </div>

                <ContactFormDialog breeder={breeder} />

                <div className="pt-3 border-t border-border/50 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Iskustvo</span>
                    <span className="font-medium">{breeder.yearsExperience} godina</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pasmine</span>
                    <span className="font-medium">{breeder.breeds.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Vrsta</span>
                    <span className="font-medium">{breeder.species === 'dog' ? 'Psi' : breeder.species === 'cat' ? 'Mačke' : 'Psi i mačke'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Related breeders */}
        {relatedBreeders.length > 0 && (
          <section className="mt-12 pt-8 border-t border-border/50">
            <h2 className="text-2xl font-extrabold mb-6 font-[var(--font-heading)]">Više uzgajivača</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {relatedBreeders.map((b) => (
                <Link key={b.id} href={`/uzgajivacnice/${b.id}`} className="group">
                  <Card className="overflow-hidden border-0 shadow-sm rounded-2xl card-hover">
                    <CardContent className="p-0">
                      <div className={`h-24 bg-gradient-to-br ${b.gradient} flex items-center justify-center relative`}>
                        <div className="absolute inset-0 paw-pattern opacity-10" />
                        <Avatar className="h-14 w-14 border-3 border-white shadow-lg relative">
                          <AvatarFallback className="bg-white/90 text-gray-700 text-lg font-bold">
                            {b.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-sm group-hover:text-orange-500 transition-colors">{b.name}</h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{b.city}</span>
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            {b.rating.toFixed(1)}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {b.breeds.slice(0, 2).map((breed) => (
                            <Badge key={breed} variant="secondary" className="text-[10px] font-normal">
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

function ContactFormDialog({ breeder }: { breeder: Breeder }) {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <Dialog>
      <DialogTrigger render={<Button className="w-full bg-orange-500 hover:bg-orange-600 btn-hover rounded-xl font-semibold" />}>
        <MessageSquare className="h-4 w-4 mr-2" />
        Pošalji upit
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-[var(--font-heading)]">Pošalji upit — {breeder.name}</DialogTitle>
        </DialogHeader>
        {sent ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
              <Send className="h-8 w-8 text-emerald-500" />
            </div>
            <h3 className="font-bold text-lg mb-2">Upit poslan!</h3>
            <p className="text-sm text-muted-foreground">Uzgajivač će vam odgovoriti u najkraćem roku.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="contact-name" className="text-sm">Ime i prezime</Label>
              <Input id="contact-name" required className="mt-1 rounded-lg" />
            </div>
            <div>
              <Label htmlFor="contact-email" className="text-sm">Email</Label>
              <Input id="contact-email" type="email" required className="mt-1 rounded-lg" />
            </div>
            <div>
              <Label htmlFor="contact-phone" className="text-sm">Telefon</Label>
              <Input id="contact-phone" type="tel" className="mt-1 rounded-lg" />
            </div>
            <div>
              <Label htmlFor="contact-breed" className="text-sm">Koja pasmina vas zanima?</Label>
              <select id="contact-breed" className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm mt-1">
                {breeder.breeds.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="contact-message" className="text-sm">Poruka</Label>
              <Textarea id="contact-message" required rows={3} className="mt-1 rounded-lg" placeholder="Napišite vaš upit..." />
            </div>
            <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 btn-hover rounded-xl font-semibold">
              <Send className="h-4 w-4 mr-2" />
              Pošalji upit
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

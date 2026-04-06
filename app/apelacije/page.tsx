import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BadgeCheck, HeartHandshake, MapPin, Shield, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

import { Button } from '@/components/ui/button';
import { getActiveRescueAppeals } from '@/lib/db';
import { APPEAL_STATUS_LABELS, getAppealProgressPct } from '@/lib/types';
import { ItemListJsonLd } from '@/components/seo/json-ld';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://petpark.hr';

export const metadata: Metadata = {
  title: 'Rescue apelacije | PetPark',
  description: 'Javne rescue apelacije za pomoć životinjama u potrebi. Pregledaj aktivne slučajeve i pomozi direktno organizacijama koje brinu o spašenim životinjama.',
  openGraph: {
    title: 'Rescue apelacije | PetPark',
    description: 'Javne rescue apelacije za pomoć životinjama u potrebi. Pregledaj aktivne slučajeve i pomozi direktno organizacijama.',
    type: 'website',
    url: '/apelacije',
    siteName: 'PetPark',
    locale: 'hr_HR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rescue apelacije | PetPark',
    description: 'Javne rescue apelacije za pomoć životinjama u potrebi.',
  },
  alternates: {
    canonical: `${BASE_URL}/apelacije`,
  },
};

const urgencyLabels = {
  low: 'Niži prioritet',
  normal: 'Standardno',
  high: 'Visok prioritet',
  critical: 'Kritično',
} as const;

const urgencyColors = {
  low: 'bg-gray-100 text-gray-700',
  normal: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-rose-100 text-rose-700',
} as const;

export default async function RescueAppealsPage() {
  const appeals = await getActiveRescueAppeals();

  const jsonLdItems = appeals.map((appeal) => ({
    name: appeal.title,
    url: `${BASE_URL}/apelacije/${appeal.slug}`,
    description: appeal.summary,
  }));

  return (
    <>
      <ItemListJsonLd items={jsonLdItems} />
      <div className="min-h-screen bg-background">
        {/* Editorial Hero */}
        <section className="relative appeals-hero-gradient overflow-hidden">
          <div className="absolute inset-0 paw-pattern opacity-[0.03]" />
          <div className="container mx-auto max-w-6xl px-6 md:px-10 lg:px-16 py-20 md:py-28 relative">
            <div className="max-w-3xl animate-fade-in-up">
              <p className="section-kicker">Appeals</p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-[var(--font-heading)] leading-[1.05] tracking-tight mb-6">
                Rescue apelacije
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
                Pregledaj aktivne slučajeve i pomozi direktno organizacijama koje brinu o spašenim životinjama. Svaka donacija ide izravno organizaciji.
              </p>
            </div>
          </div>
        </section>

        {/* Info Panel */}
        <div className="container mx-auto max-w-6xl px-6 md:px-10 lg:px-16 -mt-8 relative z-10">
          <div className="info-panel p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-warm-orange/10 flex items-center justify-center shrink-0">
                <HeartHandshake className="h-5 w-5 text-warm-orange" />
              </div>
              <div>
                <p className="font-semibold">Kako radi ovaj listing</p>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li>• prikazujemo samo aktivne apelacije iz verificiranih organizacija</li>
                  <li>• donacije idu direktno organizaciji, ne kroz PetPark</li>
                  <li>• svaka organizacija mora proći verifikaciju prije objave</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Appeals Grid */}
        <div className="container mx-auto max-w-6xl px-6 md:px-10 lg:px-16 py-12 md:py-16">

          {appeals.length === 0 ? (
            <div className="appeal-card p-8 text-center">
              <p className="text-muted-foreground">
                Trenutno nema javno objavljenih apelacija. Kad rescue organizacije objave active slučajeve, pojavit će se ovdje.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {appeals.map((appeal, index) => {
                const progress = getAppealProgressPct(appeal);
                const org = appeal.organization;
                const isVerified = org?.verification_status === 'approved';

                return (
                  <div 
                    key={appeal.id} 
                    className="appeal-card animate-fade-in-up"
                    style={{ animationDelay: `${Math.min(index * 100, 500)}ms` }}
                  >
                    <div className="p-6">
                      {/* Badges Row */}
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="bg-muted/60">{APPEAL_STATUS_LABELS[appeal.status]}</Badge>
                        <Badge className={urgencyColors[appeal.urgency]}>{urgencyLabels[appeal.urgency]}</Badge>
                        {appeal.species && <Badge variant="outline" className="border-border/40">{appeal.species}</Badge>}
                      </div>

                      <h2 className="mt-4 text-xl md:text-2xl font-semibold font-[var(--font-heading)] leading-tight">{appeal.title}</h2>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground line-clamp-3">{appeal.summary}</p>

                      {/* Organization with Verification Badge */}
                      <div className="mt-5 flex items-center gap-3 p-4 rounded-xl bg-muted/30 border border-border/20">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                            Organizacija
                            {isVerified && (
                              <Badge className="bg-emerald-100 text-emerald-700 border-0 gap-1 text-xs font-medium">
                                <BadgeCheck className="h-3 w-3" />
                                Verificirana
                              </Badge>
                            )}
                            {!isVerified && org?.verification_status === 'pending' && (
                              <Badge variant="outline" className="text-amber-600 border-amber-200/60 gap-1 text-xs font-medium">
                                <Shield className="h-3 w-3" />
                                U provjeri
                              </Badge>
                            )}
                          </p>
                          <div className="mt-1 flex items-center gap-2 text-sm">
                            <span className="font-semibold text-foreground">{org?.display_name ?? 'Nepoznato'}</span>
                            {org?.city && (
                              <>
                                <span className="text-muted-foreground">•</span>
                                <span className="inline-flex items-center gap-1 text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  {org.city}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        {org && (
                          <Link href={`/udruge/${org.slug}`}>
                            <Button variant="ghost" size="sm" className="shrink-0 text-warm-orange hover:text-warm-orange/80 hover:bg-warm-orange/5">
                              Profil
                            </Button>
                          </Link>
                        )}
                      </div>

                      {/* Progress Bar */}
                      {appeal.target_amount_cents > 0 && (
                        <div className="mt-5 rounded-2xl bg-gradient-to-br from-emerald-50/80 to-emerald-50/40 p-5 border border-emerald-100/50">
                          <div className="flex items-center justify-between text-sm mb-3">
                            <span className="inline-flex items-center gap-2 font-semibold text-emerald-900">
                              <Target className="h-4 w-4 text-emerald-600" />
                              Napredak apelacije
                            </span>
                            <span className="font-bold text-emerald-700">{progress}%</span>
                          </div>
                          <div className="appeal-progress-bar">
                            <div 
                              className="appeal-progress-fill"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <div className="mt-3 flex items-center justify-between text-xs">
                            <span className="text-emerald-700 font-medium">{formatCurrency(appeal.raised_amount_cents)} skupljeno</span>
                            <span className="text-emerald-600">Cilj: {formatCurrency(appeal.target_amount_cents)}</span>
                          </div>
                          <p className="mt-2 text-xs text-emerald-600/80">
                            {appeal.donor_count} {appeal.donor_count === 1 ? 'donator' : 'donatora'}
                          </p>
                        </div>
                      )}

                      {/* No progress yet */}
                      {appeal.target_amount_cents === 0 && (
                        <div className="mt-5 rounded-2xl bg-muted/30 p-5 border border-border/20">
                          <p className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                            <HeartHandshake className="h-4 w-4 text-warm-orange" />
                            Uskoro dostupno
                          </p>
                          <p className="mt-2 text-sm text-muted-foreground">
                            Donacije još nisu omogućene. Prati ovu apelaciju za ažuriranja.
                          </p>
                        </div>
                      )}

                      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <Link href={`/apelacije/${appeal.slug}`}>
                          <Button className="gap-2 h-11 bg-warm-orange hover:bg-warm-orange/90 text-white">
                            Otvori detalj <ArrowRight className="h-4 w-4" />
                          </Button>
                        </Link>
                        {org && (
                          <Link href={`/udruge/${org.slug}`} className="text-sm font-medium text-warm-orange hover:text-warm-orange/80 transition-colors">
                            Profil organizacije →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Bottom CTA */}
          <div className="mt-12 appeal-card p-6 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                  <HeartHandshake className="h-4 w-4 text-warm-orange" />
                  Želiš li pomoći? Pogledaj sve rescue udruge
                </p>
                <p className="text-sm text-muted-foreground">
                  Upoznaj organizacije i njihov rad prije nego što doniraš.
                </p>
              </div>
              <Link href="/udruge">
                <Button variant="outline" className="gap-2 h-11 border-warm-orange/30 text-warm-orange hover:bg-warm-orange/5 hover:text-warm-orange">
                  Sve udruge <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function formatCurrency(amountCents: number): string {
  return new Intl.NumberFormat('hr-HR', { 
    style: 'currency', 
    currency: 'EUR',
    maximumFractionDigits: 0 
  }).format(amountCents / 100);
}

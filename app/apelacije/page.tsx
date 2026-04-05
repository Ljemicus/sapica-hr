import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BadgeCheck, CalendarDays, HeartHandshake, MapPin, Shield, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
      <div className="min-h-screen bg-gradient-to-b from-rose-50/60 via-white to-orange-50/40">
        <div className="container mx-auto max-w-6xl px-4 py-10">
          <div className="mb-8 grid gap-4 lg:grid-cols-[1fr_320px]">
            <div className="space-y-3">
              <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100 border-0">Appeals</Badge>
              <h1 className="text-3xl font-bold tracking-tight font-[var(--font-heading)] md:text-4xl">Rescue apelacije koje su stvarno objavljene</h1>
              <p className="max-w-3xl text-muted-foreground md:text-lg">
                Ovdje prikazujemo samo aktivne apelacije iz baze. Nema mock iznosa, nema fake badgeva i nema checkout flowa dok payment lane ne sjedne kako spada.
              </p>
            </div>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <p className="text-sm font-semibold">Kako radi ovaj listing</p>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li>• vidiš samo active apelacije</li>
                  <li>• organizacija mora biti aktivna da apelacija bude javna</li>
                  <li>• donacije još nisu puštene live</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {appeals.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-8 text-center text-sm text-muted-foreground">
                Trenutno nema javno objavljenih apelacija. Kad rescue organizacije objave active slučajeve, pojavit će se ovdje.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {appeals.map((appeal) => {
                const progress = getAppealProgressPct(appeal);
                const org = appeal.organization;
                const isVerified = org?.verification_status === 'approved';

                return (
                  <Card key={appeal.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      {/* Badges Row */}
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">{APPEAL_STATUS_LABELS[appeal.status]}</Badge>
                        <Badge className={urgencyColors[appeal.urgency]}>{urgencyLabels[appeal.urgency]}</Badge>
                        {appeal.species && <Badge variant="outline">{appeal.species}</Badge>}
                      </div>

                      <h2 className="mt-4 text-2xl font-semibold font-[var(--font-heading)]">{appeal.title}</h2>
                      <p className="mt-3 text-sm leading-6 text-muted-foreground line-clamp-3">{appeal.summary}</p>

                      {/* Organization with Verification Badge */}
                      <div className="mt-5 flex items-center gap-3 p-3 rounded-xl bg-muted/40">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold flex items-center gap-2">
                            Organizacija
                            {isVerified && (
                              <Badge className="bg-blue-100 text-blue-700 border-0 gap-1 text-xs">
                                <BadgeCheck className="h-3 w-3" />
                                Verificirana
                              </Badge>
                            )}
                            {!isVerified && org?.verification_status === 'pending' && (
                              <Badge variant="outline" className="text-amber-600 border-amber-200 gap-1 text-xs">
                                <Shield className="h-3 w-3" />
                                U provjeri
                              </Badge>
                            )}
                          </p>
                          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">{org?.display_name ?? 'Nepoznato'}</span>
                            {org?.city && (
                              <>
                                <span>•</span>
                                <span className="inline-flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {org.city}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        {org && (
                          <Link href={`/udruge/${org.slug}`}>
                            <Button variant="ghost" size="sm" className="shrink-0">
                              Profil
                            </Button>
                          </Link>
                        )}
                      </div>

                      {/* Progress Bar */}
                      {appeal.target_amount_cents > 0 && (
                        <div className="mt-5 rounded-2xl bg-emerald-50 p-4">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="inline-flex items-center gap-2 font-medium text-emerald-900">
                              <Target className="h-4 w-4 text-emerald-600" />
                              Napredak apelacije
                            </span>
                            <span className="font-semibold text-emerald-700">{progress}%</span>
                          </div>
                          <div className="h-2.5 w-full rounded-full bg-emerald-100 overflow-hidden">
                            <div 
                              className="h-full rounded-full bg-emerald-500 transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <div className="mt-2 flex items-center justify-between text-xs text-emerald-700">
                            <span>{formatCurrency(appeal.raised_amount_cents)} skupljeno</span>
                            <span>Cilj: {formatCurrency(appeal.target_amount_cents)}</span>
                          </div>
                          <p className="mt-2 text-xs text-emerald-600">
                            {appeal.donor_count} {appeal.donor_count === 1 ? 'donator' : 'donatora'}
                          </p>
                        </div>
                      )}

                      {/* No progress yet */}
                      {appeal.target_amount_cents === 0 && (
                        <div className="mt-5 rounded-2xl bg-muted/40 p-4">
                          <p className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                            <HeartHandshake className="h-4 w-4 text-rose-600" />
                            Napredak bez checkouta
                          </p>
                          <p className="mt-2 text-sm text-muted-foreground">
                            Donacije još nisu omogućene. Prati ovu apelaciju za ažuriranja.
                          </p>
                        </div>
                      )}

                      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <Link href={`/apelacije/${appeal.slug}`}>
                          <Button className="gap-2 h-11">
                            Otvori detalj apelacije <ArrowRight className="h-4 w-4" />
                          </Button>
                        </Link>
                        {org && (
                          <Link href={`/udruge/${org.slug}`} className="text-sm font-medium text-rose-700 hover:underline">
                            Profil organizacije →
                          </Link>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Bottom CTA */}
          <Card className="mt-8 border-0 shadow-sm">
            <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                  <HeartHandshake className="h-4 w-4 text-emerald-600" />
                  Želiš li pomoći? Pogledaj sve rescue udruge
                </p>
                <p className="text-sm text-muted-foreground">
                  Upoznaj organizacije i njihov rad prije nego što doniraš.
                </p>
              </div>
              <Link href="/udruge">
                <Button variant="outline" className="gap-2 h-11">
                  Sve udruge <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
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

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, BellRing, CircleDashed, ExternalLink, HeartHandshake, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAppealUpdates, getRescueAppealBySlug } from '@/lib/db';
import { APPEAL_STATUS_LABELS, RESCUE_DONATION_LINK_STATUS_LABELS, RESCUE_VERIFICATION_STATUS_LABELS } from '@/lib/types';
import { hasApprovedExternalDonationLink } from '@/lib/rescue-utils';
import { ShareButtons } from './share-buttons';

interface Props {
  params: Promise<{ slug: string }>;
}

const urgencyLabels = {
  low: 'Niži prioritet',
  normal: 'Standardno',
  high: 'Visok prioritet',
  critical: 'Kritično',
} as const;

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://petpark.hr';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const appeal = await getRescueAppealBySlug(slug);

  if (!appeal || appeal.status !== 'active') {
    return { title: 'Apelacija nije pronađena', robots: { index: false, follow: false } };
  }

  const title = `${appeal.title} | Apelacija za pomoć`;
  const description = appeal.summary || appeal.story?.slice(0, 160) || 'Pomozite udruzi u njihovoj misiji spašavanja životinja.';
  const imageUrl = appeal.cover_image_url || '/opengraph-image';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `/apelacije/${slug}`,
      siteName: 'PetPark',
      locale: 'hr_HR',
      images: imageUrl.startsWith('http') 
        ? [{ url: imageUrl, width: 1200, height: 630, alt: appeal.title }]
        : [{ url: imageUrl, width: 1200, height: 630, alt: appeal.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imageUrl.startsWith('http') ? [imageUrl] : [imageUrl],
    },
    alternates: {
      canonical: `${BASE_URL}/apelacije/${slug}`,
    },
  };
}

export default async function RescueAppealDetailPage({ params }: Props) {
  const { slug } = await params;
  const appeal = await getRescueAppealBySlug(slug);

  if (!appeal || appeal.status !== 'active') notFound();

  const organization = appeal.organization;
  const updates = await getAppealUpdates(appeal.id, { publicOnly: true });
  const progress = getAppealProgressPct(appeal);
  const canShowDonationCta = hasApprovedExternalDonationLink(organization);

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/50 via-white to-white">
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <Link href="/apelacije" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Natrag na apelacije
        </Link>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{APPEAL_STATUS_LABELS[appeal.status]}</Badge>
              <Badge variant="outline">{urgencyLabels[appeal.urgency]}</Badge>
              {appeal.species && <Badge variant="outline">{appeal.species}</Badge>}
              {organization && <Badge variant="outline">Verification: {RESCUE_VERIFICATION_STATUS_LABELS[organization.verification_status]}</Badge>}
            </div>

            <h1 className="mt-4 text-3xl font-bold tracking-tight font-[var(--font-heading)] md:text-4xl">{appeal.title}</h1>
            <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">{appeal.story || appeal.summary}</p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-muted/50 p-5">
                <p className="text-sm font-semibold">Organizacija</p>
                <p className="mt-2 text-sm text-muted-foreground">{organization?.display_name ?? 'Nepoznato'}</p>
                {organization && (
                  <Link href={`/udruge/${organization.slug}`} className="mt-3 inline-flex text-sm font-medium text-rose-700 hover:underline">
                    Pogledaj profil organizacije
                  </Link>
                )}
              </div>

              <div className="rounded-2xl bg-muted/50 p-5">
                <p className="inline-flex items-center gap-2 text-sm font-semibold">
                  <CircleDashed className="h-4 w-4 text-rose-600" />
                  Transparentni progress
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Dosad je evidentirano {progress}% cilja ({formatCurrency(appeal.raised_amount_cents, appeal.currency)} od {formatCurrency(appeal.target_amount_cents, appeal.currency)}).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold font-[var(--font-heading)]">Detalji apelacije</h2>
              <dl className="mt-4 grid gap-4 text-sm md:grid-cols-2">
                <div>
                  <dt className="font-semibold">Kome se pomaže</dt>
                  <dd className="mt-1 text-muted-foreground">{appeal.beneficiary_name ?? '—'}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Lokacija</dt>
                  <dd className="mt-1 text-muted-foreground">{appeal.location_label ?? organization?.city ?? '—'}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Donatora</dt>
                  <dd className="mt-1 text-muted-foreground">{appeal.donor_count}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Objavljeno</dt>
                  <dd className="mt-1 text-muted-foreground">{formatDate(appeal.starts_at ?? appeal.created_at)}</dd>
                </div>
              </dl>

              <div className="mt-6 rounded-2xl border border-dashed p-5">
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                  <HeartHandshake className="h-4 w-4 text-rose-600" />
                  Donacije idu direktno organizaciji
                </p>
                {canShowDonationCta && organization?.external_donation_url ? (
                  <>
                    <p className="mt-2 text-sm text-muted-foreground">
                      PetPark ne obrađuje uplatu niti drži sredstva. Klik te vodi na verificirani vanjski donation link organizacije.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Link href={organization.external_donation_url} target="_blank" rel="noreferrer">
                        <Button className="gap-2">
                          Doniraj izravno organizaciji <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Badge variant="outline">{RESCUE_DONATION_LINK_STATUS_LABELS[organization.external_donation_url_status]}</Badge>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Javni donation CTA se prikazuje tek nakon što admin odobri vanjski link organizacije. Bez fake gumba, bez checkout teatra, bez „oops ništa ne radi" momenta.
                    </p>
                    <Button variant="outline" className="mt-4" disabled>
                      Donation link čeka provjeru
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold font-[var(--font-heading)]">Javni updatei</h2>
                {updates.length === 0 ? (
                  <p className="mt-4 text-sm text-muted-foreground">Još nema javno objavljenih updatea za ovu apelaciju.</p>
                ) : (
                  <ul className="mt-4 space-y-4">
                    {updates.map((update) => (
                      <li key={update.id} className="rounded-2xl bg-muted/40 p-4 text-sm">
                        {update.title && <p className="font-semibold">{update.title}</p>}
                        <p className="mt-2 text-muted-foreground">{update.body}</p>
                        <p className="mt-3 text-xs text-muted-foreground">{formatDate(update.published_at ?? update.created_at)}</p>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-6 rounded-2xl bg-rose-50 p-4 text-sm text-rose-900">
                  <p className="inline-flex items-center gap-2 font-semibold">
                    <ShieldCheck className="h-4 w-4" />
                    Production-safe note
                  </p>
                  <p className="mt-2 text-rose-800/80">Prikazujemo samo active apelacije s realnim podacima i verified external donation gatingom. Nema platform-native checkouta u ovom laneu.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <ShareButtons title={appeal.title} description={appeal.summary || appeal.story || undefined} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatCurrency(amountCents: number, currency: string) {
  return new Intl.NumberFormat('hr-HR', { style: 'currency', currency }).format(amountCents / 100);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('hr-HR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value));
}

function getAppealProgressPct(appeal: { target_amount_cents: number; raised_amount_cents: number }) {
  if (appeal.target_amount_cents <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((appeal.raised_amount_cents / appeal.target_amount_cents) * 100)));
}

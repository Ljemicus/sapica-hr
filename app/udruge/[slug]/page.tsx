import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, ExternalLink, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getActiveRescueAppeals, getRescueOrganizationBySlug } from '@/lib/db';
import { APPEAL_STATUS_LABELS, RESCUE_DONATION_LINK_STATUS_LABELS, RESCUE_VERIFICATION_STATUS_LABELS } from '@/lib/types';
import { hasApprovedExternalDonationLink } from '@/lib/rescue-utils';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const organization = await getRescueOrganizationBySlug(slug);

  if (!organization || organization.status !== 'active') {
    return { title: 'Organizacija nije pronađena', robots: { index: false, follow: false } };
  }

  return {
    title: `${organization.display_name} | PetPark rescue`,
    description: organization.description ?? organization.display_name,
  };
}

export default async function RescueOrganizationDetailPage({ params }: Props) {
  const { slug } = await params;
  const organization = await getRescueOrganizationBySlug(slug);

  if (!organization || organization.status !== 'active') notFound();

  const allActiveAppeals = await getActiveRescueAppeals();
  const appeals = allActiveAppeals.filter((appeal) => appeal.organization_id === organization.id);
  const canShowDonationCta = hasApprovedExternalDonationLink(organization);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/50 via-white to-white">
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <Link href="/udruge" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Natrag na organizacije
        </Link>

        <Card className="mb-6 border-0 shadow-sm">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:justify-between">
              <div className="max-w-3xl">
                <Badge className="mb-3 bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-0">Rescue organization</Badge>
                <h1 className="text-3xl font-bold tracking-tight font-[var(--font-heading)] md:text-4xl">{organization.display_name}</h1>
                <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {organization.city && <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-emerald-600" />{organization.city}</span>}
                  {organization.email && <span className="inline-flex items-center gap-1.5"><Mail className="h-4 w-4 text-emerald-600" />{organization.email}</span>}
                  {organization.phone && <span className="inline-flex items-center gap-1.5"><Phone className="h-4 w-4 text-emerald-600" />{organization.phone}</span>}
                </div>
                <p className="mt-5 leading-7 text-muted-foreground">{organization.description ?? 'Organizacija još nije popunila javni opis.'}</p>
              </div>

              <div className="rounded-2xl border bg-muted/40 p-5 lg:min-w-72">
                <p className="text-sm font-semibold">Trenutni javni signal</p>
                <div className="mt-3 space-y-3 text-sm text-muted-foreground">
                  <div>
                    <p className="font-medium text-foreground">Live apelacije</p>
                    <p>{appeals.length} aktivno prikazano</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Verification status</p>
                    <p>{RESCUE_VERIFICATION_STATUS_LABELS[organization.verification_status]}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Donation link</p>
                    <p>{RESCUE_DONATION_LINK_STATUS_LABELS[organization.external_donation_url_status]}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold font-[var(--font-heading)]">Javni profil organizacije</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-semibold">Pravni naziv</p>
                  <p className="mt-3 text-sm text-muted-foreground">{organization.legal_name}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold">Tip organizacije</p>
                  <p className="mt-3 text-sm text-muted-foreground">{organization.kind}</p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-muted/40 p-5">
                <p className="inline-flex items-center gap-2 text-sm font-semibold">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Transparentnost donacija
                </p>
                <p className="mt-3 text-sm text-muted-foreground">Ako je vanjski donation link verificiran, PetPark ga samo prikazuje kao izlazni link. Donacije idu direktno organizaciji.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold font-[var(--font-heading)]">Dalje odavde</h2>
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                <p>Profil organizacije je sad stvarni javni identitet, s verification i donation-link guardovima.</p>
                <p>Draft apelacije i verification dokumenti ostaju iza dashboarda i admin reviewa.</p>
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <Link href="/apelacije">
                  <Button className="w-full justify-between">
                    Sve javne apelacije <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                {canShowDonationCta && organization.external_donation_url && (
                  <Link href={organization.external_donation_url} target="_blank" rel="noreferrer">
                    <Button variant="outline" className="w-full justify-between">
                      Doniraj izravno organizaciji <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
                {organization.website_url && (
                  <Link href={organization.website_url} target="_blank" rel="noreferrer">
                    <Button variant="outline" className="w-full justify-between">
                      Vanjski link <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </div>
              {!canShowDonationCta && (
                <p className="mt-4 text-xs text-muted-foreground">Donation CTA se ne prikazuje dok verified external link ne bude odobren. Nema prečaca, nema muljanja.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold font-[var(--font-heading)]">Live apelacije organizacije</h2>
              <p className="text-sm text-muted-foreground">Prikazujemo samo apelacije koje su stvarno aktivne.</p>
            </div>
          </div>

          {appeals.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 text-sm text-muted-foreground">Ova organizacija trenutno nema aktivnih javnih apelacija.</CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {appeals.map((appeal) => (
                <Link key={appeal.id} href={`/apelacije/${appeal.slug}`}>
                  <Card className="h-full border-0 shadow-sm transition-shadow hover:shadow-md">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-semibold">{appeal.title}</h3>
                        <Badge variant="outline">{APPEAL_STATUS_LABELS[appeal.status]}</Badge>
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">{appeal.summary}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {appeal.species && <Badge variant="secondary">{appeal.species}</Badge>}
                        {appeal.location_label && <Badge variant="secondary">{appeal.location_label}</Badge>}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

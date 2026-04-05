import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
  ArrowLeft, 
  ArrowRight, 
  BadgeCheck, 
  Bell, 
  CheckCircle2, 
  ExternalLink, 
  HeartHandshake, 
  Mail, 
  MapPin, 
  Phone, 
  Shield, 
  ShieldCheck,
  Target,
  Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  getActiveRescueAppeals, 
  getRescueOrganizationBySlug,
  getRescueOrganizationsByCity,
  getVerifiedRescueOrganizations,
} from '@/lib/db';
import { APPEAL_STATUS_LABELS, RESCUE_DONATION_LINK_STATUS_LABELS, RESCUE_VERIFICATION_STATUS_LABELS, getAppealProgressPct } from '@/lib/types';
import { hasApprovedExternalDonationLink } from '@/lib/rescue-utils';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://petpark.hr';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const organization = await getRescueOrganizationBySlug(slug);

  if (!organization || organization.status !== 'active') {
    return { title: 'Organizacija nije pronađena', robots: { index: false, follow: false } };
  }

  const verifiedLabel = organization.verification_status === 'approved' ? ' ✅ Verificirana' : '';
  const title = `${organization.display_name}${verifiedLabel} | Rescue udruga`;
  const description = organization.description || `${organization.display_name} — rescue organizacija iz ${organization.city || 'Hrvatske'}. Pogledaj aktivne apelacije i kako pomoći.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'profile',
      url: `/udruge/${slug}`,
      siteName: 'PetPark',
      locale: 'hr_HR',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `${BASE_URL}/udruge/${slug}`,
    },
  };
}

export default async function RescueOrganizationDetailPage({ params }: Props) {
  const { slug } = await params;
  const organization = await getRescueOrganizationBySlug(slug);

  if (!organization || organization.status !== 'active') notFound();

  const [allActiveAppeals, similarByCity, verifiedOrgs] = await Promise.all([
    getActiveRescueAppeals(),
    organization.city ? getRescueOrganizationsByCity(organization.city) : Promise.resolve([]),
    getVerifiedRescueOrganizations(),
  ]);

  const appeals = allActiveAppeals.filter((appeal) => appeal.organization_id === organization.id);
  const canShowDonationCta = hasApprovedExternalDonationLink(organization);
  const isVerified = organization.verification_status === 'approved';
  
  // Calculate total stats for this org
  const totalRaised = appeals.reduce((sum, a) => sum + a.raised_amount_cents, 0);
  const totalTarget = appeals.reduce((sum, a) => sum + a.target_amount_cents, 0);
  const totalDonors = appeals.reduce((sum, a) => sum + a.donor_count, 0);

  // Get similar organizations (same city, excluding current, verified first)
  const similarOrganizations = similarByCity
    .filter((org) => org.id !== organization.id && org.status === 'active')
    .sort((a, b) => {
      // Verified orgs first
      if (a.verification_status === 'approved' && b.verification_status !== 'approved') return -1;
      if (a.verification_status !== 'approved' && b.verification_status === 'approved') return 1;
      return 0;
    })
    .slice(0, 3);

  // If not enough similar by city, add some verified orgs from other cities
  const additionalOrgs = verifiedOrgs
    .filter((org) => 
      org.id !== organization.id && 
      org.city !== organization.city &&
      !similarOrganizations.some((s) => s.id === org.id)
    )
    .slice(0, 3 - similarOrganizations.length);

  const recommendedOrganizations = [...similarOrganizations, ...additionalOrgs];

  // Organization structured data
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: organization.display_name,
    alternateName: organization.legal_name,
    description: organization.description,
    url: `${BASE_URL}/udruge/${slug}`,
    ...(organization.website_url && { sameAs: [organization.website_url] }),
    ...(organization.email && { email: organization.email }),
    ...(organization.phone && { telephone: organization.phone }),
    address: {
      '@type': 'PostalAddress',
      addressLocality: organization.city || 'Hrvatska',
      addressCountry: organization.country_code || 'HR',
    },
    ...(organization.external_donation_url && canShowDonationCta && {
      donationLink: organization.external_donation_url,
    }),
    ...(isVerified && {
      hasCredential: {
        '@type': 'EducationalOccupationalCredential',
        credentialCategory: 'Verificirana rescue organizacija',
        recognizedBy: {
          '@type': 'Organization',
          name: 'PetPark',
        },
      },
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <div className="min-h-screen bg-gradient-to-b from-emerald-50/50 via-white to-white">
        <div className="container mx-auto max-w-5xl px-4 py-8">
          <Link href="/udruge" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Natrag na organizacije
          </Link>

          {/* Main Organization Card */}
          <Card className="mb-6 border-0 shadow-sm">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:justify-between">
                <div className="max-w-3xl">
                  {/* Verification Badge - Prominent */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-0">Rescue organization</Badge>
                    {isVerified ? (
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-0 gap-1">
                        <BadgeCheck className="h-3.5 w-3.5" />
                        Verificirana
                      </Badge>
                    ) : organization.verification_status === 'pending' ? (
                      <Badge variant="outline" className="text-amber-600 border-amber-200 gap-1">
                        <Shield className="h-3.5 w-3.5" />
                        U provjeri
                      </Badge>
                    ) : null}
                  </div>
                  
                  <h1 className="text-3xl font-bold tracking-tight font-[var(--font-heading)] md:text-4xl">{organization.display_name}</h1>
                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {organization.city && <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-emerald-600" />{organization.city}</span>}
                    {organization.email && <span className="inline-flex items-center gap-1.5"><Mail className="h-4 w-4 text-emerald-600" />{organization.email}</span>}
                    {organization.phone && <span className="inline-flex items-center gap-1.5"><Phone className="h-4 w-4 text-emerald-600" />{organization.phone}</span>}
                  </div>
                  <p className="mt-5 leading-7 text-muted-foreground">{organization.description ?? 'Organizacija još nije popunila javni opis.'}</p>
                </div>

                {/* Stats Card */}
                <div className="rounded-2xl border bg-muted/40 p-5 lg:min-w-72">
                  <p className="text-sm font-semibold">Statistika organizacije</p>
                  <div className="mt-3 space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5">
                        <HeartHandshake className="h-4 w-4 text-emerald-600" />
                        Aktivne apelacije
                      </span>
                      <span className="font-medium text-foreground">{appeals.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-emerald-600" />
                        Broj donatora
                      </span>
                      <span className="font-medium text-foreground">{totalDonors}</span>
                    </div>
                    {totalTarget > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5">
                          <Target className="h-4 w-4 text-emerald-600" />
                          Skupljeno
                        </span>
                        <span className="font-medium text-foreground">
                          {Math.round((totalRaised / totalTarget) * 100)}%
                        </span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-border/50">
                      <span className="text-xs">Verification status</span>
                      <p className="font-medium text-foreground mt-0.5">
                        {RESCUE_VERIFICATION_STATUS_LABELS[organization.verification_status]}
                      </p>
                    </div>
                    {organization.external_donation_url && (
                      <div>
                        <span className="text-xs">Donation link</span>
                        <p className="font-medium text-foreground mt-0.5">
                          {RESCUE_DONATION_LINK_STATUS_LABELS[organization.external_donation_url_status]}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
            {/* Left Column - Main Info */}
            <div className="space-y-6">
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
                      <p className="mt-3 text-sm text-muted-foreground capitalize">{organization.kind}</p>
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

              {/* Live Appeals Section */}
              <div>
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
                  <div className="grid gap-4">
                    {appeals.map((appeal) => {
                      const progress = getAppealProgressPct(appeal);
                      
                      return (
                        <Link key={appeal.id} href={`/apelacije/${appeal.slug}`}>
                          <Card className="h-full border-0 shadow-sm transition-shadow hover:shadow-md">
                            <CardContent className="p-5">
                              <div className="flex items-center justify-between gap-3 flex-wrap">
                                <h3 className="font-semibold">{appeal.title}</h3>
                                <Badge variant="outline">{APPEAL_STATUS_LABELS[appeal.status]}</Badge>
                              </div>
                              <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{appeal.summary}</p>
                              
                              {/* Progress bar for appeal */}
                              {appeal.target_amount_cents > 0 && (
                                <div className="mt-4">
                                  <div className="flex items-center justify-between text-xs mb-1.5">
                                    <span className="text-muted-foreground">Napredak</span>
                                    <span className="font-medium">{progress}%</span>
                                  </div>
                                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                                    <div 
                                      className="h-full rounded-full bg-emerald-500 transition-all"
                                      style={{ width: `${progress}%` }}
                                    />
                                  </div>
                                  <p className="mt-1.5 text-xs text-muted-foreground">
                                    {formatCurrency(appeal.raised_amount_cents)} od {formatCurrency(appeal.target_amount_cents)} • {appeal.donor_count} donatora
                                  </p>
                                </div>
                              )}
                              
                              <div className="mt-4 flex flex-wrap gap-2">
                                {appeal.species && <Badge variant="secondary">{appeal.species}</Badge>}
                                {appeal.location_label && <Badge variant="secondary">{appeal.location_label}</Badge>}
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Actions & Similar Orgs */}
            <div className="space-y-6">
              {/* Actions Card */}
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold font-[var(--font-heading)]">Akcije</h2>
                  
                  <div className="mt-4 flex flex-col gap-3">
                    <Link href="/apelacije">
                      <Button className="w-full justify-between h-11">
                        Sve javne apelacije <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    {canShowDonationCta && organization.external_donation_url && (
                      <Link href={organization.external_donation_url} target="_blank" rel="noreferrer">
                        <Button variant="outline" className="w-full justify-between h-11 border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                          Doniraj izravno <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                    {organization.website_url && (
                      <Link href={organization.website_url} target="_blank" rel="noreferrer">
                        <Button variant="outline" className="w-full justify-between h-11">
                          Web stranica <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                  </div>
                  
                  {!canShowDonationCta && organization.external_donation_url && (
                    <p className="mt-4 text-xs text-muted-foreground">Donation CTA se ne prikazuje dok verified external link ne bude odobren.</p>
                  )}
                </CardContent>
              </Card>

              {/* Email Subscribe Card */}
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold font-[var(--font-heading)] flex items-center gap-2">
                    <Bell className="h-5 w-5 text-emerald-600" />
                    Prati novosti
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Pretplati se na obavijesti o novim apelacijama od {organization.display_name}.
                  </p>
                  <form className="mt-4 space-y-3" action="/api/subscriptions/rescue" method="POST">
                    <input type="hidden" name="organization_id" value={organization.id} />
                    <Input 
                      type="email" 
                      name="email"
                      placeholder="tvoj@email.com" 
                      required 
                      className="h-11"
                    />
                    <Button type="submit" variant="outline" className="w-full h-11">
                      Pretplati se
                    </Button>
                  </form>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Možeš se odpretplatiti u bilo kojem trenutku. Ne šaljemo spam.
                  </p>
                </CardContent>
              </Card>

              {/* Similar Organizations Card */}
              {recommendedOrganizations.length > 0 && (
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold font-[var(--font-heading)]">Slične organizacije</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Ostale verificirane udruge{organization.city ? ` iz ${organization.city}` : ''}.
                    </p>
                    
                    <div className="mt-4 space-y-3">
                      {recommendedOrganizations.map((org) => (
                        <Link key={org.id} href={`/udruge/${org.slug}`}>
                          <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors group">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="font-medium truncate group-hover:text-emerald-700 transition-colors">
                                  {org.display_name}
                                </p>
                                {org.verification_status === 'approved' && (
                                  <BadgeCheck className="h-4 w-4 text-blue-500 shrink-0" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                                <MapPin className="h-3 w-3" />
                                {org.city || 'Hrvatska'}
                              </p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </Link>
                      ))}
                    </div>
                    
                    <Link href="/udruge">
                      <Button variant="ghost" className="w-full mt-4 h-11">
                        Pogledaj sve udruge
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}

              {/* Trust Badge Card */}
              {isVerified && (
                <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-emerald-50">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-blue-900">Verificirana organizacija</h3>
                        <p className="mt-1 text-sm text-blue-800/80">
                          Ova organizacija je prošla PetPark verifikacijski proces. Dokumentacija je pregledana i odobrena.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
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

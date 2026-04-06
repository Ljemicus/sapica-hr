import { unstable_noStore as noStore, revalidatePath } from 'next/cache';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AlertCircle, ArrowRight, BadgeCheck, ClipboardList, HeartHandshake, LayoutDashboard, Link2, Plus, ShieldCheck, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RescueVerificationDocumentsCard } from '@/components/rescue/rescue-verification-documents-card';
import { RescueOnboardingWizard } from '@/components/rescue/rescue-onboarding-wizard';
import { createClient } from '@/lib/supabase/server';
import {
  createRescueOrganization,
  getPublisherProfile,
  getRescueAppealsByOrganization,
  getRescueOrganizationByOwner,
  getRescueVerificationDocuments,
  updateRescueOrganization,
} from '@/lib/db';
import {
  RESCUE_DONATION_LINK_STATUS_LABELS,
  RESCUE_ORGANIZATION_STATUS_LABELS,
  RESCUE_REVIEW_STATE_LABELS,
  RESCUE_VERIFICATION_STATUS_LABELS,
} from '@/lib/types';
import { getAppealPublishReadiness, getRescueOrganizationCompletion, getRescueVerificationReadiness, hasApprovedExternalDonationLink, slugifyRescueValue } from '@/lib/rescue-utils';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Rescue dashboard | PetPark',
};

async function requireRescueOwner() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/prijava');

  const profile = await getPublisherProfile(user.id);
  if (!profile) redirect('/onboarding/publisher-type');
  if (profile.type !== 'udomljavanje') redirect('/dashboard/profile');

  return { user, profile };
}

export default async function RescueDashboardPage() {
  noStore();

  const { user, profile } = await requireRescueOwner();
  const organization = await getRescueOrganizationByOwner(user.id);
  const appeals = organization ? await getRescueAppealsByOrganization(organization.id) : [];
  const verificationDocuments = organization ? await getRescueVerificationDocuments(organization.id) : [];
  const completion = getRescueOrganizationCompletion(organization);
  const verificationReadiness = getRescueVerificationReadiness(organization, verificationDocuments);
  const publishableAppeals = appeals.filter((appeal) => getAppealPublishReadiness(organization, appeal).ready).length;
  const approvedDocs = verificationDocuments.filter((doc) => doc.review_status === 'approved').length;
  const pendingDocs = verificationDocuments.filter((doc) => doc.review_status === 'pending').length;
  const donationLinkReady = hasApprovedExternalDonationLink(organization);
  
  // Determine if onboarding wizard should show
  const hasOrg = !!organization;
  const hasDocs = verificationDocuments.length > 0;
  const hasCreatedAppeals = appeals.length > 0;
  const isNewRescueUser = !hasOrg || !hasDocs || !hasCreatedAppeals;

  async function saveOrganizationAction(formData: FormData) {
    'use server';

    const { user, profile } = await requireRescueOwner();
    const existing = await getRescueOrganizationByOwner(user.id);
    const existingDocuments = existing ? await getRescueVerificationDocuments(existing.id) : [];

    const displayName = String(formData.get('display_name') ?? '').trim();
    const legalName = String(formData.get('legal_name') ?? '').trim();
    const slugInput = String(formData.get('slug') ?? '').trim();
    const description = String(formData.get('description') ?? '').trim();
    const city = String(formData.get('city') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim();
    const phone = String(formData.get('phone') ?? '').trim();
    const websiteUrl = String(formData.get('website_url') ?? '').trim();
    const externalDonationUrl = String(formData.get('external_donation_url') ?? '').trim();
    const donationContactName = String(formData.get('donation_contact_name') ?? '').trim();
    const bankAccountIban = String(formData.get('bank_account_iban') ?? '').trim();
    const kind = String(formData.get('kind') ?? 'rescue').trim() as 'rescue' | 'shelter' | 'association' | 'sanctuary' | 'other';
    const intent = String(formData.get('intent') ?? 'save');

    const slug = slugifyRescueValue(slugInput || displayName || legalName);
    if (!displayName || !legalName || !slug) redirect('/dashboard/rescue?error=org_required');

    const donationUrlChanged = externalDonationUrl !== (existing?.external_donation_url ?? '');
    const basePatch = {
      display_name: displayName,
      legal_name: legalName,
      slug,
      kind,
      description: description || null,
      city: city || null,
      email: email || null,
      phone: phone || null,
      website_url: websiteUrl || null,
      external_donation_url: externalDonationUrl || null,
      external_donation_url_status: externalDonationUrl
        ? donationUrlChanged
          ? 'pending_review' as const
          : existing?.external_donation_url_status ?? 'pending_review' as const
        : 'not_provided' as const,
      external_donation_url_verified_at: externalDonationUrl && !donationUrlChanged ? existing?.external_donation_url_verified_at ?? null : null,
      external_donation_url_verified_by: externalDonationUrl && !donationUrlChanged ? existing?.external_donation_url_verified_by ?? null : null,
      donation_contact_name: donationContactName || null,
      bank_account_iban: bankAccountIban || null,
      verification_status: existing?.verification_status ?? 'not_submitted',
      review_state: intent === 'submit' ? 'pending' as const : existing?.review_state ?? 'not_started' as const,
      verification_submitted_at: existing?.verification_submitted_at ?? null,
    };

    let saved = existing;

    if (existing) {
      const reviewReady = getRescueVerificationReadiness({ ...existing, ...basePatch }, existingDocuments).ready;
      saved = await updateRescueOrganization(existing.id, {
        ...basePatch,
        status: intent === 'submit' && reviewReady ? 'pending_review' : existing.status,
        verification_status: intent === 'submit' && reviewReady ? 'pending' : basePatch.verification_status,
        review_state: intent === 'submit' && reviewReady ? 'pending' : basePatch.review_state,
        verification_submitted_at: intent === 'submit' && reviewReady ? new Date().toISOString() : basePatch.verification_submitted_at,
      });
    } else {
      saved = await createRescueOrganization({
        owner_user_id: user.id,
        publisher_profile_id: profile.id,
        display_name: basePatch.display_name,
        legal_name: basePatch.legal_name,
        slug: basePatch.slug,
        kind: basePatch.kind,
        description: basePatch.description,
        city: basePatch.city,
        email: basePatch.email,
        phone: basePatch.phone,
        website_url: basePatch.website_url,
        external_donation_url: basePatch.external_donation_url,
        donation_contact_name: basePatch.donation_contact_name,
        bank_account_iban: basePatch.bank_account_iban,
      });

      if (saved) {
        const reviewReady = getRescueVerificationReadiness(saved, existingDocuments).ready;
        if (intent === 'submit' && reviewReady) {
          saved = await updateRescueOrganization(saved.id, {
            status: 'pending_review',
            verification_status: 'pending',
            review_state: 'pending',
            verification_submitted_at: new Date().toISOString(),
          });
        }
      }
    }

    if (!saved) redirect('/dashboard/rescue?error=org_save_failed');

    revalidatePath('/dashboard/rescue');
    redirect(`/dashboard/rescue?saved=org${intent === 'submit' ? '&submitted=1' : ''}`);
  }

  return (
    <div className="min-h-screen bg-gray-50/60 px-4 py-10">
      {/* Onboarding Wizard for new rescue users */}
      {isNewRescueUser && (
        <RescueOnboardingWizard
          organizationId={organization?.id}
          hasDocuments={hasDocs}
          hasAppeals={hasCreatedAppeals}
        />
      )}
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <Link href="/dashboard/profile" className="inline-flex text-sm text-muted-foreground hover:underline">
              &larr; Natrag na profil
            </Link>
            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-0">Rescue workspace</Badge>
            <div>
              <h1 className="text-3xl font-bold tracking-tight font-[var(--font-heading)]">Rescue onboarding, verifikacija i apelacije</h1>
              <p className="mt-2 max-w-3xl text-muted-foreground">
                Ovaj lane ne glumi checkout. Rescue dodaje verificirani vanjski donation link, dokumente za review i tek onda javno ide live.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold">Publisher profil</p>
            <p className="mt-1 text-sm text-muted-foreground">{profile.display_name}</p>
            <p className="text-sm text-muted-foreground">Tip: {profile.type}</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <StatCard icon={LayoutDashboard} label="Onboarding" value={organization ? `${completion.percent}%` : '0%'} note={organization ? `${completion.completed} / ${completion.total} ključnih polja.` : 'Prvo kreiraj organizaciju.'} />
          <StatCard icon={ClipboardList} label="Apelacije" value={String(appeals.length)} note={`${publishableAppeals} spremno za public publish kad guardovi prođu.`} />
          <StatCard icon={ShieldCheck} label="Verifikacija" value={organization ? RESCUE_VERIFICATION_STATUS_LABELS[organization.verification_status] : 'Nije poslano'} note={verificationDocuments.length ? `${approvedDocs} odobreno · ${pendingDocs} na čekanju` : 'Još nema uploadanih dokumenata.'} />
          <StatCard icon={Link2} label="Donation link" value={organization ? RESCUE_DONATION_LINK_STATUS_LABELS[organization.external_donation_url_status] : 'Nije dodan'} note={donationLinkReady ? 'Javni CTA može biti prikazan.' : 'Bez approved linka nema javnog donation CTA-a.'} />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold font-[var(--font-heading)]">Organizacija i vanjski donation link</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Javni link ide kroz review. Donacije idu direktno organizaciji, ne kroz PetPark.</p>
                </div>
                {organization && (
                  <Badge variant="outline" className="text-xs">
                    {RESCUE_ORGANIZATION_STATUS_LABELS[organization.status]}
                  </Badge>
                )}
              </div>

              <form id="organization-form" action={saveOrganizationAction} className="mt-6 space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="display_name">Javno ime organizacije</Label>
                    <Input id="display_name" name="display_name" defaultValue={organization?.display_name ?? profile.display_name} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="legal_name">Pravni naziv</Label>
                    <Input id="legal_name" name="legal_name" defaultValue={organization?.legal_name ?? profile.display_name} required />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug</Label>
                    <Input id="slug" name="slug" defaultValue={organization?.slug ?? slugifyRescueValue(profile.display_name)} placeholder="moja-udruga" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="kind">Tip organizacije</Label>
                    <select id="kind" name="kind" defaultValue={organization?.kind ?? 'rescue'} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="rescue">Rescue</option>
                      <option value="shelter">Sklonište</option>
                      <option value="association">Udruga</option>
                      <option value="sanctuary">Sanctuary</option>
                      <option value="other">Ostalo</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Opis i misija</Label>
                  <Textarea id="description" name="description" rows={5} defaultValue={organization?.description ?? ''} placeholder="Tko ste, kome pomažete i kako radite." />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="city">Grad</Label>
                    <Input id="city" name="city" defaultValue={organization?.city ?? profile.city ?? ''} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Kontakt email</Label>
                    <Input id="email" name="email" type="email" defaultValue={organization?.email ?? ''} />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon</Label>
                    <Input id="phone" name="phone" defaultValue={organization?.phone ?? profile.phone ?? ''} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website_url">Website / Instagram link</Label>
                    <Input id="website_url" name="website_url" type="url" defaultValue={organization?.website_url ?? ''} />
                  </div>
                </div>

                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="external_donation_url">Vanjski donation link</Label>
                      <Input id="external_donation_url" name="external_donation_url" type="url" defaultValue={organization?.external_donation_url ?? ''} placeholder="https://..." />
                      <p className="text-xs text-muted-foreground">Prikazuje se javno tek nakon admin reviewa. PetPark ovdje samo preusmjerava, ne naplaćuje niti drži sredstva.</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="donation_contact_name">Kontakt za donacije</Label>
                      <Input id="donation_contact_name" name="donation_contact_name" defaultValue={organization?.donation_contact_name ?? ''} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bank_account_iban">IBAN</Label>
                      <Input id="bank_account_iban" name="bank_account_iban" defaultValue={organization?.bank_account_iban ?? ''} />
                    </div>
                  </div>
                  {organization && (
                    <div className="mt-4 space-y-3">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline">Link status: {RESCUE_DONATION_LINK_STATUS_LABELS[organization.external_donation_url_status]}</Badge>
                        <Badge variant="outline">Verification: {RESCUE_VERIFICATION_STATUS_LABELS[organization.verification_status]}</Badge>
                        <Badge variant="outline">Review state: {RESCUE_REVIEW_STATE_LABELS[organization.review_state]}</Badge>
                      </div>
                      {organization.admin_notes && (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-950">
                          <p className="font-semibold">Admin note</p>
                          <p className="mt-1 text-amber-900/80">{organization.admin_notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button type="submit" name="intent" value="save">Spremi organizaciju</Button>
                  <Button type="submit" name="intent" value="submit" variant="outline" disabled={!verificationReadiness.ready}>
                    Pošalji na provjeru
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <div id="verification-documents">
              <RescueVerificationDocumentsCard organizationId={organization?.id} documents={verificationDocuments} />
            </div>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold font-[var(--font-heading)]">Objava i guardovi</h2>
                <div className="mt-4 space-y-4 text-sm text-muted-foreground">
                  <div className="rounded-2xl bg-muted/40 p-4">
                    <p className="font-medium text-foreground">Što radi već sad</p>
                    <ul className="mt-2 space-y-2">
                      <li>• spremanje organizacije i vanjskog donation linka u bazu</li>
                      <li>• upload verification dokumenata u privatni storage + metadata zapis u bazu</li>
                      <li>• apelacije mogu ići live tek kad postoji approved donation link</li>
                    </ul>
                  </div>
                  {!verificationReadiness.ready ? (
                    <div className="rounded-2xl bg-amber-50 p-4 text-amber-950">
                      <p className="inline-flex items-center gap-2 font-semibold"><AlertCircle className="h-4 w-4" /> Blockeri za review</p>
                      <ul className="mt-2 space-y-2 text-amber-900/80">
                        {verificationReadiness.blockers.map((blocker) => <li key={blocker}>• {blocker}</li>)}
                      </ul>
                    </div>
                  ) : (
                    <div className="rounded-2xl bg-emerald-50 p-4 text-emerald-950">
                      <p className="inline-flex items-center gap-2 font-semibold"><BadgeCheck className="h-4 w-4" /> Review-ready</p>
                      <p className="mt-2 text-emerald-900/80">Admin sad ima dovoljno podataka za provjeru organizacije i donation linka.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold font-[var(--font-heading)]">Apelacije</h2>
                <p className="mt-1 text-sm text-muted-foreground">Draft-first flow za create, edit i safe publish.</p>
              </div>
              {organization ? (
                <Link href="/dashboard/rescue/apelacije/novo">
                  <Button className="gap-2"><Plus className="h-4 w-4" /> Nova apelacija</Button>
                </Link>
              ) : (
                <Button disabled className="gap-2"><Plus className="h-4 w-4" /> Nova apelacija</Button>
              )}
            </div>

            {!organization ? (
              <div className="mt-6 rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">Prvo spremi organizaciju pa će se otvoriti create/edit flow za apelacije.</div>
            ) : appeals.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">Nema još apelacija. Možeš odmah složiti draft, ali public donation CTA ostaje zaključan dok verification lane ne prođe.</div>
            ) : (
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {appeals.map((appeal) => {
                  const readiness = getAppealPublishReadiness(organization, appeal);
                  return (
                    <Card key={appeal.id} className="border bg-white/80 shadow-none">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-semibold">{appeal.title}</h3>
                            <p className="mt-1 text-xs text-muted-foreground">/{appeal.slug}</p>
                          </div>
                          <Badge variant="outline">{appeal.status}</Badge>
                        </div>
                        <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{appeal.summary}</p>
                        <div className="mt-4 text-xs text-muted-foreground">
                          {readiness.ready ? 'Spremna za objavu.' : `${readiness.blockers.length} blokera prije objave.`}
                        </div>
                        <div className="mt-5 flex items-center justify-between gap-3">
                          <Link href={`/dashboard/rescue/apelacije/${appeal.id}`}>
                            <Button variant="outline">Uredi</Button>
                          </Link>
                          <Link href={`/apelacije/${appeal.slug}`} className="text-sm font-medium text-emerald-700 hover:underline">
                            Javni pregled <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                <HeartHandshake className="h-4 w-4 text-emerald-600" /> Javni sloj koristi stvarne rescue podatke
              </p>
              <p className="text-sm text-muted-foreground">Aktivne organizacije vidiš na /udruge, a live apelacije na /apelacije. Donation link se pokazuje samo kad je verificiran i approved.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/udruge"><Button variant="outline">Javni directory</Button></Link>
              <Link href="/apelacije"><Button variant="outline">Javne apelacije</Button></Link>
            </div>
          </CardContent>
        </Card>

        {/* Reset onboarding wizard */}
        {!isNewRescueUser && (
          <Card className="border-0 shadow-sm bg-gradient-to-r from-orange-50/50 to-teal-50/50">
            <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Sparkles className="h-4 w-4 text-orange-500" /> Ponovno pokreni uvodni vodič
                </p>
                <p className="text-sm text-muted-foreground">Ako želite ponovno proći kroz uvodni vodič, kliknite gumb desno.</p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    localStorage.removeItem('rescue-onboarding-completed');
                    localStorage.removeItem('rescue-onboarding-skipped');
                    localStorage.removeItem('rescue-onboarding-progress');
                    window.location.reload();
                  }
                }}
              >
                Pokreni vodič
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, note }: { icon: typeof LayoutDashboard; label: string; value: string; note: string }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-6">
        <p className="inline-flex items-center gap-2 text-sm font-semibold"><Icon className="h-4 w-4 text-emerald-600" /> {label}</p>
        <p className="mt-3 text-3xl font-bold">{value}</p>
        <p className="mt-2 text-sm text-muted-foreground">{note}</p>
      </CardContent>
    </Card>
  );
}

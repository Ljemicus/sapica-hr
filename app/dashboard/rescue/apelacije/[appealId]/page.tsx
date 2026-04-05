import { revalidatePath } from 'next/cache';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { AlertCircle, ArrowLeft, ArrowRight, CircleCheck, Globe, Save, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createClient } from '@/lib/supabase/server';
import { createRescueAppeal, getPublisherProfile, getRescueAppeal, getRescueOrganizationByOwner, updateRescueAppeal, updateRescueAppealStatus } from '@/lib/db';
import { APPEAL_STATUS_LABELS } from '@/lib/types';
import { getAppealPublishReadiness, slugifyRescueValue } from '@/lib/rescue-utils';

interface Props {
  params: Promise<{ appealId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { appealId } = await params;
  return {
    title: appealId === 'novo' ? 'Nova rescue apelacija | PetPark' : 'Uredi rescue apelaciju | PetPark',
  };
}

async function requireOwnerContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/prijava');

  const profile = await getPublisherProfile(user.id);
  if (!profile || profile.type !== 'udomljavanje') redirect('/dashboard/profile');

  const organization = await getRescueOrganizationByOwner(user.id);
  if (!organization) redirect('/dashboard/rescue');

  return { user, organization };
}

export default async function RescueAppealEditorPage({ params }: Props) {
  const { appealId } = await params;
  const { organization } = await requireOwnerContext();

  const isNew = appealId === 'novo';
  const appeal = isNew ? null : await getRescueAppeal(appealId);

  if (!isNew && (!appeal || appeal.organization_id !== organization.id)) {
    notFound();
  }

  const readiness = getAppealPublishReadiness(organization, appeal);

  async function saveAppealAction(formData: FormData) {
    'use server';

    const { user, organization } = await requireOwnerContext();
    const currentId = String(formData.get('appeal_id') ?? 'novo');
    const isNew = currentId === 'novo';
    const existing = isNew ? null : await getRescueAppeal(currentId);

    if (!isNew && (!existing || existing.organization_id !== organization.id)) {
      notFound();
    }

    const title = String(formData.get('title') ?? '').trim();
    const slugInput = String(formData.get('slug') ?? '').trim();
    const summary = String(formData.get('summary') ?? '').trim();
    const story = String(formData.get('story') ?? '').trim();
    const beneficiaryName = String(formData.get('beneficiary_name') ?? '').trim();
    const species = String(formData.get('species') ?? '').trim();
    const locationLabel = String(formData.get('location_label') ?? '').trim();
    const coverImageUrl = String(formData.get('cover_image_url') ?? '').trim();
    const urgency = String(formData.get('urgency') ?? 'normal').trim() as 'low' | 'normal' | 'high' | 'critical';
    const targetAmountCents = Number(formData.get('target_amount_cents') ?? 0) || 0;
    const startsAt = String(formData.get('starts_at') ?? '').trim();
    const endsAt = String(formData.get('ends_at') ?? '').trim();
    const intent = String(formData.get('intent') ?? 'save');
    const slug = slugifyRescueValue(slugInput || title);

    if (!title || !slug || !summary) {
      redirect(`/dashboard/rescue/apelacije/${currentId}?error=required`);
    }

    const patch = {
      title,
      slug,
      summary,
      story: story || null,
      beneficiary_name: beneficiaryName || null,
      species: species || null,
      location_label: locationLabel || null,
      cover_image_url: coverImageUrl || null,
      urgency,
      target_amount_cents: targetAmountCents,
      starts_at: startsAt || null,
      ends_at: endsAt || null,
    };

    let saved = existing;

    if (existing) {
      saved = await updateRescueAppeal(existing.id, patch);
    } else {
      saved = await createRescueAppeal({
        organization_id: organization.id,
        created_by: user.id,
        currency: 'EUR',
        ...patch,
      });
    }

    if (!saved) {
      redirect(`/dashboard/rescue/apelacije/${currentId}?error=save_failed`);
    }

    if (intent === 'publish') {
      const publishReadiness = getAppealPublishReadiness(organization, saved);
      if (!publishReadiness.ready) {
        redirect(`/dashboard/rescue/apelacije/${saved.id}?error=not_ready`);
      }

      const published = await updateRescueAppealStatus(saved.id, 'active');
      if (!published) {
        redirect(`/dashboard/rescue/apelacije/${saved.id}?error=publish_failed`);
      }
    }

    if (intent === 'close') {
      const closed = await updateRescueAppealStatus(saved.id, saved.status === 'funded' ? 'closed' : 'closed');
      if (!closed) {
        redirect(`/dashboard/rescue/apelacije/${saved.id}?error=close_failed`);
      }
    }

    if (intent === 'cancel') {
      const cancelled = await updateRescueAppealStatus(saved.id, 'cancelled');
      if (!cancelled) {
        redirect(`/dashboard/rescue/apelacije/${saved.id}?error=cancel_failed`);
      }
    }

    revalidatePath('/dashboard/rescue');
    revalidatePath('/apelacije');
    revalidatePath(`/apelacije/${saved.slug}`);
    revalidatePath('/udruge');
    redirect(`/dashboard/rescue/apelacije/${saved.id}?saved=1`);
  }

  return (
    <div className="min-h-screen bg-gray-50/60 px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <Link href="/dashboard/rescue" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Natrag na rescue dashboard
        </Link>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100 border-0">Appeal editor</Badge>
            <h1 className="mt-3 text-3xl font-bold tracking-tight font-[var(--font-heading)]">
              {isNew ? 'Nova apelacija' : appeal?.title ?? 'Uredi apelaciju'}
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
              Draft možeš spremati koliko god puta želiš. Objavljivanje je dopušteno samo kad je organizacija aktivna i apelacija prođe content checklistu.
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-4 text-sm shadow-sm">
            <p className="font-semibold">Organizacija</p>
            <p className="mt-1 text-muted-foreground">{organization.display_name}</p>
            {!isNew && appeal && <p className="text-muted-foreground">Status: {APPEAL_STATUS_LABELS[appeal.status]}</p>}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <form action={saveAppealAction} className="space-y-5">
                <input type="hidden" name="appeal_id" value={appeal?.id ?? 'novo'} />

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="title">Naslov</Label>
                    <Input id="title" name="title" defaultValue={appeal?.title ?? ''} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug</Label>
                    <Input id="slug" name="slug" defaultValue={appeal?.slug ?? ''} placeholder="luna-oporavak" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="beneficiary_name">Kome se pomaže</Label>
                    <Input id="beneficiary_name" name="beneficiary_name" defaultValue={appeal?.beneficiary_name ?? ''} placeholder="Luna" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="summary">Kratki sažetak</Label>
                  <Textarea id="summary" name="summary" rows={3} defaultValue={appeal?.summary ?? ''} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="story">Priča / detalji slučaja</Label>
                  <Textarea id="story" name="story" rows={8} defaultValue={appeal?.story ?? ''} placeholder="Što se dogodilo, zašto je pomoć hitna i što slijedi." />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="species">Vrsta</Label>
                    <Input id="species" name="species" defaultValue={appeal?.species ?? ''} placeholder="pas / mačka" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location_label">Lokacija</Label>
                    <Input id="location_label" name="location_label" defaultValue={appeal?.location_label ?? organization.city ?? ''} />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="urgency">Urgency</Label>
                    <select id="urgency" name="urgency" defaultValue={appeal?.urgency ?? 'normal'} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="target_amount_cents">Cilj (u centima)</Label>
                    <Input id="target_amount_cents" name="target_amount_cents" type="number" min="0" step="1" defaultValue={appeal?.target_amount_cents ?? 0} />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="starts_at">Početak</Label>
                    <Input id="starts_at" name="starts_at" type="datetime-local" defaultValue={toDateTimeLocal(appeal?.starts_at)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ends_at">Kraj</Label>
                    <Input id="ends_at" name="ends_at" type="datetime-local" defaultValue={toDateTimeLocal(appeal?.ends_at)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cover_image_url">Cover image URL</Label>
                  <Input id="cover_image_url" name="cover_image_url" type="url" defaultValue={appeal?.cover_image_url ?? ''} />
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button type="submit" name="intent" value="save" className="gap-2">
                    <Save className="h-4 w-4" /> Spremi draft
                  </Button>
                  <Button type="submit" name="intent" value="publish" variant="outline" disabled={!readiness.ready} className="gap-2">
                    <Globe className="h-4 w-4" /> Objavi apelaciju
                  </Button>
                  {!isNew && appeal?.status === 'active' && (
                    <Button type="submit" name="intent" value="close" variant="outline" className="gap-2">
                      <CircleCheck className="h-4 w-4" /> Zatvori apelaciju
                    </Button>
                  )}
                  {!isNew && appeal?.status === 'draft' && (
                    <Button type="submit" name="intent" value="cancel" variant="outline" className="gap-2">
                      <XCircle className="h-4 w-4" /> Otkaži draft
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold font-[var(--font-heading)]">Publish checklist</h2>
                <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                  {readiness.ready ? (
                    <div className="rounded-2xl bg-emerald-50 p-4 text-emerald-950">
                      <p className="inline-flex items-center gap-2 font-semibold"><CircleCheck className="h-4 w-4" /> Apelacija je spremna</p>
                      <p className="mt-2 text-emerald-900/80">Ako je organizacija aktivna, možeš objaviti apelaciju bez ručnog petljanja po bazi.</p>
                    </div>
                  ) : (
                    <div className="rounded-2xl bg-amber-50 p-4 text-amber-950">
                      <p className="inline-flex items-center gap-2 font-semibold"><AlertCircle className="h-4 w-4" /> Još nije spremna za objavu</p>
                      <ul className="mt-2 space-y-2 text-amber-900/80">
                        {readiness.blockers.map((blocker) => (
                          <li key={blocker}>• {blocker}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold font-[var(--font-heading)]">Javni sloj</h2>
                <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                  <p>Live apelacije automatski ulaze na /apelacije i u profil organizacije na /udruge/[slug].</p>
                  <p>Checkout, payment intenti i donor UX ostaju za kasniji lane — ovdje toga namjerno nema.</p>
                </div>
                {!isNew && appeal && (
                  <div className="mt-5 flex flex-col gap-3">
                    <Link href={`/apelacije/${appeal.slug}`}>
                      <Button variant="outline" className="w-full justify-between">Otvori javni detalj <ArrowRight className="h-4 w-4" /></Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function toDateTimeLocal(value: string | null | undefined) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const tzOffset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - tzOffset * 60_000);
  return local.toISOString().slice(0, 16);
}

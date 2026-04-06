'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { ArrowRight, BadgeCheck, Building2, CheckCircle2, CircleDashed, Clock, CreditCard, ShieldCheck, Store, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CITIES, PROVIDER_APPLICATION_STATUS_COLORS, PROVIDER_APPLICATION_STATUS_LABELS, type ProviderApplication, type User } from '@/lib/types';
import { providerApplicationSchema, type ProviderApplicationInput } from '@/lib/validations';
import { trackEvent } from '@/lib/analytics';

const PROVIDER_TYPES = [
  { value: 'čuvar', label: 'Sitter / čuvar', icon: UserRound },
  { value: 'groomer', label: 'Groomer', icon: Store },
  { value: 'trener', label: 'Trener', icon: BadgeCheck },
  { value: 'drugo', label: 'Druga usluga', icon: CircleDashed },
] as const;

const SERVICE_OPTIONS = [
  'Čuvanje preko noći',
  'Dnevni boravak',
  'Šetnja pasa',
  'Čuvanje u domu vlasnika',
  'Njega i kupanje',
  'Trening i dresura',
] as const;

type ProviderTypeOption = (typeof PROVIDER_TYPES)[number]['value'];
type ProviderServiceOption = (typeof SERVICE_OPTIONS)[number];

/** Statuses where the form is read-only (user cannot edit) */
const LOCKED_STATUSES = new Set(['pending_verification', 'active', 'restricted']);

interface Props {
  user: User;
  initialApplication: ProviderApplication | null;
  stripeReturn?: 'complete' | 'refresh' | null;
}

function mapInitialValues(user: User, application: ProviderApplication | null): ProviderApplicationInput {
  return {
    display_name: application?.display_name || user.name || '',
    bio: application?.bio || '',
    city: application?.city || user.city || '',
    phone: application?.phone || user.phone || '',
    provider_type: ((application?.provider_type as ProviderTypeOption | undefined) || 'čuvar'),
    services: (application?.services?.filter((service): service is ProviderServiceOption => (SERVICE_OPTIONS as readonly string[]).includes(service)) || []),
    experience_years: application?.experience_years || 0,
    prices: application?.prices || {},
    business_name: application?.business_name || '',
    oib: application?.oib || '',
    address: application?.address || '',
    stripe_account_id: application?.stripe_account_id || '',
    stripe_onboarding_complete: application?.stripe_onboarding_complete || false,
    terms_accepted: application?.terms_accepted || false,
    privacy_accepted: application?.privacy_accepted || false,
  };
}

export function ProviderOnboardingForm({ user, initialApplication, stripeReturn }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [savingDraft, setSavingDraft] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [connectingStripe, setConnectingStripe] = useState(false);
  const source = searchParams.get('source') || 'direct';

  const defaultValues = useMemo(() => mapInitialValues(user, initialApplication), [user, initialApplication]);

  const status = initialApplication?.status || 'draft';
  const locked = LOCKED_STATUSES.has(status);
  const stripeReady = initialApplication?.stripe_onboarding_complete || initialApplication?.payout_enabled || false;

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<ProviderApplicationInput>({
    resolver: zodResolver(providerApplicationSchema),
    defaultValues,
  });

  const selectedServices = (watch('services') || []) as ProviderServiceOption[];

  useEffect(() => {
    if (source !== 'direct') {
      trackEvent('Provider Onboarding Visit', { source });
    }
  }, [source]);

  // Show toast on Stripe return and clean up the URL
  useEffect(() => {
    if (!stripeReturn) return;

    if (stripeReturn === 'complete') {
      if (stripeReady) {
        toast.success('Stripe onboarding dovršen! Isplate su spremne.');
      } else {
        toast.info('Vraćeni ste sa Stripea. Status računa će se ažurirati uskoro.');
      }
    } else if (stripeReturn === 'refresh') {
      toast.info('Stripe link je istekao. Kliknite ponovo za nastavak.');
    }

    // Clean query params from URL without reload
    window.history.replaceState({}, '', '/onboarding/provider');
  }, [stripeReturn, stripeReady]);

  async function saveDraft() {
    setSavingDraft(true);
    try {
      const values = getValues();
      const response = await fetch('/api/provider-application', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        toast.error(payload.error || 'Spremanje skice nije uspjelo');
        return;
      }

      toast.success('Skica spremljena');
      trackEvent('Provider Onboarding Draft Saved', { source });
      router.refresh();
    } catch {
      toast.error('Greška pri spremanju skice');
    } finally {
      setSavingDraft(false);
    }
  }

  async function connectStripe() {
    setConnectingStripe(true);
    try {
      // Save current form state before redirecting
      if (!locked) await saveDraft();
      const response = await fetch('/api/provider-connect', { method: 'POST' });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        toast.error(payload.error || 'Stripe onboarding trenutno nije dostupan');
        return;
      }

      if (payload.onboardingUrl) {
        trackEvent('Provider Stripe Onboarding Started', { source });
        window.location.href = payload.onboardingUrl as string;
        return;
      }

      toast.error('Stripe onboarding link nije generiran');
    } catch {
      toast.error('Greška pri pokretanju Stripe onboardinga');
    } finally {
      setConnectingStripe(false);
    }
  }

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/provider-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        toast.error(payload.error || 'Slanje prijave nije uspjelo');
        return;
      }

      toast.success('Prijava poslana! Pregledat ćemo je što prije.');
      trackEvent('Provider Onboarding Submitted', {
        source,
        provider_type: values.provider_type,
        city: values.city || 'unknown',
        services_count: values.services.length,
      });
      router.refresh();
    } catch {
      toast.error('Mrežna greška pri slanju prijave');
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Editorial Hero */}
      <section className="relative organizations-hero-gradient overflow-hidden">
        <div className="absolute inset-0 paw-pattern opacity-[0.03]" />
        <div className="container mx-auto px-6 md:px-10 lg:px-16 py-12 md:py-16 relative">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="animate-fade-in-up">
                <p className="section-kicker">PetPark provider onboarding</p>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight font-[var(--font-heading)] leading-[1.05]">
                  Postani provider na PetParku
                </h1>
                <p className="text-muted-foreground mt-4 max-w-2xl text-lg">
                  Ispuni osnovne podatke, odaberi usluge i pošalji prijavu. Stripe i detalji za isplatu mogu i kasnije — prvo riješimo profil.
                </p>
              </div>
              <Badge className={`border ${PROVIDER_APPLICATION_STATUS_COLORS[status]} px-4 py-1.5 text-sm`}>
                {PROVIDER_APPLICATION_STATUS_LABELS[status]}
              </Badge>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 md:px-10 lg:px-16 py-10 md:py-14 space-y-8">

        <div className="grid gap-4 md:grid-cols-3">
          <div className="community-section-card p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2 font-semibold">Korak 1</p>
            <p className="font-semibold text-lg font-[var(--font-heading)]">Osnovni profil</p>
            <p className="text-sm text-muted-foreground mt-2">Ime, grad, telefon i kratki opis.</p>
          </div>
          <div className="community-section-card p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2 font-semibold">Korak 2</p>
            <p className="font-semibold text-lg font-[var(--font-heading)]">Usluge i cijene</p>
            <p className="text-sm text-muted-foreground mt-2">Odaberi što nudiš i stavi početnu cijenu.</p>
          </div>
          <div className="community-section-card p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2 font-semibold">Korak 3</p>
            <p className="font-semibold text-lg font-[var(--font-heading)]">Pošalji prijavu</p>
            <p className="text-sm text-muted-foreground mt-2">Pregledamo profil pa tek onda ide live.</p>
          </div>
        </div>

        {/* Status banners */}
        {status === 'pending_verification' && (
          <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 flex items-start gap-3 dark:bg-yellow-950/20 dark:border-yellow-800">
            <Clock className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-yellow-800 dark:text-yellow-200">Prijava je na pregledu</p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Tvoja prijava je zaprimljena i čeka odobrenje. Javit ćemo ti kad bude pregledana. U međuvremenu možeš dovršiti Stripe onboarding ako nisi.
              </p>
            </div>
          </div>
        )}

        {status === 'active' && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4 flex items-start gap-3 dark:bg-green-950/20 dark:border-green-800">
            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-green-800 dark:text-green-200">Profil je aktivan!</p>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                Tvoj provider profil je odobren i vidljiv korisnicima. Možeš primati rezervacije.
              </p>
            </div>
          </div>
        )}

        {status === 'rejected' && initialApplication?.admin_notes && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3 dark:bg-red-950/20 dark:border-red-800">
            <ShieldCheck className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-red-800 dark:text-red-200">Prijava odbijena</p>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                Napomena od admina: {initialApplication.admin_notes}
              </p>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                Ispravi podatke i pošalji prijavu ponovo.
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.5fr,0.8fr]">
          <form onSubmit={onSubmit} className="space-y-6">
            <fieldset disabled={locked} className="space-y-6">
              <Card className="rounded-2xl border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>1. Osnovni profil</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="display_name">Ime / javni naziv</Label>
                    <Input id="display_name" {...register('display_name')} placeholder="npr. Ana Horvat ili Happy Paws Studio" />
                    {errors.display_name && <p className="text-sm text-red-500">{errors.display_name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Grad</Label>
                    <select
                      id="city"
                      className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                      {...register('city')}
                    >
                      <option value="">Odaberite grad</option>
                      {CITIES.map((city) => <option key={city} value={city}>{city}</option>)}
                    </select>
                    {errors.city && <p className="text-sm text-red-500">{errors.city.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon</Label>
                    <Input id="phone" {...register('phone')} placeholder="+385 91 123 4567" />
                    {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="bio">Kratki opis</Label>
                    <Textarea id="bio" rows={5} {...register('bio')} placeholder="Npr. imam iskustva sa psima, nudim šetnje i dnevnu brigu, odgovoran/na sam i dostupan/na vikendom." />
                    <p className="text-xs text-muted-foreground">Piši jednostavno i ljudski. Ne treba roman, samo da vlasnik odmah skuži tko si.</p>
                    {errors.bio && <p className="text-sm text-red-500">{errors.bio.message}</p>}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>2. Usluge i cijene</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    {PROVIDER_TYPES.map((type) => {
                      const Icon = type.icon;
                      const active = watch('provider_type') === type.value;
                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setValue('provider_type', type.value)}
                          className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${active ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/20' : 'border-border hover:bg-muted/40'} disabled:cursor-not-allowed disabled:opacity-60`}
                        >
                          <Icon className="h-5 w-5 text-teal-600" />
                          <span className="font-medium">{type.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  {errors.provider_type && <p className="text-sm text-red-500">{errors.provider_type.message}</p>}

                  <div className="space-y-3">
                    <Label>Koje usluge nudiš?</Label>
                    <div className="grid gap-2 md:grid-cols-2">
                      {SERVICE_OPTIONS.map((service) => {
                        const checked = selectedServices.includes(service as ProviderServiceOption);
                        return (
                          <label key={service} className={`flex items-center gap-3 rounded-xl border p-3 text-sm transition ${checked ? 'border-orange-300 bg-orange-50 dark:bg-orange-950/20' : 'border-border'}`}>
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={locked}
                              onChange={(event) => {
                                const next = new Set<ProviderServiceOption>(getValues('services') || []);
                                if (event.target.checked) next.add(service as ProviderServiceOption); else next.delete(service as ProviderServiceOption);
                                setValue('services', Array.from(next), { shouldValidate: true });
                              }}
                            />
                            {service}
                          </label>
                        );
                      })}
                    </div>
                    {errors.services && <p className="text-sm text-red-500">{errors.services.message}</p>}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="experience_years">Godine iskustva</Label>
                      <Input id="experience_years" type="number" min={0} max={50} {...register('experience_years', { valueAsNumber: true })} />
                      <p className="text-xs text-muted-foreground">Ako tek krećeš, slobodno stavi 0. Bitnije je da si pouzdan/a nego da glumiš veterana.</p>
                      {errors.experience_years && <p className="text-sm text-red-500">{errors.experience_years.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="base_price">Početna cijena (€)</Label>
                      <Input
                        id="base_price"
                        type="number"
                        min={0}
                        value={Number(watch('prices')?.base ?? 0)}
                        onChange={(event) => setValue('prices', { ...getValues('prices'), base: Number(event.target.value) }, { shouldValidate: true })}
                      />
                      <p className="text-xs text-muted-foreground">Stavi okvirnu početnu cijenu. To možeš kasnije doraditi.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>3. Pravni i poslovni podaci</CardTitle>
                  <p className="text-sm text-muted-foreground">Ako nemaš sve spremno, ispuni što znaš. Ovo nije dio koji te treba zaustaviti.</p>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="business_name">Naziv obrta / firme (ako postoji)</Label>
                    <Input id="business_name" {...register('business_name')} placeholder="npr. Happy Paws j.d.o.o." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="oib">OIB</Label>
                    <Input id="oib" {...register('oib')} placeholder="11 znamenki" />
                    {errors.oib && <p className="text-sm text-red-500">{errors.oib.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Adresa</Label>
                    <Input id="address" {...register('address')} placeholder="Ulica i broj" />
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>4. Uvjeti i privatnost</CardTitle>
                  <p className="text-sm text-muted-foreground">Dosadni dio, ali moramo ga imati. Dvije kvačice i gotovo.</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <label className="flex items-start gap-3 rounded-xl border p-4 text-sm">
                    <input type="checkbox" className="mt-1" {...register('terms_accepted')} />
                    <span>Prihvaćam uvjete korištenja za providere i razumijem da PetPark može ručno pregledati i odobriti moj profil.</span>
                  </label>
                  {errors.terms_accepted && <p className="text-sm text-red-500">{errors.terms_accepted.message}</p>}
                  <label className="flex items-start gap-3 rounded-xl border p-4 text-sm">
                    <input type="checkbox" className="mt-1" {...register('privacy_accepted')} />
                    <span>Prihvaćam politiku privatnosti i obradu podataka potrebnih za onboarding, isplate i verifikaciju.</span>
                  </label>
                  {errors.privacy_accepted && <p className="text-sm text-red-500">{errors.privacy_accepted.message}</p>}
                </CardContent>
              </Card>
            </fieldset>

            {!locked && (
              <div className="rounded-2xl border bg-background/80 p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">Ako nisi gotov/a, spremi skicu i vrati se kasnije. Ništa ne nestaje.</p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button type="button" variant="outline" onClick={saveDraft} disabled={savingDraft || submitting}>
                    {savingDraft ? 'Spremam...' : 'Spremi skicu'}
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Šaljem...' : 'Pošalji prijavu'}
                    {!submitting && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}
          </form>

          <div className="space-y-6 lg:sticky lg:top-24 self-start">
            <Card className="rounded-2xl border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-orange-500" /> Stripe Connect
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <p>
                  Isplate prema providerima idu preko Stripe Connect onboardinga. Ne moraš to riješiti odmah — prvo pošalji prijavu, a isplate spoji čim budeš spreman/na.
                </p>
                <div className="rounded-xl border p-4 bg-muted/30">
                  {stripeReady ? (
                    <p className="flex items-center gap-2 text-green-700 dark:text-green-400">
                      <CheckCircle2 className="h-4 w-4" />
                      <strong>Onboarding dovršen — isplate spremne</strong>
                    </p>
                  ) : (
                    <p><strong>Status:</strong> Onboarding još nije dovršen</p>
                  )}
                  {initialApplication?.stripe_account_id && (
                    <p className="mt-2 break-all text-xs"><strong>Stripe account:</strong> {initialApplication.stripe_account_id}</p>
                  )}
                </div>
                {!stripeReady && (
                  <Button type="button" variant="outline" className="w-full" onClick={connectStripe} disabled={connectingStripe}>
                    {connectingStripe ? 'Otvaram Stripe...' : initialApplication?.stripe_account_id ? 'Nastavi Stripe onboarding' : 'Poveži isplate'}
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-teal-600" /> Što trebaš znati
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>• U V1 PetPark ručno odobrava providere.</p>
                <p>• Profil neće biti javno aktivan dok ne prođe review.</p>
                <p>• Ako nisi siguran oko pravnog statusa, unesi podatke koje imaš — to se može doraditi kasnije.</p>
                <p>• Cilj ovog flowa je da te brzo dovedemo do kvalitetne prijave, ne da te ugušimo papirologijom.</p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-purple-600" /> Sljedeći koraci
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>1. Ispuni osnovne podatke i usluge.</p>
                <p>2. Pošalji prijavu na provjeru.</p>
                <p>3. Spoji Stripe za isplate kad budeš spreman/na.</p>
                <p>4. Nakon odobrenja tvoj profil može ići live.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

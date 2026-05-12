import {
  Camera,
  Check,
  HeartHandshake,
  ImagePlus,
  MapPin,
  PawPrint,
  ShieldCheck,
  Sparkles,
  Star,
} from 'lucide-react';
import {
  AppHeader,
  Badge,
  Button,
  ButtonLink,
  Card,
  Input,
  LeafDecoration,
  PawDecoration,
  PetParkLogo,
  Select,
} from '@/components/shared/petpark/design-foundation';
import { cn } from '@/lib/utils';

const steps = ['Osnovne informacije', 'Detalji usluge', 'Cijena i dostupnost', 'Pregled'];

const tips = [
  'Napiši jasno gdje se usluga odvija i za koje ljubimce je najbolja.',
  'Dodaj konkretne detalje: šetnje, hranjenje, navike i način komunikacije.',
  'Kvalitetne fotografije doma, dvorišta ili opreme grade povjerenje.',
];

const petTypes = ['Psi', 'Mačke', 'Male životinje'];

function FieldLabel({ children, required = false }: { children: string; required?: boolean }) {
  return (
    <span className="text-sm font-black text-[color:var(--pp-color-forest-text)]">
      {children}{required ? <span className="text-[color:var(--pp-color-orange-primary)]"> *</span> : null}
    </span>
  );
}

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-3">
      <FieldLabel required={required}>{label}</FieldLabel>
      {children}
    </label>
  );
}

export function StepProgress() {
  return (
    <Card radius="24" className="relative z-10 p-4 sm:p-5" shadow="small">
      <ol className="grid gap-3 md:grid-cols-4">
        {steps.map((step, index) => (
          <li key={step} className="flex items-center gap-3 rounded-[18px] bg-[color:var(--pp-color-cream-surface)] p-3">
            <span
              className={cn(
                'flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-black',
                index === 0
                  ? 'bg-[color:var(--pp-color-orange-primary)] text-white shadow-[var(--pp-shadow-button-glow)]'
                  : 'bg-[color:var(--pp-color-card-surface)] text-[color:var(--pp-color-muted-text)] shadow-[var(--pp-shadow-small-card)]',
              )}
            >
              {index === 0 ? <Check className="size-5" aria-hidden /> : index + 1}
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[color:var(--pp-color-muted-text)]">Korak {index + 1}</p>
              <p className="mt-0.5 text-sm font-black text-[color:var(--pp-color-forest-text)]">{step}</p>
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
}

export function PhotoUploadPlaceholder() {
  return (
    <div className="rounded-[24px] border border-dashed border-[color:var(--pp-color-teal-accent)]/35 bg-[color:var(--pp-color-info-surface)] p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-[var(--pp-radius-control)] bg-[color:var(--pp-color-card-surface)] text-[color:var(--pp-color-teal-accent)] shadow-[var(--pp-shadow-small-card)]">
            <ImagePlus className="size-7" aria-hidden />
          </span>
          <div>
            <p className="text-base font-black text-[color:var(--pp-color-forest-text)]">Dodaj fotografije usluge</p>
            <p className="mt-1 max-w-md text-sm font-semibold leading-6 text-[color:var(--pp-color-muted-text)]">
              Uploadaj prostor, opremu ili primjer aktivnosti. Za sada je ovo statičan placeholder za kasniju integraciju.
            </p>
          </div>
        </div>
        <Button variant="secondary" size="sm" className="w-full sm:w-auto">
          <Camera className="size-4" aria-hidden />
          Odaberi slike
        </Button>
      </div>
    </div>
  );
}

export function PublishServiceForm() {
  return (
    <Card radius="28" className="p-6 sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Badge variant="teal">Korak 1</Badge>
          <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-[color:var(--pp-color-forest-text)]">Osnovne informacije</h2>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-[color:var(--pp-color-muted-text)]">
            Postavi temelje svoje objave. Detalje i dostupnost možeš doraditi u idućim koracima.
          </p>
        </div>
        <Badge variant="orange">Nacrt</Badge>
      </div>

      <form className="mt-8 space-y-7" aria-label="Objava usluge">
        <div className="grid gap-5 md:grid-cols-2">
          <FormField label="Naziv usluge" required>
            <Input name="title" defaultValue="Čuvanje u domu" />
          </FormField>
          <FormField label="Kategorija" required>
            <Select name="category" defaultValue="cuvanje">
              <option value="cuvanje">Čuvanje</option>
              <option value="setnja">Šetnja</option>
              <option value="grooming">Grooming</option>
              <option value="trening">Trening</option>
            </Select>
          </FormField>
          <FormField label="Podvrsta usluge">
            <Select name="subcategory" defaultValue="dom">
              <option value="dom">U domu pružatelja</option>
              <option value="vlasnik">U domu vlasnika</option>
              <option value="dnevno">Dnevno čuvanje</option>
            </Select>
          </FormField>
          <FormField label="Lokacija" required>
            <Input name="location" defaultValue="Rijeka, Hrvatska" />
          </FormField>
        </div>

        <label className="flex flex-col gap-3">
          <FieldLabel required>Kratki opis</FieldLabel>
          <textarea
            name="description"
            rows={5}
            defaultValue="Toplo, sigurno i mirno čuvanje za pse koji vole obiteljsko okruženje, redovite šetnje i puno pažnje."
            className="w-full resize-none rounded-[var(--pp-radius-control)] border border-[color:var(--pp-color-warm-border)] bg-[color:var(--pp-color-card-surface)] px-4 py-4 text-sm font-semibold leading-7 text-[color:var(--pp-color-forest-text)] shadow-[var(--pp-shadow-small-card)] outline-none transition placeholder:text-[color:var(--pp-color-muted-text)]/70 focus:border-[color:var(--pp-color-teal-accent)] focus:ring-2 focus:ring-[color:var(--pp-color-teal-accent)]/20"
          />
        </label>

        <PhotoUploadPlaceholder />

        <div className="grid gap-5 md:grid-cols-3">
          <FormField label="Iskustvo">
            <Select name="experience" defaultValue="3plus">
              <option value="1">Do 1 godine</option>
              <option value="3plus">3+ godine</option>
              <option value="5plus">5+ godina</option>
            </Select>
          </FormField>
          <FormField label="Za koje ljubimce?">
            <Select name="pets" defaultValue="psi">
              <option value="psi">Psi</option>
              <option value="macke">Mačke</option>
              <option value="vise">Više vrsta ljubimaca</option>
            </Select>
          </FormField>
          <FormField label="Dob ljubimca">
            <Select name="age" defaultValue="all">
              <option value="all">Sve dobi</option>
              <option value="puppy">Štenci / mladi</option>
              <option value="senior">Seniori</option>
            </Select>
          </FormField>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-[color:var(--pp-color-warm-border)] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <ButtonLink href="/moje-usluge" variant="secondary" size="lg" className="w-full sm:w-auto">Odustani</ButtonLink>
          <ButtonLink href="/moje-usluge" size="lg" className="w-full sm:w-auto">Nastavi</ButtonLink>
        </div>
      </form>
    </Card>
  );
}

export function PublishTipsCard() {
  return (
    <Card tone="sage" radius="24" className="relative overflow-hidden p-6">
      <PawDecoration className="-right-5 -top-5 opacity-60" />
      <div className="relative z-10">
        <span className="flex size-12 items-center justify-center rounded-[var(--pp-radius-control)] bg-[color:var(--pp-color-card-surface)] text-[color:var(--pp-color-teal-accent)] shadow-[var(--pp-shadow-small-card)]">
          <Sparkles className="size-6" aria-hidden />
        </span>
        <h2 className="mt-5 text-2xl font-black tracking-[-0.03em] text-[color:var(--pp-color-forest-text)]">Savjeti za bolju objavu</h2>
        <ul className="mt-5 space-y-4">
          {tips.map((tip) => (
            <li key={tip} className="flex gap-3 text-sm font-bold leading-6 text-[color:var(--pp-color-muted-text)]">
              <Check className="mt-1 size-4 shrink-0 text-[color:var(--pp-color-success)]" aria-hidden />
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

export function ServicePreviewCard() {
  return (
    <Card radius="24" className="p-6">
      <div className="flex items-center justify-between gap-3">
        <Badge variant="orange">Preview</Badge>
        <span className="flex items-center gap-1 text-sm font-black text-[color:var(--pp-color-forest-text)]">
          <Star className="size-4 fill-[color:var(--pp-color-orange-primary)] text-[color:var(--pp-color-orange-primary)]" aria-hidden />
          4.9
        </span>
      </div>
      <div className="mt-5 min-h-[150px] rounded-[24px] bg-[linear-gradient(135deg,var(--pp-color-sage-surface),var(--pp-color-warning-surface))] p-5">
        <span className="flex size-14 items-center justify-center rounded-[var(--pp-radius-control)] bg-[color:var(--pp-color-card-surface)] text-[color:var(--pp-color-orange-primary)] shadow-[var(--pp-shadow-small-card)]">
          <PawPrint className="size-8" aria-hidden />
        </span>
      </div>
      <h2 className="mt-5 text-xl font-black tracking-[-0.03em] text-[color:var(--pp-color-forest-text)]">Čuvanje u domu</h2>
      <p className="mt-2 flex items-center gap-2 text-sm font-bold text-[color:var(--pp-color-muted-text)]">
        <MapPin className="size-4" aria-hidden />
        Rijeka, Hrvatska
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {petTypes.map((pet) => <Badge key={pet} variant="sage">{pet}</Badge>)}
      </div>
      <p className="mt-5 text-sm font-semibold leading-6 text-[color:var(--pp-color-muted-text)]">
        Ovako će vlasnici vidjeti tvoju uslugu prije slanja zahtjeva za rezervaciju.
      </p>
    </Card>
  );
}

function SafetyNote() {
  return (
    <Card tone="cream" radius="24" className="p-5" shadow="small">
      <div className="flex gap-4">
        <ShieldCheck className="mt-1 size-6 shrink-0 text-[color:var(--pp-color-teal-accent)]" aria-hidden />
        <p className="text-sm font-bold leading-6 text-[color:var(--pp-color-muted-text)]">
          Objave prolaze osnovnu provjeru prije isticanja u marketplaceu. Ne dijelimo privatne podatke bez tvoje potvrde.
        </p>
      </div>
    </Card>
  );
}

export function PublishServicePage() {
  return (
    <main data-petpark-route="objavi-uslugu" className="min-h-screen overflow-hidden bg-[color:var(--pp-color-cream-background)] text-[color:var(--pp-color-forest-text)]">
      <AppHeader
        navItems={[
          { href: '/usluge', label: 'Usluge' },
          { href: '/objavi-uslugu', label: 'Objavi uslugu' },
          { href: '/#kako-radi', label: 'Kako radi' },
          { href: '/zajednica', label: 'Zajednica' },
        ]}
        actions={(
          <div className="hidden items-center gap-5 lg:flex">
            <ButtonLink href="/prijava" variant="secondary" size="md" className="min-w-[130px]">Prijava</ButtonLink>
            <ButtonLink href="/moje-usluge" size="md" className="min-w-[170px]">Moje usluge</ButtonLink>
          </div>
        )}
      />

      <section className="relative mx-auto max-w-[1440px] px-4 pb-14 pt-8 sm:px-6 lg:px-10">
        <LeafDecoration className="-left-24 top-[760px] size-[240px] opacity-55" />
        <LeafDecoration className="right-[-70px] top-32 size-[180px] opacity-55" />
        <PawDecoration className="left-[48%] top-16 hidden rotate-12 opacity-60 xl:flex" />

        <div className="mx-auto max-w-[var(--pp-content-width)]">
          <div className="grid items-end gap-8 lg:grid-cols-[1fr_380px]">
            <div>
              <Badge variant="teal">PetPark pružatelji</Badge>
              <h1 className="mt-4 max-w-[780px] text-5xl font-black leading-[0.98] tracking-[-0.055em] text-[color:var(--pp-color-forest-text)] sm:text-6xl lg:text-[72px]">
                Objavi uslugu
              </h1>
              <p className="mt-6 max-w-[680px] text-lg font-semibold leading-8 text-[color:var(--pp-color-muted-text)]">
                Predstavi svoje iskustvo, način rada i dostupnost vlasnicima koji traže pouzdanu brigu za svog ljubimca.
              </p>
            </div>
            <Card tone="orange" radius="28" className="relative overflow-hidden p-6">
              <PawDecoration className="-right-4 -top-4 opacity-70" />
              <div className="relative z-10 flex gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-[var(--pp-radius-control)] bg-[color:var(--pp-color-card-surface)] text-[color:var(--pp-color-orange-primary)] shadow-[var(--pp-shadow-small-card)]">
                  <HeartHandshake className="size-6" aria-hidden />
                </span>
                <div>
                  <h2 className="text-xl font-black tracking-[-0.03em]">Kreni kao provjereni pružatelj</h2>
                  <p className="mt-2 text-sm font-bold leading-6 text-[color:var(--pp-color-muted-text)]">
                    Ova stranica je spremna kao statičan onboarding okvir za kasniju validaciju i backend povezivanje.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="mt-10">
            <StepProgress />
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            <PublishServiceForm />
            <aside className="flex flex-col gap-6">
              <PublishTipsCard />
              <ServicePreviewCard />
              <SafetyNote />
            </aside>
          </div>

          <footer className="pb-10 pt-14 text-center text-sm font-bold text-[color:var(--pp-color-muted-text)]">
            <PetParkLogo className="mx-auto mb-3" width={126} height={38} />
            PetPark pomaže lokalnim pružateljima da sigurno dođu do novih vlasnika ljubimaca.
          </footer>
        </div>
      </section>
    </main>
  );
}

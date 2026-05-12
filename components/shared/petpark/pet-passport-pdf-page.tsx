import Link from 'next/link';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Download,
  FileText,
  Mail,
  MapPin,
  Phone,
  Pill,
  Printer,
  QrCode,
  ShieldCheck,
  Stethoscope,
  Syringe,
} from 'lucide-react';
import { AppHeader, Badge, Button, ButtonLink, Card, LeafDecoration } from '@/components/shared/petpark/design-foundation';

const navItems = [
  { href: '/usluge', label: 'Usluge' },
  { href: '/kalendar', label: 'Kalendar' },
  { href: '/pet-passport', label: 'Pet Passport' },
  { href: '/pet-passport/pdf', label: 'PDF' },
];

const vaccinations = [
  ['Bjesnoća', '12. ožu 2026.', 'Vet Centar Rijeka', 'vrijedi do 12. ožu 2027.'],
  ['DHPPi/L', '02. lip 2025.', 'dr. Marić', 'obnova 02. lip 2026.'],
  ['Zaštita od parazita', '28. tra 2026.', 'PetPark grooming', 'obnova 28. svi 2026.'],
];

const alerts = [
  ['Alergija', 'Piletina', 'Umjerena reakcija — izbjegavati hranu i poslastice s pilećim proteinom.'],
  ['Napomena', 'Osjetljive šapice', 'Nakon dužih šetnji koristiti blaži šampon i provjeriti jastučiće.'],
];

const therapies = [
  ['Omega ulje', '1 žličica dnevno', 'kontinuirano'],
  ['Probiotik', '1 kapsula ujutro', 'do 18. svi 2026.'],
];

function PdfSection({ icon: Icon, title, children }: { icon: typeof Syringe; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[18px] border border-[color:var(--pp-color-warm-border)] bg-white p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="inline-flex size-8 items-center justify-center rounded-full bg-[color:var(--pp-color-info-surface)] text-[color:var(--pp-color-teal-accent)]"><Icon className="size-4" /></span>
        <h2 className="text-base font-black text-[color:var(--pp-color-forest-text)]">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function PdfSheet() {
  return (
    <article className="mx-auto w-full max-w-[620px] rounded-[28px] bg-white p-6 text-[color:var(--pp-color-forest-text)] shadow-[0_28px_80px_rgba(29,58,50,0.16)] ring-1 ring-[color:var(--pp-color-warm-border)] print:max-w-none print:rounded-none print:p-8 print:shadow-none print:ring-0">
      <header className="flex items-start justify-between gap-6 border-b border-[color:var(--pp-color-warm-border)] pb-5">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[color:var(--pp-color-orange-primary)]">PetPark Pet Passport</p>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.04em]">Maks</h1>
          <p className="mt-2 text-sm font-bold text-[color:var(--pp-color-muted-text)]">Border collie · 2 godine · 18 kg · mužjak</p>
          <p className="mt-1 text-xs font-bold text-[color:var(--pp-color-muted-text)]">Mikročip: 191001000234567</p>
        </div>
        <div className="text-center">
          <div className="mx-auto flex size-24 items-center justify-center rounded-[24px] bg-[color:var(--pp-color-warning-surface)] text-5xl">🐶</div>
          <Badge variant="teal" className="mt-3">Aktivan</Badge>
        </div>
      </header>

      <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_150px]">
        <div className="rounded-[18px] bg-[color:var(--pp-color-sage-surface)] p-4">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[color:var(--pp-color-teal-accent)]">Vlasnik</p>
          <p className="mt-2 text-xl font-black">Ana Lukić</p>
          <div className="mt-3 space-y-2 text-xs font-bold text-[color:var(--pp-color-muted-text)]">
            <p className="flex items-center gap-2"><Phone className="size-3.5" /> +385 91 000 0000</p>
            <p className="flex items-center gap-2"><Mail className="size-3.5" /> ana@example.com</p>
            <p className="flex items-center gap-2"><MapPin className="size-3.5" /> Rijeka, Hrvatska</p>
          </div>
        </div>
        <div className="rounded-[18px] bg-[color:var(--pp-color-cream-surface)] p-4 text-center">
          <QrCode className="mx-auto size-20 text-[color:var(--pp-color-forest-text)]" />
          <p className="mt-2 text-[10px] font-black uppercase tracking-[0.16em] text-[color:var(--pp-color-muted-text)]">Scan access</p>
        </div>
      </div>

      <div className="mt-4 grid gap-4">
        <PdfSection icon={Syringe} title="Cijepljenja i zaštita">
          <div className="space-y-2">
            {vaccinations.map(([name, date, vet, next]) => (
              <div key={name} className="grid gap-2 rounded-[14px] bg-[color:var(--pp-color-cream-surface)] p-3 text-xs sm:grid-cols-[1fr_110px]">
                <div><p className="font-black">{name}</p><p className="font-bold text-[color:var(--pp-color-muted-text)]">{vet}</p></div>
                <div className="sm:text-right"><p className="font-black">{date}</p><p className="font-bold text-[color:var(--pp-color-muted-text)]">{next}</p></div>
              </div>
            ))}
          </div>
        </PdfSection>

        <div className="grid gap-4 sm:grid-cols-2">
          <PdfSection icon={AlertTriangle} title="Alergije">
            <div className="space-y-2">
              {alerts.map(([type, title, text]) => (
                <div key={title} className="rounded-[14px] bg-[color:var(--pp-color-warning-surface)] p-3">
                  <p className="text-xs font-black text-[color:var(--pp-color-orange-primary)]">{type}</p>
                  <p className="text-sm font-black">{title}</p>
                  <p className="mt-1 text-xs font-semibold leading-5 text-[color:var(--pp-color-muted-text)]">{text}</p>
                </div>
              ))}
            </div>
          </PdfSection>

          <PdfSection icon={Pill} title="Terapije">
            <div className="space-y-2">
              {therapies.map(([name, dose, until]) => (
                <div key={name} className="rounded-[14px] bg-[color:var(--pp-color-info-surface)] p-3">
                  <p className="text-sm font-black">{name}</p>
                  <p className="mt-1 text-xs font-bold text-[color:var(--pp-color-muted-text)]">{dose} · {until}</p>
                </div>
              ))}
            </div>
          </PdfSection>
        </div>

        <PdfSection icon={Stethoscope} title="Veterinar i zadnja kontrola">
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-[14px] bg-[color:var(--pp-color-cream-surface)] p-3">
              <p className="text-xs font-bold text-[color:var(--pp-color-muted-text)]">Primarni veterinar</p>
              <p className="font-black">Vet Centar Rijeka · dr. Marić</p>
            </div>
            <div className="rounded-[14px] bg-[color:var(--pp-color-cream-surface)] p-3">
              <p className="text-xs font-bold text-[color:var(--pp-color-muted-text)]">Zadnja kontrola</p>
              <p className="font-black">30. tra 2026. · težina stabilna</p>
            </div>
          </div>
        </PdfSection>
      </div>

      <footer className="mt-5 flex flex-col gap-2 border-t border-[color:var(--pp-color-warm-border)] pt-4 text-[11px] font-bold text-[color:var(--pp-color-muted-text)] sm:flex-row sm:items-center sm:justify-between">
        <span>Generirano iz PetPark UI previewa · 12. svibnja 2026.</span>
        <span className="inline-flex items-center gap-1"><ShieldCheck className="size-3.5" /> Kontrolirano dijeljenje</span>
      </footer>
    </article>
  );
}

function PreviewPanel() {
  return (
    <Card radius="28" className="p-5 print:hidden">
      <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[color:var(--pp-color-teal-accent)]">PDF alati</p>
      <h2 className="mt-1 text-2xl font-black text-[color:var(--pp-color-forest-text)]">Prije ispisa</h2>
      <p className="mt-2 text-sm font-semibold leading-6 text-[color:var(--pp-color-muted-text)]">Ova stranica je statični UI preview. Ne generira stvarni PDF i ne šalje podatke van.</p>
      <div className="mt-5 grid gap-3">
        <Button><Download className="size-4" /> Preuzmi PDF</Button>
        <Button variant="secondary"><Printer className="size-4" /> Ispiši karton</Button>
        <Button variant="teal"><FileText className="size-4" /> Pošalji veterinaru</Button>
      </div>
      <div className="mt-5 rounded-[var(--pp-radius-card-20)] bg-[color:var(--pp-color-sage-surface)] p-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[color:var(--pp-color-success)]" />
          <p className="text-sm font-bold leading-6 text-[color:var(--pp-color-muted-text)]">A4 format, čitljiv QR blok, kontakt vlasnika i najvažnije medicinske napomene vidljive bez skrolanja.</p>
        </div>
      </div>
    </Card>
  );
}

export function PetPassportPdfPage() {
  return (
    <main data-petpark-route="pet-passport-pdf" className="min-h-screen overflow-hidden bg-[color:var(--pp-color-cream-background)] text-[color:var(--pp-color-forest-text)] print:bg-white">
      <div className="print:hidden">
        <AppHeader navItems={navItems} actions={<ButtonLink href="/pet-passport" size="sm"><Download className="size-4" /> Pet Passport</ButtonLink>} />
      </div>
      <section className="relative px-5 pb-12 pt-10 sm:px-8 lg:px-20 print:p-0">
        <LeafDecoration className="-right-12 top-24 hidden rotate-12 lg:block print:hidden" />
        <div className="mx-auto max-w-[var(--pp-content-width)]">
          <div className="mb-6 flex flex-col gap-4 print:hidden lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Link href="/pet-passport" className="inline-flex items-center gap-2 text-sm font-extrabold text-[color:var(--pp-color-muted-text)] hover:text-[color:var(--pp-color-forest-text)]">
                <ArrowLeft className="size-4" /> Natrag na Pet Passport
              </Link>
              <Badge variant="orange" className="mt-5">A4 PDF preview</Badge>
              <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] text-[color:var(--pp-color-forest-text)] sm:text-5xl">Pet Passport PDF i ispis</h1>
              <p className="mt-3 max-w-[620px] text-base font-semibold leading-7 text-[color:var(--pp-color-muted-text)]">Pregled kartona spreman za ispis, dijeljenje s veterinarom ili privremeni pristup pružatelju usluge.</p>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px] print:block">
            <PdfSheet />
            <PreviewPanel />
          </div>
        </div>
      </section>
    </main>
  );
}

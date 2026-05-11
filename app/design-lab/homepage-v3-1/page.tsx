import type { Metadata } from 'next';
import Image from 'next/image';
import {
  ArrowRight,
  BookOpen,
  CalendarCheck,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  GraduationCap,
  Heart,
  HeartHandshake,
  Home,
  MapPin,
  MessageCircle,
  PawPrint,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'PetPark Homepage v3.1 Design Lab',
  description: 'Reference-driven PetPark homepage design lab prototype.',
  robots: { index: false, follow: false },
};

type IconType = typeof PawPrint;

const shellCss = `
  body:has(#petpark-homepage-v31-lab) > header[role="banner"],
  body:has(#petpark-homepage-v31-lab) footer:not(#petpark-v31-footer),
  body:has(#petpark-homepage-v31-lab) nav.fixed.bottom-0.left-0.right-0,
  body:has(#petpark-homepage-v31-lab) div.fixed.bottom-0.left-0.right-0,
  body:has(#petpark-homepage-v31-lab) div.fixed.bottom-20.right-4,
  body:has(#petpark-homepage-v31-lab) div.fixed.bottom-4.right-4,
  body:has(#petpark-homepage-v31-lab) button.fixed.bottom-20.right-4,
  body:has(#petpark-homepage-v31-lab) button.fixed.bottom-4.right-4,
  body:has(#petpark-homepage-v31-lab) nextjs-portal,
  body:has(#petpark-homepage-v31-lab) [data-nextjs-toast],
  body:has(#petpark-homepage-v31-lab) [data-nextjs-dialog-overlay] { display: none !important; }
  body:has(#petpark-homepage-v31-lab) main#main-content { overflow: hidden; }
  #petpark-homepage-v31-lab * { box-sizing: border-box; }
`;

const services: Array<{ label: string; Icon: IconType; pos: string; accent: string }> = [
  { label: 'Čuvanje', Icon: Home, pos: 'left-[42%] top-0', accent: 'text-[#159067]' },
  { label: 'Šetnja', Icon: PawPrint, pos: 'right-0 top-[24%]', accent: 'text-[#f97316]' },
  { label: 'Grooming', Icon: Sparkles, pos: 'right-[10%] bottom-[14%]', accent: 'text-[#159067]' },
  { label: 'Trening', Icon: GraduationCap, pos: 'bottom-0 left-[42%]', accent: 'text-[#f97316]' },
  { label: 'Izgubljeni', Icon: MapPin, pos: 'bottom-[16%] left-[4%]', accent: 'text-[#d95a33]' },
  { label: 'Udomljavanje', Icon: HeartHandshake, pos: 'left-0 top-[26%]', accent: 'text-[#159067]' },
];

const quick = [
  { title: 'Rezerviraj šetnju', text: 'Aktivan dan za psa', Icon: CalendarCheck },
  { title: 'Pronađi čuvanje', text: 'Siguran dogovor', Icon: Home },
  { title: 'Naruči grooming', text: 'Njega i svježina', Icon: Sparkles },
  { title: 'Trening & savjeti', text: 'Bolje navike', Icon: GraduationCap },
  { title: 'Hitno: izgubljen?', text: 'Brza objava', Icon: MapPin },
  { title: 'Udomi ljubav', text: 'Novi dom', Icon: HeartHandshake },
];

const needs = [
  { label: 'Čuvanje', Icon: Home },
  { label: 'Šetnja', Icon: PawPrint },
  { label: 'Grooming', Icon: Sparkles },
  { label: 'Trening', Icon: GraduationCap },
  { label: 'Izgubljeni', Icon: MapPin },
  { label: 'Udomljavanje', Icon: HeartHandshake },
];

function Container({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>;
}

function Header() {
  return (
    <header className="mx-auto flex h-[76px] w-full max-w-[1320px] items-center justify-between px-4 sm:px-6 lg:px-8">
      <Image src="/brand/petpark-logo.svg" alt="PetPark" width={146} height={44} priority className="h-auto w-[112px] sm:w-[142px]" />
      <nav className="hidden items-center gap-1 rounded-full border border-[#e9deca] bg-white/76 p-1.5 shadow-[0_14px_38px_rgba(20,65,47,.08)] backdrop-blur lg:flex">
        {['Usluge', 'Kako radi', 'Zajednica', 'Blog'].map((item) => (
          <span key={item} className="rounded-full px-4 py-2 text-sm font-black text-[#123829]">{item}</span>
        ))}
      </nav>
      <div className="hidden items-center gap-3 sm:flex">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#cfe3d3] bg-[#f6fff8] px-4 py-2 text-sm font-black text-[#123829]"><UserRound className="h-4 w-4" />Prijava</span>
        <span className="inline-flex items-center gap-2 rounded-full bg-[#f97316] px-4 py-2 text-sm font-black text-white shadow-[0_16px_34px_rgba(249,115,22,.25)]"><Plus className="h-4 w-4" />Objavi uslugu</span>
      </div>
      <span className="rounded-full border border-[#e9deca] bg-white/82 px-4 py-2 text-sm font-black text-[#123829] sm:hidden">Menu</span>
    </header>
  );
}

function AssistantCard() {
  return (
    <div className="w-full max-w-[570px] rounded-[36px] border border-white/80 bg-white/96 p-5 shadow-[0_30px_90px_rgba(20,65,47,.13)] ring-1 ring-[#eadfcb]/70 backdrop-blur sm:p-7">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[28px] font-black tracking-[-0.045em] text-[#0b2f22]">Reci nam što trebaš</h2>
          <p className="mt-1 text-sm font-semibold leading-6 text-[#657267]">Tri kratka koraka do prave PetPark opcije.</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff0dc] px-3 py-1.5 text-xs font-black uppercase tracking-[0.08em] text-[#f97316]"><Sparkles className="h-3.5 w-3.5" />Pametni asistent</span>
      </div>

      <div className="space-y-6">
        <div>
          <p className="mb-3 text-sm font-black text-[#123829]">1. Odaberi ljubimca</p>
          <div className="grid grid-cols-3 gap-2">
            {['Pas', 'Mačka', 'Mali ljubimci'].map((pet, i) => (
              <span key={pet} className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border px-3 text-sm font-black ${i === 0 ? 'border-[#159067]/30 bg-[#e8f6ec] text-[#123829]' : 'border-[#eadfcb] bg-[#fffaf2] text-[#637067]'}`}>{i === 0 ? <Check className="h-4 w-4 text-[#159067]" /> : null}{pet}</span>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm font-black text-[#123829]">2. Što trebaš?</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {needs.map(({ label, Icon }, i) => (
              <span key={label} className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border px-3 text-sm font-black ${i === 0 ? 'border-[#f97316]/28 bg-[#fff0dc] text-[#123829]' : 'border-[#eadfcb] bg-white text-[#637067]'}`}><Icon className={`h-4 w-4 ${i % 2 ? 'text-[#159067]' : 'text-[#f97316]'}`} />{label}</span>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm font-black text-[#123829]">3. Gdje?</p>
          <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
            <span className="inline-flex min-h-13 items-center justify-between rounded-2xl border border-[#eadfcb] bg-[#fffaf2] px-4 text-sm font-black text-[#123829]"><span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-[#f97316]" />Zagreb</span><ChevronDown className="h-4 w-4 text-[#159067]" /></span>
            <span className="inline-flex min-h-13 items-center justify-center gap-2 rounded-2xl bg-[#123829] px-6 text-sm font-black text-white shadow-[0_16px_34px_rgba(18,56,41,.24)]">Nastavi <ArrowRight className="h-4 w-4" /></span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ServiceOrbit() {
  return (
    <div className="relative mx-auto hidden h-[545px] w-[545px] xl:block">
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,.98)_0%,#fff6e9_38%,#e6f5ea_72%,rgba(255,240,220,.8)_100%)] shadow-[0_36px_110px_rgba(20,65,47,.16)]" />
      <div className="absolute inset-8 rounded-full border border-white/90" />
      <div className="absolute inset-[84px] rounded-full border border-dashed border-[#159067]/24" />
      <div className="absolute inset-[144px] rounded-full bg-white/55 ring-1 ring-white/70" />
      <div className="absolute left-1/2 top-1/2 h-[304px] w-[304px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white p-4 shadow-[0_32px_80px_rgba(20,65,47,.18)]">
        <div className="relative grid h-full w-full place-items-center overflow-hidden rounded-full bg-[#fff7ed]">
          <Image src="/images/design-lab/petpark-v31-hero-dog-cat.png" alt="Pas i mačka za PetPark hero" fill priority sizes="304px" className="object-cover" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,.16),transparent_36%),linear-gradient(180deg,transparent_52%,rgba(18,56,41,.10)_100%)]" />
        </div>
      </div>
      {services.map(({ label, Icon, pos, accent }) => (
        <div key={label} className={`absolute ${pos} flex -translate-x-1/2 flex-col items-center gap-2`}>
          <span className="grid h-[68px] w-[68px] place-items-center rounded-full border border-white/90 bg-white shadow-[0_14px_36px_rgba(20,65,47,.14)]"><Icon className={`h-7 w-7 ${accent}`} /></span>
          <span className="rounded-full bg-white/88 px-3 py-1.5 text-sm font-black text-[#123829] shadow-[0_10px_24px_rgba(20,65,47,.09)]">{label}</span>
        </div>
      ))}
      <Heart className="absolute left-[16%] top-[13%] h-5 w-5 fill-[#f97316]/20 text-[#f97316]" />
      <Sparkles className="absolute bottom-[12%] right-[16%] h-6 w-6 text-[#159067]/70" />
    </div>
  );
}

function ResponsivePetVisual() {
  return (
    <div className="xl:hidden">
      <div className="mx-auto mt-2 max-w-[430px] rounded-[36px] bg-[radial-gradient(circle_at_50%_42%,#fff_0%,#fff2df_48%,#e6f5ea_100%)] p-5 shadow-[0_24px_70px_rgba(20,65,47,.13)] ring-1 ring-white/80">
        <div className="relative mx-auto aspect-square max-w-[320px] overflow-hidden rounded-full bg-[#fff7ed] shadow-[inset_0_0_0_1px_rgba(255,255,255,.8)]">
          <Image src="/images/design-lab/petpark-v31-hero-dog-cat.png" alt="Pas i mačka za PetPark hero" fill sizes="320px" className="object-cover" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,.14),transparent_36%),linear-gradient(180deg,transparent_54%,rgba(18,56,41,.08)_100%)]" />
        </div>
      </div>
    </div>
  );
}

function MobileServiceGrid() {
  return (
    <div className="xl:hidden">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-black text-[#123829]">Usluge u PetParku</p>
        <span className="rounded-full bg-[#e8f6ec] px-3 py-1 text-xs font-black text-[#159067]">6 opcija</span>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {services.map(({ label, Icon, accent }) => (
          <span key={label} className="flex min-h-[76px] items-center gap-3 rounded-[22px] border border-[#eadfcb] bg-white/88 p-3 shadow-[0_10px_24px_rgba(20,65,47,.07)]"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#fff0dc]"><Icon className={`h-5 w-5 ${accent}`} /></span><span className="text-sm font-black text-[#123829]">{label}</span></span>
        ))}
      </div>
    </div>
  );
}

function Hero() {
  return (
    <Container className="grid gap-9 pb-10 pt-5 sm:pb-14 sm:pt-8 xl:grid-cols-[minmax(0,.49fr)_minmax(540px,.51fr)] xl:items-center xl:gap-14 xl:pb-20 xl:pt-14">
      <div className="relative max-w-[600px] space-y-6">
        <div className="absolute left-0 top-[90px] hidden h-16 w-16 rounded-full bg-[#d8f1df] blur-2xl sm:block" />
        <span className="inline-flex rounded-full bg-[#e8f6ec] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#159067]">ODABERI ŠTO TREBAŠ</span>
        <div>
          <h1 className="relative max-w-[590px] text-[42px] font-black leading-[1.03] tracking-[-0.065em] text-[#0b2f22] sm:text-[60px] xl:text-[74px] xl:leading-[.98]">Što treba tvom ljubimcu danas?</h1>
          <p className="mt-5 max-w-[560px] text-[17px] font-semibold leading-8 text-[#617066] sm:text-[19px]">PetPark povezuje ljubimce s pouzdanim ljudima i uslugama koje im olakšavaju svaki dan. Brzo, sigurno i s ljubavlju.</p>
        </div>
        <AssistantCard />
        <ResponsivePetVisual />
        <MobileServiceGrid />
      </div>
      <ServiceOrbit />
    </Container>
  );
}

function ShortcutStrip() {
  return (
    <Container className="pb-10">
      <div className="overflow-hidden rounded-[34px] border border-white/80 bg-white/95 p-2 shadow-[0_24px_70px_rgba(20,65,47,.10)] ring-1 ring-[#eadfcb]/70">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {quick.map(({ title, text, Icon }) => (
            <div key={title} className="group flex min-w-0 items-center gap-3 rounded-[24px] px-4 py-4 transition hover:bg-[#fff7ed]">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#fff0dc] text-[#f97316]"><Icon className="h-5 w-5" /></span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black leading-tight text-[#123829]">{title}</p>
                <p className="mt-1 text-xs font-semibold text-[#657267]">{text}</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-[#159067]" />
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}

function ContentCards() {
  return (
    <Container className="pb-12">
      <div className="mb-7">
        <span className="text-xs font-black uppercase tracking-[0.18em] text-[#f97316]">PetPark vodi dalje</span>
        <h2 className="mt-2 max-w-2xl text-[31px] font-black leading-tight tracking-[-0.055em] text-[#0b2f22] sm:text-[44px]">Jedan početak, tri korisna smjera.</h2>
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <article className="rounded-[36px] border border-white/80 bg-white/95 p-6 shadow-[0_24px_70px_rgba(20,65,47,.095)] ring-1 ring-[#eadfcb]/70">
          <div className="mb-5 flex items-center justify-between"><h3 className="text-2xl font-black text-[#0b2f22]">Live zajednica</h3><span className="inline-flex items-center gap-2 rounded-full bg-[#e8f6ec] px-3 py-1 text-xs font-black text-[#159067]"><span className="h-2 w-2 rounded-full bg-[#159067]" />Uživo</span></div>
          {[['Ana traži čuvanje za vikend', 'Zagreb · prije 8 min'], ['Marko dijeli savjet za šetnju', 'Split · trening'], ['Bella traži novi dom', 'Rijeka · udomljavanje']].map(([title, meta]) => <div key={title} className="mb-3 flex items-center gap-3 rounded-2xl bg-[#fffaf2] p-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#fff0dc] text-[#f97316]"><PawPrint className="h-5 w-5" /></span><div><p className="text-sm font-black text-[#123829]">{title}</p><p className="text-xs font-semibold text-[#657267]">{meta}</p></div></div>)}
          <span className="mt-3 inline-flex items-center gap-2 text-sm font-black text-[#f97316]">Otvori zajednicu <ArrowRight className="h-4 w-4" /></span>
        </article>

        <article className="rounded-[36px] border border-white/80 bg-white/95 p-6 shadow-[0_24px_70px_rgba(20,65,47,.095)] ring-1 ring-[#eadfcb]/70">
          <div className="mb-5 flex items-center justify-between"><h3 className="text-2xl font-black text-[#0b2f22]">Najnoviji savjeti</h3><BookOpen className="h-6 w-6 text-[#f97316]" /></div>
          {[['Kako pas pokazuje stres?', 'Ponašanje · 4 min'], ['Njega dlake bez nervoze', 'Grooming · 5 min'], ['Prvi koraci kad ljubimac nestane', 'Sigurnost · važno']].map(([title, meta]) => <div key={title} className="mb-3 grid grid-cols-[58px_1fr] gap-3 rounded-2xl bg-[#fffaf2] p-3"><span className="rounded-2xl bg-gradient-to-br from-[#e8f6ec] to-[#fff0dc]" /><div><p className="text-sm font-black leading-5 text-[#123829]">{title}</p><p className="mt-1 text-xs font-semibold text-[#657267]">{meta}</p></div></div>)}
          <span className="mt-3 inline-flex items-center gap-2 text-sm font-black text-[#f97316]">Pogledaj blog <ArrowRight className="h-4 w-4" /></span>
        </article>

        <article className="rounded-[36px] border border-[#cfe3d3] bg-[linear-gradient(180deg,#ecf8f0_0%,#def1e5_100%)] p-6 shadow-[0_24px_70px_rgba(20,65,47,.09)]">
          <div className="mb-5 flex items-center justify-between"><h3 className="text-2xl font-black text-[#0b2f22]">Zašto PetPark?</h3><ShieldCheck className="h-6 w-6 text-[#159067]" /></div>
          {['Krećeš od potrebe ljubimca', 'Sve važno na jednom mjestu', 'Topao lokalni kontekst', 'Manje marketplace buke'].map((item) => <div key={item} className="mb-3 flex items-center gap-3 rounded-2xl bg-white/72 p-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-white text-[#159067]"><Check className="h-5 w-5" /></span><p className="text-sm font-black text-[#123829]">{item}</p></div>)}
          <span className="mt-3 inline-flex items-center gap-2 text-sm font-black text-[#159067]">Prikaži opcije <ArrowRight className="h-4 w-4" /></span>
        </article>
      </div>
    </Container>
  );
}

function AppBanner() {
  return (
    <Container className="pb-12">
      <div className="grid gap-7 overflow-hidden rounded-[42px] bg-[linear-gradient(135deg,#dff2e4_0%,#fff1df_100%)] p-7 shadow-[0_22px_70px_rgba(20,65,47,.12)] lg:grid-cols-[.75fr_1.25fr] lg:p-11">
        <div className="relative mx-auto h-[210px] w-[142px] rounded-[34px] border-[8px] border-[#123829] bg-white shadow-[0_18px_50px_rgba(18,56,41,.18)] lg:mx-0"><div className="m-3 rounded-[22px] bg-[#fff7ed] p-3"><div className="mb-3 h-16 rounded-2xl bg-[#e8f6ec]" /><div className="mb-2 h-3 rounded-full bg-[#123829]/20" /><div className="h-3 w-2/3 rounded-full bg-[#f97316]/40" /></div></div>
        <div className="flex flex-col justify-center">
          <span className="text-xs font-black uppercase tracking-[0.18em] text-[#159067]">PetPark app</span>
          <h2 className="mt-2 text-[30px] font-black tracking-[-0.055em] text-[#0b2f22] sm:text-[44px]">PetPark uvijek uz tebe.</h2>
          <p className="mt-3 max-w-2xl text-base font-semibold leading-8 text-[#617066]">Brze obavijesti, lakša rezervacija, poruke i sve odluke za ljubimca na jednom toplom mjestu.</p>
          <div className="mt-6 flex flex-wrap gap-3">{['Brze obavijesti', 'Laka rezervacija', 'Poruke', 'Sve na jednom mjestu'].map((chip) => <span key={chip} className="rounded-full bg-white/78 px-4 py-2 text-sm font-black text-[#123829] shadow-[0_8px_20px_rgba(20,65,47,.06)]">{chip}</span>)}</div>
        </div>
      </div>
    </Container>
  );
}

function Footer() {
  return (
    <footer id="petpark-v31-footer" className="border-t border-[#eadfcb] bg-[#fffaf2]">
      <div className="mx-auto grid max-w-[1320px] gap-7 px-4 py-9 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-8">
        <div><Image src="/brand/petpark-logo.svg" alt="PetPark" width={118} height={38} className="h-auto w-[108px]" /><p className="mt-4 max-w-sm text-sm font-semibold leading-7 text-[#657267]">Design-lab prototip prema vizualnoj referenci, s pravim PetPark logom.</p></div>
        {['Usluge', 'Zajednica', 'Pomoć'].map((h) => <div key={h}><h3 className="text-sm font-black text-[#123829]">{h}</h3><div className="mt-3 grid gap-2 text-sm font-semibold text-[#657267]"><span>Čuvanje</span><span>Savjeti</span><span>Kontakt</span></div></div>)}
      </div>
    </footer>
  );
}

export default function HomepageV31DesignLab() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: shellCss }} />
      <main id="petpark-homepage-v31-lab" className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_10%_12%,rgba(220,242,226,.95),transparent_30%),radial-gradient(circle_at_88%_10%,rgba(255,225,190,.9),transparent_34%),linear-gradient(180deg,#fbf4e8_0%,#fffaf2_48%,#fbf4e8_100%)] text-[#163528]">
        <Header />
        <Hero />
        <ShortcutStrip />
        <ContentCards />
        <AppBanner />
        <Footer />
      </main>
    </>
  );
}

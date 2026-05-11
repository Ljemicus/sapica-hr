import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  HeartHandshake,
  Home,
  MapPin,
  MessageCircle,
  PawPrint,
  Search,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'PetPark Homepage v3 Design Lab',
  description: 'Standalone PetPark homepage v3 design-lab prototype for review only.',
  robots: { index: false, follow: false },
};

type IconType = typeof PawPrint;

type Tone = 'mint' | 'cream' | 'orange' | 'green' | 'rose';

const navItems = ['Usluge', 'Kako radi', 'Zajednica', 'Blog'];
const petChoices = ['Pas', 'Mačka', 'Mali ljubimci'];
const serviceChoices = ['Čuvanje', 'Šetnja', 'Grooming', 'Trening', 'Izgubljeni', 'Udomljavanje'];

const orbitNodes: Array<{ label: string; Icon: IconType; tone: Tone; position: string }> = [
  { label: 'Čuvanje', Icon: Home, tone: 'mint', position: 'left-1/2 top-0 -translate-x-1/2' },
  { label: 'Šetnja', Icon: PawPrint, tone: 'green', position: 'right-0 top-[23%]' },
  { label: 'Grooming', Icon: Sparkles, tone: 'orange', position: 'right-10 bottom-[17%]' },
  { label: 'Trening', Icon: GraduationCap, tone: 'cream', position: 'bottom-0 left-1/2 -translate-x-1/2' },
  { label: 'Izgubljeni', Icon: MapPin, tone: 'rose', position: 'bottom-[17%] left-10' },
  { label: 'Udomljavanje', Icon: HeartHandshake, tone: 'orange', position: 'left-0 top-[23%]' },
];

const quickActions: Array<{ title: string; text: string; Icon: IconType; tone: Tone }> = [
  { title: 'Rezerviraj šetnju', text: 'Za dane kad treba pouzdana šetnja bez puno dogovaranja.', Icon: PawPrint, tone: 'green' },
  { title: 'Pronađi čuvanje', text: 'Mirniji plan kad putuješ, radiš ili trebaš sigurnu pomoć.', Icon: Home, tone: 'mint' },
  { title: 'Hitno: izgubljen?', text: 'Brza prijava i jasna pomoć zajednice u blizini.', Icon: MapPin, tone: 'rose' },
  { title: 'Udomi ljubav', text: 'Topao put prema ljubimcima koji čekaju novi dom.', Icon: HeartHandshake, tone: 'orange' },
];

const directionCards: Array<{
  title: string;
  description: string;
  cta: string;
  Icon: IconType;
  items: Array<{ title: string; meta: string; badge?: string }>;
}> = [
  {
    title: 'Live zajednica',
    description: 'Kratki lokalni signali, pitanja i pomoć kad trebaš brzu odluku.',
    cta: 'Otvori zajednicu',
    Icon: MessageCircle,
    items: [
      { title: 'Netko traži preporuku za čuvanje', meta: 'Zagreb · danas', badge: 'novo' },
      { title: 'Savjet za prvu šetnju s novim psom', meta: 'Zajednica · odgovoreno' },
      { title: 'Udomljavanje u blizini Rijeke', meta: 'Lokalno · provjeri' },
    ],
  },
  {
    title: 'Najnoviji savjeti',
    description: 'Kratki vodiči za njegu, ponašanje i sigurnost ljubimaca.',
    cta: 'Čitaj savjete',
    Icon: BookOpen,
    items: [
      { title: 'Kako prepoznati stres kod psa', meta: 'Ponašanje · 4 min' },
      { title: 'Njega dlake bez nervoze', meta: 'Grooming · vodič' },
      { title: 'Što napraviti ako ljubimac pobjegne', meta: 'Sigurnost · važno', badge: 'hitno' },
    ],
  },
  {
    title: 'Zašto PetPark?',
    description: 'Kreće od potrebe ljubimca, ne od beskrajnog kataloga profila.',
    cta: 'Prikaži opcije',
    Icon: ShieldCheck,
    items: [
      { title: 'Jasniji prvi korak', meta: 'Odaberi potrebu, zatim detalje.' },
      { title: 'Topliji lokalni kontekst', meta: 'Usluge i ljudi oko tebe.' },
      { title: 'Manje marketplace buke', meta: 'Više povjerenja, manje lutanja.' },
    ],
  },
];

const toneClasses: Record<Tone, string> = {
  mint: 'bg-[#e8f5ec] text-[#0f6b57]',
  cream: 'bg-[#fff7e8] text-[#123829]',
  orange: 'bg-[#fff0dc] text-[#f97316]',
  green: 'bg-[#e4f1e8] text-[#123829]',
  rose: 'bg-[#fff0ea] text-[#c7502d]',
};

const shellCss = `
  body:has(#petpark-homepage-v3-lab) > header[role="banner"],
  body:has(#petpark-homepage-v3-lab) footer:not(#petpark-lab-footer),
  body:has(#petpark-homepage-v3-lab) nav.fixed.bottom-0.left-0.right-0,
  body:has(#petpark-homepage-v3-lab) div.fixed.bottom-20.right-4,
  body:has(#petpark-homepage-v3-lab) div.fixed.bottom-4.right-4,
  body:has(#petpark-homepage-v3-lab) button.fixed.bottom-20.right-4,
  body:has(#petpark-homepage-v3-lab) button.fixed.bottom-4.right-4,
  body:has(#petpark-homepage-v3-lab) nextjs-portal,
  body:has(#petpark-homepage-v3-lab) [data-nextjs-toast],
  body:has(#petpark-homepage-v3-lab) [data-nextjs-dialog-overlay] {
    display: none !important;
  }
  body:has(#petpark-homepage-v3-lab) main#main-content { overflow: hidden; }
  #petpark-homepage-v3-lab * { box-sizing: border-box; }
`;

function LabContainer({ children, className = '', id }: { children: React.ReactNode; className?: string; id?: string }) {
  return <div id={id} className={`mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>;
}

function LabHeader() {
  return (
    <header className="mx-auto flex h-[72px] w-full max-w-[1320px] items-center justify-between px-4 sm:px-6 lg:px-8">
      <Link href="/design-lab/homepage-v3" aria-label="PetPark design lab" className="inline-flex items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f97316] focus-visible:ring-offset-2">
        <Image src="/brand/petpark-logo.svg" alt="PetPark" width={142} height={44} priority className="h-auto w-[112px] sm:w-[142px]" />
      </Link>

      <nav aria-label="Design lab navigacija" className="hidden rounded-full border border-[#eadfcf] bg-white/72 p-1.5 shadow-[0_12px_40px_rgba(24,64,47,.07)] backdrop-blur lg:flex">
        {navItems.map((item) => (
          <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="rounded-full px-4 py-2 text-sm font-extrabold text-[#173d2d] transition hover:bg-[#fff2df] hover:text-[#f97316] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f97316]">
            {item}
          </a>
        ))}
      </nav>

      <div className="hidden items-center gap-2 sm:flex">
        <span className="rounded-full px-4 py-2 text-sm font-extrabold text-[#173d2d]">Prijava</span>
        <span className="rounded-full bg-[#f97316] px-4 py-2 text-sm font-extrabold text-white shadow-[0_14px_28px_rgba(249,115,22,.24)]">Objavi uslugu</span>
      </div>

      <span className="rounded-full border border-[#eadfcf] bg-white/78 px-4 py-2 text-sm font-extrabold text-[#173d2d] shadow-[0_8px_20px_rgba(24,64,47,.06)] sm:hidden">Menu</span>
    </header>
  );
}

function ChoicePill({ label, selected = false }: { label: string; selected?: boolean }) {
  return (
    <span className={`inline-flex min-h-10 items-center justify-center rounded-full border px-3.5 text-sm font-black ${selected ? 'border-[#f97316]/30 bg-[#ffe3c5] text-[#123829] shadow-[inset_0_0_0_1px_rgba(255,255,255,.8)]' : 'border-[#eadfcf] bg-white/80 text-[#617063]'}`}>
      {label}
    </span>
  );
}

function Step({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[24px] bg-[#fffaf1] p-4 ring-1 ring-[#eadfcf]/85">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-xs font-black text-[#f97316] shadow-[0_6px_18px_rgba(24,64,47,.06)]">{number}</span>
        <p className="text-sm font-black text-[#123829]">{title}</p>
      </div>
      {children}
    </div>
  );
}

function SmartAssistant() {
  return (
    <div className="w-full max-w-[570px] rounded-[32px] border border-[#eadfcf] bg-white/93 p-5 shadow-[0_26px_70px_rgba(24,64,47,.12)] backdrop-blur sm:p-7">
      <div className="mb-5">
        <span className="inline-flex rounded-full bg-[#fff0dc] px-3 py-1 text-[11px] font-black uppercase tracking-[0.13em] text-[#f97316]">Pametni asistent</span>
        <h2 className="mt-3 text-[26px] font-black leading-tight tracking-[-0.045em] text-[#0b2f22] sm:text-[30px]">Reci nam što trebaš</h2>
        <p className="mt-1 text-sm leading-6 text-[#647165]">Tri kratka koraka do prave PetPark opcije.</p>
      </div>

      <div className="space-y-3.5">
        <Step number="1" title="Odaberi ljubimca">
          <div className="flex flex-wrap gap-2">{petChoices.map((choice, index) => <ChoicePill key={choice} label={choice} selected={index === 0} />)}</div>
        </Step>
        <Step number="2" title="Što trebaš?">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{serviceChoices.map((choice, index) => <ChoicePill key={choice} label={choice} selected={index === 0} />)}</div>
        </Step>
        <Step number="3" title="Gdje?">
          <div className="grid gap-3 sm:grid-cols-[1fr_168px] sm:items-center">
            <div className="flex min-h-12 items-center gap-2 rounded-2xl border border-[#eadfcf] bg-white px-4 text-sm font-black text-[#123829]">
              <MapPin className="h-4 w-4 text-[#f97316]" aria-hidden="true" />
              Zagreb
            </div>
            <span className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#f97316] px-6 text-sm font-black text-white shadow-[0_14px_30px_rgba(249,115,22,.25)]">Nastavi</span>
          </div>
        </Step>
      </div>
    </div>
  );
}

function ServiceCircle() {
  return (
    <div className="relative mx-auto hidden h-[560px] w-[560px] xl:block" aria-label="PetPark service circle desktop prototype">
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_45%,#ffffff_0%,#fffaf2_40%,#e8f5ec_74%,#fff1df_100%)] shadow-[0_36px_96px_rgba(24,64,47,.16)]" />
      <div className="absolute inset-10 rounded-full border border-white/90" />
      <div className="absolute inset-[92px] rounded-full border border-dashed border-[#0f6b57]/18" />
      <div className="absolute inset-[150px] rounded-full border border-[#eadfcf]/85 bg-white/65" />

      <div className="absolute left-1/2 top-1/2 h-[268px] w-[268px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#fffaf1] p-5 shadow-[0_28px_78px_rgba(24,64,47,.18)] ring-1 ring-white/85">
        <div className="relative grid h-full w-full place-items-center overflow-hidden rounded-full bg-[radial-gradient(circle_at_48%_34%,#fff_0%,#fff7e8_48%,#e7f3ea_100%)]">
          <Image src="/images/petpark-home-hero-pets.svg" alt="Privremeni dog and cat PetPark illustration" width={210} height={210} priority className="h-[210px] w-[210px] object-contain" />
          <div className="pointer-events-none absolute inset-x-8 bottom-9 h-8 rounded-full bg-[#123829]/10 blur-xl" />
        </div>
      </div>

      {orbitNodes.map(({ label, Icon, tone, position }) => (
        <div key={label} className={`absolute ${position} flex h-[98px] w-[138px] flex-col items-center justify-center rounded-[30px] border border-white/90 bg-white/94 p-3 text-center shadow-[0_16px_44px_rgba(24,64,47,.12)] backdrop-blur`}>
          <span className={`mb-2 grid h-10 w-10 place-items-center rounded-2xl ${toneClasses[tone]}`} aria-hidden="true"><Icon className="h-5 w-5" /></span>
          <span className="text-sm font-black text-[#0b2f22]">{label}</span>
        </div>
      ))}
    </div>
  );
}

function MobileServiceGrid() {
  return (
    <div className="xl:hidden">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-black text-[#123829]">Usluge u PetParku</p>
        <span className="rounded-full bg-[#e8f5ec] px-3 py-1 text-xs font-black text-[#0f6b57]">Kompaktni izbor</span>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {orbitNodes.map(({ label, Icon, tone }) => (
          <div key={label} className="flex min-h-[76px] items-center gap-3 rounded-[22px] border border-[#eadfcf] bg-white/86 p-3 shadow-[0_8px_24px_rgba(24,64,47,.065)]">
            <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl ${toneClasses[tone]}`} aria-hidden="true"><Icon className="h-5 w-5" /></span>
            <span className="text-sm font-black leading-tight text-[#0b2f22]">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Hero() {
  return (
    <LabContainer className="grid gap-10 pb-14 pt-6 sm:pt-10 xl:grid-cols-[minmax(0,0.48fr)_minmax(540px,0.52fr)] xl:items-center xl:gap-16 xl:pb-20 xl:pt-16">
      <div className="max-w-[590px] space-y-6">
        <div>
          <span className="inline-flex rounded-full border border-[#eadfcf] bg-white/70 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#f97316] shadow-[0_10px_26px_rgba(24,64,47,.06)]">ODABERI ŠTO TREBAŠ</span>
          <h1 className="mt-5 max-w-[580px] text-[42px] font-black leading-[1.01] tracking-[-0.065em] text-[#0b2f22] sm:text-[60px] xl:text-[76px] xl:leading-[0.98]">Što treba tvom ljubimcu danas?</h1>
          <p className="mt-5 max-w-[560px] text-[17px] leading-8 text-[#5f6b63] sm:text-[19px]">PetPark povezuje ljubimce s pouzdanim ljudima i uslugama koje im olakšavaju svaki dan. Brzo, sigurno i s ljubavlju.</p>
        </div>
        <SmartAssistant />
        <MobileServiceGrid />
      </div>
      <ServiceCircle />
    </LabContainer>
  );
}

function QuickActions() {
  return (
    <LabContainer id="usluge" className="py-6 sm:py-8">
      <div className="mb-6 max-w-2xl">
        <span className="text-xs font-black uppercase tracking-[0.18em] text-[#f97316]">Brze akcije</span>
        <h2 className="mt-2 text-[30px] font-black leading-tight tracking-[-0.05em] text-[#0b2f22] sm:text-[42px]">Najkraći put do pomoći.</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {quickActions.map(({ title, text, Icon, tone }) => (
          <article key={title} className="group flex min-h-[168px] flex-col rounded-[30px] border border-[#eadfcf] bg-white/88 p-5 shadow-[0_18px_48px_rgba(24,64,47,.085)] transition hover:-translate-y-1 hover:bg-white hover:shadow-[0_26px_64px_rgba(24,64,47,.12)]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <span className={`grid h-12 w-12 place-items-center rounded-2xl ${toneClasses[tone]}`} aria-hidden="true"><Icon className="h-6 w-6" /></span>
              <ChevronRight className="mt-1 h-5 w-5 text-[#f97316] opacity-70 transition group-hover:translate-x-1" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-black leading-tight tracking-[-0.025em] text-[#0b2f22]">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-[#5f6b63]">{text}</p>
          </article>
        ))}
      </div>
    </LabContainer>
  );
}

function DirectionCards() {
  return (
    <LabContainer id="zajednica" className="py-8 sm:py-12">
      <div className="mb-7 grid gap-3 lg:grid-cols-[1fr_0.75fr] lg:items-end">
        <div>
          <span className="text-xs font-black uppercase tracking-[0.18em] text-[#f97316]">PetPark vodi dalje</span>
          <h2 className="mt-2 text-[30px] font-black leading-tight tracking-[-0.055em] text-[#0b2f22] sm:text-[44px]">Jedan početak, tri korisna smjera.</h2>
        </div>
        <p className="text-sm leading-7 text-[#5f6b63] sm:text-base">Manje ponavljanja, više jasnih izbora: zajednica, savjeti i razlog zašto PetPark nije hladan katalog.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {directionCards.map(({ title, description, cta, Icon, items }) => (
          <article key={title} className="rounded-[32px] border border-[#eadfcf] bg-white/90 p-5 shadow-[0_20px_56px_rgba(24,64,47,.09)] sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <span className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-[#fff0dc] text-[#f97316]" aria-hidden="true"><Icon className="h-6 w-6" /></span>
                <h3 className="text-2xl font-black tracking-[-0.045em] text-[#0b2f22]">{title}</h3>
              </div>
            </div>
            <p className="min-h-[72px] text-sm leading-7 text-[#5f6b63]">{description}</p>
            <div className="mt-5 space-y-3">
              {items.map((item) => (
                <div key={item.title} className="rounded-[20px] border border-[#eadfcf]/75 bg-[#fffaf1] p-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-black leading-5 text-[#0b2f22]">{item.title}</p>
                      <p className="mt-1 text-xs font-semibold leading-4 text-[#657267]">{item.meta}</p>
                    </div>
                    {item.badge ? <span className="shrink-0 rounded-full bg-[#e8f5ec] px-2.5 py-1 text-[11px] font-black text-[#0f6b57]">{item.badge}</span> : null}
                  </div>
                </div>
              ))}
            </div>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[#f97316]">{cta}<ArrowRight className="h-4 w-4" /></span>
          </article>
        ))}
      </div>
    </LabContainer>
  );
}

function CommunityBanner() {
  return (
    <LabContainer id="kako-radi" className="py-8 sm:py-12">
      <div className="rounded-[34px] bg-[#fff0dc] p-2 shadow-[0_26px_80px_rgba(24,64,47,.11)]">
        <div className="rounded-[28px] bg-[radial-gradient(circle_at_88%_14%,rgba(249,115,22,.22),transparent_32%),linear-gradient(135deg,#0b2f22_0%,#123829_58%,#0f6b57_100%)] px-7 py-9 text-white sm:px-10 sm:py-11 lg:grid lg:min-h-[292px] lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-10 lg:px-12">
          <div>
            <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-[#ffe4c7]">PetPark zajednica</span>
            <h2 className="mt-4 max-w-2xl text-[30px] font-black leading-[1.03] tracking-[-0.055em] sm:text-[44px]">Sve na jednom mjestu, bez hladnog marketplace dojma.</h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/78">Topla platforma za svakodnevne odluke: gdje pronaći pomoć, kako reagirati kad je hitno i kome se obratiti kad treba mirniji dogovor.</p>
          </div>
          <div className="mt-7 grid gap-3 sm:grid-cols-3 lg:mt-0 lg:grid-cols-1">
            {[
              ['Usluge koje imaju smisla', Search],
              ['Savjeti kada nisi siguran', CheckCircle2],
              ['Ljudi koji mogu pomoći', UsersRound],
            ].map(([label, Icon]) => {
              const IconComponent = Icon as IconType;
              return (
                <div key={label as string} className="flex min-h-16 items-center gap-3 rounded-[22px] border border-white/12 bg-white/11 px-4 py-4 text-sm font-black leading-5 text-white backdrop-blur">
                  <IconComponent className="h-5 w-5 shrink-0 text-[#ffe4c7]" aria-hidden="true" />
                  {label as string}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </LabContainer>
  );
}

function LabFooter() {
  return (
    <footer id="petpark-lab-footer" className="border-t border-[#eadfcf] bg-[#fffaf1]">
      <div className="mx-auto grid max-w-[1320px] gap-7 px-4 py-8 sm:px-6 lg:grid-cols-[1.25fr_1fr_1fr_1fr] lg:px-8 lg:py-10">
        <div>
          <Image src="/brand/petpark-logo.svg" alt="PetPark" width={118} height={38} className="h-auto w-[108px]" />
          <p className="mt-4 max-w-sm text-sm leading-7 text-[#5f6b63]">Design-lab prototip za pregled: smjer, hijerarhija i osjećaj prije produkcijske implementacije.</p>
        </div>
        {[
          ['Usluge', ['Čuvanje', 'Šetnja', 'Grooming']],
          ['Zajednica', ['Live zajednica', 'Savjeti', 'Udomljavanje']],
          ['Pomoć', ['Izgubljeni', 'Kako radi', 'Kontakt']],
        ].map(([heading, links]) => (
          <div key={heading as string}>
            <h3 className="text-sm font-black text-[#0b2f22]">{heading as string}</h3>
            <div className="mt-3 grid gap-2 text-sm font-semibold text-[#5f6b63]">{(links as string[]).map((item) => <span key={item}>{item}</span>)}</div>
          </div>
        ))}
      </div>
    </footer>
  );
}

export default function HomepageV3DesignLab() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: shellCss }} />
      <main id="petpark-homepage-v3-lab" className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_12%_8%,rgba(231,243,234,.92),transparent_32%),radial-gradient(circle_at_86%_5%,rgba(255,224,190,.82),transparent_34%),linear-gradient(180deg,#fbf4e8_0%,#fffaf1_46%,#fbf4e8_100%)] text-[#163528]">
        <LabHeader />
        <Hero />
        <QuickActions />
        <DirectionCards />
        <CommunityBanner />
        <LabFooter />
      </main>
    </>
  );
}

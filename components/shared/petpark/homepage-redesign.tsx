import Image from 'next/image';
import Link from 'next/link';
import {
  Bell,
  BookOpen,
  Bookmark,
  ChevronRight,
  Heart,
  MapPin,
  MessageCircle,
  PawPrint,
  Plus,
  Search,
  ShieldCheck,
  UserRound,
  UsersRound,
} from 'lucide-react';
import { PetParkLogo } from '@/components/shared/brand';
import { cn } from '@/lib/utils';

type HomepageRedesignProps = {
  mode?: 'production' | 'preview';
};

type CategoryIconName = 'care' | 'walk' | 'grooming' | 'training' | 'lost' | 'adoption';
type Tone = 'orange' | 'green' | 'teal' | 'yellow';

const officialCategoryIcons: Record<CategoryIconName, string> = {
  care: '/images/design-lab/official/icons/icon-only/cuvanje.svg',
  walk: '/images/design-lab/official/icons/icon-only/setnja.svg',
  grooming: '/images/design-lab/official/icons/icon-only/grooming.svg',
  training: '/images/design-lab/official/icons/icon-only/trening.svg',
  lost: '/images/design-lab/official/icons/icon-only/izgubljeni.svg',
  adoption: '/images/design-lab/official/icons/icon-only/udomljavanje.svg',
};

const navItems = [
  { label: 'Usluge', href: '/usluge' },
  { label: 'Kako radi', href: '#kako-radi' },
  { label: 'Zajednica', href: '/zajednica' },
  { label: 'Blog', href: '/blog' },
];

const categories: { label: string; href: string; icon: CategoryIconName; tone: 'orange' | 'green' }[] = [
  { label: 'Čuvanje', href: '/usluge', icon: 'care', tone: 'orange' },
  { label: 'Šetnja', href: '/usluge', icon: 'walk', tone: 'green' },
  { label: 'Grooming', href: '/njega', icon: 'grooming', tone: 'green' },
  { label: 'Trening', href: '/dresura', icon: 'training', tone: 'green' },
  { label: 'Izgubljeni', href: '/izgubljeni', icon: 'lost', tone: 'green' },
  { label: 'Udomljavanje', href: '/udomljavanje', icon: 'adoption', tone: 'orange' },
];

const feedItems = [
  {
    title: 'Nestao mačak u Trešnjevci',
    body: 'Sivi mačak, zelenih očiju, odaziva se na ime Leo.',
    location: 'Trešnjevka, Zagreb',
    badge: 'UPOZORENJE',
    time: 'Prije 2 h',
    tone: 'orange' as Tone,
    image: '/images/design-lab/petpark-reference-feed-cat.png',
  },
  {
    title: 'Pronađen pas kod Maksimira',
    body: 'Prijateljski pas, s crnom ogrlicom.',
    location: 'Maksimir, Zagreb',
    badge: 'PRONAĐENO',
    time: 'Prije 5 h',
    tone: 'green' as Tone,
    image: '/images/design-lab/petpark-reference-feed-dog.png',
  },
  {
    title: 'Nova tema: priprema psa za čuvanje',
    body: 'Kako pomoći psu da se osjeća sigurno i opušteno dok ste vi odsutni.',
    location: 'Forum zajednice',
    badge: 'FORUM',
    time: 'Prije 6 h',
    tone: 'teal' as Tone,
    Icon: MessageCircle,
  },
  {
    title: 'Članak: kako odabrati groomera',
    body: 'Savjeti koji će vam pomoći pronaći pravog stručnjaka za vašeg ljubimca.',
    location: 'PetPark blog',
    badge: 'BLOG',
    time: 'Prije 1 d',
    tone: 'yellow' as Tone,
    Icon: BookOpen,
  },
];

const quickAccess = [
  { title: 'Forum', body: 'Pitajte, podijelite iskustva i pomozite drugima.', href: '/forum', Icon: MessageCircle, tone: 'teal' as Tone },
  { title: 'Izgubljeni / pronađeni', body: 'Pronašli ste ljubimca ili tražite svog?', href: '/izgubljeni', Icon: MapPin, tone: 'orange' as Tone },
  { title: 'Udomljavanje', body: 'Dajte dom. Promijenite život.', href: '/udomljavanje', Icon: Heart, tone: 'green' as Tone },
  { title: 'Blog savjeti', body: 'Korisni članci i vodiči za svakog vlasnika.', href: '/blog', Icon: BookOpen, tone: 'yellow' as Tone },
];

const trustItems = [
  { title: 'Provjereni pružatelji usluga', body: 'Sigurnost i kvaliteta', Icon: ShieldCheck },
  { title: 'Zajednica koja pomaže', body: 'Stručni savjeti i podrška', Icon: UsersRound },
  { title: 'Lokalno i pouzdano', body: 'Usluge u vašem gradu', Icon: MapPin },
  { title: 'Za sve ljubimce', body: 'Psi, mačke i više', Icon: PawPrint },
];

const shellHideCss = `
  body:has(#petpark-homepage-live-reference) > header[role="banner"],
  body:has(#petpark-homepage-live-reference) footer:not(#petpark-home-footer),
  body:has(#petpark-homepage-live-reference) nav.fixed.bottom-0.left-0.right-0,
  body:has(#petpark-homepage-live-reference) .fixed.bottom-0.left-0.right-0,
  body:has(#petpark-homepage-live-reference) div.fixed.bottom-20.right-4,
  body:has(#petpark-homepage-live-reference) div.fixed.bottom-4.right-4,
  body:has(#petpark-homepage-live-reference) button.fixed.bottom-20.right-4,
  body:has(#petpark-homepage-live-reference) button.fixed.bottom-4.right-4,
  body:has(#petpark-homepage-live-reference) nextjs-portal,
  body:has(#petpark-homepage-live-reference) [data-nextjs-toast],
  body:has(#petpark-homepage-live-reference) [data-nextjs-dialog-overlay] { display: none !important; }
  body:has(#petpark-homepage-live-reference) main#main-content { overflow: hidden; }
  body:has(#petpark-homepage-live-reference) .pb-20 { padding-bottom: 0 !important; }
  @media (min-width: 768px) and (max-width: 1023px) {
    #petpark-homepage-live-reference .petpark-mobile-hero { display: flex !important; flex-direction: row !important; align-items: center !important; gap: 28px !important; }
    #petpark-homepage-live-reference .petpark-mobile-hero-visual { width: 310px !important; flex: 0 0 310px !important; }
  }
`;

function CategoryGlyph({ name }: { name: CategoryIconName }) {
  const common = 'h-7 w-7';

  if (name === 'care') {
    return (
      <svg viewBox="0 0 48 48" className={common} fill="none" aria-hidden="true">
        <path d="M13.5 24 24 15.2 34.5 24" stroke="currentColor" strokeWidth="4.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17 23.2v12h14v-12" fill="currentColor" />
        <circle cx="24" cy="30" r="3.8" fill="#fff7ec" />
        <circle cx="24" cy="30" r="1.35" fill="currentColor" />
      </svg>
    );
  }

  if (name === 'walk') {
    return (
      <svg viewBox="0 0 48 48" className={common} fill="none" aria-hidden="true">
        <circle cx="17" cy="31" r="4.7" stroke="currentColor" strokeWidth="4" />
        <circle cx="31" cy="17" r="4.7" stroke="currentColor" strokeWidth="4" />
        <path d="M20.7 27.3 27.3 20.7" stroke="currentColor" strokeWidth="4.4" strokeLinecap="round" />
        <path d="M13.7 34.3 10.8 37.2M34.3 13.7l2.9-2.9" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === 'grooming') {
    return (
      <svg viewBox="0 0 48 48" className={common} fill="none" aria-hidden="true">
        <path d="m14 14 20 20" stroke="currentColor" strokeWidth="4.4" strokeLinecap="round" />
        <path d="m34 14-20 20" stroke="currentColor" strokeWidth="4.4" strokeLinecap="round" />
        <circle cx="14" cy="35" r="4.3" stroke="currentColor" strokeWidth="3.7" />
        <circle cx="34" cy="35" r="4.3" stroke="currentColor" strokeWidth="3.7" />
      </svg>
    );
  }

  if (name === 'training') {
    return (
      <svg viewBox="0 0 48 48" className={common} fill="none" aria-hidden="true">
        <path d="M8 19.5 24 11.5l16 8-16 8-16-8Z" fill="currentColor" />
        <path d="M15.5 25.2v6.9c4.7 3.1 12.3 3.1 17 0v-6.9" fill="currentColor" />
        <path d="M38.5 21.2v9" stroke="currentColor" strokeWidth="3.3" strokeLinecap="round" />
        <circle cx="38.5" cy="33" r="2.1" fill="currentColor" />
      </svg>
    );
  }

  if (name === 'lost') {
    return (
      <svg viewBox="0 0 48 48" className={common} fill="none" aria-hidden="true">
        <path d="M24 41s12.5-11.9 12.5-23.4a12.5 12.5 0 0 0-25 0C11.5 29.1 24 41 24 41Z" fill="currentColor" />
        <circle cx="24" cy="18" r="5.1" fill="#eef3e6" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 48 48" className={common} fill="none" aria-hidden="true">
      <circle cx="24" cy="16.2" r="4.6" fill="currentColor" />
      <circle cx="14.5" cy="20.6" r="3.8" fill="currentColor" />
      <circle cx="33.5" cy="20.6" r="3.8" fill="currentColor" />
      <circle cx="18.5" cy="29.5" r="3.8" fill="currentColor" />
      <circle cx="29.5" cy="29.5" r="3.8" fill="currentColor" />
      <path d="M24 38.5c-5.8-3.9-8.2-6.4-8.2-9.1 0-2.2 1.7-3.8 3.9-3.8 1.7 0 3.2.9 4.3 2.4 1.1-1.5 2.6-2.4 4.3-2.4 2.2 0 3.9 1.6 3.9 3.8 0 2.7-2.4 5.2-8.2 9.1Z" fill="#fff7ec" />
    </svg>
  );
}

function CategoryCard({ label, href, icon, tone }: (typeof categories)[number]) {
  const cardWidth = label === 'Čuvanje' || label === 'Šetnja' ? 90 : label === 'Udomljavanje' ? 100 : 96;

  return (
    <Link
      href={href}
      style={{ width: cardWidth }}
      className="flex h-[121px] flex-col items-center justify-center rounded-[11px] border border-[#E9E0D1] bg-[#FFFDF8] text-center shadow-[0_10px_24px_rgba(80,55,25,.09)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(80,55,25,.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F26A00] focus-visible:ring-offset-2"
    >
      <span className={cn('mb-[15px] flex h-[59px] w-[59px] items-center justify-center rounded-full', tone === 'orange' ? 'bg-[#FBE9DB] text-[#E9651A]' : 'bg-[#E9F0DF] text-[#286D45]')}>
        <CategoryGlyph name={icon} />
      </span>
      <span className="text-[14px] font-semibold leading-none text-[#141c18]">{label}</span>
    </Link>
  );
}

function ToneBadge({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        'rounded-full px-3 py-1 text-[10px] font-black tracking-[0.08em]',
        tone === 'orange' && 'bg-[#FBE9DB] text-[#B4531C]',
        tone === 'green' && 'bg-[#DFEADA] text-[#286D45]',
        tone === 'teal' && 'bg-[#DDF1EE] text-[#08776F]',
        tone === 'yellow' && 'bg-[#FFF1C8] text-[#A96310]',
      )}
    >
      {children}
    </span>
  );
}

function FeedIcon({ item }: { item: (typeof feedItems)[number] }) {
  if ('image' in item && item.image) {
    return <Image src={item.image} alt="" width={106} height={77} className="h-[77px] w-[106px] rounded-[10px] object-cover" />;
  }

  const Icon = item.Icon ?? MessageCircle;
  return (
    <span className={cn('flex h-[77px] w-[106px] items-center justify-center rounded-[10px]', item.tone === 'teal' ? 'bg-[#DDF1EE] text-[#159C98]' : 'bg-[#FFF1C8] text-[#C77B12]')}>
      <Icon className="h-8 w-8" />
    </span>
  );
}

function QuickIcon({ tone, Icon }: { tone: Tone; Icon: React.ComponentType<{ className?: string }> }) {
  return (
    <span
      className={cn(
        'flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] text-white',
        tone === 'teal' && 'bg-[#159C98]',
        tone === 'orange' && 'bg-[#F26A00]',
        tone === 'green' && 'bg-[#286D45]',
        tone === 'yellow' && 'bg-[#F6B23C]',
      )}
    >
      <Icon className="h-6 w-6" />
    </span>
  );
}


function MobileCategoryCard({ label, href, icon, tone }: (typeof categories)[number]) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="group flex min-h-[118px] w-full max-w-[112px] flex-col items-center justify-center rounded-[18px] border border-[#E7DDCC] bg-[#FFFDF8] px-2 text-center shadow-[0_12px_24px_rgba(80,55,25,.08)] transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(80,55,25,.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F26A00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF6EA] sm:min-h-[124px] sm:max-w-[120px]"
      style={{ paddingLeft: 8, paddingRight: 8 }}
    >
      <span className={cn('mb-3 flex h-[56px] w-[56px] items-center justify-center rounded-full', tone === 'orange' ? 'bg-[#FBE9DB] text-[#E9651A]' : 'bg-[#E9F0DF] text-[#286D45]')}>
        <CategoryGlyph name={icon} />
      </span>
      <span className="text-[12px] font-black leading-[14px] text-[#14231D] sm:text-[13px] sm:leading-4">{label}</span>
    </Link>
  );
}

function MobileFeedFallbackIcon({ item }: { item: (typeof feedItems)[number] }) {
  const Icon = item.Icon ?? MessageCircle;

  return (
    <span className={cn('flex h-[74px] w-[74px] items-center justify-center rounded-[18px] sm:h-[88px] sm:w-[88px]', item.tone === 'teal' ? 'bg-[#DDF1EE] text-[#159C98]' : 'bg-[#FFF1C8] text-[#C77B12]')}>
      <Icon className="h-7 w-7 sm:h-8 sm:w-8" />
    </span>
  );
}

function MobileFeedItem({ item, featured = false }: { item: (typeof feedItems)[number]; featured?: boolean }) {
  return (
    <article className={cn('group overflow-hidden rounded-[22px] border border-[#E7DDCC] bg-[#FFFDF8] shadow-[0_14px_28px_rgba(80,55,25,.07)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(80,55,25,.10)]', featured ? 'sm:min-h-[270px]' : '')}>
      <div className={cn(featured ? 'sm:block' : 'grid grid-cols-[74px_minmax(0,1fr)] gap-3 sm:grid-cols-[88px_minmax(0,1fr)]', 'p-3 sm:p-4')} style={{ padding: 12 }}>
        <div className={cn('overflow-hidden rounded-[18px]', featured ? 'sm:mb-4 sm:h-[130px] sm:w-full' : '')}>
          {'image' in item && item.image ? (
            <Image
              src={item.image}
              alt=""
              width={featured ? 360 : 88}
              height={featured ? 156 : 88}
              className={cn('object-cover', featured ? 'h-[74px] w-[74px] sm:h-full sm:w-full' : 'h-[74px] w-[74px] sm:h-[88px] sm:w-[88px]')}
            />
          ) : (
            <MobileFeedFallbackIcon item={item} />
          )}
        </div>
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <ToneBadge tone={item.tone}>{item.badge}</ToneBadge>
            <span className="text-[11px] font-bold text-[#66736D] sm:text-[12px]">{item.time}</span>
          </div>
          <h3 className="text-[15px] font-black leading-[19px] tracking-[-0.01em] text-[#15241E] sm:text-[17px] sm:leading-[22px]">{item.title}</h3>
          <p className="mt-1.5 line-clamp-2 text-[12px] font-medium leading-[18px] text-[#5A6963] sm:text-[13px] sm:leading-[19px]">{item.body}</p>
          <p className="mt-2 flex items-center gap-1 text-[11px] font-black text-[#C65F26] sm:text-[12px]"><MapPin className="h-3.5 w-3.5 shrink-0" />{item.location}</p>
        </div>
      </div>
    </article>
  );
}

function MobileQuickCard({ title, body, href, Icon, tone }: (typeof quickAccess)[number]) {
  return (
    <Link href={href} className="group relative overflow-hidden rounded-[22px] border border-[#E7DDCC] bg-[#FFFDF8] p-4 shadow-[0_12px_24px_rgba(80,55,25,.07)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(80,55,25,.10)]" style={{ padding: 16 }}>
      <span className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#FBE9DB]/70" />
      <div className="relative flex items-start gap-3">
        <QuickIcon tone={tone} Icon={Icon} />
        <span className="min-w-0 flex-1">
          <span className="block text-[16px] font-black leading-5 text-[#17231D]">{title}</span>
          <span className="mt-1.5 block text-[13px] font-medium leading-[18px] text-[#5A6963]">{body}</span>
        </span>
        <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-[#8B958D] group-hover:text-[#C65F26]" />
      </div>
    </Link>
  );
}

function MobileHomepage() {
  return (
    <div className="lg:hidden">
      <div className="relative mx-auto min-h-screen max-w-[900px] overflow-hidden bg-[#FAF6EA] pb-12 pt-4 text-[#003B2F] sm:px-7 md:px-8" style={{ paddingLeft: 18, paddingRight: 18 }}>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[620px] bg-[radial-gradient(circle_at_86%_8%,rgba(252,231,214,.96),transparent_42%),radial-gradient(circle_at_10%_18%,rgba(223,234,218,.88),transparent_38%)]" />
        <div className="pointer-events-none absolute left-1/2 top-[120px] h-[440px] w-[440px] -translate-x-1/2 rounded-full bg-[#F8E3C9]/30 blur-3xl" />

        <header className="relative z-10 flex items-center justify-between gap-2 sm:gap-4">
          <Link href="/" aria-label="PetPark početna" className="block min-w-0 shrink">
            <PetParkLogo width={154} height={36} priority className="h-[30px] w-auto max-w-[130px] min-[380px]:h-[33px] min-[380px]:max-w-[154px] sm:h-[42px] sm:max-w-none" />
          </Link>
          <div className="flex shrink-0 items-center gap-1.5 min-[380px]:gap-2">
            <Link href="/prijava" className="inline-flex h-10 items-center justify-center rounded-full bg-[#F26A00] px-3 text-[11px] font-black text-white shadow-[0_10px_22px_rgba(242,106,0,.22)] min-[380px]:px-4 min-[380px]:text-[12px] sm:h-11 sm:px-5 sm:text-[13px]" style={{ paddingLeft: 12, paddingRight: 12 }}>
              Prijava
            </Link>
            <Link href="/objavi-uslugu" className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-full border border-[#D8CBB8] bg-[#FFFDF8] px-3 text-[11px] font-black text-[#123D36] shadow-[0_8px_18px_rgba(80,55,25,.07)] min-[380px]:text-[12px] sm:h-11 sm:px-5 sm:text-[13px]" style={{ paddingLeft: 12, paddingRight: 12 }}>
              Objavi uslugu
            </Link>
          </div>
        </header>

        <nav aria-label="Brza navigacija" className="relative z-10 -mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
          {navItems.map((item) => (
            <Link key={item.label} href={item.href} className="shrink-0 rounded-full border border-[#E2D7C6] bg-[#FFFDF8]/88 px-3 py-2 text-center text-[12px] font-extrabold text-[#123D36] shadow-[0_5px_14px_rgba(80,55,25,.06)] sm:px-4 sm:text-[13px]" style={{ padding: '8px 12px' }}>
              {item.label}
            </Link>
          ))}
        </nav>

        <section className="petpark-mobile-hero relative z-10 flex flex-col pt-7 sm:pt-10 md:items-center md:gap-7">
          <div className="md:flex-1">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#E9E0D1] bg-[#FFFDF8]/92 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-[#C65F26] shadow-sm sm:text-[12px]" style={{ padding: '6px 12px' }}>
              <PawPrint className="h-4 w-4 fill-[#F26A00] text-[#F26A00]" />
              PetPark zajednica
            </div>
            <h1 className="mt-4 max-w-[680px] font-serif text-[42px] font-black leading-[0.98] tracking-[-0.058em] text-[#003B2F] min-[390px]:text-[45px] sm:text-[58px] md:text-[56px]">
              Mjesto gdje zajednica pomaže ljubimcima.
            </h1>
            <p className="mt-4 max-w-[610px] text-[16px] font-semibold leading-[24px] text-[#46545A] sm:text-[20px] sm:leading-[30px] md:text-[18px] md:leading-[27px]">
              Usluge, upozorenja, savjeti i udomljavanje — sve za ljubimce na jednom mjestu.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/izgubljeni/prijavi" className="inline-flex h-12 items-center justify-center gap-2 rounded-[14px] bg-[#F26A00] px-5 text-[14px] font-black text-white shadow-[0_14px_26px_rgba(242,106,0,.22)] sm:w-auto sm:text-[15px]" style={{ paddingLeft: 20, paddingRight: 20 }}>
                <Bell className="h-5 w-5" />
                Objavi upozorenje
              </Link>
              <Link href="/usluge" className="inline-flex h-12 items-center justify-center gap-2 rounded-[14px] border border-[#4F7772] bg-[#FFFDF8] px-5 text-[14px] font-extrabold text-[#103D3A] shadow-[0_8px_18px_rgba(80,55,25,.06)] sm:w-auto sm:text-[15px]" style={{ paddingLeft: 20, paddingRight: 20 }}>
                <Search className="h-5 w-5" />
                Pogledaj usluge
              </Link>
            </div>
          </div>

          <div className="petpark-mobile-hero-visual relative mt-7 h-[238px] overflow-hidden rounded-[30px] border border-[#E7DDCC] bg-[#FFFDF8]/75 shadow-[0_22px_46px_rgba(80,55,25,.12)] sm:h-[330px] md:mt-0 md:h-[340px] md:w-[310px] md:shrink-0 md:rounded-[34px]">
            <Image src="/images/design-lab/petpark-reference-hero-mobile-clean.png" alt="Pas i mačka u PetPark zajednici" fill priority sizes="(max-width: 640px) 100vw, 0px" className="object-cover object-center sm:hidden" />
            <Image src="/images/design-lab/petpark-reference-hero-tablet-clean.png" alt="Pas i mačka u PetPark zajednici" fill priority sizes="(min-width: 640px) 720px, 0px" className="hidden object-cover object-center sm:block" />
            <div className="absolute bottom-3 left-3 right-3 rounded-[18px] border border-white/70 bg-[#FFFDF8]/88 px-4 py-3 shadow-[0_10px_24px_rgba(80,55,25,.12)] backdrop-blur" style={{ padding: '12px 16px' }}>
              <p className="text-[12px] font-black uppercase tracking-[0.12em] text-[#C65F26]">Danas na PetParku</p>
              <p className="mt-0.5 text-[14px] font-extrabold text-[#123D36] sm:text-[15px]">Pronađi pomoć, objavi upozorenje ili pitaj zajednicu.</p>
            </div>
          </div>
        </section>

        <section aria-label="PetPark usluge" className="relative z-10 mt-6 grid grid-cols-2 justify-items-center gap-3 py-2 min-[390px]:grid-cols-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-6 md:gap-x-0">
          {categories.map((category) => <MobileCategoryCard key={category.label} {...category} />)}
        </section>

        <section id="kako-radi-mobile" className="relative z-10 mt-9 flex flex-col rounded-[28px] border border-[#E7DDCC] bg-[#FFF7EC]/72 p-4 shadow-[0_18px_38px_rgba(80,55,25,.08)] backdrop-blur sm:p-5" style={{ padding: 16 }}>
          <div className="mb-4 flex items-end justify-between gap-3 sm:mb-5">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#C65F26]">Zajednica</p>
              <h2 className="font-serif text-[30px] font-black tracking-[-0.05em] text-[#003B2F] sm:text-[38px]">Aktualno</h2>
            </div>
            <Link href="/zajednica" className="inline-flex items-center gap-1 rounded-full bg-[#FFFDF8] px-3 py-2 text-[13px] font-black text-[#C65F26] shadow-sm" style={{ padding: '8px 12px' }}>Sve <ChevronRight className="h-4 w-4" /></Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {feedItems.map((item, index) => <MobileFeedItem key={item.title} item={item} featured={index < 2} />)}
          </div>
        </section>

        <section className="relative z-10 mt-7 flex flex-col">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#C65F26]">Prečaci</p>
              <h2 className="font-serif text-[30px] font-black tracking-[-0.05em] text-[#003B2F] sm:text-[36px]">Brzi pristup</h2>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {quickAccess.map((item) => <MobileQuickCard key={item.title} {...item} />)}
          </div>
        </section>

        <section className="relative z-10 mt-7 grid gap-3 sm:grid-cols-2">
          {trustItems.map(({ title, body, Icon }) => (
            <div key={title} className="rounded-[22px] border border-[#E7DDCC] bg-[#FFFDF8]/90 p-4 shadow-[0_12px_24px_rgba(80,55,25,.06)]" style={{ padding: 16 }}>
              <Icon className="h-7 w-7 text-[#2E7A63]" />
              <p className="mt-3 text-[14px] font-black leading-5 text-[#003B2F]">{title}</p>
              <p className="mt-1 text-[12px] font-semibold leading-4 text-[#65746E]">{body}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}


function PixelPerfectDesktopHomepage({ isPreview }: { isPreview: boolean }) {
  return (
    <div className="relative mx-auto hidden aspect-[1448/1086] w-full max-w-[1448px] overflow-hidden bg-[#FAF6EA] lg:block">
      <img
        src="/images/design-lab/petpark-reference-homepage-pixel-match.png"
        alt="PetPark početna stranica"
        className="absolute inset-0 h-full w-full object-fill"
        draggable={false}
      />
      <div className="pointer-events-none absolute left-[38px] top-[18px] h-[62px] w-[235px] bg-[#FAF6EA]" />
      <Link href="/" aria-label="PetPark početna" className="absolute left-[45px] top-[24px] h-12 w-[211px]">
        <PetParkLogo width={211} height={48} priority className="h-12 w-auto" />
      </Link>
      <Link href="/usluge" aria-label="Usluge" className="absolute left-[29.2%] top-[3.2%] h-[2.4%] w-[4.4%]" />
      <Link href="#kako-radi" aria-label="Kako radi" className="absolute left-[36.3%] top-[3.2%] h-[2.4%] w-[5.6%]" />
      <Link href="/zajednica" aria-label="Zajednica" className="absolute left-[44.7%] top-[3.2%] h-[2.4%] w-[6.0%]" />
      <Link href="/blog" aria-label="Blog" className="absolute left-[53.4%] top-[3.2%] h-[2.4%] w-[3.4%]" />
      <Link href="/prijava" aria-label="Prijava" className="absolute left-[74.5%] top-[2.2%] h-[4.5%] w-[9.0%]" />
      <Link href="/objavi-uslugu" aria-label="Objavi uslugu" className="absolute left-[84.8%] top-[2.2%] h-[4.5%] w-[12.0%]" />
      <Link href="/usluge" aria-label="Čuvanje" className="absolute left-[4.7%] top-[32.8%] h-[11.2%] w-[6.4%]" />
      <Link href="/usluge" aria-label="Šetnja" className="absolute left-[12.2%] top-[32.8%] h-[11.2%] w-[6.4%]" />
      <Link href="/njega" aria-label="Grooming" className="absolute left-[19.7%] top-[32.8%] h-[11.2%] w-[6.6%]" />
      <Link href="/dresura" aria-label="Trening" className="absolute left-[27.1%] top-[32.8%] h-[11.2%] w-[6.6%]" />
      <Link href="/izgubljeni" aria-label="Izgubljeni" className="absolute left-[34.5%] top-[32.8%] h-[11.2%] w-[6.7%]" />
      <Link href="/udomljavanje" aria-label="Udomljavanje" className="absolute left-[42.0%] top-[32.8%] h-[11.2%] w-[7.0%]" />
      <Link href="/izgubljeni/prijavi" aria-label="Objavi upozorenje" className="absolute left-[4.7%] top-[46.0%] h-[4.7%] w-[14.7%]" />
      <Link href="/usluge" aria-label="Pogledaj usluge" className="absolute left-[20.8%] top-[46.0%] h-[4.7%] w-[13.4%]" />
      <Link href="/zajednica" aria-label="Pogledaj sve iz zajednice" className="absolute left-[53.0%] top-[53.7%] h-[3.0%] w-[8.0%]" />
      <Link href="/forum" aria-label="Forum" className="absolute left-[62.5%] top-[57.1%] h-[6.4%] w-[33.7%]" />
      <Link href="/izgubljeni" aria-label="Izgubljeni i pronađeni" className="absolute left-[62.5%] top-[64.4%] h-[6.4%] w-[33.7%]" />
      <Link href="/udomljavanje" aria-label="Udomljavanje" className="absolute left-[62.5%] top-[71.8%] h-[6.4%] w-[33.7%]" />
      <Link href="/blog" aria-label="Blog savjeti" className="absolute left-[62.5%] top-[79.1%] h-[6.4%] w-[33.7%]" />
      <h1 className="sr-only">Mjesto gdje zajednica pomaže ljubimcima. PetPark povezuje usluge, upozorenja, savjete i udomljavanje — sve za ljubimce na jednom mjestu.</h1>
      {isPreview ? <span className="sr-only">Preview mode</span> : null}
    </div>
  );
}

export function HomepageRedesign({ mode = 'production' }: HomepageRedesignProps) {
  const isPreview = mode === 'preview';

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: shellHideCss }} />
      <main id="petpark-homepage-live-reference" className="min-h-screen overflow-hidden bg-[#FAF6EA] text-[#003B2F]">
        <MobileHomepage />
        <PixelPerfectDesktopHomepage isPreview={isPreview} />
        <footer id="petpark-home-footer" className="sr-only">PetPark</footer>
      </main>
    </>
  );
}

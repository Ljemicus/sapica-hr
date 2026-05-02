import Link from 'next/link';
import type { Metadata } from 'next';
import { ShieldCheck, Award, ArrowRight, CheckCircle2, PawPrint, Upload, UserCheck, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { buildLocaleAlternates, buildLocaleOpenGraph } from '@/lib/seo/locale-metadata';

export const metadata: Metadata = {
  title: { absolute: 'Verifikacija sittera | PetPark' },
  description: 'Saznajte više o statusima profila na PetParku — osnovni profil, provjera i dodatne oznake koje pomažu vlasnicima pri odabiru.',
  openGraph: {
    title: 'Verifikacija sittera | PetPark',
    description: 'Saznajte više o statusima profila na PetParku — osnovni profil, provjera i dodatne oznake.',
    type: 'website',
    ...buildLocaleOpenGraph('/verifikacija'),
  },
  alternates: buildLocaleAlternates('/verifikacija'),
};

const tiers = {
  hr: [
    {
      level: 'Basic', subtitle: 'Početni korak', icon: PawPrint, color: 'from-gray-400 to-gray-500', borderColor: 'border-gray-200 dark:border-gray-700',
      benefits: ['Kreiranje profila', 'Postavljanje cijena', 'Primanje upita', 'Pristup forumu'],
      requirements: ['Registracija na platformi', 'Ispunjen profil s fotografijom'],
    },
    {
      level: 'Provjeren', subtitle: 'Dodatni kontekst', icon: ShieldCheck, color: 'from-blue-500 to-cyan-500', borderColor: 'border-blue-200 dark:border-blue-800',
      benefits: ['Jasnija oznaka na profilu', 'Više konteksta za vlasnike', 'Pregled osnovnih podataka', 'Uredniji profil u rezultatima', 'Lakša komunikacija s podrškom'],
      requirements: ['Provjera identiteta', 'Usklađen i potpun profil', 'Dodatne informacije prema vrsti usluge'], featured: true,
    },
    {
      level: 'Istaknuti', subtitle: 'Aktivan profil', icon: Award, color: 'from-amber-500 to-orange-500', borderColor: 'border-amber-200 dark:border-amber-800',
      benefits: ['Posebna oznaka profila', 'Bolja vidljivost gdje je primjenjivo', 'Mogućnost isticanja u kampanjama', 'Dodatni prostor za opis usluge', 'Više povjerenja kroz recenzije'],
      requirements: ['Provjeren status profila', 'Pozitivne recenzije', 'Stabilna aktivnost profila', 'Usklađenost s pravilima platforme'],
    },
  ],
  en: [
    {
      level: 'Basic', subtitle: 'Starting point', icon: PawPrint, color: 'from-gray-400 to-gray-500', borderColor: 'border-gray-200 dark:border-gray-700',
      benefits: ['Create a profile', 'Set your prices', 'Receive requests', 'Forum access'],
      requirements: ['Register on the platform', 'Complete profile with a photo'],
    },
    {
      level: 'Checked', subtitle: 'Additional context', icon: ShieldCheck, color: 'from-blue-500 to-cyan-500', borderColor: 'border-blue-200 dark:border-blue-800',
      benefits: ['Clearer profile badge', 'More context for owners', 'Basic information review', 'Cleaner profile presentation in results', 'Easier support communication'],
      requirements: ['Identity check', 'Complete and consistent profile', 'Additional details depending on service type'], featured: true,
    },
    {
      level: 'Featured', subtitle: 'Active profile', icon: Award, color: 'from-amber-500 to-orange-500', borderColor: 'border-amber-200 dark:border-amber-800',
      benefits: ['Special profile badge', 'Improved visibility where applicable', 'Potential campaign features', 'More room to describe your service', 'More trust through reviews'],
      requirements: ['Checked profile status', 'Positive reviews', 'Stable profile activity', 'Compliance with platform rules'],
    },
  ],
} as const;

const steps = {
  hr: [
    { step: 1, title: 'Registrirajte se', description: 'Kreirajte profil, dodajte fotografije i opišite svoje iskustvo s ljubimcima.', icon: UserCheck, color: 'from-orange-500 to-amber-500' },
    { step: 2, title: 'Pošaljite dokumente', description: 'Uploadajte osobnu iskaznicu i ispunite obrazac za provjeru pozadine.', icon: Upload, color: 'from-blue-500 to-cyan-500' },
    { step: 3, title: 'Dobijte oznaku', description: 'Naš tim pregledava prijavu i javlja se s odlukom ili dodatnim pitanjima.', icon: ShieldCheck, color: 'from-teal-500 to-emerald-500' },
    { step: 4, title: 'Rastite do Premium', description: 'Prikupljajte recenzije, održavajte aktivan profil i s vremenom možete dobiti dodatne oznake.', icon: Star, color: 'from-amber-500 to-orange-500' },
  ],
  en: [
    { step: 1, title: 'Create your account', description: 'Build your profile, add photos, and describe your experience with pets.', icon: UserCheck, color: 'from-orange-500 to-amber-500' },
    { step: 2, title: 'Upload documents', description: 'Upload your ID and complete the background review form.', icon: Upload, color: 'from-blue-500 to-cyan-500' },
    { step: 3, title: 'Get verified', description: 'Our team reviews each application and follows up with a decision or additional questions.', icon: ShieldCheck, color: 'from-teal-500 to-emerald-500' },
    { step: 4, title: 'Grow into Premium', description: 'Collect reviews, keep your profile active, and you may become eligible for additional badges over time.', icon: Star, color: 'from-amber-500 to-orange-500' },
  ],
} as const;

function VerificationBody({ language }: { language: 'hr' | 'en' }) {
  const tierCopy = tiers[language];
  const stepCopy = steps[language];
  const labels = language === 'en'
    ? {
        heroBadge: 'Trust and safety', heroTitleA: 'Profile', heroTitleB: 'checks', heroText: 'Give owners clearer context before they send a request. Profile checks and badges help explain who you are and how you work.',
        tierBadge: 'Verification levels', tierTitle: 'Profile statuses, clearly explained', tierText: 'From a basic profile to additional badges — each status gives owners more context', featured: 'Most popular', benefits: 'Benefits', requirements: 'Requirements',
        stepsBadge: 'How verification works', stepsTitle: 'Four simple steps', stepsText: 'From registration to a clearer public profile',
        ctaTitle: 'Ready to build your profile?', ctaText: 'Create a profile, add the right details and make it easier for owners to understand your service.', ctaPrimary: 'Create profile', ctaSecondary: 'Frequently asked questions',
      }
    : {
        heroBadge: 'Povjerenje i sigurnost', heroTitleA: 'Provjere', heroTitleB: 'profila', heroText: 'Dajte vlasnicima jasniji kontekst prije slanja upita. Provjere i oznake profila pomažu objasniti tko ste i kako radite.',
        tierBadge: 'Razine verifikacije', tierTitle: 'Statusi profila, jasno objašnjeni', tierText: 'Od osnovnog profila do dodatnih oznaka — svaki status daje vlasnicima više konteksta', featured: 'Najpopularniji', benefits: 'Pogodnosti', requirements: 'Zahtjevi',
        stepsBadge: 'Kako do verifikacije', stepsTitle: 'Četiri jednostavna koraka', stepsText: 'Od registracije do jasnijeg javnog profila',
        ctaTitle: 'Spremni izgraditi profil?', ctaText: 'Kreirajte profil, dodajte prave informacije i olakšajte vlasnicima da razumiju vašu uslugu.', ctaPrimary: 'Kreiraj profil', ctaSecondary: 'Česta pitanja',
      };

  return (
    <div>
      <Breadcrumbs items={[{ label: language === 'en' ? 'Verification' : 'Verifikacija', href: language === 'en' ? '/verifikacija/en' : '/verifikacija' }]} />
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-amber-50 dark:from-blue-950/20 dark:via-background dark:to-amber-950/20">
        <div className="absolute inset-0 paw-pattern opacity-[0.03]" />
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-6 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 border-0 text-sm px-5 py-2 rounded-full font-semibold animate-fade-in-up">
              <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />{labels.heroBadge}
            </Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 animate-fade-in-up delay-100 font-[var(--font-heading)]">
              {labels.heroTitleA} <span className="text-gradient">{labels.heroTitleB}</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 animate-fade-in-up delay-200 leading-relaxed max-w-2xl mx-auto">{labels.heroText}</p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 border-0 rounded-full font-semibold">{labels.tierBadge}</Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4 font-[var(--font-heading)]">{labels.tierTitle}</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">{labels.tierText}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {tierCopy.map((tier, i) => {
            const featured = 'featured' in tier && Boolean(tier.featured);
            return (
            <Card key={tier.level} className={`border-2 ${tier.borderColor} shadow-sm rounded-2xl overflow-hidden animate-fade-in-up delay-${(i + 1) * 100} ${featured ? 'ring-2 ring-blue-400 dark:ring-blue-600 scale-[1.02]' : ''} relative`}>
              {featured && <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-center text-xs font-bold py-1.5">{labels.featured}</div>}
              <CardContent className={`p-6 md:p-8 ${featured ? 'pt-10' : ''}`}>
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${tier.color} text-white mb-4 shadow-lg`}><tier.icon className="h-7 w-7" /></div>
                <h3 className="text-2xl font-extrabold mb-1 font-[var(--font-heading)]">{tier.level}</h3>
                <p className="text-sm text-muted-foreground mb-6">{tier.subtitle}</p>
                <div className="space-y-3 mb-6">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{labels.benefits}</p>
                  {tier.benefits.map((benefit) => <div key={benefit} className="flex items-start gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-teal-500 flex-shrink-0 mt-0.5" /><span>{benefit}</span></div>)}
                </div>
                <div className="border-t pt-4 space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{labels.requirements}</p>
                  {tier.requirements.map((req) => <div key={req} className="flex items-start gap-2 text-sm text-muted-foreground"><ArrowRight className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" /><span>{req}</span></div>)}
                </div>
              </CardContent>
            </Card>
            );
          })}
        </div>
      </section>

      <section className="py-16 md:py-24 bg-gradient-to-b from-orange-50/40 to-white dark:from-orange-950/10 dark:to-background relative overflow-hidden">
        <div className="absolute inset-0 paw-pattern opacity-[0.02]" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/30 border-0 rounded-full font-semibold">{labels.stepsBadge}</Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 font-[var(--font-heading)]">{labels.stepsTitle}</h2>
            <p className="text-muted-foreground text-lg">{labels.stepsText}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {stepCopy.map((item, i) => (
              <div key={item.step} className={`text-center animate-fade-in-up delay-${(i + 1) * 100}`}>
                <div className="text-6xl font-extrabold text-orange-100/80 dark:text-orange-900/30 leading-none mb-3 select-none">{String(item.step).padStart(2, '0')}</div>
                <div className={`relative inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} text-white mb-4 shadow-lg -mt-10`}><item.icon className="h-6 w-6" /></div>
                <h3 className="text-lg font-bold mb-2 font-[var(--font-heading)]">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-20">
        <Card className="border-0 shadow-sm rounded-3xl bg-gradient-to-r from-blue-500 via-teal-500 to-orange-500 overflow-hidden">
          <CardContent className="p-10 md:p-16 text-center text-white relative">
            <div className="absolute inset-0 paw-pattern opacity-[0.06]" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4 font-[var(--font-heading)]">{labels.ctaTitle}</h2>
              <p className="text-white/85 text-lg mb-8 max-w-xl mx-auto">{labels.ctaText}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/registracija?role=sitter"><Button size="lg" className="bg-white text-blue-600 hover:bg-white/90 shadow-xl shadow-black/10 rounded-xl font-bold text-lg px-10 h-14">{labels.ctaPrimary}<ArrowRight className="ml-2 h-5 w-5" /></Button></Link>
                <Link href={language === 'en' ? '/faq/en' : '/faq'}><Button size="lg" variant="outline" className="border-2 border-white/40 text-white hover:bg-white/10 rounded-xl text-lg px-10 h-14">{labels.ctaSecondary}</Button></Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

export function VerificationPageShell({ language = 'hr' }: { language?: 'hr' | 'en' }) {
  return <VerificationBody language={language} />;
}

export default function VerifikacijaPage() {
  return <VerificationPageShell language="hr" />;
}

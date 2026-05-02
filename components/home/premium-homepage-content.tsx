'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Star, MapPin, Shield, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n';

/* ─────────────────────────────────────────────
   Types
   ───────────────────────────────────────────── */

type FeaturedSitter = {
  id: string;
  name: string;
  city: string;
  rating: number | null;
  reviews: number | null;
  bio: string;
  verified: boolean;
  superhost: boolean;
  initial: string;
};

type City = {
  name: string;
  image: string;
  landing: string | null;
};

/* ─────────────────────────────────────────────
   Premium Copy — bilingual
   ───────────────────────────────────────────── */

const copy = {
  hr: {
    heroKicker: 'PetPark Hrvatska',
    heroHeadline: 'Briga o ljubimcima\nna koju se možete\nosloniti.',
    heroSub: 'Povezujemo vlasnike s provjerenim stručnjacima za čuvanje, njegu i zdravlje ljubimaca. Jednostavno, sigurno, s povjerenjem.',
    heroCta: 'Pronađite sittera',
    heroSecondaryCta: 'Postanite partner',

    stats1: '500+',
    stats1Label: 'Verificiranih partnera',
    stats2: '4.9',
    stats2Label: 'Prosječna ocjena',
    stats3: '10k+',
    stats3Label: 'Sretnih vlasnika',

    servicesKicker: 'Naše usluge',
    servicesTitle: 'Sve što vaš ljubimac treba,\nna jednom mjestu.',
    
    sittersKicker: 'Istaknuti partneri',
    sittersTitle: 'Stručnjaci kojima vlasnici vjeruju.',
    sittersCta: 'Pogledajte sve',

    trustKicker: 'Zašto PetPark',
    trustTitle: 'Izgrađeno na povjerenju,\nprovenjeno kroz iskustvo.',
    trustItems: [
      { title: 'Jasni profili', body: 'Profili prikazuju ključne informacije prije prvog upita.' },
      { title: 'Stvarne recenzije', body: 'Iskustva vlasnika bez filtera — transparentnost gradi povjerenje.' },
      { title: 'Sigurno plaćanje', body: 'Plaćanje kroz platformu s potpunom zaštitom.' },
      { title: 'Podrška 7 dana', body: 'Tim stručnjaka uvijek na raspolaganju.' },
    ],

    citiesKicker: 'Dostupnost',
    citiesTitle: 'Aktivni u svim većim gradovima.',

    ctaTitle: 'Spremni pronaći\nsvog partnera?',
    ctaSub: 'Pridružite se vlasnicima koji preko PetParka lakše traže brigu za svoje ljubimce.',
    ctaButton: 'Započnite pretragu',
  },
  en: {
    heroKicker: 'PetPark Croatia',
    heroHeadline: 'Pet care you can\ntruly rely on.',
    heroSub: 'Connecting pet owners with service providers for sitting, grooming, and pet health. Simple, clearer, easier.',
    heroCta: 'Find a sitter',
    heroSecondaryCta: 'Become a partner',

    stats1: '500+',
    stats1Label: 'Verified partners',
    stats2: '4.9',
    stats2Label: 'Average rating',
    stats3: '10k+',
    stats3Label: 'Happy owners',

    servicesKicker: 'Our services',
    servicesTitle: 'Everything your pet needs,\nin one place.',
    
    sittersKicker: 'Featured partners',
    sittersTitle: 'Experts pet owners trust.',
    sittersCta: 'View all',

    trustKicker: 'Why PetPark',
    trustTitle: 'Built on trust,\nproven through experience.',
    trustItems: [
      { title: 'Clear profiles', body: 'Profiles show key details before the first inquiry.' },
      { title: 'Real reviews', body: 'Unfiltered owner experiences — transparency builds trust.' },
      { title: 'Secure payment', body: 'Platform payment with complete protection.' },
      { title: '7-day support', body: 'Expert team always available.' },
    ],

    citiesKicker: 'Availability',
    citiesTitle: 'Active in all major cities.',

    ctaTitle: 'Ready to find\nyour partner?',
    ctaSub: 'Join thousands of owners who have already found reliable care for their pets.',
    ctaButton: 'Start searching',
  },
};

const services = [
  {
    title: { hr: 'Čuvanje ljubimaca', en: 'Pet Sitting' },
    description: { hr: 'Pouzdani sitteri koji se brinu o vašem ljubimcu kao o svom.', en: 'Reliable sitters who care for your pet as their own.' },
    href: '/pretraga',
  },
  {
    title: { hr: 'Njega i grooming', en: 'Grooming' },
    description: { hr: 'Profesionalna njega dlake, kupanje i styling.', en: 'Professional coat care, bathing, and styling.' },
    href: '/njega',
  },
  {
    title: { hr: 'Školovanje pasa', en: 'Dog Training' },
    description: { hr: 'Treneri za poslušnost, socijalizaciju i strukturiran rad.', en: 'Trainers for obedience, socialization, and structured work.' },
    href: '/dresura',
  },
  {
    title: { hr: 'Veterinari', en: 'Veterinarians' },
    description: { hr: 'Pronađite veterinare u vašem gradu.', en: 'Find veterinarians in your city.' },
    href: '/veterinari',
  },
];

/* ─────────────────────────────────────────────
   Premium Homepage Content
   ───────────────────────────────────────────── */

interface PremiumHomepageContentProps {
  featuredSitters: FeaturedSitter[];
  cities: City[];
}

export function PremiumHomepageContent({ featuredSitters, cities }: PremiumHomepageContentProps) {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const t = isEn ? copy.en : copy.hr;

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* ─── Hero Section ─── */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FAF9F6] via-[#F5F4F0] to-[#E8E6E0]" />
        <div className="absolute top-20 right-20 w-96 h-96 bg-[#5A7D5A]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-[#7A9A7A]/5 rounded-full blur-3xl" />

        <div className="container mx-auto px-6 md:px-12 lg:px-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <span className="inline-block text-[#5A7D5A] text-sm font-semibold tracking-[0.2em] uppercase mb-6">
                {t.heroKicker}
              </span>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#2D2D2D] leading-[1.1] mb-6 whitespace-pre-line">
                {t.heroHeadline}
              </h1>
              
              <p className="text-lg text-[#6B6B6B] leading-relaxed mb-8 max-w-lg">
                {t.heroSub}
              </p>

              <div className="flex flex-wrap gap-4">
                <Link href="/pretraga">
                  <Button 
                    size="lg" 
                    className="bg-[#5A7D5A] hover:bg-[#4A6B4A] text-white px-8 py-6 text-base font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-[#5A7D5A]/20 hover:shadow-xl hover:shadow-[#5A7D5A]/30"
                  >
                    {t.heroCta}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/postani-sitter">
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="border-[#2D2D2D]/20 text-[#2D2D2D] hover:bg-[#2D2D2D]/5 px-8 py-6 text-base font-semibold rounded-xl transition-all duration-300"
                  >
                    {t.heroSecondaryCta}
                  </Button>
                </Link>
              </div>

              <div className="flex gap-8 mt-12 pt-8 border-t border-[#E5E4DF]">
                <div>
                  <div className="text-2xl font-bold text-[#2D2D2D]">{t.stats1}</div>
                  <div className="text-sm text-[#6B6B6B]">{t.stats1Label}</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#2D2D2D]">{t.stats2}</div>
                  <div className="text-sm text-[#6B6B6B]">{t.stats2Label}</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#2D2D2D]">{t.stats3}</div>
                  <div className="text-sm text-[#6B6B6B]">{t.stats3Label}</div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="relative"
            >
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl shadow-[#2D2D2D]/10">
                <Image
                  src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1200&h=900&fit=crop"
                  alt="Happy dog with owner"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.4 }}
                className="absolute -bottom-6 -left-6 bg-white rounded-xl p-4 shadow-xl shadow-[#2D2D2D]/10"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#5A7D5A]/10 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-[#5A7D5A]" />
                  </div>
                  <div>
                    <div className="font-semibold text-[#2D2D2D]">Sigurniji prvi korak</div>
                    <div className="text-sm text-[#6B6B6B]">Verificirani partneri</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Services Section ─── */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-6 md:px-12 lg:px-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="inline-block text-[#5A7D5A] text-sm font-semibold tracking-[0.2em] uppercase mb-4">
              {t.servicesKicker}
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#2D2D2D] leading-tight whitespace-pre-line">
              {t.servicesTitle}
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
              >
                <Link href={service.href}>
                  <div className="group bg-white rounded-2xl p-8 h-full transition-all duration-300 hover:shadow-xl hover:shadow-[#2D2D2D]/5 hover:-translate-y-1 border border-[#E5E4DF]/50">
                    <div className="w-14 h-14 bg-[#5A7D5A]/10 rounded-xl flex items-center justify-center mb-6 transition-colors duration-300 group-hover:bg-[#5A7D5A]">
                      <span className="text-2xl">{idx === 0 ? '🔍' : idx === 1 ? '✂️' : idx === 2 ? '🎓' : '🏥'}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-[#2D2D2D] mb-3">
                      {isEn ? service.title.en : service.title.hr}
                    </h3>
                    <p className="text-[#6B6B6B] leading-relaxed">
                      {isEn ? service.description.en : service.description.hr}
                    </p>
                    <div className="mt-6 flex items-center text-[#5A7D5A] font-semibold text-sm">
                      {isEn ? 'Learn more' : 'Saznajte više'}
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Sitters ─── */}
      <section className="py-24 md:py-32 bg-white">
        <div className="container mx-auto px-6 md:px-12 lg:px-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row md:items-end md:justify-between mb-16"
          >
            <div>
              <span className="inline-block text-[#5A7D5A] text-sm font-semibold tracking-[0.2em] uppercase mb-4">
                {t.sittersKicker}
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#2D2D2D] leading-tight">
                {t.sittersTitle}
              </h2>
            </div>
            <Link href="/pretraga" className="mt-6 md:mt-0">
              <Button variant="outline" className="border-[#2D2D2D]/20 text-[#2D2D2D] hover:bg-[#2D2D2D]/5 rounded-xl">
                {t.sittersCta}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredSitters.slice(0, 6).map((sitter, idx) => (
              <motion.div 
                key={sitter.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
              >
                <Link href={`/sitter/${sitter.id}`}>
                  <div className="group bg-[#FAF9F6] rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-[#2D2D2D]/5 hover:-translate-y-1">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-[#5A7D5A]/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl font-bold text-[#5A7D5A]">{sitter.initial}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-[#2D2D2D] truncate">{sitter.name}</h3>
                          {sitter.verified && (
                            <Shield className="w-4 h-4 text-[#5A7D5A] flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-[#6B6B6B] mb-2">
                          <MapPin className="w-3.5 h-3.5" />
                          {sitter.city}
                        </div>
                        {sitter.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            <span className="font-semibold text-[#2D2D2D]">{sitter.rating}</span>
                            {sitter.reviews && (
                              <span className="text-sm text-[#6B6B6B]">({sitter.reviews})</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-[#6B6B6B] line-clamp-2">{sitter.bio}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Trust Section ─── */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-6 md:px-12 lg:px-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block text-[#5A7D5A] text-sm font-semibold tracking-[0.2em] uppercase mb-4">
                {t.trustKicker}
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#2D2D2D] leading-tight whitespace-pre-line">
                {t.trustTitle}
              </h2>
            </motion.div>

            <div className="grid sm:grid-cols-2 gap-6">
              {t.trustItems.map((item, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="w-10 h-10 bg-[#5A7D5A]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Check className="w-5 h-5 text-[#5A7D5A]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#2D2D2D] mb-1">{item.title}</h3>
                    <p className="text-sm text-[#6B6B6B] leading-relaxed">{item.body}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Cities Section ─── */}
      <section className="py-24 md:py-32 bg-white">
        <div className="container mx-auto px-6 md:px-12 lg:px-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="inline-block text-[#5A7D5A] text-sm font-semibold tracking-[0.2em] uppercase mb-4">
              {t.citiesKicker}
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#2D2D2D] leading-tight">
              {t.citiesTitle}
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {cities.map((city, idx) => (
              <motion.div 
                key={city.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.05 }}
              >
                <Link href={city.landing || '#'}>
                  <div className="group relative aspect-square rounded-xl overflow-hidden">
                    <Image
                      src={city.image}
                      alt={city.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2D2D2D]/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white font-semibold">{city.name}</h3>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-6 md:px-12 lg:px-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative bg-[#5A7D5A] rounded-3xl p-12 md:p-16 lg:p-20 text-center overflow-hidden"
          >
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-72 h-72 bg-white rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight whitespace-pre-line mb-6">
                {t.ctaTitle}
              </h2>
              <p className="text-lg text-white/80 mb-8">
                {t.ctaSub}
              </p>
              <Link href="/pretraga">
                <Button 
                  size="lg"
                  className="bg-white text-[#5A7D5A] hover:bg-white/90 px-8 py-6 text-base font-semibold rounded-xl transition-all duration-300 shadow-lg"
                >
                  {t.ctaButton}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { enUS, hr } from 'date-fns/locale';
import { Scissors, ClipboardList, Star, Clock, Calendar } from 'lucide-react';
import { ProfileHero } from '@/components/shared/petpark/profile-hero';
import { ReviewBlock } from '@/components/shared/petpark/review-block';
import { ServicesPrices } from '@/components/shared/petpark/services-prices';
import { AvailabilityBlock } from '@/components/shared/petpark/availability-block';
import { BookingCTASidebar } from '@/components/shared/petpark/booking-cta-sidebar';
import { TrustPanel } from '@/components/shared/petpark/trust-panel';
import { useLanguage } from '@/lib/i18n/context';
import { useUser } from '@/hooks/use-user';
import type { PublicGroomerProfile, PublicProviderReview } from '@/lib/types/public-provider';
import type { GroomerAvailabilitySlot } from '@/lib/types';
import { GROOMING_SERVICE_LABELS } from '@/lib/types';
import { getOrderedDays, formatWorkingHours } from '@/lib/profile-helpers';
import { GroomerBookingDialog } from './booking-dialog';

interface GroomerProfileProps {
  groomer: PublicGroomerProfile;
  reviews: PublicProviderReview[];
  availableDates: Set<string>;
}

const GROOMING_SERVICE_LABELS_EN: Record<string, string> = {
  sisanje: 'Haircut',
  kupanje: 'Bath',
  trimanje: 'Hand stripping',
  nokti: 'Nails',
  cetkanje: 'Brushing',
};

const GROOMER_SPECIALIZATION_LABELS_EN: Record<string, string> = {
  psi: 'Dogs',
  macke: 'Cats',
  oba: 'Dogs & cats',
};

const DAY_LABELS_EN: Record<string, string> = {
  Pon: 'Mon', Uto: 'Tue', Sri: 'Wed', 'Čet': 'Thu', Pet: 'Fri', Sub: 'Sat', Ned: 'Sun',
};

export function GroomerProfile({ groomer, reviews, availableDates }: GroomerProfileProps) {
  const { user } = useUser();
  const router = useRouter();
  const [showBooking, setShowBooking] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [availabilitySlots, setAvailabilitySlots] = useState<GroomerAvailabilitySlot[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [preselectedSlot, setPreselectedSlot] = useState<GroomerAvailabilitySlot | null>(null);
  const { language } = useLanguage();
  const isEn = language === 'en';
  const locale = isEn ? enUS : hr;

  const serviceLabel = (value: string) =>
    isEn ? GROOMING_SERVICE_LABELS_EN[value] || value : GROOMING_SERVICE_LABELS[value as keyof typeof GROOMING_SERVICE_LABELS] || value;

  const specializationLabel = isEn
    ? GROOMER_SPECIALIZATION_LABELS_EN[groomer.specialization] || groomer.specialization
    : groomer.specialization === 'psi' ? 'Psi' : groomer.specialization === 'macke' ? 'Mačke' : 'Psi i mačke';

  const dayLabel = (day: string) => (isEn ? DAY_LABELS_EN[day] || day : day);

  const copy = {
    aboutKicker: isEn ? 'Get to know' : 'Upoznajte',
    about: isEn ? 'About the groomer' : 'O groomeru',
    aboutFallback: isEn
      ? 'This groomer has not added a bio yet. Contact them directly for more information about their services.'
      : 'Ovaj groomer još nije dodao opis. Kontaktirajte ga izravno za više informacija o uslugama.',
    servicesKicker: isEn ? 'What we offer' : 'Što nudimo',
    servicesPricing: isEn ? 'Services & pricing' : 'Usluge i cijene',
    noServices: isEn
      ? 'Services and pricing are not listed yet. Contact the groomer for more information.'
      : 'Usluge i cijene trenutno nisu navedene. Kontaktirajte za više informacija.',
    ratingLabel: isEn ? 'Rating' : 'Ocjena',
    servicesLabel: isEn ? 'Services' : 'Usluge',
    reviews: isEn ? 'reviews' : 'recenzija',
    workingHours: isEn ? 'Working hours' : 'Radno vrijeme',
    closed: isEn ? 'Closed' : 'Zatvoreno',
    book: isEn ? 'Book appointment' : 'Zakaži termin',
  };

  useEffect(() => {
    const loadSlots = async () => {
      const fromDate = new Date().toISOString().split('T')[0];
      const toDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 60).toISOString().split('T')[0];
      setAvailabilityLoading(true);
      try {
        const response = await fetch(
          `/api/groomer-availability?groomer_id=${groomer.id}&from_date=${fromDate}&to_date=${toDate}`
        );
        const data = await response.json();
        setAvailabilitySlots(Array.isArray(data) ? data : []);
      } catch {
        setAvailabilitySlots([]);
      } finally {
        setAvailabilityLoading(false);
      }
    };
    loadSlots();
  }, [groomer.id]);

  const selectedDateSlots = useMemo(
    () => availabilitySlots.filter((slot) => slot.date === selectedDate),
    [availabilitySlots, selectedDate]
  );

  const servicePrices = useMemo(() => {
    return groomer.services.map((s) => ({
      service: s,
      label: serviceLabel(s),
      price: groomer.prices[s] || 0,
    }));
  }, [groomer.services, groomer.prices]);

  const workingHours = useMemo(() => {
    if (!groomer.workingHours) return [];
    return getOrderedDays().map((day) => ({
      day: dayLabel(day),
      hours: groomer.workingHours?.[day] ? formatWorkingHours(groomer.workingHours[day]) : null,
    }));
  }, [groomer.workingHours]);

  const handleSlotSelect = (slot: { id: string; start_time: string; end_time: string }) => {
    setPreselectedSlot(slot as GroomerAvailabilitySlot);
    setShowBooking(true);
  };

  const hasWorkingHours = workingHours.length > 0 && workingHours.some((wh) => wh.hours);

  return (
    <div className="concept-zero">
      <ProfileHero
        name={groomer.name}
        city={groomer.city}
        rating={groomer.rating}
        reviewCount={groomer.reviewCount}
        profileImage={groomer.profileImage}
        badges={[
          { icon: 'custom', label: specializationLabel, customIcon: <Scissors className="h-3 w-3" /> },
          ...(groomer.verified ? [{ icon: 'verified' as const, label: isEn ? 'Verified profile' : 'Verificiran profil' }] : []),
        ]}
        extraMeta={[
          { icon: <ClipboardList className="h-4 w-4 flex-shrink-0" />, label: `${groomer.services.length} ${isEn ? 'services' : 'usluga'}` },
        ]}
      />

      {/* ── Content Grid ── */}
      <div className="container mx-auto px-6 md:px-10 lg:px-16 py-12 md:py-16 lg:py-20 pb-24 md:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-14">

          {/* ── Main Content ── */}
          <div className="lg:col-span-2 space-y-12 md:space-y-14">

            {/* About */}
            <section className="animate-fade-in-up">
              <p className="text-sm uppercase tracking-[0.25em] text-warm-orange mb-3 font-semibold">{copy.aboutKicker}</p>
              <h2 className="text-2xl md:text-3xl font-extrabold font-[var(--font-heading)] leading-tight mb-5">{copy.about}</h2>
              <div className="detail-section-card p-7 md:p-8">
                <p className="text-muted-foreground leading-relaxed text-[15px] md:text-base">{groomer.description || copy.aboutFallback}</p>

                {/* Inline stats strip */}
                <div className="grid grid-cols-3 gap-4 mt-7 pt-6 border-t border-border/30">
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-extrabold text-gradient font-[var(--font-heading)]">
                      {groomer.rating.toFixed(1)}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium mt-1">{copy.ratingLabel}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-extrabold text-gradient font-[var(--font-heading)]">
                      {groomer.services.length}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium mt-1">{copy.servicesLabel}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-extrabold text-gradient font-[var(--font-heading)]">
                      {groomer.reviewCount}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium mt-1">{copy.reviews}</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Services & Pricing */}
            <section className="animate-fade-in-up delay-100">
              <p className="text-sm uppercase tracking-[0.25em] text-warm-orange mb-3 font-semibold">{copy.servicesKicker}</p>
              <h2 className="text-2xl md:text-3xl font-extrabold font-[var(--font-heading)] leading-tight mb-6">{copy.servicesPricing}</h2>
              <ServicesPrices
                services={servicePrices}
                unitLabel={isEn ? 'per service' : 'po usluzi'}
                emptyMessage={copy.noServices}
              />
            </section>

            {/* Availability Calendar + Slots */}
            <AvailabilityBlock
              availableDates={availableDates}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              slots={selectedDateSlots}
              onSelectSlot={handleSlotSelect}
              loading={availabilityLoading}
            />

            {/* Reviews */}
            <ReviewBlock reviews={reviews} />

            {/* Trust Panel */}
            <TrustPanel />
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-6">
            <BookingCTASidebar
              priceFrom={groomer.priceFrom}
              priceUnit={isEn ? 'per service' : 'po usluzi'}
              priceNote={isEn ? 'depending on service and pet size' : 'ovisno o usluzi i veličini ljubimca'}
              onBook={() => setShowBooking(true)}
              messageHref={`/poruke?groomer=${groomer.id}`}
              signInHref={`/prijava?redirect=/groomer/${groomer.id}`}
              stats={[
                { value: groomer.services.length, label: isEn ? 'services' : 'usluge', accent: 'orange' },
                { value: groomer.reviewCount, label: copy.reviews, accent: 'teal' },
              ]}
              workingHours={hasWorkingHours ? workingHours : undefined}
              availableDates={availableDates}
            />
          </div>
        </div>
      </div>

      {showBooking && (
        <GroomerBookingDialog
          open={showBooking}
          onOpenChange={(open) => { setShowBooking(open); if (!open) setPreselectedSlot(null); }}
          groomer={{
            id: groomer.id,
            name: groomer.name,
            city: groomer.city,
            services: groomer.services as any,
            prices: groomer.prices as any,
            rating: groomer.rating,
            review_count: groomer.reviewCount,
            bio: groomer.description || '',
            verified: groomer.verified,
            specialization: groomer.specialization as any,
          }}
          initialDate={selectedDate || undefined}
          initialSlot={preselectedSlot}
        />
      )}
    </div>
  );
}

import type { Metadata } from 'next';
import { CTASection } from '@/components/shared/petpark/cta-section';
import { ListingPageTemplate } from '@/components/shared/petpark/listing-page-template';
import { listingPreviewSections, listingPreviewTrustItems } from '@/components/shared/petpark/listing-preview-data';
import { PageHero } from '@/components/shared/petpark/page-hero';
import { PetParkBadge } from '@/components/shared/petpark/pp-badge';

export const metadata: Metadata = {
  title: { absolute: 'PetPark listinzi redizajn preview | PetPark' },
  description: 'Interni preview redizajna PetPark listing stranica.',
  robots: {
    index: false,
    follow: false,
  },
};

function HeroVisual() {
  return (
    <div className="space-y-4" aria-label="Sažetak preview listinga">
      <div className="rounded-[var(--pp-radius-28)] bg-[color:var(--pp-warm-white)] p-5 shadow-[var(--pp-shadow-card)]">
        <div className="flex items-center justify-between gap-3">
          <PetParkBadge variant="grooming">Groomeri</PetParkBadge>
          <span className="text-sm font-black text-[color:var(--pp-muted)]">3 preview kartice</span>
        </div>
        <div className="mt-4 h-3 rounded-full bg-[color:var(--pp-grooming-bg)]" />
        <div className="mt-3 h-3 w-2/3 rounded-full bg-[color:var(--pp-cream)]" />
      </div>
      <div className="rounded-[var(--pp-radius-28)] bg-[color:var(--pp-warm-white)] p-5 shadow-[var(--pp-shadow-card)]">
        <div className="flex items-center justify-between gap-3">
          <PetParkBadge variant="trainer">Treneri</PetParkBadge>
          <span className="text-sm font-black text-[color:var(--pp-muted)]">bez lažnih ocjena</span>
        </div>
        <div className="mt-4 h-3 rounded-full bg-[color:var(--pp-trainer-bg)]" />
        <div className="mt-3 h-3 w-3/4 rounded-full bg-[color:var(--pp-cream)]" />
      </div>
    </div>
  );
}

export default function ListingPreviewPage() {
  return (
    <div className="bg-[color:var(--pp-cream)] text-[color:var(--pp-ink)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 overflow-hidden px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <PageHero
          eyebrow="PetPark listinzi"
          title="Pronađi pouzdane pružatelje usluga."
          description="Redizajnirani listinzi pomažu vlasnicima da mirno usporede groomere i trenere: što rade, gdje su dostupni, imaju li recenzije i kako krenuti bez javnih kontakata u karticama."
          primaryAction={{ label: 'Pogledaj groomere', href: '#groomeri' }}
          secondaryAction={{ label: 'Pogledaj trenere', href: '#treneri' }}
          variant="colorful"
          visual={<HeroVisual />}
        />

        <ListingPageTemplate sections={listingPreviewSections} trustItems={listingPreviewTrustItems} />

        <CTASection
          variant="partner"
          eyebrow="Partneri"
          title="Pružaš usluge za ljubimce?"
          description="PetPark listinzi su zamišljeni za jasnu, poštenu prezentaciju usluga — bez izmišljenih brojki i bez javnog izlaganja kontakata prije procesa."
          primaryLabel="Postani partner"
          primaryHref="/postani-sitter"
          secondaryLabel="Otvori pretragu"
          secondaryHref="/pretraga"
        />
      </div>
    </div>
  );
}

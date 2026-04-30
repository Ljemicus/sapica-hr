import { cn } from '@/lib/utils';
import { EmptyStateCard } from './empty-state-card';
import { ListingProviderCard } from './listing-provider-card';
import { PetParkBadge } from './pp-badge';
import { TrustPanel } from './trust-panel';
import type { ListingPreviewSection } from './listing-preview-data';

type ListingPageTemplateProps = {
  sections: ListingPreviewSection[];
  trustItems: Parameters<typeof TrustPanel>[0]['items'];
};

const sectionAccent = {
  grooming: 'from-[color:var(--pp-grooming-bg)] to-[color:var(--pp-cream)]',
  training: 'from-[color:var(--pp-trainer-bg)] to-[color:var(--pp-cream)]',
};

export function ListingPageTemplate({ sections, trustItems }: ListingPageTemplateProps) {
  return (
    <div className="space-y-10 md:space-y-14">
      <form className="rounded-[var(--pp-radius-32)] border border-[color:var(--pp-line)] bg-[color:var(--pp-warm-white)] p-4 shadow-[var(--pp-shadow-card)]" aria-label="Preview filtera za listinge">
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_1fr_auto] md:items-end">
          {[
            { label: 'Usluga', value: 'Grooming ili dresura' },
            { label: 'Grad', value: 'Rijeka' },
            { label: 'Datum', value: 'Po dogovoru' },
            { label: 'Vrsta ljubimca', value: 'Pas ili mačka' },
          ].map((field) => (
            <label key={field.label} className="space-y-1 text-sm font-bold text-[color:var(--pp-muted)]">
              {field.label}
              <input
                name={field.label.toLowerCase().replaceAll(' ', '-')}
                defaultValue={field.value}
                className="min-h-11 w-full rounded-[var(--pp-radius-16)] border border-[color:var(--pp-line)] bg-[color:var(--pp-cream)] px-3 py-2 text-[color:var(--pp-ink)] outline-none focus:ring-2 focus:ring-[color:var(--pp-logo-teal)]"
              />
            </label>
          ))}
          <button type="button" className="min-h-11 rounded-[var(--pp-radius-pill)] bg-[color:var(--pp-forest)] px-5 text-sm font-extrabold text-white shadow-[0_18px_40px_rgba(14,83,56,.20)] transition hover:-translate-y-0.5 hover:bg-[color:var(--pp-forest-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--pp-logo-teal)] focus-visible:ring-offset-2">
            Prikaži rezultate
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2" aria-label="Popularni gradovi">
          {['Rijeka', 'Zagreb', 'Split'].map((city) => (
            <button key={city} type="button" className="min-h-9 rounded-[var(--pp-radius-pill)] bg-[color:var(--pp-cream)] px-3 text-xs font-extrabold text-[color:var(--pp-muted)] hover:text-[color:var(--pp-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--pp-logo-teal)]">
              {city}
            </button>
          ))}
        </div>
      </form>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
        <div className="space-y-10">
          {sections.map((section) => (
            <section key={section.id} id={section.id} className={cn('scroll-mt-28 rounded-[var(--pp-radius-40)] border border-[color:var(--pp-line)] bg-gradient-to-br p-5 shadow-[var(--pp-shadow-soft)] md:p-7', sectionAccent[section.accent])}>
              <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div className="max-w-2xl space-y-3">
                  <p className="text-sm font-black uppercase tracking-[0.18em] text-[color:var(--pp-logo-orange)]">{section.eyebrow}</p>
                  <h2 className="font-heading text-3xl font-black tracking-[-0.045em] text-[color:var(--pp-ink)] md:text-5xl">{section.title}</h2>
                  <p className="text-base leading-7 text-[color:var(--pp-muted)]">{section.description}</p>
                </div>
                <PetParkBadge variant={section.accent === 'grooming' ? 'grooming' : 'trainer'}>{section.resultSummary}</PetParkBadge>
              </div>

              <div className="mb-6 flex flex-wrap gap-2" aria-label={`${section.title} filteri`}>
                {section.chips.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    className="min-h-10 rounded-[var(--pp-radius-pill)] border border-[color:var(--pp-line)] bg-[color:var(--pp-warm-white)] px-4 text-sm font-extrabold text-[color:var(--pp-muted)] transition hover:-translate-y-0.5 hover:text-[color:var(--pp-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--pp-logo-teal)] focus-visible:ring-offset-2"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                {section.providers.map((provider) => (
                  <ListingProviderCard key={provider.id} provider={provider} />
                ))}
              </div>
            </section>
          ))}
        </div>

        <aside className="space-y-6 xl:sticky xl:top-24">
          <TrustPanel items={trustItems} className="grid-cols-1 lg:grid-cols-1" />
          <EmptyStateCard
            variant="waitlist"
            title="Još nemamo mnogo pružatelja u ovom gradu."
            description="Ostavi interes i javimo ti kad novi partneri stignu. Preview ne šalje podatke, nego pokazuje budući obrazac iskustva."
            primaryActionLabel="Obavijesti me"
            primaryActionHref="/kontakt"
            secondaryActionLabel="Pogledaj pretragu"
            secondaryActionHref="/pretraga"
          />
        </aside>
      </div>
    </div>
  );
}

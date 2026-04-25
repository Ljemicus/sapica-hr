import Link from 'next/link';

type UskoroStateProps = {
  title: string;
  description?: string;
};

export function UskoroState({
  title,
  description = 'Ovaj dio PetParka još pripremamo. Nećemo glumiti inventory dok nema dovoljno provjerenih podataka.',
}: UskoroStateProps) {
  return (
    <section className="min-h-[60vh] bg-gradient-to-br from-background via-warm-cream/20 to-background">
      <div className="container mx-auto max-w-3xl px-4 py-20 text-center">
        <div className="mx-auto rounded-3xl border bg-card/80 p-8 shadow-sm backdrop-blur md:p-12">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-warm-orange">Uskoro</p>
          <h1 className="font-[var(--font-heading)] text-3xl font-bold tracking-tight md:text-5xl">{title}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground md:text-lg">{description}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/pretraga" className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary/90 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]">Pretraži dostupne usluge</Link>
            <Link href="/kontakt" className="inline-flex h-11 items-center justify-center rounded-md border bg-background px-8 text-sm font-medium shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]">Javi nam što trebaš</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

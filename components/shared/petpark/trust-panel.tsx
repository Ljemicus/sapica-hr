import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type TrustItem = {
  icon?: ReactNode;
  title: string;
  description: string;
};

type TrustPanelProps = {
  items?: TrustItem[];
  className?: string;
};

const defaultItems: TrustItem[] = [
  { title: 'Verificirani partneri', description: 'Profili i informacije prikazuju se jasno, bez izmišljenog inventoryja.', icon: '✓' },
  { title: 'Jasne cijene', description: 'Kad cijena nije potvrđena, radije kažemo po dogovoru nego prikazujemo 0 €.', icon: '€' },
  { title: 'Sigurna komunikacija', description: 'Upiti i dogovori ostaju povezani s PetPark iskustvom.', icon: '✦' },
  { title: 'Lokalna zajednica', description: 'PetPark raste grad po grad, s ljudima koji stvarno vole životinje.', icon: '♥' },
];

export function TrustPanel({ items = defaultItems, className }: TrustPanelProps) {
  return (
    <div className={cn('grid gap-4 rounded-[var(--pp-radius-32)] border border-[color:var(--pp-line)] bg-[color:var(--pp-surface)] p-5 shadow-[var(--pp-shadow-card)] md:grid-cols-2 lg:grid-cols-4', className)}>
      {items.map((item) => (
        <div key={item.title} className="space-y-3 rounded-[var(--pp-radius-24)] bg-[color:var(--pp-warm-white)] p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-[var(--pp-radius-pill)] bg-[color:var(--pp-forest)] text-sm font-black text-white" aria-hidden="true">{item.icon ?? '✓'}</div>
          <div>
            <h3 className="font-heading text-lg font-black text-[color:var(--pp-ink)]">{item.title}</h3>
            <p className="mt-1 text-sm leading-6 text-[color:var(--pp-muted)]">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

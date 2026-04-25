import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export interface InternalLinkItem {
  href: string;
  title: string;
  description: string;
  badge?: string;
}

interface InternalLinkSectionProps {
  eyebrow?: string;
  title: string;
  description?: string;
  items: InternalLinkItem[];
  ctaLabel?: string;
}

export function InternalLinkSection({ eyebrow, title, description, items, ctaLabel = 'Otvori' }: InternalLinkSectionProps) {
  if (!items.length) return null;

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {eyebrow && (
            <div className="text-center mb-3">
              <Badge variant="secondary" className="rounded-full border-0 px-4 py-1.5 text-orange-600 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/30 font-semibold">
                {eyebrow}
              </Badge>
            </div>
          )}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold font-[var(--font-heading)]">{title}</h2>
            {description && (
              <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">{description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <Link prefetch={false} key={item.href} href={item.href} className="group block h-full">
                <Card className="h-full border-0 shadow-sm card-hover rounded-2xl transition-all group-hover:shadow-md">
                  <CardContent className="p-5 h-full flex flex-col">
                    {item.badge && (
                      <div className="mb-3">
                        <Badge variant="outline" className="rounded-full text-xs">
                          {item.badge}
                        </Badge>
                      </div>
                    )}
                    <h3 className="font-bold text-base mb-2 group-hover:text-orange-500 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                      {item.description}
                    </p>
                    <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-orange-500">
                      {ctaLabel} →
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

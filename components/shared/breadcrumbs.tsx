import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { BreadcrumbJsonLd } from '@/components/seo/json-ld';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://petpark.hr';

export interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const allItems: BreadcrumbItem[] = [
    { label: 'Početna', href: '/' },
    ...items,
  ];

  const jsonLdItems = allItems.map((item) => ({
    name: item.label,
    url: `${BASE_URL}${item.href}`,
  }));

  return (
    <>
      <BreadcrumbJsonLd items={jsonLdItems} />
      <nav aria-label="Breadcrumb" className="container mx-auto px-4 pt-4 pb-2">
        <ol className="flex items-center gap-1.5 text-sm text-muted-foreground flex-wrap">
          {allItems.map((item, i) => {
            const isLast = i === allItems.length - 1;
            return (
              <li key={item.href} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />}
                {isLast ? (
                  <span className="font-medium text-foreground truncate max-w-[200px]" aria-current="page">
                    {i === 0 && <Home className="h-3.5 w-3.5 inline mr-1" />}
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="hover:text-orange-500 transition-colors truncate max-w-[200px]"
                  >
                    {i === 0 && <Home className="h-3.5 w-3.5 inline mr-1" />}
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}

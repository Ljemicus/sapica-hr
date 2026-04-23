import type { ReactNode } from 'react';
import { PublicPageShell } from '@/components/shared/public-page-shell';
import { InternalLinkSection, type InternalLinkItem } from '@/components/shared/internal-link-section';
import { ServiceJsonLd } from '@/components/seo/json-ld';

export interface DiscoveryPageShellProps {
  breadcrumbLabel: string;
  breadcrumbHref: string;
  jsonLdName: string;
  jsonLdDescription: string;
  serviceType: string;
  areaServed?: string[];
  loadingFallback?: ReactNode;
  children: ReactNode;
  internalLinks?: {
    eyebrow: string;
    title: string;
    description: string;
    items: InternalLinkItem[];
    ctaLabel?: string;
  };
  afterContent?: ReactNode;
}

export function DiscoveryPageShell({
  breadcrumbLabel,
  breadcrumbHref,
  jsonLdName,
  jsonLdDescription,
  serviceType,
  areaServed,
  children,
  internalLinks,
  afterContent,
}: DiscoveryPageShellProps) {
  return (
    <PublicPageShell breadcrumbItems={[{ label: breadcrumbLabel, href: breadcrumbHref }]}>
      <ServiceJsonLd
        name={jsonLdName}
        description={jsonLdDescription}
        url={`https://petpark.hr${breadcrumbHref}`}
        serviceType={serviceType}
        areaServed={areaServed}
      />
      {children}
      {internalLinks ? (
        <InternalLinkSection
          eyebrow={internalLinks.eyebrow}
          title={internalLinks.title}
          description={internalLinks.description}
          items={internalLinks.items}
          ctaLabel={internalLinks.ctaLabel}
        />
      ) : null}
      {afterContent}
    </PublicPageShell>
  );
}

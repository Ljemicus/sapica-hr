import type { Article } from '@/lib/types';

interface JsonLdProps {
  data: Record<string, unknown>;
}

function JsonLdScript({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function WebsiteJsonLd() {
  return (
    <JsonLdScript
      data={{
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Organization',
            '@id': 'https://petpark.hr/#organization',
            name: 'PetPark',
            alternateName: 'PetPark d.o.o.',
            url: 'https://petpark.hr',
            logo: {
              '@type': 'ImageObject',
              url: 'https://petpark.hr/opengraph-image',
              width: 1200,
              height: 630,
            },
            description: 'Hrvatska super-aplikacija za ljubimce. Čuvanje, grooming, školovanje, veterinari, shop, udomljavanje i zajednica — sve na jednom mjestu.',
            address: {
              '@type': 'PostalAddress',
              addressLocality: 'Rijeka',
              addressCountry: 'HR',
            },
            contactPoint: {
              '@type': 'ContactPoint',
              email: 'petparkhr@gmail.com',
              telephone: '+385915676202',
              contactType: 'customer service',
              availableLanguage: ['Croatian', 'English'],
              hoursAvailable: {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                opens: '08:00',
                closes: '20:00',
              },
            },
            sameAs: [
              'https://www.instagram.com/petpark.hr',
              'https://www.facebook.com/petpark.hr',
            ],
          },
          {
            '@type': 'WebSite',
            '@id': 'https://petpark.hr/#website',
            url: 'https://petpark.hr',
            name: 'PetPark',
            description: 'Sve za ljubimce na jednom mjestu',
            inLanguage: 'hr',
            publisher: { '@id': 'https://petpark.hr/#organization' },
            potentialAction: {
              '@type': 'SearchAction',
              target: 'https://petpark.hr/pretraga?q={search_term_string}',
              'query-input': 'required name=search_term_string',
            },
          },
        ],
      }}
    />
  );
}

export function ItemListJsonLd({ items }: { items: { name: string; url: string; description: string }[] }) {
  return (
    <JsonLdScript
      data={{
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: items.map((item, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: item.name,
          url: item.url,
          description: item.description,
        })),
      }}
    />
  );
}

interface ArticleJsonLdProps {
  article: Article;
}

export function ArticleJsonLd({ article }: ArticleJsonLdProps) {
  return (
    <JsonLdScript
      data={{
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: article.title,
        description: article.excerpt,
        author: {
          '@type': 'Person',
          name: article.author,
        },
        publisher: {
          '@type': 'Organization',
          name: 'PetPark',
          logo: {
            '@type': 'ImageObject',
            url: 'https://petpark.hr/opengraph-image',
          },
        },
        datePublished: article.date,
        dateModified: article.date,
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `https://petpark.hr/zajednica/${article.slug}`,
        },
        articleSection: article.category,
      }}
    />
  );
}

interface VetClinic {
  name: string;
  address: string;
  city: string;
  phone?: string;
  rating?: number;
  reviewCount?: number;
}

export function LocalBusinessJsonLd({ clinic }: { clinic: VetClinic }) {
  return (
    <JsonLdScript
      data={{
        '@context': 'https://schema.org',
        '@type': 'VeterinaryCare',
        name: clinic.name,
        address: {
          '@type': 'PostalAddress',
          streetAddress: clinic.address,
          addressLocality: clinic.city,
          addressCountry: 'HR',
        },
        ...(clinic.phone && { telephone: clinic.phone }),
        ...(clinic.rating && {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: clinic.rating,
            reviewCount: clinic.reviewCount || 0,
          },
        }),
      }}
    />
  );
}

interface FaqItem {
  q: string;
  a: string;
}

export function FAQJsonLd({ faqs }: { faqs: FaqItem[] }) {
  return (
    <JsonLdScript
      data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.a,
          },
        })),
      }}
    />
  );
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  return (
    <JsonLdScript
      data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: item.name,
          item: item.url,
        })),
      }}
    />
  );
}

export function SiteNavigationJsonLd() {
  const navItems = [
    { name: 'Čuvanje ljubimaca', url: 'https://petpark.hr/pretraga' },
    { name: 'Grooming', url: 'https://petpark.hr/njega' },
    { name: 'Školovanje pasa', url: 'https://petpark.hr/dresura' },
    { name: 'Veterinari', url: 'https://petpark.hr/veterinari' },
    { name: 'Pet Shop', url: 'https://petpark.hr/shop' },
    { name: 'Blog', url: 'https://petpark.hr/zajednica' },
    { name: 'Forum', url: 'https://petpark.hr/forum' },
    { name: 'Udomljavanje', url: 'https://petpark.hr/udomljavanje' },
    { name: 'Izgubljeni ljubimci', url: 'https://petpark.hr/izgubljeni' },
    { name: 'Dog-Friendly', url: 'https://petpark.hr/dog-friendly' },
  ];

  return (
    <JsonLdScript
      data={{
        '@context': 'https://schema.org',
        '@type': 'SiteNavigationElement',
        name: navItems.map((item) => item.name),
        url: navItems.map((item) => item.url),
      }}
    />
  );
}

interface ServiceJsonLdProps {
  name: string;
  description: string;
  url: string;
  serviceType: string;
  areaServed?: string[];
}

export function ServiceJsonLd({ name, description, url, serviceType, areaServed }: ServiceJsonLdProps) {
  return (
    <JsonLdScript
      data={{
        '@context': 'https://schema.org',
        '@type': 'Service',
        name,
        description,
        url,
        serviceType,
        provider: { '@id': 'https://petpark.hr/#organization' },
        ...(areaServed && {
          areaServed: areaServed.map((city) => ({
            '@type': 'City',
            name: city,
          })),
        }),
      }}
    />
  );
}

interface AggregateRatingJsonLdProps {
  name: string;
  ratingValue: number;
  reviewCount: number;
  url: string;
}

export function AggregateRatingJsonLd({ name, ratingValue, reviewCount, url }: AggregateRatingJsonLdProps) {
  return (
    <JsonLdScript
      data={{
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name,
        url,
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue,
          reviewCount,
          bestRating: 5,
          worstRating: 1,
        },
      }}
    />
  );
}

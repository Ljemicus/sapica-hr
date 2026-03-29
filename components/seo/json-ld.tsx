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
            logo: 'https://petpark.hr/opengraph-image',
            description: 'Hrvatski marketplace za čuvanje kućnih ljubimaca. Pronađite pouzdane sittere u vašem gradu.',
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
          },
          {
            '@type': 'WebSite',
            '@id': 'https://petpark.hr/#website',
            url: 'https://petpark.hr',
            name: 'PetPark',
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

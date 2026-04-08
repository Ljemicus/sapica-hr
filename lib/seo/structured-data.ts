/**
 * JSON-LD Structured Data for PetPark
 * Implements schema.org markup for search engines
 */

export interface LocalBusinessData {
  '@type': 'LocalBusiness' | 'VeterinaryCare' | 'PetStore' | 'AnimalShelter';
  name: string;
  description: string;
  url: string;
  telephone?: string;
  email?: string;
  address: {
    '@type': 'PostalAddress';
    streetAddress: string;
    addressLocality: string;
    addressRegion?: string;
    postalCode: string;
    addressCountry: string;
  };
  geo?: {
    '@type': 'GeoCoordinates';
    latitude: number;
    longitude: number;
  };
  openingHours?: string;
  priceRange?: string;
  image?: string;
  sameAs?: string[];
  aggregateRating?: {
    '@type': 'AggregateRating';
    ratingValue: number;
    reviewCount: number;
    bestRating?: number;
    worstRating?: number;
  };
}

export interface FAQData {
  '@type': 'FAQPage';
  mainEntity: Array<{
    '@type': 'Question';
    name: string;
    acceptedAnswer: {
      '@type': 'Answer';
      text: string;
    };
  }>;
}

export interface BreadcrumbData {
  '@type': 'BreadcrumbList';
  itemListElement: Array<{
    '@type': 'ListItem';
    position: number;
    name: string;
    item?: string;
  }>;
}

export interface ProductData {
  '@type': 'Product';
  name: string;
  description: string;
  image?: string;
  brand?: {
    '@type': 'Brand';
    name: string;
  };
  offers?: {
    '@type': 'Offer';
    price: number;
    priceCurrency: string;
    availability?: 'https://schema.org/InStock' | 'https://schema.org/OutOfStock' | 'https://schema.org/PreOrder';
    url?: string;
  };
  aggregateRating?: {
    '@type': 'AggregateRating';
    ratingValue: number;
    reviewCount: number;
  };
}

export interface ServiceData {
  '@type': 'Service';
  name: string;
  description: string;
  provider: {
    '@type': 'LocalBusiness' | 'Person';
    name: string;
  };
  areaServed?: string | string[];
  offers?: {
    '@type': 'Offer';
    price: number;
    priceCurrency: string;
  };
}

export interface PersonData {
  '@type': 'Person';
  name: string;
  description?: string;
  image?: string;
  url?: string;
  sameAs?: string[];
  jobTitle?: string;
  worksFor?: {
    '@type': 'Organization';
    name: string;
  };
}

export class StructuredDataGenerator {
  /**
   * Generate LocalBusiness structured data for PetPark
   */
  static generateLocalBusiness(data: LocalBusinessData): object {
    return {
      '@context': 'https://schema.org',
      '@type': data['@type'],
      name: data.name,
      description: data.description,
      url: data.url,
      ...(data.telephone && { telephone: data.telephone }),
      ...(data.email && { email: data.email }),
      address: {
        '@type': 'PostalAddress',
        streetAddress: data.address.streetAddress,
        addressLocality: data.address.addressLocality,
        ...(data.address.addressRegion && { addressRegion: data.address.addressRegion }),
        postalCode: data.address.postalCode,
        addressCountry: data.address.addressCountry,
      },
      ...(data.geo && {
        geo: {
          '@type': 'GeoCoordinates',
          latitude: data.geo.latitude,
          longitude: data.geo.longitude,
        },
      }),
      ...(data.openingHours && { openingHours: data.openingHours }),
      ...(data.priceRange && { priceRange: data.priceRange }),
      ...(data.image && { image: data.image }),
      ...(data.sameAs && data.sameAs.length > 0 && { sameAs: data.sameAs }),
      ...(data.aggregateRating && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: data.aggregateRating.ratingValue,
          reviewCount: data.aggregateRating.reviewCount,
          ...(data.aggregateRating.bestRating && { bestRating: data.aggregateRating.bestRating }),
          ...(data.aggregateRating.worstRating && { worstRating: data.aggregateRating.worstRating }),
        },
      }),
    };
  }
  
  /**
   * Generate FAQ structured data
   */
  static generateFAQ(data: FAQData): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: data.mainEntity.map((question, index) => ({
        '@type': 'Question',
        name: question.name,
        acceptedAnswer: {
          '@type': 'Answer',
          text: question.acceptedAnswer.text,
        },
      })),
    };
  }
  
  /**
   * Generate Breadcrumb structured data
   */
  static generateBreadcrumb(data: BreadcrumbData): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: data.itemListElement.map((item, index) => ({
        '@type': 'ListItem',
        position: item.position,
        name: item.name,
        ...(item.item && { item: item.item }),
      })),
    };
  }
  
  /**
   * Generate Product structured data (for marketplace items)
   */
  static generateProduct(data: ProductData): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: data.name,
      description: data.description,
      ...(data.image && { image: data.image }),
      ...(data.brand && {
        brand: {
          '@type': 'Brand',
          name: data.brand.name,
        },
      }),
      ...(data.offers && {
        offers: {
          '@type': 'Offer',
          price: data.offers.price,
          priceCurrency: data.offers.priceCurrency,
          ...(data.offers.availability && { availability: data.offers.availability }),
          ...(data.offers.url && { url: data.offers.url }),
        },
      }),
      ...(data.aggregateRating && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: data.aggregateRating.ratingValue,
          reviewCount: data.aggregateRating.reviewCount,
        },
      }),
    };
  }
  
  /**
   * Generate Service structured data
   */
  static generateService(data: ServiceData): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: data.name,
      description: data.description,
      provider: {
        '@type': data.provider['@type'],
        name: data.provider.name,
      },
      ...(data.areaServed && { areaServed: data.areaServed }),
      ...(data.offers && {
        offers: {
          '@type': 'Offer',
          price: data.offers.price,
          priceCurrency: data.offers.priceCurrency,
        },
      }),
    };
  }
  
  /**
   * Generate Person structured data (for sitters, vets, etc.)
   */
  static generatePerson(data: PersonData): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: data.name,
      ...(data.description && { description: data.description }),
      ...(data.image && { image: data.image }),
      ...(data.url && { url: data.url }),
      ...(data.sameAs && data.sameAs.length > 0 && { sameAs: data.sameAs }),
      ...(data.jobTitle && { jobTitle: data.jobTitle }),
      ...(data.worksFor && {
        worksFor: {
          '@type': 'Organization',
          name: data.worksFor.name,
        },
      }),
    };
  }
  
  /**
   * Generate HTML script tag for structured data
   */
  static generateScriptTag(data: object): string {
    return `<script type="application/ld+json">${JSON.stringify(data, null, 2)}</script>`;
  }
  
  /**
   * Generate multiple structured data scripts
   */
  static generateMultipleScriptTags(dataArray: object[]): string {
    return dataArray.map(data => this.generateScriptTag(data)).join('\n');
  }
  
  /**
   * Preset configurations for PetPark
   */
  static readonly PRESETS = {
    // PetPark as a LocalBusiness
    PETPARK_BUSINESS: (): LocalBusinessData => ({
      '@type': 'LocalBusiness',
      name: 'PetPark',
      description: 'Trusted platform connecting pet owners with reliable sitters, groomers, trainers, and veterinarians.',
      url: 'https://petpark.example.com',
      telephone: '+1-555-123-4567',
      email: 'info@petpark.example.com',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '123 Pet Care Ave',
        addressLocality: 'San Francisco',
        addressRegion: 'CA',
        postalCode: '94107',
        addressCountry: 'US',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 37.7749,
        longitude: -122.4194,
      },
      openingHours: 'Mo-Fr 09:00-18:00',
      priceRange: '$$',
      image: 'https://petpark.example.com/logo.jpg',
      sameAs: [
        'https://facebook.com/petpark',
        'https://twitter.com/petparkapp',
        'https://instagram.com/petpark',
        'https://linkedin.com/company/petpark',
      ],
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: 4.8,
        reviewCount: 1250,
        bestRating: 5,
        worstRating: 1,
      },
    }),
    
    // Common FAQ questions
    PETPARK_FAQ: (): FAQData => ({
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How do I find a pet sitter near me?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Use our search filters to find sitters in your area. You can filter by location, services offered, availability, and ratings. Each sitter profile includes reviews, photos, and detailed service information.',
          },
        },
        {
          '@type': 'Question',
          name: 'What types of pet care services are available?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'PetPark offers boarding, dog walking, house sitting, drop-in visits, daycare, grooming, training, veterinary services, and pet transportation. Each service provider is verified and reviewed by the community.',
          },
        },
        {
          '@type': 'Question',
          name: 'How are sitters and service providers verified?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'All providers undergo identity verification, background checks, and reference verification. We also monitor reviews and ratings to ensure quality service.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is there insurance coverage for pet care services?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, PetPark provides insurance coverage for all bookings made through our platform. This includes liability coverage and veterinary care reimbursement for eligible incidents.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do payments work on PetPark?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Payments are processed securely through our platform. We hold payments until service completion and only release funds after both parties confirm satisfaction. We accept all major credit cards and digital payment methods.',
          },
        },
      ],
    }),
    
    // Breadcrumb for sitter profile page
    SITTER_BREADCRUMB: (sitterName: string, sitterId: string): BreadcrumbData => ({
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://petpark.example.com',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Find Sitters',
          item: 'https://petpark.example.com/sitters',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: sitterName,
          item: `https://petpark.example.com/sitters/${sitterId}`,
        },
      ],
    }),
    
    // Product data for pet supplies
    PET_SUPPLY_PRODUCT: (name: string, price: number, image: string): ProductData => ({
      '@type': 'Product',
      name,
      description: `High-quality ${name.toLowerCase()} for your pet. Durable, safe, and pet-approved.`,
      image,
      brand: {
        '@type': 'Brand',
        name: 'PetPark Supplies',
      },
      offers: {
        '@type': 'Offer',
        price,
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        url: `https://petpark.example.com/products/${encodeURIComponent(name.toLowerCase().replace(/\s+/g, '-'))}`,
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: 4.5,
        reviewCount: 42,
      },
    }),
    
    // Service data for dog walking
    DOG_WALKING_SERVICE: (providerName: string, price: number, area: string): ServiceData => ({
      '@type': 'Service',
      name: 'Professional Dog Walking',
      description: 'Regular exercise and companionship for your dog with our certified walkers.',
      provider: {
        '@type': 'LocalBusiness',
        name: providerName,
      },
      areaServed: area,
      offers: {
        '@type': 'Offer',
        price,
        priceCurrency: 'USD',
      },
    }),
    
    // Person data for sitter
    SITTER_PERSON: (name: string, image: string, bio: string): PersonData => ({
      '@type': 'Person',
      name,
      description: bio,
      image,
      url: `https://petpark.example.com/sitters/${encodeURIComponent(name.toLowerCase().replace(/\s+/g, '-'))}`,
      sameAs: [
        `https://petpark.example.com/sitters/${encodeURIComponent(name.toLowerCase().replace(/\s+/g, '-'))}`,
      ],
      jobTitle: 'Professional Pet Sitter',
      worksFor: {
        '@type': 'Organization',
        name: 'PetPark',
      },
    }),
  };
  
  /**
   * Generate all structured data for a page
   */
  static generateForPage(
    pageType: 'home' | 'sitter' | 'service' | 'product' | 'faq',
    ...args: any[]
  ): string {
    const data: object[] = [];
    
    switch (pageType) {
      case 'home':
        data.push(
          this.generateLocalBusiness(this.PRESETS.PETPARK_BUSINESS()),
          this.generateFAQ(this.PRESETS.PETPARK_FAQ())
        );
        break;
        
      case 'sitter':
        const [sitterName, sitterId, image, bio] = args;
        data.push(
          this.generateBreadcrumb(this.PRESETS.SITTER_BREADCRUMB(sitterName, sitterId)),
          this.generatePerson(this.PRESETS.SITTER_PERSON(sitterName, image, bio))
        );
        break;
        
      case 'service':
        const [providerName, price, area] = args;
        data.push(
          this.generateService(this.PRESETS.DOG_WALKING_SERVICE(providerName, price, area))
        );
        break;
        
      case 'product':
        const [productName, productPrice, productImage] = args;
        data.push(
          this.generateProduct(this.PRESETS.PET_SUPPLY_PRODUCT(productName, productPrice, productImage))
        );
        break;
        
      case 'faq':
        data.push(this.generateFAQ(this.PRESETS.PETPARK_FAQ()));
        break;
    }
    
    return this.generateMultipleScriptTags(data);
  }
}

/**
 * Helper to generate structured data script tags
 */
export function generateStructuredData(
  pageType: 'home' | 'sitter' | 'service' | 'product' | 'faq',
  ...args: any[]
): string {
  return StructuredDataGenerator.generateForPage(pageType, ...args);
}
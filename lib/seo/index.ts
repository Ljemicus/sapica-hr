/**
 * SEO utilities for PetPark
 * Barrel export for all SEO modules
 */

// Re-export existing modules
export * from './internal-links';
export * from './locale-metadata';
export * from './indexability';

// Export new modules
export * from './opengraph-generator';
export * from './twitter-cards';
export * from './structured-data';

// Combined utilities
export { generateOpenGraphImage, generateOpenGraphMetaTags } from './opengraph-generator';
export { generateTwitterCard, generateSocialMetaTags } from './twitter-cards';
export { generateStructuredData } from './structured-data';

// Main SEO generator
export class SEOGenerator {
  /**
   * Generate complete SEO metadata for a page
   */
  static generateForPage(
    pageType: 'home' | 'sitter' | 'service' | 'product' | 'blog' | 'faq',
    pageData: any
  ): {
    title: string;
    description: string;
    openGraph: Array<{ property: string; content: string }>;
    twitter: Array<{ name: string; content: string }>;
    structuredData: string;
  } {
    // Generate page-specific metadata
    const { title, description } = this.getPageMetadata(pageType, pageData);
    
    // Generate OpenGraph tags
    const openGraph = this.generateOpenGraphTags(pageType, pageData);
    
    // Generate Twitter Card tags
    const twitter = this.generateTwitterTags(pageType, pageData);
    
    // Generate structured data
    const structuredData = this.generateStructuredData(pageType, pageData);
    
    return {
      title,
      description,
      openGraph,
      twitter,
      structuredData,
    };
  }
  
  private static getPageMetadata(pageType: string, data: any): { title: string; description: string } {
    switch (pageType) {
      case 'home':
        return {
          title: 'PetPark - Trusted Pet Care Platform',
          description: 'Find reliable sitters, groomers, trainers, and veterinarians for your pets. Join thousands of happy pet owners today!',
        };
        
      case 'sitter':
        return {
          title: `${data.name} - Pet Sitter on PetPark`,
          description: `⭐ ${data.rating}/5 rating | ${data.bio?.substring(0, 150)}...`,
        };
        
      case 'service':
        return {
          title: `${data.service} Services in ${data.location}`,
          description: `Find top-rated ${data.service.toLowerCase()} providers in ${data.location}. Read reviews, compare prices, and book instantly.`,
        };
        
      case 'product':
        return {
          title: data.name,
          description: data.description,
        };
        
      case 'blog':
        return {
          title: data.title,
          description: data.excerpt,
        };
        
      case 'faq':
        return {
          title: 'PetPark FAQ - Frequently Asked Questions',
          description: 'Find answers to common questions about pet care services, bookings, payments, and safety on PetPark.',
        };
        
      default:
        return {
          title: 'PetPark',
          description: 'Your trusted platform for pet care services',
        };
    }
  }
  
  private static generateOpenGraphTags(pageType: string, data: any): Array<{ property: string; content: string }> {
    // Use OpenGraph generator presets
    const { generateOpenGraphMetaTags } = require('./opengraph-generator');
    
    switch (pageType) {
      case 'home':
        return generateOpenGraphMetaTags('HOME');
        
      case 'sitter':
        return generateOpenGraphMetaTags('SITTER_PROFILE', data.name, data.rating);
        
      case 'service':
        return generateOpenGraphMetaTags('SERVICE', data.service, data.location);
        
      case 'blog':
        return generateOpenGraphMetaTags('BLOG_POST', data.title, data.author);
        
      default:
        return generateOpenGraphMetaTags('HOME');
    }
  }
  
  private static generateTwitterTags(pageType: string, data: any): Array<{ name: string; content: string }> {
    // Use Twitter Card generator presets
    const { generateTwitterCard } = require('./twitter-cards');
    
    switch (pageType) {
      case 'home':
        return generateTwitterCard('HOME');
        
      case 'sitter':
        return generateTwitterCard('SITTER_PROFILE', data.name, data.rating, data.image);
        
      case 'service':
        return generateTwitterCard('SERVICE_PAGE', data.service, data.location);
        
      case 'blog':
        return generateTwitterCard('BLOG_POST', data.title, data.excerpt, data.image, data.author);
        
      default:
        return generateTwitterCard('HOME');
    }
  }
  
  private static generateStructuredData(pageType: string, data: any): string {
    // Use Structured Data generator
    const { generateStructuredData } = require('./structured-data');
    
    switch (pageType) {
      case 'home':
        return generateStructuredData('home');
        
      case 'sitter':
        return generateStructuredData('sitter', data.name, data.id, data.image, data.bio);
        
      case 'service':
        return generateStructuredData('service', data.providerName, data.price, data.area);
        
      case 'product':
        return generateStructuredData('product', data.name, data.price, data.image);
        
      case 'faq':
        return generateStructuredData('faq');
        
      default:
        return '';
    }
  }
}

// Default export
export default SEOGenerator;
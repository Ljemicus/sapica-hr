/**
 * SEO utilities for PetPark
 * Barrel export for all SEO modules
 */

import type { 
  PageType, 
  PageData, 
  SitterPageData, 
  ServicePageData, 
  ProductPageData, 
  BlogPageData,
  SEOMetadata 
} from './types';

// Re-export existing modules
export * from './internal-links';
export * from './locale-metadata';
export * from './indexability';

// Export new modules
export * from './opengraph-generator';
export * from './twitter-cards';
export * from './structured-data';

// Export types
export type {
  PageType,
  PageData,
  SitterPageData,
  ServicePageData,
  ProductPageData,
  BlogPageData,
  SEOMetadata,
} from './types';

// Combined utilities
export { generateOpenGraphImage, generateOpenGraphMetaTags } from './opengraph-generator';
export { generateTwitterCardTags, generateTwitterCardFromOpenGraph } from './twitter-cards';
export { generateStructuredData } from './structured-data';

// Type guards
function isSitterPageData(data: PageData): data is SitterPageData {
  return typeof data === 'object' && data !== null && 'name' in data && 'rating' in data;
}

function isServicePageData(data: PageData): data is ServicePageData {
  return typeof data === 'object' && data !== null && 'service' in data && 'location' in data;
}

function isProductPageData(data: PageData): data is ProductPageData {
  return typeof data === 'object' && data !== null && 'name' in data && 'description' in data;
}

function isBlogPageData(data: PageData): data is BlogPageData {
  return typeof data === 'object' && data !== null && 'title' in data && 'excerpt' in data && 'author' in data;
}

// Main SEO generator
export class SEOGenerator {
  /**
   * Generate complete SEO metadata for a page
   */
  static generateForPage(
    pageType: PageType,
    pageData: PageData
  ): SEOMetadata {
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
  
  private static getPageMetadata(pageType: PageType, data: PageData): { title: string; description: string } {
    switch (pageType) {
      case 'home':
        return {
          title: 'PetPark - Trusted Pet Care Platform',
          description: 'Find reliable sitters, groomers, trainers, and veterinarians for your pets. Join thousands of happy pet owners today!',
        };
        
      case 'sitter':
        if (isSitterPageData(data)) {
          return {
            title: `${data.name} - Pet Sitter on PetPark`,
            description: `⭐ ${data.rating}/5 rating | ${data.bio?.substring(0, 150) || 'Professional pet sitter'}...`,
          };
        }
        return {
          title: 'Pet Sitter on PetPark',
          description: 'Professional pet sitter available for your pet care needs.',
        };
        
      case 'service':
        if (isServicePageData(data)) {
          return {
            title: `${data.service} Services in ${data.location}`,
            description: `Find top-rated ${data.service.toLowerCase()} providers in ${data.location}. Read reviews, compare prices, and book instantly.`,
          };
        }
        return {
          title: 'Pet Services on PetPark',
          description: 'Find top-rated pet care providers. Read reviews, compare prices, and book instantly.',
        };
        
      case 'product':
        if (isProductPageData(data)) {
          return {
            title: data.name,
            description: data.description,
          };
        }
        return {
          title: 'Product on PetPark',
          description: 'Quality pet products available on PetPark.',
        };
        
      case 'blog':
        if (isBlogPageData(data)) {
          return {
            title: data.title,
            description: data.excerpt,
          };
        }
        return {
          title: 'PetPark Blog',
          description: 'Tips, stories, and advice for pet owners.',
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
  
  private static generateOpenGraphTags(pageType: PageType, data: PageData): Array<{ property: string; content: string }> {
    // Use OpenGraph generator presets
    const { generateOpenGraphMetaTags } = require('./opengraph-generator');
    
    switch (pageType) {
      case 'home':
        return generateOpenGraphMetaTags('HOME');
        
      case 'sitter':
        if (isSitterPageData(data)) {
          return generateOpenGraphMetaTags('SITTER_PROFILE', data.name, data.rating);
        }
        return generateOpenGraphMetaTags('HOME');
        
      case 'service':
        if (isServicePageData(data)) {
          return generateOpenGraphMetaTags('SERVICE', data.service, data.location);
        }
        return generateOpenGraphMetaTags('HOME');
        
      case 'blog':
        if (isBlogPageData(data)) {
          return generateOpenGraphMetaTags('BLOG_POST', data.title, data.author);
        }
        return generateOpenGraphMetaTags('HOME');
        
      default:
        return generateOpenGraphMetaTags('HOME');
    }
  }
  
  private static generateTwitterTags(pageType: PageType, data: PageData): Array<{ name: string; content: string }> {
    // Use Twitter Card generator presets
    const { generateTwitterCardTags } = require('./twitter-cards');
    
    switch (pageType) {
      case 'home':
        return generateTwitterCardTags({ card: 'summary_large_image', title: 'PetPark', description: 'Trusted Pet Care Platform', image: '/og-home.jpg' });
        
      case 'sitter':
        if (isSitterPageData(data)) {
          return generateTwitterCardTags({ 
            card: 'summary_large_image', 
            title: `${data.name} - Pet Sitter`, 
            description: `⭐ ${data.rating}/5 rating`, 
            image: data.image || '/og-sitter-default.jpg' 
          });
        }
        return generateTwitterCardTags({ card: 'summary_large_image', title: 'PetPark', description: 'Trusted Pet Care Platform', image: '/og-home.jpg' });
        
      case 'service':
        if (isServicePageData(data)) {
          return generateTwitterCardTags({ 
            card: 'summary_large_image', 
            title: `${data.service} in ${data.location}`, 
            description: `Find top-rated ${data.service.toLowerCase()} providers`, 
            image: '/og-service.jpg' 
          });
        }
        return generateTwitterCardTags({ card: 'summary_large_image', title: 'PetPark', description: 'Trusted Pet Care Platform', image: '/og-home.jpg' });
        
      case 'blog':
        if (isBlogPageData(data)) {
          return generateTwitterCardTags({ 
            card: 'summary_large_image', 
            title: data.title, 
            description: data.excerpt, 
            image: data.image || '/og-blog-default.jpg' 
          });
        }
        return generateTwitterCardTags({ card: 'summary_large_image', title: 'PetPark', description: 'Trusted Pet Care Platform', image: '/og-home.jpg' });
        
      default:
        return generateTwitterCardTags({ card: 'summary_large_image', title: 'PetPark', description: 'Trusted Pet Care Platform', image: '/og-home.jpg' });
    }
  }
  
  private static generateStructuredData(pageType: PageType, data: PageData): string {
    // Use Structured Data generator
    const { generateStructuredData } = require('./structured-data');
    
    switch (pageType) {
      case 'home':
        return generateStructuredData('home');
        
      case 'sitter':
        if (isSitterPageData(data)) {
          return generateStructuredData('sitter', data.name, data.id, data.image, data.bio);
        }
        return '';
        
      case 'service':
        if (isServicePageData(data)) {
          return generateStructuredData('service', data.providerName, data.price, data.area);
        }
        return '';
        
      case 'product':
        if (isProductPageData(data)) {
          return generateStructuredData('product', data.name, data.price, data.image);
        }
        return '';
        
      case 'faq':
        return generateStructuredData('faq');
        
      default:
        return '';
    }
  }
}

// Default export
export default SEOGenerator;

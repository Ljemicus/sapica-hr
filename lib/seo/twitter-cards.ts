/**
 * Twitter Card meta tags for PetPark
 * Implements Twitter Card protocol for rich social media previews
 */

export interface TwitterCardOptions {
  // Required for all cards
  card: 'summary' | 'summary_large_image' | 'app' | 'player';
  site?: string; // @username of website
  creator?: string; // @username of content creator
  
  // Required for summary_large_image cards
  title: string;
  description: string;
  image: string;
  imageAlt?: string;
  
  // Optional for all cards
  url?: string;
  
  // Player card specific
  player?: {
    url: string;
    width: number;
    height: number;
    stream?: string;
  };
  
  // App card specific
  app?: {
    country?: string;
    name: {
      iphone?: string;
      ipad?: string;
      googleplay?: string;
    };
    id: {
      iphone?: string;
      ipad?: string;
      googleplay?: string;
    };
    url: {
      iphone?: string;
      ipad?: string;
      googleplay?: string;
    };
  };
}

export class TwitterCardGenerator {
  private static readonly DEFAULT_OPTIONS: Partial<TwitterCardOptions> = {
    card: 'summary_large_image',
    site: '@petparkapp',
    creator: '@petparkapp',
  };
  
  /**
   * Generate Twitter Card meta tags
   */
  static generateMetaTags(options: TwitterCardOptions): Array<{ name: string; content: string }> {
    const config = { ...this.DEFAULT_OPTIONS, ...options };
    const tags: Array<{ name: string; content: string }> = [];
    
    // Required tags
    tags.push({ name: 'twitter:card', content: config.card });
    
    if (config.site) {
      tags.push({ name: 'twitter:site', content: config.site });
    }
    
    if (config.creator) {
      tags.push({ name: 'twitter:creator', content: config.creator });
    }
    
    if (config.title) {
      tags.push({ name: 'twitter:title', content: config.title });
    }
    
    if (config.description) {
      tags.push({ name: 'twitter:description', content: config.description });
    }
    
    if (config.image) {
      tags.push({ name: 'twitter:image', content: config.image });
      
      if (config.imageAlt) {
        tags.push({ name: 'twitter:image:alt', content: config.imageAlt });
      }
    }
    
    if (config.url) {
      tags.push({ name: 'twitter:url', content: config.url });
    }
    
    // Player card specific
    if (config.card === 'player' && config.player) {
      tags.push({ name: 'twitter:player', content: config.player.url });
      tags.push({ name: 'twitter:player:width', content: config.player.width.toString() });
      tags.push({ name: 'twitter:player:height', content: config.player.height.toString() });
      
      if (config.player.stream) {
        tags.push({ name: 'twitter:player:stream', content: config.player.stream });
      }
    }
    
    // App card specific
    if (config.card === 'app' && config.app) {
      if (config.app.country) {
        tags.push({ name: 'twitter:app:country', content: config.app.country });
      }
      
      // iPhone
      if (config.app.name.iphone) {
        tags.push({ name: 'twitter:app:name:iphone', content: config.app.name.iphone });
      }
      if (config.app.id.iphone) {
        tags.push({ name: 'twitter:app:id:iphone', content: config.app.id.iphone });
      }
      if (config.app.url.iphone) {
        tags.push({ name: 'twitter:app:url:iphone', content: config.app.url.iphone });
      }
      
      // iPad
      if (config.app.name.ipad) {
        tags.push({ name: 'twitter:app:name:ipad', content: config.app.name.ipad });
      }
      if (config.app.id.ipad) {
        tags.push({ name: 'twitter:app:id:ipad', content: config.app.id.ipad });
      }
      if (config.app.url.ipad) {
        tags.push({ name: 'twitter:app:url:ipad', content: config.app.url.ipad });
      }
      
      // Google Play
      if (config.app.name.googleplay) {
        tags.push({ name: 'twitter:app:name:googleplay', content: config.app.name.googleplay });
      }
      if (config.app.id.googleplay) {
        tags.push({ name: 'twitter:app:id:googleplay', content: config.app.id.googleplay });
      }
      if (config.app.url.googleplay) {
        tags.push({ name: 'twitter:app:url:googleplay', content: config.app.url.googleplay });
      }
    }
    
    return tags;
  }
  
  /**
   * Preset configurations for different page types
   */
  static readonly PRESETS = {
    HOME: (): TwitterCardOptions => ({
      card: 'summary_large_image',
      title: 'PetPark - Trusted Pet Care Platform',
      description: 'Find reliable sitters, groomers, trainers, and veterinarians for your pets. Join thousands of happy pet owners today!',
      image: 'https://petpark.example.com/og-home.jpg',
      imageAlt: 'PetPark platform showing happy pets and owners',
      url: 'https://petpark.example.com',
    }),
    
    SITTER_PROFILE: (name: string, rating: number, imageUrl: string): TwitterCardOptions => ({
      card: 'summary_large_image',
      title: `${name} - Pet Sitter on PetPark`,
      description: `⭐ ${rating}/5 rating | Trusted pet sitter available for boarding, walking, and house sitting. Book now for peace of mind!`,
      image: imageUrl || 'https://petpark.example.com/og-sitter-default.jpg',
      imageAlt: `${name}, professional pet sitter`,
      url: `https://petpark.example.com/sitters/${encodeURIComponent(name)}`,
    }),
    
    PET_PROFILE: (name: string, type: string, imageUrl: string): TwitterCardOptions => ({
      card: 'summary_large_image',
      title: `Meet ${name} the ${type}`,
      description: `This adorable ${type.toLowerCase()} is looking for love and care. View profile to learn more about ${name}!`,
      image: imageUrl || 'https://petpark.example.com/og-pet-default.jpg',
      imageAlt: `${name} the ${type}`,
      url: `https://petpark.example.com/pets/${encodeURIComponent(name)}`,
    }),
    
    BLOG_POST: (title: string, excerpt: string, imageUrl: string, author: string): TwitterCardOptions => ({
      card: 'summary_large_image',
      title,
      description: `${excerpt} - Written by ${author}`,
      image: imageUrl || 'https://petpark.example.com/og-blog-default.jpg',
      imageAlt: `Blog post: ${title}`,
      url: `https://petpark.example.com/blog/${encodeURIComponent(title.toLowerCase().replace(/\s+/g, '-'))}`,
      creator: `@${author.toLowerCase().replace(/\s+/g, '')}`,
    }),
    
    SERVICE_PAGE: (service: string, location: string): TwitterCardOptions => ({
      card: 'summary_large_image',
      title: `Find ${service} Services in ${location}`,
      description: `Browse top-rated ${service.toLowerCase()} providers in ${location}. Read reviews, compare prices, and book instantly.`,
      image: `https://petpark.example.com/og-${service.toLowerCase().replace(/\s+/g, '-')}.jpg`,
      imageAlt: `${service} services in ${location}`,
      url: `https://petpark.example.com/services/${encodeURIComponent(service.toLowerCase().replace(/\s+/g, '-'))}/${encodeURIComponent(location.toLowerCase().replace(/\s+/g, '-'))}`,
    }),
    
    MOBILE_APP: (): TwitterCardOptions => ({
      card: 'app',
      title: 'PetPark Mobile App',
      description: 'Manage your pet care on the go with the PetPark app',
      image: 'https://petpark.example.com/og-app.jpg',
      url: 'https://petpark.example.com/app',
      app: {
        name: {
          iphone: 'PetPark',
          ipad: 'PetPark',
          googleplay: 'PetPark',
        },
        id: {
          iphone: '1234567890',
          ipad: '1234567890',
          googleplay: 'com.petpark.app',
        },
        url: {
          iphone: 'https://apps.apple.com/app/petpark/id1234567890',
          ipad: 'https://apps.apple.com/app/petpark/id1234567890',
          googleplay: 'https://play.google.com/store/apps/details?id=com.petpark.app',
        },
      },
    }),
  };
  
  /**
   * Validate Twitter Card configuration
   */
  static validate(options: TwitterCardOptions): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check required fields
    if (!options.card) {
      errors.push('twitter:card is required');
    }
    
    if (!options.title) {
      errors.push('twitter:title is required');
    }
    
    if (!options.description) {
      errors.push('twitter:description is required');
    }
    
    if (!options.image) {
      errors.push('twitter:image is required');
    }
    
    // Check card-specific requirements
    if (options.card === 'summary_large_image') {
      if (options.title.length > 70) {
        errors.push('twitter:title should be 70 characters or less for summary_large_image cards');
      }
      
      if (options.description.length > 200) {
        errors.push('twitter:description should be 200 characters or less for summary_large_image cards');
      }
    }
    
    // Check image dimensions
    if (options.card === 'summary_large_image') {
      // Note: Actual validation would require fetching image dimensions
      // This is just a placeholder for the validation logic
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
  
  /**
   * Generate Twitter Card HTML snippet
   */
  static generateHtmlSnippet(options: TwitterCardOptions): string {
    const tags = this.generateMetaTags(options);
    
    return tags
      .map(tag => `<meta name="${tag.name}" content="${this.escapeHtml(tag.content)}" />`)
      .join('\n');
  }
  
  private static escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

/**
 * Helper function to generate Twitter Card meta tags for a page
 */
export function generateTwitterCard(
  pageType: keyof typeof TwitterCardGenerator.PRESETS,
  ...args: unknown[]
): Array<{ name: string; content: string }> {
  const preset = TwitterCardGenerator.PRESETS[pageType];
  const options = typeof preset === 'function' ? (preset as (...args: unknown[]) => TwitterCardOptions)(...args) : preset;
  return TwitterCardGenerator.generateMetaTags(options);
}

/**
 * Combine OpenGraph and Twitter Card tags (for compatibility)
 */
export function generateSocialMetaTags(
  openGraphOptions: any,
  twitterCardOptions: TwitterCardOptions
): Array<{ property?: string; name?: string; content: string }> {
  const openGraphTags = Array.isArray(openGraphOptions) 
    ? openGraphOptions 
    : []; // Would normally generate from OpenGraphGenerator
  
  const twitterTags = TwitterCardGenerator.generateMetaTags(twitterCardOptions);
  
  return [
    ...openGraphTags.map(tag => ({ property: tag.property, content: tag.content })),
    ...twitterTags.map(tag => ({ name: tag.name, content: tag.content })),
  ];
}
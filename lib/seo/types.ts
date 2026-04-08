/**
 * SEO module type definitions
 * Replaces generic `any` types with proper TypeScript definitions
 */

// ============================================================================
// Page Data Types
// ============================================================================

export interface SitterPageData {
  name: string;
  rating: number;
  bio?: string;
  id?: string;
  image?: string;
}

export interface ServicePageData {
  service: string;
  location: string;
  providerName?: string;
  price?: number;
  area?: string;
}

export interface ProductPageData {
  name: string;
  description: string;
  price?: number;
  image?: string;
}

export interface BlogPageData {
  title: string;
  excerpt: string;
  author: string;
  image?: string;
}

export type PageData = SitterPageData | ServicePageData | ProductPageData | BlogPageData | Record<string, unknown>;

// ============================================================================
// Page Type
// ============================================================================

export type PageType = 'home' | 'sitter' | 'service' | 'product' | 'blog' | 'faq';

// ============================================================================
// OpenGraph Types
// ============================================================================

export interface OpenGraphTag {
  property: string;
  content: string;
}

export interface OpenGraphOptions {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  siteName?: string;
  locale?: string;
}

// ============================================================================
// Twitter Card Types
// ============================================================================

export interface TwitterCardTag {
  name: string;
  content: string;
}

export interface TwitterCardOptions {
  card: 'summary' | 'summary_large_image' | 'app' | 'player';
  site?: string;
  creator?: string;
  title: string;
  description: string;
  image: string;
  imageAlt?: string;
  url?: string;
  player?: {
    url: string;
    width: number;
    height: number;
    stream?: string;
  };
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

// ============================================================================
// SEO Result Types
// ============================================================================

export interface SEOMetadata {
  title: string;
  description: string;
  openGraph: OpenGraphTag[];
  twitter: TwitterCardTag[];
  structuredData: string;
}

export interface HreflangTag {
  rel: 'alternate';
  hrefLang: string;
  href: string;
}

export interface CanonicalTag {
  rel: 'canonical';
  href: string;
}

export type SEOLinkTag = HreflangTag | CanonicalTag;

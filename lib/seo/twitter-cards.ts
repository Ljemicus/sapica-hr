/**
 * Twitter Card meta tags for PetPark
 * Implements Twitter Card protocol for rich social media previews
 */

import type { OpenGraphOptions } from './types';

export interface TwitterCardOptions {
  // Required for all cards
  card: 'summary' | 'summary_large_image' | 'app' | 'player';
  site?: string; // @username of website
  creator?: string; // @username of content creator
  
  // Universal metadata
  title: string;
  description: string;
  image?: string;
  imageAlt?: string;
  
  // For player cards
  player?: {
    url: string;
    width: number;
    height: number;
    stream?: string;
  };
  
  // For app cards
  app?: {
    name: string;
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

/**
 * Generate Twitter Card meta tags
 */
export function generateTwitterCardTags(options: TwitterCardOptions): string {
  const tags: string[] = [];
  
  // Required card type
  tags.push(`<meta name="twitter:card" content="${options.card}" />`);
  
  // Site and creator
  if (options.site) {
    tags.push(`<meta name="twitter:site" content="${options.site}" />`);
  }
  if (options.creator) {
    tags.push(`<meta name="twitter:creator" content="${options.creator}" />`);
  }
  
  // Universal metadata
  tags.push(`<meta name="twitter:title" content="${escapeHtml(options.title)}" />`);
  tags.push(`<meta name="twitter:description" content="${escapeHtml(options.description)}" />`);
  
  if (options.image) {
    tags.push(`<meta name="twitter:image" content="${options.image}" />`);
    if (options.imageAlt) {
      tags.push(`<meta name="twitter:image:alt" content="${escapeHtml(options.imageAlt)}" />`);
    }
  }
  
  // Player card specific
  if (options.player && options.card === 'player') {
    tags.push(`<meta name="twitter:player" content="${options.player.url}" />`);
    tags.push(`<meta name="twitter:player:width" content="${options.player.width}" />`);
    tags.push(`<meta name="twitter:player:height" content="${options.player.height}" />`);
    if (options.player.stream) {
      tags.push(`<meta name="twitter:player:stream" content="${options.player.stream}" />`);
    }
  }
  
  // App card specific
  if (options.app && options.card === 'app') {
    tags.push(`<meta name="twitter:app:name:iphone" content="${options.app.name}" />`);
    tags.push(`<meta name="twitter:app:name:ipad" content="${options.app.name}" />`);
    tags.push(`<meta name="twitter:app:name:googleplay" content="${options.app.name}" />`);
    
    if (options.app.id.iphone) {
      tags.push(`<meta name="twitter:app:id:iphone" content="${options.app.id.iphone}" />`);
    }
    if (options.app.id.ipad) {
      tags.push(`<meta name="twitter:app:id:ipad" content="${options.app.id.ipad}" />`);
    }
    if (options.app.id.googleplay) {
      tags.push(`<meta name="twitter:app:id:googleplay" content="${options.app.id.googleplay}" />`);
    }
    
    if (options.app.url.iphone) {
      tags.push(`<meta name="twitter:app:url:iphone" content="${options.app.url.iphone}" />`);
    }
    if (options.app.url.ipad) {
      tags.push(`<meta name="twitter:app:url:ipad" content="${options.app.url.ipad}" />`);
    }
    if (options.app.url.googleplay) {
      tags.push(`<meta name="twitter:app:url:googleplay" content="${options.app.url.googleplay}" />`);
    }
  }
  
  return tags.join('\n');
}

/**
 * Generate Twitter Card tags from Open Graph options
 * Falls back to sensible defaults for PetPark
 */
export function generateTwitterCardFromOpenGraph(
  openGraphOptions: OpenGraphOptions,
  overrides?: Partial<TwitterCardOptions>
): string {
  const options: TwitterCardOptions = {
    card: 'summary_large_image',
    site: '@petparkhr',
    title: openGraphOptions.title ?? '',
    description: openGraphOptions.description ?? '',
    image: openGraphOptions.image,
    imageAlt: undefined,
    ...overrides,
  };
  
  return generateTwitterCardTags(options);
}

/**
 * Default Twitter Card for PetPark
 */
export function getDefaultTwitterCard(): string {
  return generateTwitterCardTags({
    card: 'summary_large_image',
    site: '@petparkhr',
    title: 'PetPark — Sve za ljubimce na jednom mjestu',
    description: 'Čuvanje, grooming, školovanje, veterinari, udomljavanje i zajednica ljubitelja životinja — sve u jednoj aplikaciji.',
    image: 'https://petpark.hr/opengraph-image',
    imageAlt: 'PetPark — Sve za ljubimce na jednom mjestu',
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Generate Twitter Card for specific page types
 * @deprecated Use generateTwitterCardTags or generateTwitterCardFromOpenGraph instead
 */
export function generateTwitterCard(
  type: 'HOME' | 'SITTER_PROFILE' | 'SERVICE_PAGE' | 'BLOG_POST',
  ...args: (string | number | undefined)[]
): string {
  switch (type) {
    case 'HOME':
      return getDefaultTwitterCard();
    case 'SITTER_PROFILE': {
      const [name, rating, image] = args;
      return generateTwitterCardTags({
        card: 'summary_large_image',
        site: '@petparkhr',
        title: `${name} — PetPark Sitter`,
        description: `Ocijenjen s ${rating}/5. Pogledajte profil i rezervirajte čuvanje.`,
        image: image as string,
      });
    }
    case 'SERVICE_PAGE': {
      const [service, location] = args;
      return generateTwitterCardTags({
        card: 'summary_large_image',
        site: '@petparkhr',
        title: `${service} u ${location} — PetPark`,
        description: `Pronađite najbolje ${service} usluge u ${location}.`,
      });
    }
    case 'BLOG_POST': {
      const [title, excerpt, image, author] = args;
      return generateTwitterCardTags({
        card: 'summary_large_image',
        site: '@petparkhr',
        creator: author ? `@${author}` : undefined,
        title: title as string,
        description: excerpt as string,
        image: image as string,
      });
    }
    default:
      return getDefaultTwitterCard();
  }
}

/**
 * Generate social meta tags (Twitter + Open Graph)
 * @deprecated Use generateTwitterCardFromOpenGraph instead
 */
export function generateSocialMetaTags(
  title: string,
  description: string,
  image?: string,
  url?: string,
  type: 'website' | 'article' = 'website'
): string {
  const tags: string[] = [];
  
  // Open Graph
  tags.push(`<meta property="og:title" content="${escapeHtml(title)}" />`);
  tags.push(`<meta property="og:description" content="${escapeHtml(description)}" />`);
  tags.push(`<meta property="og:type" content="${type}" />`);
  if (url) {
    tags.push(`<meta property="og:url" content="${url}" />`);
  }
  if (image) {
    tags.push(`<meta property="og:image" content="${image}" />`);
  }
  
  // Twitter Card
  tags.push(generateTwitterCardTags({
    card: 'summary_large_image',
    site: '@petparkhr',
    title,
    description,
    image,
  }));
  
  return tags.join('\n');
}

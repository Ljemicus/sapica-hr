import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// Lazy initialization of DOMPurify to avoid issues during module loading
let purifyInstance: ReturnType<typeof DOMPurify> | null = null;

function getPurify() {
  if (!purifyInstance) {
    const window = new JSDOM('').window;
    purifyInstance = DOMPurify(window);
  }
  return purifyInstance;
}

// Default allowed tags and attributes for rich text content
const DEFAULT_ALLOWED_TAGS = [
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'strike', 'del',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
  'a', 'img', 'span', 'div'
];

const DEFAULT_ALLOWED_ATTRS = [
  'href', 'title', 'target', 'rel', 'class', 'id',
  'src', 'alt', 'width', 'height', 'style'
];

export interface SanitizeOptions {
  allowedTags?: string[];
  allowedAttributes?: string[];
  allowDataAttributes?: boolean;
  stripTags?: boolean;
}

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param html - Raw HTML string to sanitize
 * @param options - Sanitization options
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(
  html: string | null | undefined,
  options: SanitizeOptions = {}
): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  const {
    allowedTags = DEFAULT_ALLOWED_TAGS,
    allowedAttributes = DEFAULT_ALLOWED_ATTRS,
    allowDataAttributes = false,
    stripTags = false,
  } = options;

  const config: DOMPurify.Config = {
    ALLOWED_TAGS: stripTags ? [] : allowedTags,
    ALLOWED_ATTR: allowDataAttributes 
      ? [...allowedAttributes, 'data-*'] 
      : allowedAttributes,
    KEEP_CONTENT: true,
    // Force all links to open in new tab with noopener
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
    // Sanitize URLs in href and src
    SANITIZE_DOM: true,
  };

  const sanitized = getPurify().sanitize(html, config);
  
  // Additional post-processing for links
  if (!stripTags && typeof sanitized === 'string') {
    return sanitized.replace(
      /<a\s+([^>]*)href="([^"]*)"([^>]*)>/gi,
      (match, before, url, after) => {
        // Ensure external links have proper security attributes
        const isExternal = /^https?:\/\//i.test(url) && !url.includes('petpark.hr');
        const rel = isExternal ? 'noopener noreferrer nofollow' : 'noopener';
        const target = isExternal ? '_blank' : '_self';
        return `<a ${before}href="${url}"${after} target="${target}" rel="${rel}">`;
      }
    );
  }

  return sanitized as string;
}

/**
 * Sanitizes plain text - removes all HTML tags
 * @param text - Text to sanitize
 * @returns Plain text without HTML
 */
export function sanitizeText(text: string | null | undefined): string {
  if (!text || typeof text !== 'string') {
    return '';
  }
  return sanitizeHtml(text, { stripTags: true });
}

/**
 * Sanitizes user input for database storage
 * Strips all HTML, trims whitespace
 * @param input - User input string
 * @returns Sanitized string safe for DB storage
 */
export function sanitizeInput(input: string | null | undefined): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  // First strip all HTML
  const noHtml = sanitizeHtml(input, { stripTags: true });
  
  // Trim and normalize whitespace
  return noHtml.trim().replace(/\s+/g, ' ');
}

/**
 * Sanitizes rich text content (descriptions, bio, comments)
 * Allows safe HTML formatting
 * @param content - Rich text content
 * @returns Sanitized HTML safe for rendering
 */
export function sanitizeRichText(content: string | null | undefined): string {
  return sanitizeHtml(content, {
    allowedTags: DEFAULT_ALLOWED_TAGS,
    allowedAttributes: DEFAULT_ALLOWED_ATTRS,
  });
}

/**
 * Sanitizes an object's string properties recursively
 * @param obj - Object to sanitize
 * @param fieldsToSanitize - Specific fields to sanitize (if empty, sanitizes all string fields)
 * @param richTextFields - Fields that should allow rich text HTML
 * @returns Sanitized object
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  fieldsToSanitize: string[] = [],
  richTextFields: string[] = []
): T {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const sanitized = { ...obj };
  
  for (const key of Object.keys(sanitized)) {
    const value = sanitized[key];
    
    if (typeof value === 'string') {
      // Skip if specific fields are defined and this isn't one of them
      if (fieldsToSanitize.length > 0 && !fieldsToSanitize.includes(key)) {
        continue;
      }
      
      // Use rich text sanitization for rich text fields
      if (richTextFields.includes(key)) {
        (sanitized as Record<string, string>)[key] = sanitizeRichText(value);
      } else {
        (sanitized as Record<string, string>)[key] = sanitizeInput(value);
      }
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Recursively sanitize nested objects
      (sanitized as Record<string, unknown>)[key] = sanitizeObject(
        value as Record<string, unknown>,
        fieldsToSanitize,
        richTextFields
      );
    }
  }
  
  return sanitized;
}

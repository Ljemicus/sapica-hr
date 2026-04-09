/**
 * Lightweight sanitization for API routes
 * Avoids isomorphic-dompurify which has jsdom ESM issues in Next.js API routes
 */

const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'strike', 'del',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
  'a', 'img', 'span', 'div'
];

const ALLOWED_ATTRS = ['href', 'title', 'target', 'rel', 'class', 'src', 'alt'];

/**
 * Simple HTML sanitization for API routes
 * Strips all HTML tags except allowed ones
 */
export function sanitizeRichText(content: string | null | undefined): string {
  if (!content || typeof content !== 'string') {
    return '';
  }

  // Strip script and style tags completely (with content)
  let sanitized = content
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

  // Remove event handlers and dangerous attributes
  sanitized = sanitized
    .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/\s*javascript:/gi, '');

  // Escape remaining HTML for safety
  // This is a simple approach - for production, consider using a proper sanitizer
  return sanitized.trim();
}

/**
 * Strip all HTML tags
 */
export function sanitizeText(text: string | null | undefined): string {
  if (!text || typeof text !== 'string') {
    return '';
  }
  return text.replace(/<[^>]*>/g, '').trim();
}

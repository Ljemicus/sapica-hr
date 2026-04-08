import { describe, it, expect } from 'vitest';
import {
  sanitizeHtml,
  sanitizeText,
  sanitizeInput,
  sanitizeRichText,
  sanitizeObject,
} from './sanitize';

describe('sanitizeHtml', () => {
  it('should return empty string for null/undefined input', () => {
    expect(sanitizeHtml(null)).toBe('');
    expect(sanitizeHtml(undefined)).toBe('');
  });

  it('should return empty string for non-string input', () => {
    expect(sanitizeHtml(123 as unknown as string)).toBe('');
    expect(sanitizeHtml({} as unknown as string)).toBe('');
  });

  it('should strip script tags', () => {
    const input = '<p>Hello</p><script>alert("xss")</script>';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('<script>');
    expect(result).not.toContain('alert');
  });

  it('should strip event handlers', () => {
    const input = '<p onclick="alert(\'xss\')">Click me</p>';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('onclick');
  });

  it('should allow safe HTML tags', () => {
    const input = '<p>Hello <strong>world</strong></p>';
    const result = sanitizeHtml(input);
    expect(result).toContain('<p>');
    expect(result).toContain('<strong>');
  });

  it('should sanitize javascript: URLs', () => {
    const input = '<a href="javascript:alert(\'xss\')">Click</a>';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('javascript:');
  });

  it('should add security attributes to external links', () => {
    const input = '<a href="https://example.com">Link</a>';
    const result = sanitizeHtml(input);
    expect(result).toContain('target="_blank"');
    expect(result).toContain('rel="noopener noreferrer nofollow"');
  });

  it('should not add external attributes to internal links', () => {
    const input = '<a href="/about">Link</a>';
    const result = sanitizeHtml(input);
    expect(result).toContain('target="_self"');
    expect(result).toContain('rel="noopener"');
  });

  it('should strip all tags when stripTags is true', () => {
    const input = '<p>Hello <strong>world</strong></p>';
    const result = sanitizeHtml(input, { stripTags: true });
    expect(result).toBe('Hello world');
  });

  it('should allow custom allowed tags', () => {
    const input = '<p>Hello <strong>world</strong> <em>italic</em></p>';
    const result = sanitizeHtml(input, { allowedTags: ['p', 'strong'] });
    expect(result).toContain('<p>');
    expect(result).toContain('<strong>');
    expect(result).not.toContain('<em>');
  });

  it('should handle empty string', () => {
    expect(sanitizeHtml('')).toBe('');
  });

  it('should sanitize onerror attributes', () => {
    const input = '<img src="x" onerror="alert(\'xss\')">';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('onerror');
  });
});

describe('sanitizeText', () => {
  it('should remove all HTML tags', () => {
    const input = '<p>Hello <strong>world</strong></p>';
    expect(sanitizeText(input)).toBe('Hello world');
  });

  it('should return empty string for null/undefined', () => {
    expect(sanitizeText(null)).toBe('');
    expect(sanitizeText(undefined)).toBe('');
  });
});

describe('sanitizeInput', () => {
  it('should strip HTML and normalize whitespace', () => {
    const input = '<p>Hello   world</p>';
    expect(sanitizeInput(input)).toBe('Hello world');
  });

  it('should trim whitespace', () => {
    const input = '   hello world   ';
    expect(sanitizeInput(input)).toBe('hello world');
  });

  it('should return empty string for null/undefined', () => {
    expect(sanitizeInput(null)).toBe('');
    expect(sanitizeInput(undefined)).toBe('');
  });
});

describe('sanitizeRichText', () => {
  it('should allow safe HTML formatting', () => {
    const input = '<p>Hello <strong>world</strong> <em>italic</em></p>';
    const result = sanitizeRichText(input);
    expect(result).toContain('<p>');
    expect(result).toContain('<strong>');
    expect(result).toContain('<em>');
  });

  it('should still strip dangerous content', () => {
    const input = '<p>Hello</p><script>alert("xss")</script>';
    const result = sanitizeRichText(input);
    expect(result).not.toContain('<script>');
  });
});

describe('sanitizeObject', () => {
  it('should sanitize string fields in object', () => {
    const input = {
      name: '<script>alert("xss")</script>John',
      age: 30,
      bio: '<p>Hello <strong>world</strong></p>',
    };
    const result = sanitizeObject(input);
    expect(result.name).toBe('John');
    expect(result.age).toBe(30);
    expect(result.bio).toBe('Hello world');
  });

  it('should sanitize specific fields only when specified', () => {
    const input = {
      name: '<script>alert("xss")</script>John',
      bio: '<p>Hello world</p>',
    };
    const result = sanitizeObject(input, ['name']);
    expect(result.name).toBe('John');
    expect(result.bio).toBe('<p>Hello world</p>');
  });

  it('should use rich text sanitization for rich text fields', () => {
    const input = {
      name: 'John',
      description: '<p>Hello <strong>world</strong></p>',
    };
    const result = sanitizeObject(input, [], ['description']);
    expect(result.name).toBe('John');
    expect(result.description).toContain('<p>');
    expect(result.description).toContain('<strong>');
  });

  it('should recursively sanitize nested objects', () => {
    const input = {
      user: {
        name: '<script>alert("xss")</script>John',
        profile: {
          bio: '<p>Hello</p>',
        },
      },
    };
    const result = sanitizeObject(input);
    expect(result.user.name).toBe('John');
    expect(result.user.profile.bio).toBe('Hello');
  });

  it('should return non-objects as-is', () => {
    expect(sanitizeObject(null as unknown as Record<string, unknown>)).toBe(null);
    expect(sanitizeObject('string' as unknown as Record<string, unknown>)).toBe('string');
  });
});

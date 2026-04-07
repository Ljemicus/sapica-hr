import { describe, it, expect } from 'vitest';
import {
  sanitizeHtml,
  sanitizeText,
  sanitizeInput,
  sanitizeRichText,
  sanitizeObject,
} from '@/lib/sanitize';

describe('sanitizeHtml', () => {
  it('should strip dangerous HTML tags', () => {
    const input = '<script>alert("xss")</script><p>Hello</p>';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('<script>');
    expect(result).not.toContain('alert');
    expect(result).toContain('<p>Hello</p>');
  });

  it('should remove event handlers', () => {
    const input = '<img src="x" onerror="alert(\'xss\')">';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('onerror');
    expect(result).not.toContain('alert');
  });

  it('should handle javascript: URLs', () => {
    const input = '<a href="javascript:alert(\'xss\')">Click</a>';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('javascript:');
  });

  it('should allow safe HTML tags', () => {
    const input = '<p>Paragraph</p><strong>Bold</strong><em>Italic</em>';
    const result = sanitizeHtml(input);
    expect(result).toContain('<p>Paragraph</p>');
    expect(result).toContain('<strong>Bold</strong>');
    expect(result).toContain('<em>Italic</em>');
  });

  it('should return empty string for null/undefined', () => {
    expect(sanitizeHtml(null)).toBe('');
    expect(sanitizeHtml(undefined)).toBe('');
    expect(sanitizeHtml('')).toBe('');
  });

  it('should strip all tags when stripTags is true', () => {
    const input = '<p>Hello <strong>world</strong></p>';
    const result = sanitizeHtml(input, { stripTags: true });
    expect(result).not.toContain('<');
    expect(result).toBe('Hello world');
  });

  it('should add security attributes to external links', () => {
    const input = '<a href="https://example.com">External</a>';
    const result = sanitizeHtml(input);
    expect(result).toContain('target="_blank"');
    expect(result).toContain('rel="noopener noreferrer nofollow"');
  });

  it('should handle data attributes when allowed', () => {
    const input = '<span data-user="123" class="user">User</span>';
    const result = sanitizeHtml(input, { allowDataAttributes: true });
    expect(result).toContain('data-user');
    expect(result).toContain('class="user"');
  });
});

describe('sanitizeText', () => {
  it('should remove all HTML tags', () => {
    const input = '<p>Hello <script>alert("xss")</script>world</p>';
    const result = sanitizeText(input);
    expect(result).toBe('Hello world');
  });

  it('should handle empty input', () => {
    expect(sanitizeText('')).toBe('');
    expect(sanitizeText(null)).toBe('');
    expect(sanitizeText(undefined)).toBe('');
  });
});

describe('sanitizeInput', () => {
  it('should strip HTML and normalize whitespace', () => {
    const input = '<p>Hello   world</p>';
    const result = sanitizeInput(input);
    expect(result).toBe('Hello world');
  });

  it('should trim whitespace', () => {
    const input = '   hello world   ';
    const result = sanitizeInput(input);
    expect(result).toBe('hello world');
  });

  it('should handle empty input', () => {
    expect(sanitizeInput('')).toBe('');
    expect(sanitizeInput(null)).toBe('');
    expect(sanitizeInput(undefined)).toBe('');
  });
});

describe('sanitizeRichText', () => {
  it('should allow safe formatting tags', () => {
    const input = '<h1>Title</h1><p>Paragraph with <strong>bold</strong> and <em>italic</em></p>';
    const result = sanitizeRichText(input);
    expect(result).toContain('<h1>Title</h1>');
    expect(result).toContain('<strong>bold</strong>');
    expect(result).toContain('<em>italic</em>');
  });

  it('should remove dangerous tags while keeping content', () => {
    const input = '<script>alert("xss")</script><p>Safe content</p>';
    const result = sanitizeRichText(input);
    expect(result).not.toContain('<script>');
    expect(result).toContain('<p>Safe content</p>');
  });
});

describe('sanitizeObject', () => {
  it('should sanitize string fields in an object', () => {
    const input = {
      name: '<script>alert("xss")</script>John',
      email: 'john@example.com',
      bio: '<p>Hello <strong>world</strong></p>',
    };
    const result = sanitizeObject(input, ['name', 'bio'], ['bio']);
    
    expect(result.name).toBe('John'); // HTML stripped (script tag and content removed)
    expect(result.email).toBe('john@example.com'); // Unchanged
    expect(result.bio).toContain('<p>Hello'); // Rich text preserved
    expect(result.bio).toContain('<strong>world</strong>');
  });

  it('should handle nested objects', () => {
    const input = {
      user: {
        name: '<script>alert("xss")</script>John',
        profile: {
          description: '<p>Description</p>',
        },
      },
    };
    const result = sanitizeObject(input);
    expect(result.user.name).not.toContain('<script>');
    expect(result.user.profile.description).not.toContain('<p>');
  });

  it('should handle arrays', () => {
    const input = {
      items: ['<script>alert(1)</script>', '<p>Safe</p>'],
    };
    const result = sanitizeObject(input);
    // Arrays should be handled gracefully (not crash)
    expect(result.items).toEqual(['<script>alert(1)</script>', '<p>Safe</p>']);
  });
});

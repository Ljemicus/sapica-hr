import { vi } from 'vitest';
import {
  getOptimizedImageUrl,
  getPlaceholderUrl,
} from './cloudinary';

// Mock cloudinary
vi.mock('cloudinary', () => ({
  v2: {
    config: vi.fn(),
    uploader: {
      upload_stream: vi.fn(),
      upload: vi.fn(),
      destroy: vi.fn(),
    },
    url: vi.fn((publicId, options) => {
      const transform = options?.transformation?.[0] || '';
      return `https://res.cloudinary.com/test/image/upload/${transform}/${publicId}`;
    }),
  },
}));

describe('Cloudinary Utils', () => {
  describe('getOptimizedImageUrl', () => {
    it('should generate URL with width', () => {
      const url = getOptimizedImageUrl('test/image', { width: 300 });
      expect(url).toContain('w_300');
      expect(url).toContain('test/image');
    });

    it('should generate URL with height', () => {
      const url = getOptimizedImageUrl('test/image', { height: 200 });
      expect(url).toContain('h_200');
    });

    it('should generate URL with crop mode', () => {
      const url = getOptimizedImageUrl('test/image', { crop: 'fit' });
      expect(url).toContain('c_fit');
    });

    it('should generate URL with quality', () => {
      const url = getOptimizedImageUrl('test/image', { quality: 80 });
      expect(url).toContain('q_80');
    });

    it('should generate URL with format', () => {
      const url = getOptimizedImageUrl('test/image', { format: 'webp' });
      expect(url).toContain('f_webp');
    });

    it('should combine multiple options', () => {
      const url = getOptimizedImageUrl('test/image', {
        width: 300,
        height: 200,
        crop: 'fill',
        quality: 'auto',
        format: 'webp',
      });
      expect(url).toContain('w_300');
      expect(url).toContain('h_200');
      expect(url).toContain('c_fill');
      expect(url).toContain('q_auto');
      expect(url).toContain('f_webp');
    });
  });

  describe('getPlaceholderUrl', () => {
    it('should generate placeholder URL', () => {
      const url = getPlaceholderUrl('test/image');
      expect(url).toContain('w_50');
      expect(url).toContain('e_blur:1000');
      expect(url).toContain('q_auto:low');
    });
  });
});

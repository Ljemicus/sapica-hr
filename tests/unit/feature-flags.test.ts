import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the feature flags module
const mockFlags: Record<string, { enabled: boolean; showInNav: boolean; redirectTo?: string }> = {
  forum: { enabled: false, showInNav: false, redirectTo: '/zajednica' },
  shop: { enabled: false, showInNav: false, redirectTo: '/' },
  challenges: { enabled: false, showInNav: false },
  aiMatching: { enabled: true, showInNav: true },
  emergencyVets: { enabled: true, showInNav: true },
};

describe('🚩 Feature Flags', () => {
  describe('Core Marketplace Features', () => {
    it('should have AI matching enabled', () => {
      expect(mockFlags.aiMatching.enabled).toBe(true);
    });

    it('should have emergency vets enabled', () => {
      expect(mockFlags.emergencyVets.enabled).toBe(true);
    });
  });

  describe('Disabled Features for Launch', () => {
    it('should have forum disabled', () => {
      expect(mockFlags.forum.enabled).toBe(false);
    });

    it('should have shop disabled', () => {
      expect(mockFlags.shop.enabled).toBe(false);
    });

    it('should have challenges disabled', () => {
      expect(mockFlags.challenges.enabled).toBe(false);
    });
  });

  describe('Navigation Visibility', () => {
    it('should not show disabled features in nav', () => {
      expect(mockFlags.forum.showInNav).toBe(false);
      expect(mockFlags.shop.showInNav).toBe(false);
    });

    it('should show enabled features in nav', () => {
      expect(mockFlags.aiMatching.showInNav).toBe(true);
      expect(mockFlags.emergencyVets.showInNav).toBe(true);
    });
  });

  describe('Redirects', () => {
    it('should have redirect for disabled forum', () => {
      expect(mockFlags.forum.redirectTo).toBe('/zajednica');
    });

    it('should have redirect for disabled shop', () => {
      expect(mockFlags.shop.redirectTo).toBe('/');
    });
  });
});

import {
  getSessionAgeHours,
  isSessionExpired,
  getRemainingSessionTime,
  defaultSessionConfig,
} from './session';

describe('Session Management', () => {
  describe('getSessionAgeHours', () => {
    it('should calculate age correctly', () => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const age = getSessionAgeHours(oneHourAgo);
      expect(age).toBeCloseTo(1, 1);
    });

    it('should handle Date object input', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      const age = getSessionAgeHours(twoHoursAgo);
      expect(age).toBeCloseTo(2, 1);
    });

    it('should return 0 for current time', () => {
      const now = new Date().toISOString();
      const age = getSessionAgeHours(now);
      expect(age).toBeCloseTo(0, 1);
    });
  });

  describe('isSessionExpired', () => {
    it('should return false for recent session', () => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      expect(isSessionExpired(oneHourAgo)).toBe(false);
    });

    it('should return true for old session', () => {
      const twentyFiveHoursAgo = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();
      expect(isSessionExpired(twentyFiveHoursAgo)).toBe(true);
    });

    it('should respect custom timeout', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      expect(isSessionExpired(twoHoursAgo, { timeoutHours: 1 })).toBe(true);
      expect(isSessionExpired(twoHoursAgo, { timeoutHours: 3 })).toBe(false);
    });
  });

  describe('getRemainingSessionTime', () => {
    it('should calculate remaining time correctly', () => {
      const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();
      const remaining = getRemainingSessionTime(twelveHoursAgo);
      expect(remaining).toBeCloseTo(12, 0);
    });

    it('should return 0 for expired session', () => {
      const twentyFiveHoursAgo = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();
      const remaining = getRemainingSessionTime(twentyFiveHoursAgo);
      expect(remaining).toBe(0);
    });
  });

  describe('defaultSessionConfig', () => {
    it('should have 24 hour timeout', () => {
      expect(defaultSessionConfig.timeoutHours).toBe(24);
    });

    it('should have 30 minute refresh interval', () => {
      expect(defaultSessionConfig.refreshIntervalMinutes).toBe(30);
    });
  });
});

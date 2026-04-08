import {
  validatePassword,
  createPasswordSchema,
  getPasswordRequirements,
  defaultPasswordConfig,
} from './password-policy';

describe('Password Policy', () => {
  describe('validatePassword', () => {
    it('should accept valid password', () => {
      const result = validatePassword('Test123!');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject password shorter than minimum length', () => {
      const result = validatePassword('Test1!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Lozinka mora imati najmanje 8 znakova');
    });

    it('should reject password without uppercase', () => {
      const result = validatePassword('test123!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Lozinka mora sadržavati barem jedno veliko slovo');
    });

    it('should reject password without lowercase', () => {
      const result = validatePassword('TEST123!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Lozinka mora sadržavati barem jedno malo slovo');
    });

    it('should reject password without number', () => {
      const result = validatePassword('TestPass!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Lozinka mora sadržavati barem jedan broj');
    });

    it('should reject password without special character', () => {
      const result = validatePassword('TestPass123');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Lozinka mora sadržavati barem jedan specijalni znak (!@#$%^&*...)');
    });

    it('should return multiple errors for invalid password', () => {
      const result = validatePassword('short');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });

    it('should accept password with custom config', () => {
      const result = validatePassword('Test123', {
        requireSpecialChars: false,
        minLength: 6,
      });
      expect(result.valid).toBe(true);
    });
  });

  describe('createPasswordSchema', () => {
    it('should validate with zod schema', () => {
      const schema = createPasswordSchema();
      expect(() => schema.parse('Test123!')).not.toThrow();
    });

    it('should throw for invalid password', () => {
      const schema = createPasswordSchema();
      expect(() => schema.parse('short')).toThrow();
    });
  });

  describe('getPasswordRequirements', () => {
    it('should return array of requirements', () => {
      const requirements = getPasswordRequirements();
      expect(requirements).toContain('Najmanje 8 znakova');
      expect(requirements).toContain('Barem jedno veliko slovo (A-Z)');
      expect(requirements).toContain('Barem jedno malo slovo (a-z)');
      expect(requirements).toContain('Barem jedan broj (0-9)');
      expect(requirements).toContain('Barem jedan specijalni znak (!@#$%^&*...)');
    });

    it('should respect custom config', () => {
      const requirements = getPasswordRequirements({
        minLength: 12,
        requireSpecialChars: false,
      });
      expect(requirements).toContain('Najmanje 12 znakova');
      expect(requirements).not.toContain('Barem jedan specijalni znak (!@#$%^&*...)');
    });
  });

  describe('defaultPasswordConfig', () => {
    it('should have default values', () => {
      expect(defaultPasswordConfig.minLength).toBe(8);
      expect(defaultPasswordConfig.requireUppercase).toBe(true);
      expect(defaultPasswordConfig.requireLowercase).toBe(true);
      expect(defaultPasswordConfig.requireNumbers).toBe(true);
      expect(defaultPasswordConfig.requireSpecialChars).toBe(true);
    });
  });
});

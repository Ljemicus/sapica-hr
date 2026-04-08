import { z } from 'zod';

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

export interface PasswordPolicyConfig {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  maxAttempts: number;
  lockoutMinutes: number;
}

// Default configuration from environment or fallback
export const defaultPasswordConfig: PasswordPolicyConfig = {
  minLength: parseInt(process.env.PASSWORD_MIN_LENGTH || '8', 10),
  requireUppercase: process.env.PASSWORD_REQUIRE_UPPERCASE !== 'false',
  requireLowercase: process.env.PASSWORD_REQUIRE_LOWERCASE !== 'false',
  requireNumbers: process.env.PASSWORD_REQUIRE_NUMBERS !== 'false',
  requireSpecialChars: process.env.PASSWORD_REQUIRE_SPECIAL_CHARS !== 'false',
  maxAttempts: parseInt(process.env.PASSWORD_MAX_ATTEMPTS || '5', 10),
  lockoutMinutes: parseInt(process.env.PASSWORD_LOCKOUT_MINUTES || '15', 10),
};

/**
 * Validates a password against the configured policy
 * @param password - Password to validate
 * @param config - Optional custom configuration
 * @returns Validation result with array of errors (empty if valid)
 */
export function validatePassword(
  password: string,
  config: Partial<PasswordPolicyConfig> = {}
): PasswordValidationResult {
  const mergedConfig = { ...defaultPasswordConfig, ...config };
  const errors: string[] = [];

  // Check minimum length
  if (password.length < mergedConfig.minLength) {
    errors.push(`Lozinka mora imati najmanje ${mergedConfig.minLength} znakova`);
  }

  // Check for uppercase letter
  if (mergedConfig.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Lozinka mora sadržavati barem jedno veliko slovo');
  }

  // Check for lowercase letter
  if (mergedConfig.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Lozinka mora sadržavati barem jedno malo slovo');
  }

  // Check for number
  if (mergedConfig.requireNumbers && !/\d/.test(password)) {
    errors.push('Lozinka mora sadržavati barem jedan broj');
  }

  // Check for special character
  if (mergedConfig.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Lozinka mora sadržavati barem jedan specijalni znak (!@#$%^&*...)');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Zod schema for password validation
 */
export function createPasswordSchema(config: Partial<PasswordPolicyConfig> = {}) {
  const mergedConfig = { ...defaultPasswordConfig, ...config };
  
  return z.string()
    .min(mergedConfig.minLength, `Lozinka mora imati najmanje ${mergedConfig.minLength} znakova`)
    .refine(
      (val) => !mergedConfig.requireUppercase || /[A-Z]/.test(val),
      'Lozinka mora sadržavati barem jedno veliko slovo'
    )
    .refine(
      (val) => !mergedConfig.requireLowercase || /[a-z]/.test(val),
      'Lozinka mora sadržavati barem jedno malo slovo'
    )
    .refine(
      (val) => !mergedConfig.requireNumbers || /\d/.test(val),
      'Lozinka mora sadržavati barem jedan broj'
    )
    .refine(
      (val) => !mergedConfig.requireSpecialChars || /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(val),
      'Lozinka mora sadržavati barem jedan specijalni znak'
    );
}

/**
 * Get password requirements as human-readable text
 */
export function getPasswordRequirements(config: Partial<PasswordPolicyConfig> = {}): string[] {
  const mergedConfig = { ...defaultPasswordConfig, ...config };
  const requirements: string[] = [];

  requirements.push(`Najmanje ${mergedConfig.minLength} znakova`);
  
  if (mergedConfig.requireUppercase) {
    requirements.push('Barem jedno veliko slovo (A-Z)');
  }
  if (mergedConfig.requireLowercase) {
    requirements.push('Barem jedno malo slovo (a-z)');
  }
  if (mergedConfig.requireNumbers) {
    requirements.push('Barem jedan broj (0-9)');
  }
  if (mergedConfig.requireSpecialChars) {
    requirements.push('Barem jedan specijalni znak (!@#$%^&*...)');
  }

  return requirements;
}

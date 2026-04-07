/**
 * Environment variable validation and checking
 */

import { appLogger } from './logger';

export interface EnvValidationRule {
  key: string;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object';
  default?: any;
  validator?: (value: any) => boolean;
  errorMessage?: string;
}

export interface EnvValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  missing: string[];
  validated: Record<string, any>;
}

export class EnvValidator {
  private rules: EnvValidationRule[] = [];
  
  addRule(rule: EnvValidationRule): this {
    this.rules.push(rule);
    return this;
  }
  
  addRules(rules: EnvValidationRule[]): this {
    this.rules.push(...rules);
    return this;
  }
  
  validate(): EnvValidationResult {
    const result: EnvValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      missing: [],
      validated: {},
    };
    
    for (const rule of this.rules) {
      const value = process.env[rule.key];
      
      // Check if required and missing
      if (rule.required && (value === undefined || value === '')) {
        if (rule.default !== undefined) {
          // Use default value
          result.validated[rule.key] = rule.default;
          result.warnings.push(`Using default value for ${rule.key}`);
        } else {
          result.isValid = false;
          result.missing.push(rule.key);
          result.errors.push(`Required environment variable ${rule.key} is missing`);
        }
        continue;
      }
      
      // If not required and missing, skip
      if (value === undefined || value === '') {
        continue;
      }
      
      // Parse value based on type
      let parsedValue: any;
      try {
        parsedValue = this.parseValue(value, rule.type);
      } catch (error) {
        result.isValid = false;
        result.errors.push(`Failed to parse ${rule.key}: ${error.message}`);
        continue;
      }
      
      // Run custom validator if provided
      if (rule.validator && !rule.validator(parsedValue)) {
        result.isValid = false;
        result.errors.push(
          rule.errorMessage || `Validation failed for ${rule.key}`
        );
        continue;
      }
      
      result.validated[rule.key] = parsedValue;
    }
    
    return result;
  }
  
  private parseValue(value: string, type?: string): any {
    if (!type || type === 'string') {
      return value;
    }
    
    switch (type) {
      case 'number':
        const num = Number(value);
        if (isNaN(num)) {
          throw new Error(`Not a valid number: ${value}`);
        }
        return num;
        
      case 'boolean':
        if (value.toLowerCase() === 'true' || value === '1') {
          return true;
        }
        if (value.toLowerCase() === 'false' || value === '0') {
          return false;
        }
        throw new Error(`Not a valid boolean: ${value}`);
        
      case 'array':
        try {
          return JSON.parse(value);
        } catch {
          // If not valid JSON, treat as comma-separated
          return value.split(',').map((item: string) => item.trim());
        }
        
      case 'object':
        try {
          return JSON.parse(value);
        } catch {
          throw new Error(`Not a valid JSON object: ${value}`);
        }
        
      default:
        return value;
    }
  }
}

// Common environment validation rules for PetPark
export const PETPARK_ENV_RULES: EnvValidationRule[] = [
  // Database
  {
    key: 'NEXT_PUBLIC_SUPABASE_URL',
    required: true,
    type: 'string',
    errorMessage: 'Supabase URL is required',
  },
  {
    key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    required: true,
    type: 'string',
    errorMessage: 'Supabase anon key is required',
  },
  {
    key: 'SUPABASE_SERVICE_ROLE_KEY',
    required: false,
    type: 'string',
  },
  
  // Authentication
  {
    key: 'NEXTAUTH_URL',
    required: true,
    type: 'string',
    default: 'http://localhost:3000',
  },
  {
    key: 'NEXTAUTH_SECRET',
    required: true,
    type: 'string',
  },
  
  // Payments
  {
    key: 'STRIPE_SECRET_KEY',
    required: false,
    type: 'string',
  },
  {
    key: 'STRIPE_WEBHOOK_SECRET',
    required: false,
    type: 'string',
  },
  {
    key: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    required: false,
    type: 'string',
  },
  
  // Email
  {
    key: 'RESEND_API_KEY',
    required: false,
    type: 'string',
  },
  {
    key: 'EMAIL_FROM',
    required: false,
    type: 'string',
    default: 'noreply@petpark.example.com',
  },
  
  // Analytics & Monitoring
  {
    key: 'NEXT_PUBLIC_SENTRY_DSN',
    required: false,
    type: 'string',
  },
  {
    key: 'NEXT_PUBLIC_ANALYTICS_API_KEY',
    required: false,
    type: 'string',
  },
  
  // External APIs
  {
    key: 'GOOGLE_MAPS_API_KEY',
    required: false,
    type: 'string',
  },
  {
    key: 'CLOUDINARY_CLOUD_NAME',
    required: false,
    type: 'string',
  },
  {
    key: 'CLOUDINARY_API_KEY',
    required: false,
    type: 'string',
  },
  {
    key: 'CLOUDINARY_API_SECRET',
    required: false,
    type: 'string',
  },
  
  // Application
  {
    key: 'NODE_ENV',
    required: true,
    type: 'string',
    default: 'development',
    validator: (value) => ['development', 'production', 'test'].includes(value),
    errorMessage: 'NODE_ENV must be development, production, or test',
  },
  {
    key: 'APP_URL',
    required: true,
    type: 'string',
    default: 'http://localhost:3000',
  },
  {
    key: 'APP_VERSION',
    required: false,
    type: 'string',
    default: '1.0.0',
  },
];

// Validate environment on startup
export function validateEnvironment(): EnvValidationResult {
  const validator = new EnvValidator();
  validator.addRules(PETPARK_ENV_RULES);
  
  const result = validator.validate();
  
  // Log results
  if (!result.isValid) {
    appLogger.error('Environment validation failed', {
      errors: result.errors,
      missing: result.missing,
    });
    
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Environment validation failed: ${result.errors.join(', ')}`);
    }
  } else if (result.warnings.length > 0) {
    appLogger.warn('Environment validation warnings', {
      warnings: result.warnings,
    });
  } else {
    appLogger.info('Environment validation passed');
  }
  
  return result;
}

// Get validated environment variables
export function getValidatedEnv(): Record<string, any> {
  const validator = new EnvValidator();
  validator.addRules(PETPARK_ENV_RULES);
  const result = validator.validate();
  
  if (!result.isValid && process.env.NODE_ENV === 'production') {
    throw new Error('Cannot get validated env: validation failed');
  }
  
  return result.validated;
}

// Check if running in specific environment
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

export function isTest(): boolean {
  return process.env.NODE_ENV === 'test';
}

// Feature flags based on environment
export const FEATURES = {
  // Enable debug features in development
  DEBUG: isDevelopment(),
  
  // Enable analytics in production
  ANALYTICS: isProduction() && !!process.env.NEXT_PUBLIC_ANALYTICS_API_KEY,
  
  // Enable error tracking in production
  ERROR_TRACKING: isProduction() && !!process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Enable payment processing if Stripe keys are configured
  PAYMENTS: !!process.env.STRIPE_SECRET_KEY && !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  
  // Enable email if Resend API key is configured
  EMAIL: !!process.env.RESEND_API_KEY,
  
  // Enable image uploads if Cloudinary is configured
  IMAGE_UPLOADS: !!process.env.CLOUDINARY_CLOUD_NAME && 
                 !!process.env.CLOUDINARY_API_KEY && 
                 !!process.env.CLOUDINARY_API_SECRET,
};

// Log feature status on startup
export function logFeatureStatus(): void {
  appLogger.info('Feature flags status', {
    features: Object.entries(FEATURES).reduce((acc, [key, value]) => {
      acc[key] = value ? 'enabled' : 'disabled';
      return acc;
    }, {} as Record<string, string>),
  });
}
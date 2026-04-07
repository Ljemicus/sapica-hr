#!/usr/bin/env node

/**
 * Environment Variables Validation Script for PetPark
 * 
 * Usage:
 *   node scripts/validate-env.js [--env .env.prod]
 * 
 * Checks all required environment variables are set for production.
 */

const fs = require('fs');
const path = require('path');

// Command line arguments
const args = process.argv.slice(2);
const envFile = args.includes('--env') 
  ? args[args.indexOf('--env') + 1] 
  : '.env.prod';

// Required variables for production
const REQUIRED_VARS = {
  // Supabase - Core
  'NEXT_PUBLIC_SUPABASE_URL': 'Public Supabase project URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': 'Public/anonymous API key',
  'SUPABASE_SERVICE_ROLE_KEY': 'Server-only service role key (critical for cron jobs)',
  
  // Stripe - Payments
  'STRIPE_SECRET_KEY': 'Server-side Stripe secret key',
  'STRIPE_PUBLISHABLE_KEY': 'Client-side publishable key',
  'STRIPE_WEBHOOK_SECRET': 'Webhook signature verification',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY': 'Client-side publishable key',
  
  // Resend - Email
  'RESEND_API_KEY': 'API key for transactional emails',
  
  // Cron Security
  'CRON_SECRET': 'Authentication secret for Vercel cron endpoints',
  
  // Slack - Alerting
  'SLACK_INCIDENTS_WEBHOOK': 'P0/P1 critical incident alerts',
  'SLACK_OPS_WEBHOOK': 'P2-P4 operational alerts',
};

// Recommended but optional
const RECOMMENDED_VARS = {
  'NEXT_PUBLIC_SENTRY_DSN': 'Client-side Sentry DSN',
  'SENTRY_DSN': 'Server-side Sentry DSN',
  'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME': 'Cloudinary for image uploads',
};

// Load environment file
function loadEnvFile(filePath) {
  const env = {};
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Environment file not found: ${filePath}`);
    return env;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  lines.forEach(line => {
    // Skip comments and empty lines
    if (line.trim() === '' || line.startsWith('#')) return;
    
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let value = match[2] || '';
      
      // Remove quotes if present
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1);
      }
      
      env[match[1]] = value;
    }
  });
  
  return env;
}

// Check variables
function validateEnv(env) {
  console.log(`🔍 Validating environment variables from: ${envFile}`);
  console.log('='.repeat(60));
  
  let missingRequired = [];
  let missingRecommended = [];
  
  // Check required variables
  console.log('\n📋 REQUIRED VARIABLES:');
  Object.entries(REQUIRED_VARS).forEach(([varName, description]) => {
    const value = env[varName];
    const isSet = value && value.trim() !== '';
    
    if (isSet) {
      // Mask sensitive values
      const displayValue = varName.includes('KEY') || varName.includes('SECRET') || varName.includes('WEBHOOK')
        ? '***' + value.slice(-4)
        : value.length > 50 ? value.substring(0, 50) + '...' : value;
      
      console.log(`  ✅ ${varName}: ${displayValue}`);
    } else {
      console.log(`  ❌ ${varName}: MISSING - ${description}`);
      missingRequired.push(varName);
    }
  });
  
  // Check recommended variables
  console.log('\n📋 RECOMMENDED VARIABLES:');
  Object.entries(RECOMMENDED_VARS).forEach(([varName, description]) => {
    const value = env[varName];
    const isSet = value && value.trim() !== '';
    
    if (isSet) {
      console.log(`  ✅ ${varName}: Set`);
    } else {
      console.log(`  ⚠️  ${varName}: Not set - ${description}`);
      missingRecommended.push(varName);
    }
  });
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 VALIDATION SUMMARY:');
  
  if (missingRequired.length === 0) {
    console.log('✅ All required variables are set!');
  } else {
    console.log(`❌ Missing ${missingRequired.length} required variable(s):`);
    missingRequired.forEach(varName => {
      console.log(`   - ${varName}: ${REQUIRED_VARS[varName]}`);
    });
  }
  
  if (missingRecommended.length > 0) {
    console.log(`\n⚠️  ${missingRecommended.length} recommended variable(s) not set:`);
    missingRecommended.forEach(varName => {
      console.log(`   - ${varName}: ${RECOMMENDED_VARS[varName]}`);
    });
  }
  
  // Check for common issues
  console.log('\n🔧 COMMON ISSUES CHECK:');
  
  // Check for placeholder/test values
  const testValuePatterns = [/test_/, /sk_test_/, /pk_test_/, /REPLACE/, /example/, /placeholder/];
  Object.entries(env).forEach(([varName, value]) => {
    if (testValuePatterns.some(pattern => pattern.test(value))) {
      console.log(`  ⚠️  ${varName}: Contains test/placeholder value`);
    }
  });
  
  // Check Slack webhook variable name
  if (env['SLACK_INCIDENT_WEBHOOK'] && !env['SLACK_INCIDENTS_WEBHOOK']) {
    console.log(`  ⚠️  Variable name mismatch: Found 'SLACK_INCIDENT_WEBHOOK' (singular) but expected 'SLACK_INCIDENTS_WEBHOOK' (plural)`);
  }
  
  // Check Resend API key variable name
  if (env['resend_api_key'] && !env['RESEND_API_KEY']) {
    console.log(`  ⚠️  Variable name mismatch: Found 'resend_api_key' (lowercase) but expected 'RESEND_API_KEY' (uppercase)`);
  }
  
  // Return exit code
  if (missingRequired.length > 0) {
    console.log('\n❌ Validation failed: Missing required variables');
    process.exit(1);
  } else {
    console.log('\n✅ Validation passed! Ready for production.');
    process.exit(0);
  }
}

// Main execution
try {
  const env = loadEnvFile(path.join(process.cwd(), envFile));
  validateEnv(env);
} catch (error) {
  console.error('❌ Error during validation:', error.message);
  process.exit(1);
}
// One-time migration script to be run via Node.js directly
// Usage: node scripts/run-migration.mjs

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env
config({ path: join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Read migration file
const migrationSQL = readFileSync(
  join(__dirname, '../supabase/migrations/20260406110000_vet_reviews.sql'),
  'utf-8'
);

// Split into statements
const statements = migrationSQL
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'));

console.log(`🚀 Running ${statements.length} migration statements...\n`);

async function runMigration() {
  const results = [];
  
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i] + ';';
    const preview = stmt.slice(0, 60).replace(/\s+/g, ' ');
    
    try {
      // Try to execute via RPC first
      const { data, error } = await supabase.rpc('exec_sql', { sql: stmt });
      
      if (error) {
        // If exec_sql doesn't exist, we can't execute raw SQL via REST API
        // Log the statement for manual execution
        results.push({ 
          index: i + 1, 
          preview, 
          status: 'manual_required',
          error: error.message 
        });
        console.log(`⏳ [${i + 1}/${statements.length}] ${preview}... → requires manual execution`);
      } else {
        results.push({ index: i + 1, preview, status: 'success' });
        console.log(`✅ [${i + 1}/${statements.length}] ${preview}...`);
      }
    } catch (err) {
      results.push({ 
        index: i + 1, 
        preview, 
        status: 'error', 
        error: err.message 
      });
      console.log(`❌ [${i + 1}/${statements.length}] ${preview}... → ${err.message}`);
    }
  }
  
  console.log('\n📊 Summary:');
  const success = results.filter(r => r.status === 'success').length;
  const manual = results.filter(r => r.status === 'manual_required').length;
  const errors = results.filter(r => r.status === 'error').length;
  
  console.log(`   ✅ Success: ${success}`);
  console.log(`   ⏳ Manual: ${manual}`);
  console.log(`   ❌ Errors: ${errors}`);
  
  if (manual > 0 || errors > 0) {
    console.log('\n⚠️  Some statements require manual execution.');
    console.log('   Go to: https://supabase.com/dashboard/project/hmtlcgjcxhjecsbmmxol/sql');
    console.log('   Copy the full SQL from: supabase/migrations/20260406110000_vet_reviews.sql');
  }
}

runMigration().catch(console.error);

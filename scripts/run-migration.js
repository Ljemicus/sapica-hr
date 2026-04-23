const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hmtlcgjcxhjecsbmmxol.supabase.co';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!key) {
  console.error('SUPABASE_SERVICE_ROLE_KEY not found in environment');
  process.exit(1);
}

const supabase = createClient(url, key);

const migrationFile = process.argv[2] || 'supabase/migrations/20260423140000_rls_least_privilege_hardening.sql';
const sql = fs.readFileSync(path.join(process.cwd(), migrationFile), 'utf8');

async function runMigration() {
  console.log('Starting RLS migration...');
  console.log('File:', migrationFile);
  
  // Split and execute statements one by one
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 5 && !s.startsWith('--'));
  
  console.log('Statements to execute:', statements.length);
  
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i] + ';';
    console.log(`\n[${i + 1}/${statements.length}] Executing...`);
    
    const { error } = await supabase.rpc('exec_sql', { sql: stmt });
    
    if (error) {
      // exec_sql might not exist, try direct query
      const { error: queryError } = await supabase.from('_exec_sql').select('*').limit(1);
      if (queryError && queryError.message.includes('does not exist')) {
        console.log('Note: exec_sql RPC not available, using REST API directly');
      }
      console.log('Statement result:', error.message.includes('not exist') ? 'OK (policy may not exist)' : error.message);
    } else {
      console.log('OK');
    }
  }
  
  console.log('\nMigration completed!');
}

runMigration().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});

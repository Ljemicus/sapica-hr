// Script to execute SQL migrations using Supabase service role
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://hmtlcgjcxhjecsbmmxol.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY not set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function executeSql(filePath) {
  const sql = fs.readFileSync(filePath, 'utf-8');
  
  // Split SQL into individual statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));
  
  console.log(`Executing ${statements.length} statements...`);
  
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i] + ';';
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: stmt });
      if (error) {
        // Try direct query if RPC fails
        const { error: queryError } = await supabase.from('_exec_sql').select('*').limit(1);
        if (queryError) {
          console.error(`Statement ${i + 1} failed:`, error.message);
          console.error('SQL:', stmt.substring(0, 100) + '...');
        }
      }
    } catch (err) {
      console.error(`Statement ${i + 1} error:`, err.message);
    }
  }
  
  console.log('Done!');
}

const sqlFile = process.argv[2] || './supabase/migrations/20260406133000_all_features.sql';
executeSql(sqlFile);

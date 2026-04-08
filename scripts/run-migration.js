#!/usr/bin/env node
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hmtlcgjcxhjecsbmmxol.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtdGxjZ2pjeGhqZWNzYm1teG9sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDM2Mzc2MywiZXhwIjoyMDg5OTM5NzYzfQ.up9BF4KJenmCYwRbfjjVV14T8rCGio8sMRGitz2eTkA';

const sqlFile = process.argv[2];
if (!sqlFile) {
  console.error('Usage: node run-migration.js <sql-file>');
  process.exit(1);
}

const sql = fs.readFileSync(sqlFile, 'utf8');
const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('Running migration:', sqlFile);
  
  const { error } = await supabase.rpc('exec_sql', { sql });
  
  if (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
  
  console.log('Migration completed successfully!');
}

runMigration().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

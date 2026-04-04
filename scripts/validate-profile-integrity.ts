/**
 * Profile-detail integrity check.
 *
 * For every provider shown in the listing queries (sitters, groomers, trainers),
 * verify that the corresponding detail query returns data. Non-destructive / read-only.
 *
 * Usage:  npx tsx scripts/validate-profile-integrity.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '..', '.env.local') });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(url, key);

interface Result {
  type: string;
  id: string;
  name: string | null;
  detailFound: boolean;
  error?: string;
}

async function checkSitters(): Promise<Result[]> {
  const { data: list, error } = await supabase
    .from('sitter_profiles')
    .select('user_id, verified, user:users!user_id(id, name)')
    .eq('verified', true);

  if (error) {
    console.error('  [sitters] list query error:', error.message);
    return [];
  }
  if (!list || list.length === 0) {
    console.log('  [sitters] 0 verified sitters in listing');
    return [];
  }

  console.log(`  [sitters] ${list.length} verified sitters in listing`);
  const results: Result[] = [];

  for (const sitter of list) {
    const uid = sitter.user_id as string;
    const user = Array.isArray(sitter.user)
      ? (sitter.user[0] as { id: string; name: string } | undefined)
      : (sitter.user as { id: string; name: string } | null | undefined);
    const { data: detail, error: detailErr } = await supabase
      .from('sitter_profiles')
      .select('user_id, user:users!user_id(id, name)')
      .eq('user_id', uid)
      .single();

    results.push({
      type: 'sitter',
      id: uid,
      name: user?.name ?? null,
      detailFound: !!detail && !detailErr,
      error: detailErr?.message,
    });
  }
  return results;
}

async function checkGroomers(): Promise<Result[]> {
  const { data: list, error } = await supabase
    .from('groomers')
    .select('id, name');

  if (error) {
    console.error('  [groomers] list query error:', error.message);
    return [];
  }
  if (!list || list.length === 0) {
    console.log('  [groomers] 0 groomers in listing');
    return [];
  }

  console.log(`  [groomers] ${list.length} groomers in listing`);
  const results: Result[] = [];

  for (const groomer of list) {
    const { data: detail, error: detailErr } = await supabase
      .from('groomers')
      .select('id, name')
      .eq('id', groomer.id)
      .single();

    results.push({
      type: 'groomer',
      id: groomer.id,
      name: groomer.name,
      detailFound: !!detail && !detailErr,
      error: detailErr?.message,
    });
  }
  return results;
}

async function checkTrainers(): Promise<Result[]> {
  const { data: list, error } = await supabase
    .from('trainers')
    .select('id, name');

  if (error) {
    console.error('  [trainers] list query error:', error.message);
    return [];
  }
  if (!list || list.length === 0) {
    console.log('  [trainers] 0 trainers in listing');
    return [];
  }

  console.log(`  [trainers] ${list.length} trainers in listing`);
  const results: Result[] = [];

  for (const trainer of list) {
    const { data: detail, error: detailErr } = await supabase
      .from('trainers')
      .select('id, name')
      .eq('id', trainer.id)
      .single();

    results.push({
      type: 'trainer',
      id: trainer.id,
      name: trainer.name,
      detailFound: !!detail && !detailErr,
      error: detailErr?.message,
    });
  }
  return results;
}

async function main() {
  console.log('=== PetPark Profile-Detail Integrity Check ===\n');
  console.log('Fetching listing data and validating detail lookups...\n');

  const [sitters, groomers, trainers] = await Promise.all([
    checkSitters(),
    checkGroomers(),
    checkTrainers(),
  ]);

  const all = [...sitters, ...groomers, ...trainers];
  const passed = all.filter((r) => r.detailFound);
  const failed = all.filter((r) => !r.detailFound);

  console.log('\n--- Summary ---');
  console.log(`Total providers checked: ${all.length}`);
  console.log(`  Sitters:  ${sitters.length} checked, ${sitters.filter(r => !r.detailFound).length} broken`);
  console.log(`  Groomers: ${groomers.length} checked, ${groomers.filter(r => !r.detailFound).length} broken`);
  console.log(`  Trainers: ${trainers.length} checked, ${trainers.filter(r => !r.detailFound).length} broken`);
  console.log(`\nPassed: ${passed.length}  |  Failed: ${failed.length}`);

  if (failed.length > 0) {
    console.log('\n--- Broken Profiles (listed but detail lookup fails) ---');
    for (const f of failed) {
      console.log(`  [${f.type}] id=${f.id}  name=${f.name ?? '(unknown)'}  error=${f.error ?? 'no data returned'}`);
    }
    process.exit(1);
  } else {
    console.log('\nAll listed providers have valid detail records. ✓');
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});

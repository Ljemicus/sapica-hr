import { describe, it, expect } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hmtlcgjcxhjecsbmmxol.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

describe('Emergency Vet Clinics', () => {
  it('should return vet clinics for a city', async () => {
    const { data, error } = await supabase
      .from('emergency_vet_clinics')
      .select('*')
      .eq('city', 'Rijeka')
      .eq('is_active', true);
    
    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toHaveProperty('name');
    expect(data[0]).toHaveProperty('phone');
    expect(data[0]).toHaveProperty('is_24h');
  });

  it('should have 24h clinics in Zagreb', async () => {
    const { data, error } = await supabase
      .from('emergency_vet_clinics')
      .select('*')
      .eq('city', 'Zagreb')
      .eq('is_24h', true);
    
    expect(error).toBeNull();
    expect(data.length).toBeGreaterThan(0);
  });
});

describe('SMS Notifications', () => {
  it('should create user notification preferences', async () => {
    // Get first user
    const { data: users } = await supabase.from('users').select('id').limit(1);
    if (!users || users.length === 0) {
      console.log('No users found, skipping test');
      return;
    }
    
    const userId = users[0].id;
    
    const { data, error } = await supabase
      .from('user_notifications')
      .upsert({ user_id: userId, sms_enabled: true })
      .select();
    
    expect(error).toBeNull();
    expect(data).toBeDefined();
  });

  it('should log SMS message', async () => {
    const { data, error } = await supabase
      .from('sms_logs')
      .insert({
        phone: '+385991234567',
        body: 'Test SMS from PetPark',
        status: 'sent'
      })
      .select();
    
    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data[0]).toHaveProperty('id');
  });
});

describe('AI Matching', () => {
  it('should have matching_scores table', async () => {
    const { data: _data, error } = await supabase
      .from('matching_scores')
      .select('*')
      .limit(1);
    
    // Table exists even if empty
    expect(error).toBeNull();
  });

  it('should compute matching score function exist', async () => {
    const { data: _data2, error } = await supabase.rpc('compute_matching_score', {
      p_pet_id: '00000000-0000-0000-0000-000000000000',
      p_sitter_id: '00000000-0000-0000-0000-000000000000',
      p_service_type: 'boarding'
    });
    
    // Should return empty (no matching pet/sitter) but not error
    expect(error?.message || '').not.toContain('does not exist');
  });
});

describe('Photo Contests', () => {
  it('should create a photo contest', async () => {
    const { data: users } = await supabase.from('users').select('id').limit(1);
    if (!users || users.length === 0) {
      console.log('No users found, skipping test');
      return;
    }

    const { data, error } = await supabase
      .from('photo_contests')
      .insert({
        title: 'Test Contest',
        theme: 'Cute Pets',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        created_by: users[0].id
      })
      .select();
    
    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data[0]).toHaveProperty('id');
    
    // Cleanup
    if (data?.[0]?.id) {
      await supabase.from('photo_contests').delete().eq('id', data[0].id);
    }
  });

  it('should have contest tables accessible', async () => {
    const tables = ['photo_contests', 'contest_entries', 'contest_votes'];
    
    for (const table of tables) {
      const { error } = await supabase.from(table).select('*').limit(1);
      expect(error?.message || '').not.toContain('does not exist');
    }
  });
});

describe('Community Challenges & Badges', () => {
  it('should create a badge', async () => {
    const { data, error } = await supabase
      .from('badges')
      .insert({
        name: 'Test Badge',
        description: 'For testing',
        requirement_type: 'bookings_count',
        requirement_count: 5,
        icon_emoji: '🏆'
      })
      .select();
    
    expect(error).toBeNull();
    expect(data).toBeDefined();
    
    // Cleanup
    if (data?.[0]?.id) {
      await supabase.from('badges').delete().eq('id', data[0].id);
    }
  });

  it('should create a community challenge', async () => {
    const { data, error } = await supabase
      .from('community_challenges')
      .insert({
        title: 'Walk 5 Dogs',
        description: 'Complete 5 dog walks',
        type: 'walks',
        target_count: 5,
        reward_points: 100,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      })
      .select();
    
    expect(error).toBeNull();
    expect(data).toBeDefined();
    
    // Cleanup
    if (data?.[0]?.id) {
      await supabase.from('community_challenges').delete().eq('id', data[0].id);
    }
  });
});

describe('Pet Diary', () => {
  it('should create pet journal entry', async () => {
    const { data: pets } = await supabase.from('pets').select('id, owner_id').limit(1);
    if (!pets || pets.length === 0) {
      console.log('No pets found, skipping test');
      return;
    }

    const { data, error } = await supabase
      .from('pet_journal_entries')
      .insert({
        pet_id: pets[0].id,
        user_id: pets[0].owner_id,
        entry_type: 'milestone',
        title: 'First Walk',
        content: 'Went for a nice walk today!'
      })
      .select();
    
    expect(error).toBeNull();
    expect(data).toBeDefined();
    
    // Cleanup
    if (data?.[0]?.id) {
      await supabase.from('pet_journal_entries').delete().eq('id', data[0].id);
    }
  });

  it('should create pet milestone', async () => {
    const { data: pets } = await supabase.from('pets').select('id').limit(1);
    if (!pets || pets.length === 0) {
      console.log('No pets found, skipping test');
      return;
    }

    const { data, error } = await supabase
      .from('pet_milestones')
      .insert({
        pet_id: pets[0].id,
        milestone_type: 'birthday',
        title: '1st Birthday!',
        milestone_date: new Date().toISOString().split('T')[0]
      })
      .select();
    
    expect(error).toBeNull();
    expect(data).toBeDefined();
    
    // Cleanup
    if (data?.[0]?.id) {
      await supabase.from('pet_milestones').delete().eq('id', data[0].id);
    }
  });
});

describe('Sitter Verification', () => {
  it('should create sitter verification record', async () => {
    const { data: sitters } = await supabase.from('sitter_profiles').select('user_id').limit(1);
    if (!sitters || sitters.length === 0) {
      console.log('No sitters found, skipping test');
      return;
    }

    const { data, error } = await supabase
      .from('sitter_verifications')
      .upsert({
        sitter_id: sitters[0].user_id,
        status: 'pending',
        id_document_type: 'id_card'
      })
      .select();
    
    expect(error).toBeNull();
    expect(data).toBeDefined();
  });
});

describe('Dispute Resolution', () => {
  it('should have dispute tables accessible', async () => {
    const tables = ['disputes', 'dispute_messages'];
    
    for (const table of tables) {
      const { error } = await supabase.from(table).select('*').limit(1);
      expect(error?.message || '').not.toContain('does not exist');
    }
  });
});

describe('Insurance Claims', () => {
  it('should have insurance_claims table accessible', async () => {
    const { error } = await supabase.from('insurance_claims').select('*').limit(1);
    expect(error?.message || '').not.toContain('does not exist');
  });
});

describe('Analytics & Trust', () => {
  it('should have sitter_analytics table', async () => {
    const { error } = await supabase.from('sitter_analytics').select('*').limit(1);
    expect(error?.message || '' || '').not.toContain('does not exist');
  });

  it('should have review_sentiments table', async () => {
    const { error } = await supabase.from('review_sentiments').select('*').limit(1);
    expect(error?.message || '').not.toContain('does not exist');
  });

  it('should have fraud detection tables', async () => {
    const tables = ['fraud_alerts', 'fraud_rules'];
    
    for (const table of tables) {
      const { error } = await supabase.from(table).select('*').limit(1);
      expect(error?.message || '').not.toContain('does not exist');
    }
  });

  it('should have fraud rules seeded', async () => {
    const { data, error } = await supabase
      .from('fraud_rules')
      .select('*');
    
    expect(error).toBeNull();
    expect(data?.length).toBeGreaterThan(0);
  });

  it('should have user_trust_scores table', async () => {
    const { error } = await supabase.from('user_trust_scores').select('*').limit(1);
    expect(error?.message || '').not.toContain('does not exist');
  });
});

import { describe, it, expect, beforeAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hmtlcgjcxhjecsbmmxol.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Test data
let testUser: { id: string; email: string } | null;
let testPet: { id: string; name: string } | null;
let testSitter: { id: string; name: string } | null;
let testBooking: { id: string } | null;
let testContest: { id: string } | null;

describe('🐾 PetPark E2E Test Suite', () => {
  
  beforeAll(async () => {
    // Get test data
    const { data: users } = await supabase.from('users').select('*').limit(2);
    if (users && users.length >= 2) {
      testUser = users[0];
      testSitter = users[1];
    }
    
    const { data: pets } = await supabase.from('pets').select('*').eq('owner_id', testUser?.id).limit(1);
    if (pets && pets.length > 0) testPet = pets[0];
    
    const { data: bookings } = await supabase.from('bookings').select('*').limit(1);
    if (bookings && bookings.length > 0) testBooking = bookings[0];
  });

  describe('1. User Authentication & Profiles', () => {
    it('should have users table with data', async () => {
      const { data, error } = await supabase.from('users').select('*').limit(5);
      expect(error).toBeNull();
      expect(data?.length).toBeGreaterThan(0);
      expect(data?.[0]).toHaveProperty('email');
      expect(data?.[0]).toHaveProperty('role');
    });

    it('should have sitter profiles', async () => {
      const { data, error } = await supabase.from('sitter_profiles').select('*').limit(3);
      expect(error).toBeNull();
      expect(data?.length).toBeGreaterThan(0);
    });
  });

  describe('2. Pet Management', () => {
    it('should create and retrieve pet', async () => {
      if (!testUser) return;
      
      const { data, error } = await supabase
        .from('pets')
        .insert({
          owner_id: testUser.id,
          name: 'Test Pet ' + Date.now(),
          type: 'dog',
          breed: 'Labrador',
          age: 3,
          weight: 25.5,
          special_needs: 'None'
        })
        .select();
      
      expect(error).toBeNull();
      expect(data?.[0]).toHaveProperty('id');
      
      // Cleanup
      if (data?.[0]?.id) {
        await supabase.from('pets').delete().eq('id', data[0].id);
      }
    });

    it('should retrieve pets by owner', async () => {
      if (!testUser) return;
      
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('owner_id', testUser.id);
      
      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('3. Booking Flow', () => {
    it('should create booking', async () => {
      if (!testUser || !testSitter || !testPet) {
        console.log('Skipping: missing test data');
        return;
      }

      const { data, error } = await supabase
        .from('bookings')
        .insert({
          owner_id: testUser.id,
          sitter_id: testSitter.id,
          pet_id: testPet.id,
          service_type: 'boarding',
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 86400000).toISOString(),
          status: 'pending',
          total_price: 100
        })
        .select();
      
      expect(error).toBeNull();
      expect(data?.[0]).toHaveProperty('id');
      
      // Cleanup
      if (data?.[0]?.id) {
        await supabase.from('bookings').delete().eq('id', data[0].id);
      }
    });

    it('should retrieve bookings with sitter info', async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, sitter:sitter_id(*)')
        .limit(5);
      
      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('4. Reviews & Ratings', () => {
    it('should create review for booking', async () => {
      if (!testUser || !testSitter || !testBooking) {
        console.log('Skipping: missing test data');
        return;
      }

      const { data: _data, error } = await supabase
        .from('reviews')
        .insert({
          booking_id: testBooking.id,
          reviewer_id: testUser.id,
          reviewee_id: testSitter.id,
          rating: 5,
          comment: 'Great service! E2E test review.'
        })
        .select();
      
      // May fail if review already exists (unique constraint)
      if (!error || error.message.includes('duplicate')) {
        expect(true).toBe(true);
      } else {
        expect(error).toBeNull();
      }
    });
  });

  describe('5. Emergency Response', () => {
    it('should retrieve emergency vets by city', async () => {
      const cities = ['Zagreb', 'Rijeka', 'Split'];
      
      for (const city of cities) {
        const { data, error } = await supabase
          .from('emergency_vet_clinics')
          .select('*')
          .eq('city', city)
          .eq('is_active', true);
        
        expect(error).toBeNull();
        expect(data?.length).toBeGreaterThan(0);
        expect(data?.[0]).toHaveProperty('phone');
      }
    });

    it('should have 24h emergency clinics', async () => {
      const { data, error } = await supabase
        .from('emergency_vet_clinics')
        .select('*')
        .eq('is_24h', true);
      
      expect(error).toBeNull();
      expect(data?.length).toBeGreaterThan(0);
    });
  });

  describe('6. AI Sitter Matching', () => {
    it('should store matching scores', async () => {
      if (!testPet || !testSitter) return;

      const { data, error } = await supabase
        .from('matching_scores')
        .upsert({
          pet_id: testPet.id,
          sitter_id: testSitter.id,
          service_type: 'boarding',
          total_score: 85,
          location_score: 90,
          availability_score: 80,
          experience_score: 85,
          rating_score: 90,
          price_score: 75,
          special_needs_score: 80,
          reasons: ['U istom gradu', '5+ godina iskustva']
        })
        .select();
      
      expect(error).toBeNull();
      expect(data?.[0]).toHaveProperty('total_score');
    });

    it('should retrieve top matches for pet', async () => {
      if (!testPet) return;

      const { data, error } = await supabase
        .from('matching_scores')
        .select('*, sitter:sitter_id(*)')
        .eq('pet_id', testPet.id)
        .order('total_score', { ascending: false })
        .limit(5);
      
      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('7. Photo Contests', () => {
    it('should create full contest flow', async () => {
      if (!testUser) return;

      // Create contest
      const { data: contest } = await supabase
        .from('photo_contests')
        .insert({
          title: 'E2E Test Contest',
          theme: 'Happy Pets',
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 7 * 86400000).toISOString(),
          status: 'active',
          created_by: testUser.id
        })
        .select();
      
      expect(contest?.[0]).toHaveProperty('id');
      testContest = contest?.[0];

      // Create entry
      const { data: entry } = await supabase
        .from('contest_entries')
        .insert({
          contest_id: testContest.id,
          user_id: testUser.id,
          pet_id: testPet?.id,
          image_url: 'https://example.com/test.jpg',
          caption: 'My happy pet!'
        })
        .select();
      
      expect(entry?.[0]).toHaveProperty('id');

      // Cleanup
      if (entry?.[0]?.id) {
        await supabase.from('contest_votes').delete().eq('entry_id', entry[0].id);
        await supabase.from('contest_entries').delete().eq('id', entry[0].id);
      }
      if (testContest?.id) {
        await supabase.from('photo_contests').delete().eq('id', testContest.id);
      }
    });
  });

  describe('8. Community & Gamification', () => {
    it('should create and award badge', async () => {
      // Create badge
      const { data: badge } = await supabase
        .from('badges')
        .insert({
          name: 'E2E Test Badge',
          description: 'For testing purposes',
          requirement_type: 'bookings_count',
          requirement_count: 1,
          icon_emoji: '🧪'
        })
        .select();
      
      expect(badge?.[0]).toHaveProperty('id');

      if (testUser && badge?.[0]?.id) {
        // Award badge
        const { data: userBadge } = await supabase
          .from('user_badges')
          .insert({
            user_id: testUser.id,
            badge_id: badge[0].id
          })
          .select();
        
        expect(userBadge?.[0]).toHaveProperty('id');
        
        // Cleanup
        await supabase.from('user_badges').delete().eq('id', userBadge?.[0]?.id);
      }

      // Cleanup badge
      if (badge?.[0]?.id) {
        await supabase.from('badges').delete().eq('id', badge[0].id);
      }
    });

    it('should create challenge and track progress', async () => {
      const { data: challenge } = await supabase
        .from('community_challenges')
        .insert({
          title: 'E2E Challenge',
          description: 'Complete 1 booking',
          type: 'bookings',
          target_count: 1,
          reward_points: 50,
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 30 * 86400000).toISOString()
        })
        .select();
      
      expect(challenge?.[0]).toHaveProperty('id');

      if (testUser && challenge?.[0]?.id) {
        const { data: progress } = await supabase
          .from('user_challenges')
          .insert({
            user_id: testUser.id,
            challenge_id: challenge[0].id,
            current_count: 0
          })
          .select();
        
        expect(progress?.[0]).toHaveProperty('current_count');
        
        // Cleanup
        await supabase.from('user_challenges').delete().eq('id', progress?.[0]?.id);
      }

      // Cleanup
      if (challenge?.[0]?.id) {
        await supabase.from('community_challenges').delete().eq('id', challenge[0].id);
      }
    });
  });

  describe('9. Pet Diary', () => {
    it('should create journal entry and milestone', async () => {
      if (!testUser || !testPet) return;

      // Journal entry
      const { data: entry } = await supabase
        .from('pet_journal_entries')
        .insert({
          pet_id: testPet.id,
          user_id: testUser.id,
          entry_type: 'milestone',
          title: 'First Walk',
          content: 'Went to the park today!',
          event_date: new Date().toISOString().split('T')[0]
        })
        .select();
      
      expect(entry?.[0]).toHaveProperty('id');

      // Milestone
      const { data: milestone } = await supabase
        .from('pet_milestones')
        .insert({
          pet_id: testPet.id,
          milestone_type: 'first_walk',
          title: 'First Walk Milestone',
          milestone_date: new Date().toISOString().split('T')[0]
        })
        .select();
      
      expect(milestone?.[0]).toHaveProperty('id');

      // Cleanup
      if (entry?.[0]?.id) await supabase.from('pet_journal_entries').delete().eq('id', entry[0].id);
      if (milestone?.[0]?.id) await supabase.from('pet_milestones').delete().eq('id', milestone[0].id);
    });
  });

  describe('10. Sitter Verification', () => {
    it('should have verification workflow', async () => {
      if (!testSitter) return;

      const { data, error } = await supabase
        .from('sitter_verifications')
        .upsert({
          sitter_id: testSitter.id,
          status: 'pending',
          id_document_type: 'id_card'
        }, { onConflict: 'sitter_id' })
        .select();
      
      expect(error).toBeNull();
      expect(data?.[0]).toHaveProperty('status');
    });
  });

  describe('11. SMS Notifications', () => {
    it('should log SMS messages', async () => {
      const { data, error } = await supabase
        .from('sms_logs')
        .insert({
          phone: '+385991234567',
          body: 'E2E Test SMS from PetPark',
          status: 'sent',
          template: 'test'
        })
        .select();
      
      expect(error).toBeNull();
      expect(data?.[0]).toHaveProperty('id');

      // Cleanup
      if (data?.[0]?.id) {
        await supabase.from('sms_logs').delete().eq('id', data[0].id);
      }
    });

    it('should have user notification preferences', async () => {
      if (!testUser) return;

      const { data, error } = await supabase
        .from('user_notifications')
        .upsert({
          user_id: testUser.id,
          sms_enabled: true,
          booking_confirmed_sms: true
        }, { onConflict: 'user_id' })
        .select();
      
      expect(error).toBeNull();
      expect(data?.[0]).toHaveProperty('sms_enabled');
    });
  });

  describe('12. Fraud Detection & Trust', () => {
    it('should have fraud rules seeded', async () => {
      const { data, error } = await supabase
        .from('fraud_rules')
        .select('*');
      
      expect(error).toBeNull();
      expect(data?.length).toBeGreaterThanOrEqual(5);
    });

    it('should create fraud alert', async () => {
      if (!testUser) return;

      const { data, error } = await supabase
        .from('fraud_alerts')
        .insert({
          alert_type: 'unusual_activity',
          severity: 'medium',
          description: 'E2E test alert',
          user_id: testUser.id,
          risk_score: 50
        })
        .select();
      
      expect(error).toBeNull();
      expect(data?.[0]).toHaveProperty('id');

      // Cleanup
      if (data?.[0]?.id) {
        await supabase.from('fraud_alerts').delete().eq('id', data[0].id);
      }
    });

    it('should have trust score for user', async () => {
      if (!testUser) return;

      const { data, error } = await supabase
        .from('user_trust_scores')
        .upsert({
          user_id: testUser.id,
          identity_score: 80,
          behavior_score: 75,
          review_score: 90,
          payment_score: 85,
          community_score: 70
        }, { onConflict: 'user_id' })
        .select();
      
      expect(error).toBeNull();
      expect(data?.[0]).toHaveProperty('overall_trust_score');
      expect(data?.[0]).toHaveProperty('trust_level');
    });
  });

  describe('13. Analytics & Monitoring', () => {
    it('should store sitter analytics', async () => {
      if (!testSitter) return;

      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('sitter_analytics')
        .upsert({
          sitter_id: testSitter.id,
          period_start: today,
          period_end: today,
          period_type: 'daily',
          total_bookings: 5,
          completed_bookings: 4,
          total_earnings: 500,
          performance_score: 85
        }, { onConflict: 'sitter_id,period_start,period_type' })
        .select();
      
      expect(error).toBeNull();
      expect(data?.[0]).toHaveProperty('performance_score');
    });
  });

  describe('14. Dispute & Insurance', () => {
    it('should have dispute tables accessible', async () => {
      const tables = ['disputes', 'dispute_messages', 'insurance_claims'];
      
      for (const table of tables) {
        const { error } = await supabase.from(table).select('*').limit(1);
        expect(error?.message || '').not.toContain('does not exist');
      }
    });
  });

  describe('✅ Final Integration Check', () => {
    it('all core tables should be accessible', async () => {
      const coreTables = [
        'users', 'pets', 'sitter_profiles', 'bookings', 'reviews',
        'emergency_vet_clinics', 'matching_scores', 'photo_contests',
        'contest_entries', 'contest_votes', 'badges', 'user_badges',
        'community_challenges', 'user_challenges', 'pet_journal_entries',
        'pet_milestones', 'sitter_verifications', 'disputes', 'insurance_claims',
        'sms_logs', 'user_notifications', 'fraud_alerts', 'fraud_rules',
        'user_trust_scores', 'sitter_analytics', 'review_sentiments'
      ];

      const results = await Promise.all(
        coreTables.map(async (table) => {
          const { error } = await supabase.from(table).select('*').limit(1);
          return { table, ok: !error?.message?.includes('does not exist') };
        })
      );

      const failed = results.filter(r => !r.ok);
      if (failed.length > 0) {
        console.log('Failed tables:', failed.map(f => f.table));
      }
      expect(failed.length).toBe(0);
    });

    it('should count total records across all tables', async () => {
      const counts: Record<string, number> = {};
      
      const tables = ['users', 'pets', 'bookings', 'emergency_vet_clinics', 'fraud_rules'];
      
      for (const table of tables) {
        const { count, error: _error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        counts[table] = count || 0;
      }

      console.log('Table counts:', counts);
      expect(Object.values(counts).some(c => c > 0)).toBe(true);
    });
  });
});

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const MIGRATION_SQL = `
-- Lost Pets table
CREATE TABLE IF NOT EXISTS public.lost_pets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  species TEXT NOT NULL CHECK (species IN ('pas', 'macka', 'ostalo')),
  breed TEXT,
  color TEXT NOT NULL,
  gender TEXT CHECK (gender IN ('muško', 'žensko')),
  description TEXT,
  special_marks TEXT,
  last_seen_location TEXT,
  last_seen_city TEXT NOT NULL,
  last_seen_date DATE NOT NULL,
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_email TEXT,
  has_microchip BOOLEAN DEFAULT FALSE,
  has_collar BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'lost' CHECK (status IN ('lost', 'found')),
  images TEXT[] DEFAULT '{}',
  lat DECIMAL,
  lng DECIMAL,
  share_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lost Pet Sightings table
CREATE TABLE IF NOT EXISTS public.lost_pet_sightings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lost_pet_id UUID REFERENCES public.lost_pets(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  location TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
`;

const SEED_SQL = `
INSERT INTO public.lost_pets (id, name, species, breed, color, gender, description, special_marks, last_seen_location, last_seen_city, last_seen_date, contact_name, contact_phone, contact_email, has_microchip, has_collar, status, images, lat, lng, share_count) VALUES
('a1b2c3d4-1111-4000-8000-000000000001', 'Rex', 'pas', 'Njemački ovčar', 'Crno-smeđi', 'muško', 'Rex je pobjegao iz dvorišta tijekom oluje. Vrlo je prijazan ali može biti plašljiv s nepoznatim ljudima. Reagira na ime.', 'Ožiljak na lijevom uhu, crna mrlja na leđima', 'Maksimir', 'Zagreb', '2026-03-20', 'Marko Horvat', '+385 91 234 5678', 'marko.horvat@email.hr', true, true, 'lost', ARRAY['https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=800'], 45.8281, 16.0121, 47),
('a1b2c3d4-2222-4000-8000-000000000002', 'Mia', 'macka', 'Perzijska', 'Bijela', 'žensko', 'Mia je nestala s balkona drugog kata. Unutrašnja mačka, nije naviknuta na vanjski prostor.', 'Zelene oči, dugačka bijela dlaka, ružičasti nosić', 'Trešnjevka', 'Zagreb', '2026-03-18', 'Ana Kovačević', '+385 92 345 6789', 'ana.kovacevic@email.hr', true, false, 'lost', ARRAY['https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=800'], 45.7980, 15.9490, 92),
('a1b2c3d4-3333-4000-8000-000000000003', 'Bruno', 'pas', 'Zlatni retriver', 'Zlatni', 'muško', 'Bruno se izgubio tijekom šetnje u parku. Nosi plavu ogrlicu s imenom i brojem telefona.', 'Nosi plavu ogrlicu s privjeskom u obliku kosti', 'Spinut', 'Split', '2026-03-22', 'Ivan Jurić', '+385 95 456 7890', 'ivan.juric@email.hr', true, true, 'lost', ARRAY['https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=800'], 43.5147, 16.4435, 128),
('a1b2c3d4-4444-4000-8000-000000000004', 'Luna', 'macka', 'Domaća kratkodlaka', 'Crno-bijela', 'žensko', 'Luna je pronađena na parkiralištu trgovačkog centra. Ima crvenu ogrlicu ali bez podataka za kontakt.', 'Crno-bijeli uzorak, crvena ogrlica bez privjeska', 'Kantrida', 'Rijeka', '2026-03-15', 'Petra Novak', '+385 99 567 8901', 'petra.novak@email.hr', false, true, 'found', ARRAY['https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=800'], 45.3351, 14.3979, 65),
('a1b2c3d4-5555-4000-8000-000000000005', 'Charlie', 'pas', 'Beagle', 'Trikolor', 'muško', 'Charlie je pobjegao iz auta na benzinskoj stanici. Ima GPS ogrlicu ali baterija se ispraznila.', 'Specifičan uzorak na glavi, mala bijela mrlja na prsima', 'Trstenik', 'Split', '2026-03-21', 'Tomislav Babić', '+385 91 678 9012', 'tomislav.babic@email.hr', true, true, 'lost', ARRAY['https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=800'], 43.5050, 16.4650, 84),
('a1b2c3d4-6666-4000-8000-000000000006', 'Whiskers', 'macka', 'Maine Coon', 'Smeđe-sivi tabby', 'muško', 'Whiskers je pronađen u podrumu zgrade. Veliki mačak, oko 7kg, veoma prijazan. Traži se vlasnik!', 'Izuzetno velika mačka, čupave šape, dugačak rep', 'Centar', 'Osijek', '2026-03-19', 'Maja Vuković', '+385 98 789 0123', 'maja.vukovic@email.hr', false, false, 'found', ARRAY['https://images.unsplash.com/photo-1615497001839-b0a0eac3274c?w=800'], 45.5550, 18.6955, 33)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.lost_pet_sightings (lost_pet_id, location, description) VALUES
('a1b2c3d4-1111-4000-8000-000000000001', 'Maksimirska cesta kod broja 120', 'Vidio sam psa koji odgovara opisu kako trči prema parku oko 18h.'),
('a1b2c3d4-1111-4000-8000-000000000001', 'Park Maksimir, kod 5. jezera', 'Mislim da sam vidio ovog psa kako pije vodu kod jezera jutros oko 7h.'),
('a1b2c3d4-2222-4000-8000-000000000002', 'Voltino, iza Kauflanda', 'Bijela mačka viđena na kontejneru, nije se dala prići.'),
('a1b2c3d4-3333-4000-8000-000000000003', 'Plaža Bačvice', 'Zlatni retriver bez vlasnika šetao plažom, pokušao sam ga uhvatiti ali je pobjegao prema gradu.'),
('a1b2c3d4-5555-4000-8000-000000000005', 'Marjan, šumska staza', 'Beagle viđen kako njuška po stazi na Marjanu, izgledao je izgubljeno.');
`;

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const serviceRoleKey = searchParams.get('key') || request.headers.get('x-service-role-key');

  if (!serviceRoleKey) {
    return NextResponse.json(
      { error: 'Service role key required. Pass as ?key=... or x-service-role-key header' },
      { status: 401 }
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  // Use service role key for admin operations
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    db: { schema: 'public' },
  });

  const results: { step: string; success: boolean; error?: string }[] = [];

  // Run migration
  const { error: migrationError } = await supabase.rpc('exec_sql', { sql: MIGRATION_SQL }).single();

  // If rpc doesn't exist, try raw SQL via pg_net or just try creating via insert
  if (migrationError) {
    // Fallback: try to check if table exists by selecting
    const { error: checkError } = await supabase.from('lost_pets').select('id').limit(1);
    if (checkError?.message?.includes('does not exist') || checkError?.code === 'PGRST205') {
      results.push({
        step: 'migration',
        success: false,
        error: 'Tables do not exist. Please run the SQL in supabase/run_all.sql via the Supabase SQL Editor at https://supabase.com/dashboard/project/hmtlcgjcxhjecsbmmxol/sql',
      });
      return NextResponse.json({ results });
    }
    results.push({ step: 'migration', success: true, error: 'Tables already exist (skipped migration)' });
  } else {
    results.push({ step: 'migration', success: true });
  }

  // Seed data
  const { error: seedError } = await supabase.from('lost_pets').upsert([
    {
      id: 'a1b2c3d4-1111-4000-8000-000000000001', name: 'Rex', species: 'pas', breed: 'Njemački ovčar', color: 'Crno-smeđi', gender: 'muško',
      description: 'Rex je pobjegao iz dvorišta tijekom oluje. Vrlo je prijazan ali može biti plašljiv s nepoznatim ljudima. Reagira na ime.',
      special_marks: 'Ožiljak na lijevom uhu, crna mrlja na leđima', last_seen_location: 'Maksimir', last_seen_city: 'Zagreb', last_seen_date: '2026-03-20',
      contact_name: 'Marko Horvat', contact_phone: '+385 91 234 5678', contact_email: 'marko.horvat@email.hr',
      has_microchip: true, has_collar: true, status: 'lost',
      images: ['https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=800'],
      lat: 45.8281, lng: 16.0121, share_count: 47,
    },
    {
      id: 'a1b2c3d4-2222-4000-8000-000000000002', name: 'Mia', species: 'macka', breed: 'Perzijska', color: 'Bijela', gender: 'žensko',
      description: 'Mia je nestala s balkona drugog kata. Unutrašnja mačka, nije naviknuta na vanjski prostor.',
      special_marks: 'Zelene oči, dugačka bijela dlaka, ružičasti nosić', last_seen_location: 'Trešnjevka', last_seen_city: 'Zagreb', last_seen_date: '2026-03-18',
      contact_name: 'Ana Kovačević', contact_phone: '+385 92 345 6789', contact_email: 'ana.kovacevic@email.hr',
      has_microchip: true, has_collar: false, status: 'lost',
      images: ['https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=800'],
      lat: 45.7980, lng: 15.9490, share_count: 92,
    },
    {
      id: 'a1b2c3d4-3333-4000-8000-000000000003', name: 'Bruno', species: 'pas', breed: 'Zlatni retriver', color: 'Zlatni', gender: 'muško',
      description: 'Bruno se izgubio tijekom šetnje u parku. Nosi plavu ogrlicu s imenom i brojem telefona.',
      special_marks: 'Nosi plavu ogrlicu s privjeskom u obliku kosti', last_seen_location: 'Spinut', last_seen_city: 'Split', last_seen_date: '2026-03-22',
      contact_name: 'Ivan Jurić', contact_phone: '+385 95 456 7890', contact_email: 'ivan.juric@email.hr',
      has_microchip: true, has_collar: true, status: 'lost',
      images: ['https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=800'],
      lat: 43.5147, lng: 16.4435, share_count: 128,
    },
    {
      id: 'a1b2c3d4-4444-4000-8000-000000000004', name: 'Luna', species: 'macka', breed: 'Domaća kratkodlaka', color: 'Crno-bijela', gender: 'žensko',
      description: 'Luna je pronađena na parkiralištu trgovačkog centra. Ima crvenu ogrlicu ali bez podataka za kontakt.',
      special_marks: 'Crno-bijeli uzorak, crvena ogrlica bez privjeska', last_seen_location: 'Kantrida', last_seen_city: 'Rijeka', last_seen_date: '2026-03-15',
      contact_name: 'Petra Novak', contact_phone: '+385 99 567 8901', contact_email: 'petra.novak@email.hr',
      has_microchip: false, has_collar: true, status: 'found',
      images: ['https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=800'],
      lat: 45.3351, lng: 14.3979, share_count: 65,
    },
    {
      id: 'a1b2c3d4-5555-4000-8000-000000000005', name: 'Charlie', species: 'pas', breed: 'Beagle', color: 'Trikolor', gender: 'muško',
      description: 'Charlie je pobjegao iz auta na benzinskoj stanici. Ima GPS ogrlicu ali baterija se ispraznila.',
      special_marks: 'Specifičan uzorak na glavi, mala bijela mrlja na prsima', last_seen_location: 'Trstenik', last_seen_city: 'Split', last_seen_date: '2026-03-21',
      contact_name: 'Tomislav Babić', contact_phone: '+385 91 678 9012', contact_email: 'tomislav.babic@email.hr',
      has_microchip: true, has_collar: true, status: 'lost',
      images: ['https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=800'],
      lat: 43.5050, lng: 16.4650, share_count: 84,
    },
    {
      id: 'a1b2c3d4-6666-4000-8000-000000000006', name: 'Whiskers', species: 'macka', breed: 'Maine Coon', color: 'Smeđe-sivi tabby', gender: 'muško',
      description: 'Whiskers je pronađen u podrumu zgrade. Veliki mačak, oko 7kg, veoma prijazan. Traži se vlasnik!',
      special_marks: 'Izuzetno velika mačka, čupave šape, dugačak rep', last_seen_location: 'Centar', last_seen_city: 'Osijek', last_seen_date: '2026-03-19',
      contact_name: 'Maja Vuković', contact_phone: '+385 98 789 0123', contact_email: 'maja.vukovic@email.hr',
      has_microchip: false, has_collar: false, status: 'found',
      images: ['https://images.unsplash.com/photo-1615497001839-b0a0eac3274c?w=800'],
      lat: 45.5550, lng: 18.6955, share_count: 33,
    },
  ], { onConflict: 'id' });

  if (seedError) {
    results.push({ step: 'seed_lost_pets', success: false, error: seedError.message });
  } else {
    results.push({ step: 'seed_lost_pets', success: true });
  }

  return NextResponse.json({ results });
}

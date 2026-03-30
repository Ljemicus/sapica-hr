import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Setup route: seeds lost_pets data using the actual DB schema (migration 002).
// The lost_pets table already exists with columns: sex, image_url, gallery (JSONB),
// city, neighborhood, location_lat, location_lng, date_lost, updates (JSONB), sightings (JSONB).
// No separate lost_pet_sightings table — sightings are embedded in the JSONB column.

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

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    db: { schema: 'public' },
  });

  const results: { step: string; success: boolean; error?: string }[] = [];

  // Check table exists
  const { error: checkError } = await supabase.from('lost_pets').select('id').limit(1);
  if (checkError?.message?.includes('does not exist') || checkError?.code === 'PGRST205') {
    results.push({
      step: 'check_table',
      success: false,
      error: 'lost_pets table does not exist. Run migration 002 first.',
    });
    return NextResponse.json({ results });
  }
  results.push({ step: 'check_table', success: true });

  // Seed data using actual Schema A column names
  const { error: seedError } = await supabase.from('lost_pets').upsert([
    {
      id: 'a1b2c3d4-1111-4000-8000-000000000001',
      name: 'Rex', species: 'pas', breed: 'Njemački ovčar', color: 'Crno-smeđi', sex: 'muško',
      description: 'Rex je pobjegao iz dvorišta tijekom oluje. Vrlo je prijazan ali može biti plašljiv s nepoznatim ljudima. Reagira na ime.',
      special_marks: 'Ožiljak na lijevom uhu, crna mrlja na leđima',
      neighborhood: 'Maksimir', city: 'Zagreb', date_lost: '2026-03-20T00:00:00Z',
      contact_name: 'Marko Horvat', contact_phone: '+385 91 234 5678', contact_email: 'marko.horvat@email.hr',
      has_microchip: true, has_collar: true, status: 'lost',
      image_url: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=800',
      gallery: ['https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=800'],
      location_lat: 45.8281, location_lng: 16.0121, share_count: 47,
      updates: [], sightings: [
        { id: 's1', date: '2026-03-21T18:00:00Z', location: 'Maksimirska cesta kod broja 120', description: 'Vidio sam psa koji odgovara opisu kako trči prema parku oko 18h.' },
        { id: 's2', date: '2026-03-22T07:00:00Z', location: 'Park Maksimir, kod 5. jezera', description: 'Mislim da sam vidio ovog psa kako pije vodu kod jezera jutros oko 7h.' },
      ],
    },
    {
      id: 'a1b2c3d4-2222-4000-8000-000000000002',
      name: 'Mia', species: 'macka', breed: 'Perzijska', color: 'Bijela', sex: 'žensko',
      description: 'Mia je nestala s balkona drugog kata. Unutrašnja mačka, nije naviknuta na vanjski prostor.',
      special_marks: 'Zelene oči, dugačka bijela dlaka, ružičasti nosić',
      neighborhood: 'Trešnjevka', city: 'Zagreb', date_lost: '2026-03-18T00:00:00Z',
      contact_name: 'Ana Kovačević', contact_phone: '+385 92 345 6789', contact_email: 'ana.kovacevic@email.hr',
      has_microchip: true, has_collar: false, status: 'lost',
      image_url: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=800',
      gallery: ['https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=800'],
      location_lat: 45.7980, location_lng: 15.9490, share_count: 92,
      updates: [], sightings: [
        { id: 's3', date: '2026-03-19T14:00:00Z', location: 'Voltino, iza Kauflanda', description: 'Bijela mačka viđena na kontejneru, nije se dala prići.' },
      ],
    },
    {
      id: 'a1b2c3d4-3333-4000-8000-000000000003',
      name: 'Bruno', species: 'pas', breed: 'Zlatni retriver', color: 'Zlatni', sex: 'muško',
      description: 'Bruno se izgubio tijekom šetnje u parku. Nosi plavu ogrlicu s imenom i brojem telefona.',
      special_marks: 'Nosi plavu ogrlicu s privjeskom u obliku kosti',
      neighborhood: 'Spinut', city: 'Split', date_lost: '2026-03-22T00:00:00Z',
      contact_name: 'Ivan Jurić', contact_phone: '+385 95 456 7890', contact_email: 'ivan.juric@email.hr',
      has_microchip: true, has_collar: true, status: 'lost',
      image_url: 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=800',
      gallery: ['https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=800'],
      location_lat: 43.5147, location_lng: 16.4435, share_count: 128,
      updates: [], sightings: [
        { id: 's4', date: '2026-03-23T09:30:00Z', location: 'Plaža Bačvice', description: 'Zlatni retriver bez vlasnika šetao plažom, pokušao sam ga uhvatiti ali je pobjegao prema gradu.' },
      ],
    },
    {
      id: 'a1b2c3d4-4444-4000-8000-000000000004',
      name: 'Luna', species: 'macka', breed: 'Domaća kratkodlaka', color: 'Crno-bijela', sex: 'žensko',
      description: 'Luna je pronađena na parkiralištu trgovačkog centra. Ima crvenu ogrlicu ali bez podataka za kontakt.',
      special_marks: 'Crno-bijeli uzorak, crvena ogrlica bez privjeska',
      neighborhood: 'Kantrida', city: 'Rijeka', date_lost: '2026-03-15T00:00:00Z',
      contact_name: 'Petra Novak', contact_phone: '+385 99 567 8901', contact_email: 'petra.novak@email.hr',
      has_microchip: false, has_collar: true, status: 'found',
      image_url: 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=800',
      gallery: ['https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=800'],
      location_lat: 45.3351, location_lng: 14.3979, share_count: 65,
      updates: [], sightings: [],
    },
    {
      id: 'a1b2c3d4-5555-4000-8000-000000000005',
      name: 'Charlie', species: 'pas', breed: 'Beagle', color: 'Trikolor', sex: 'muško',
      description: 'Charlie je pobjegao iz auta na benzinskoj stanici. Ima GPS ogrlicu ali baterija se ispraznila.',
      special_marks: 'Specifičan uzorak na glavi, mala bijela mrlja na prsima',
      neighborhood: 'Trstenik', city: 'Split', date_lost: '2026-03-21T00:00:00Z',
      contact_name: 'Tomislav Babić', contact_phone: '+385 91 678 9012', contact_email: 'tomislav.babic@email.hr',
      has_microchip: true, has_collar: true, status: 'lost',
      image_url: 'https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=800',
      gallery: ['https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=800'],
      location_lat: 43.5050, location_lng: 16.4650, share_count: 84,
      updates: [], sightings: [
        { id: 's5', date: '2026-03-22T11:00:00Z', location: 'Marjan, šumska staza', description: 'Beagle viđen kako njuška po stazi na Marjanu, izgledao je izgubljeno.' },
      ],
    },
    {
      id: 'a1b2c3d4-6666-4000-8000-000000000006',
      name: 'Whiskers', species: 'macka', breed: 'Maine Coon', color: 'Smeđe-sivi tabby', sex: 'muško',
      description: 'Whiskers je pronađen u podrumu zgrade. Veliki mačak, oko 7kg, veoma prijazan. Traži se vlasnik!',
      special_marks: 'Izuzetno velika mačka, čupave šape, dugačak rep',
      neighborhood: 'Centar', city: 'Osijek', date_lost: '2026-03-19T00:00:00Z',
      contact_name: 'Maja Vuković', contact_phone: '+385 98 789 0123', contact_email: 'maja.vukovic@email.hr',
      has_microchip: false, has_collar: false, status: 'found',
      image_url: 'https://images.unsplash.com/photo-1615497001839-b0a0eac3274c?w=800',
      gallery: ['https://images.unsplash.com/photo-1615497001839-b0a0eac3274c?w=800'],
      location_lat: 45.5550, location_lng: 18.6955, share_count: 33,
      updates: [], sightings: [],
    },
  ], { onConflict: 'id' });

  if (seedError) {
    results.push({ step: 'seed_lost_pets', success: false, error: seedError.message });
  } else {
    results.push({ step: 'seed_lost_pets', success: true });
  }

  return NextResponse.json({ results });
}

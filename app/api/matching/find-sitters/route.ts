import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { rankSitters, calculateMatchScore, getRecommendationText, type MatchingCriteria } from '@/lib/ai-matching';
import { getAuthUser } from '@/lib/auth';
import { ServiceType } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      petId, 
      serviceType, 
      startDate, 
      endDate,
      maxDistance = 50,
      budgetMax,
      limit = 10 
    } = body;

    // Validate required fields
    if (!petId || !serviceType || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required fields: petId, serviceType, startDate, endDate' },
        { status: 400 }
      );
    }

    // Validate service type
    const validServices: ServiceType[] = ['boarding', 'walking', 'house-sitting', 'drop-in', 'daycare'];
    if (!validServices.includes(serviceType)) {
      return NextResponse.json(
        { error: 'Invalid service type' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get pet details
    const { data: pet, error: petError } = await supabase
      .from('pets')
      .select('*')
      .eq('id', petId)
      .eq('owner_id', user.id)
      .single();

    if (petError || !pet) {
      return NextResponse.json(
        { error: 'Pet not found or not owned by user' },
        { status: 404 }
      );
    }

    // Get owner's location (from user profile)
    const { data: ownerProfile } = await supabase
      .from('users')
      .select('city')
      .eq('id', user.id)
      .single();

    // Get sitters who offer this service and are available
    // Exclude sitters who already have bookings in this date range
    const { data: bookedSitterIds } = await supabase
      .from('bookings')
      .select('sitter_id')
      .in('status', ['pending', 'accepted'])
      .or(`and(start_date.lte.${endDate},end_date.gte.${startDate})`);

    const excludedSitterIds = bookedSitterIds?.map(b => b.sitter_id) || [];

    // Fetch eligible sitters
    let query = supabase
      .from('sitter_profiles')
      .select('user_id, bio, experience_years, services, prices, verified, superhost, response_time, rating_avg, review_count, location_lat, location_lng, city, photos, created_at, instant_booking, user:users!user_id(id, email, name, role, avatar_url, phone, city, created_at)')
      .eq('verified', true)
      .contains('services', [serviceType])
      .gt(`prices->>${serviceType}`, 0);

    if (excludedSitterIds.length > 0) {
      query = query.not('user_id', 'in', `(${excludedSitterIds.join(',')})`);
    }

    const { data: sitters, error: sittersError } = await query;

    if (sittersError) {
      console.error('Error fetching sitters:', sittersError);
      return NextResponse.json(
        { error: 'Failed to fetch sitters' },
        { status: 500 }
      );
    }

    if (!sitters || sitters.length === 0) {
      return NextResponse.json(
        { matches: [], message: 'No available sitters found for your criteria' },
        { status: 200 }
      );
    }

    // Get owner's coordinates (if available) - would need geocoding service
    // For now, use city-based matching
    const ownerLat = undefined;
    const ownerLng = undefined;

    // Build matching criteria
    const criteria: MatchingCriteria = {
      petId,
      serviceType,
      startDate,
      endDate,
      ownerCity: ownerProfile?.city || user.city,
      maxDistance,
      budgetMax,
    };

    // Calculate match scores
    const matches = rankSitters(
      sitters as any,
      pet,
      criteria,
      ownerLat,
      ownerLng,
      limit
    );

    // Format response
    const formattedMatches = matches.map((match, index) => ({
      sitter: {
        id: match.sitter.user_id,
        name: match.sitter.user?.name,
        avatar: match.sitter.user?.avatar_url,
        bio: match.sitter.bio,
        experienceYears: match.sitter.experience_years,
        rating: match.sitter.rating_avg,
        reviewCount: match.sitter.review_count,
        verified: match.sitter.verified,
        superhost: match.sitter.superhost,
        instantBooking: match.sitter.instant_booking,
        city: match.sitter.city,
        price: match.sitter.prices[serviceType],
        services: match.sitter.services,
      },
      matchScore: match.totalScore,
      matchPercentage: Math.round(match.totalScore),
      reasons: match.reasons,
      recommendation: getRecommendationText(match, index === 0),
      isTopMatch: index === 0,
    }));

    return NextResponse.json({
      matches: formattedMatches,
      totalAvailable: sitters.length,
      criteria: {
        serviceType,
        dateRange: { start: startDate, end: endDate },
        petSpecies: pet.species,
      },
    });

  } catch (error) {
    console.error('Error in matching API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint for quick match check (simpler, no pet required)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const city = searchParams.get('city');
    const service = searchParams.get('service') as ServiceType;
    const limit = parseInt(searchParams.get('limit') || '5');

    if (!city || !service) {
      return NextResponse.json(
        { error: 'Missing required params: city, service' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: sitters, error } = await supabase
      .from('sitter_profiles')
      .select('user_id, bio, experience_years, services, prices, verified, superhost, rating_avg, review_count, city, photos, instant_booking, user:users!user_id(id, name, avatar_url)')
      .eq('verified', true)
      .eq('city', city)
      .contains('services', [service])
      .gt(`prices->>${service}`, 0)
      .order('rating_avg', { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch sitters' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      sitters: sitters?.map(s => ({
        id: s.user_id,
        name: s.user?.name,
        avatar: s.user?.avatar_url,
        rating: s.rating_avg,
        reviewCount: s.review_count,
        verified: s.verified,
        superhost: s.superhost,
        instantBooking: s.instant_booking,
        price: s.prices[service],
        city: s.city,
      })) || [],
    });

  } catch (error) {
    console.error('Error in matching GET API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

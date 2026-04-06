import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    const lat = parseFloat(searchParams.get('lat') || '');
    const lng = parseFloat(searchParams.get('lng') || '');
    const radius = parseFloat(searchParams.get('radius') || '50'); // Default 50km
    const limit = parseInt(searchParams.get('limit') || '10');
    
    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }
    
    // Fetch all active clinics
    const { data: clinics, error } = await supabase
      .from('emergency_vet_clinics')
      .select('*')
      .eq('is_active', true);
    
    if (error) {
      console.error('Error fetching emergency vet clinics:', error);
      return NextResponse.json(
        { error: 'Failed to fetch emergency vet clinics' },
        { status: 500 }
      );
    }
    
    // Calculate distances and filter by radius
    const clinicsWithDistance = clinics
      .map((clinic) => {
        if (clinic.coordinates?.lat && clinic.coordinates?.lng) {
          const distance = calculateDistance(
            lat,
            lng,
            clinic.coordinates.lat,
            clinic.coordinates.lng
          );
          return { ...clinic, distance: Math.round(distance * 10) / 10 };
        }
        return { ...clinic, distance: null };
      })
      .filter((clinic) => clinic.distance === null || clinic.distance <= radius)
      .sort((a, b) => {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      })
      .slice(0, limit);
    
    return NextResponse.json({ clinics: clinicsWithDistance });
  } catch (error) {
    console.error('Error in emergency-vets/nearby API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

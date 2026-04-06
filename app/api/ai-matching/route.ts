import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getSitters } from '@/lib/db/sitters';
import { findBestMatches } from '@/lib/ai-matching';
import { getPetsByOwner } from '@/lib/db/pets';
import type { ServiceType } from '@/lib/types';

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { 
      petId, 
      serviceType, 
      city, 
      startDate, 
      endDate,
      specialRequirements 
    } = body;

    // Validate required fields
    if (!serviceType || !city || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required fields: serviceType, city, startDate, endDate' },
        { status: 400 }
      );
    }

    // Get pet details if petId provided
    let pet = null;
    if (petId) {
      const pets = await getPetsByOwner(user.id, 'full');
      pet = pets.find(p => p.id === petId) || null;
    }

    // Fetch sitters for the city
    const sitters = await getSitters({ 
      city,
      service: serviceType as ServiceType,
      limit: 50 
    });

    if (sitters.length === 0) {
      return NextResponse.json({
        matches: [],
        message: 'Nema dostupnih sittera u odabranom gradu za ovu uslugu.',
        totalCandidates: 0,
      });
    }

    // Find best matches using AI algorithm
    const matches = await findBestMatches(
      sitters,
      {
        pet: pet || {
          id: 'unknown',
          owner_id: user.id,
          name: 'Ljubimac',
          species: 'dog',
          breed: null,
          age: null,
          weight: null,
          special_needs: specialRequirements?.join(', ') || null,
          photo_url: null,
          created_at: new Date().toISOString(),
        },
        serviceType: serviceType as ServiceType,
        city,
        startDate,
        endDate,
        specialRequirements,
      },
      {
        limit: 5,
        minScore: 0.35, // Include slightly lower scores for transparency
      }
    );

    return NextResponse.json({
      matches: matches.map(m => ({
        sitter: {
          userId: m.sitter.user_id,
          name: m.sitter.user?.name,
          avatar: m.sitter.user?.avatar_url,
          city: m.sitter.city,
          bio: m.sitter.bio,
          experienceYears: m.sitter.experience_years,
          rating: m.sitter.rating_avg,
          reviewCount: m.sitter.review_count,
          superhost: m.sitter.superhost,
          verified: m.sitter.verified,
          services: m.sitter.services,
          prices: m.sitter.prices,
          photos: m.sitter.photos,
        },
        score: m.score,
        matchPercentage: Math.round(m.score * 100),
        reasons: m.reasons,
        matchFactors: m.matchFactors,
      })),
      totalCandidates: sitters.length,
      criteria: {
        city,
        serviceType,
        petName: pet?.name,
      },
    });

  } catch (error) {
    console.error('AI matching error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate matches' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { getRecommendationsForUser, getTrendingRestaurants } from '@/lib/recommendations/engine';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');

    // If user is logged in, get personalized recommendations
    if (session?.user?.id) {
      const recommendations = await getRecommendationsForUser(session.user.id, limit);
      return NextResponse.json(recommendations);
    }

    // Otherwise, return trending restaurants
    const trending = await getTrendingRestaurants(limit);
    return NextResponse.json(trending);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}

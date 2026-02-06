import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { restaurants, reviews } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const restaurant = await db.query.restaurants.findFirst({
      where: eq(restaurants.id, params.id),
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      );
    }

    // Get reviews
    const restaurantReviews = await db.query.reviews.findMany({
      where: eq(reviews.restaurantId, params.id),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: (reviews, { desc }) => [desc(reviews.createdAt)],
      limit: 20,
    });

    return NextResponse.json({
      ...restaurant,
      reviews: restaurantReviews,
    });
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    return NextResponse.json(
      { error: 'Failed to fetch restaurant' },
      { status: 500 }
    );
  }
}

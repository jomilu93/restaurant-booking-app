import { db } from '@/lib/db';
import { restaurants, bookings, reviews, users, userPreferences } from '@/lib/db/schema';
import { eq, and, gte, desc, sql, inArray } from 'drizzle-orm';
import type { Restaurant } from '@/types';

export interface RecommendationScore {
  restaurantId: string;
  score: number;
  reason: string;
}

/**
 * Get personalized restaurant recommendations for a user
 * Uses hybrid approach: collaborative filtering + content-based filtering
 */
export async function getRecommendationsForUser(
  userId: string,
  limit: number = 10
): Promise<Restaurant[]> {
  // Get user's preferences
  const userPref = await db.query.userPreferences.findFirst({
    where: eq(userPreferences.userId, userId),
  });

  // Get user's booking and review history
  const userBookings = await db.query.bookings.findMany({
    where: eq(bookings.userId, userId),
    with: {
      restaurant: true,
      review: true,
    },
  });

  // If user has no history, return trending restaurants
  if (userBookings.length === 0) {
    return getTrendingRestaurants(limit);
  }

  // Get collaborative recommendations (users with similar taste)
  const collaborativeScores = await getCollaborativeRecommendations(userId, userBookings);

  // Get content-based recommendations (similar restaurants)
  const contentScores = await getContentBasedRecommendations(userId, userBookings, userPref);

  // Combine scores (40% collaborative, 60% content-based)
  const combinedScores = new Map<string, number>();

  for (const [restaurantId, score] of collaborativeScores) {
    combinedScores.set(restaurantId, (combinedScores.get(restaurantId) || 0) + score * 0.4);
  }

  for (const [restaurantId, score] of contentScores) {
    combinedScores.set(restaurantId, (combinedScores.get(restaurantId) || 0) + score * 0.6);
  }

  // Sort by combined score and get top recommendations
  const sortedRestaurantIds = Array.from(combinedScores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);

  // Fetch full restaurant details
  if (sortedRestaurantIds.length === 0) {
    return getTrendingRestaurants(limit);
  }

  const recommendedRestaurants = await db.query.restaurants.findMany({
    where: inArray(restaurants.id, sortedRestaurantIds),
  });

  // Sort by recommendation score order
  const restaurantMap = new Map(recommendedRestaurants.map(r => [r.id, r]));
  return sortedRestaurantIds
    .map(id => restaurantMap.get(id))
    .filter((r): r is Restaurant => r !== undefined);
}

/**
 * Collaborative filtering: Find users with similar booking patterns
 */
async function getCollaborativeRecommendations(
  userId: string,
  userBookings: any[]
): Promise<Map<string, number>> {
  const scores = new Map<string, number>();

  // Get restaurants the user has booked
  const bookedRestaurantIds = userBookings.map(b => b.restaurantId);

  // Find other users who have also booked these restaurants
  const similarUsers = await db
    .select({
      userId: bookings.userId,
      count: sql<number>`count(*)::int`,
    })
    .from(bookings)
    .where(
      and(
        inArray(bookings.restaurantId, bookedRestaurantIds),
        sql`${bookings.userId} != ${userId}`
      )
    )
    .groupBy(bookings.userId)
    .orderBy(desc(sql`count(*)`))
    .limit(10);

  if (similarUsers.length === 0) {
    return scores;
  }

  // Get restaurants booked by similar users that current user hasn't tried
  const similarUserIds = similarUsers.map(u => u.userId);
  const similarUserBookings = await db.query.bookings.findMany({
    where: and(
      inArray(bookings.userId, similarUserIds),
      sql`${bookings.restaurantId} NOT IN (${bookedRestaurantIds.join(',')})`
    ),
  });

  // Score based on how many similar users booked each restaurant
  for (const booking of similarUserBookings) {
    scores.set(
      booking.restaurantId,
      (scores.get(booking.restaurantId) || 0) + 1
    );
  }

  // Normalize scores
  const maxScore = Math.max(...Array.from(scores.values()));
  if (maxScore > 0) {
    for (const [restaurantId, score] of scores) {
      scores.set(restaurantId, score / maxScore);
    }
  }

  return scores;
}

/**
 * Content-based filtering: Find restaurants similar to what user likes
 */
async function getContentBasedRecommendations(
  userId: string,
  userBookings: any[],
  userPref: any
): Promise<Map<string, number>> {
  const scores = new Map<string, number>();

  // Get all restaurants
  const allRestaurants = await db.query.restaurants.findMany();

  // Get restaurants user has already booked
  const bookedRestaurantIds = new Set(userBookings.map(b => b.restaurantId));

  // Calculate similarity scores for each restaurant
  for (const restaurant of allRestaurants) {
    // Skip restaurants user has already visited
    if (bookedRestaurantIds.has(restaurant.id)) {
      continue;
    }

    let score = 0;

    // Cuisine preference match (high weight)
    if (userPref?.cuisinePreferences?.includes(restaurant.cuisine)) {
      score += 3.0;
    }

    // Price range match
    if (
      userPref &&
      restaurant.priceRange >= userPref.priceRangeMin &&
      restaurant.priceRange <= userPref.priceRangeMax
    ) {
      score += 2.0;
    }

    // Neighborhood preference match
    if (userPref?.preferredNeighborhoods?.includes(restaurant.neighborhood)) {
      score += 1.5;
    }

    // Match features with restaurants user liked
    const likedRestaurants = userBookings
      .filter(b => b.review?.rating >= 4)
      .map(b => b.restaurant);

    for (const liked of likedRestaurants) {
      // Same cuisine as liked restaurant
      if (liked.cuisine === restaurant.cuisine) {
        score += 1.0;
      }

      // Similar price range
      if (Math.abs(liked.priceRange - restaurant.priceRange) <= 1) {
        score += 0.5;
      }

      // Shared features
      if (restaurant.features && liked.features) {
        const likedFeatures = liked.features;
        const sharedFeatures = restaurant.features.filter((f: string) =>
          likedFeatures.includes(f)
        ).length;
        score += sharedFeatures * 0.3;
      }
    }

    // Rating boost
    if (restaurant.rating) {
      score += (restaurant.rating / 5.0) * 1.0;
    }

    if (score > 0) {
      scores.set(restaurant.id, score);
    }
  }

  // Normalize scores
  const maxScore = Math.max(...Array.from(scores.values()));
  if (maxScore > 0) {
    for (const [restaurantId, score] of scores) {
      scores.set(restaurantId, score / maxScore);
    }
  }

  return scores;
}

/**
 * Get trending restaurants (for new users or cold start)
 */
export async function getTrendingRestaurants(limit: number = 10): Promise<Restaurant[]> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Get restaurants with most bookings in last 7 days
  const trending = await db
    .select({
      restaurantId: bookings.restaurantId,
      bookingCount: sql<number>`count(*)::int`,
    })
    .from(bookings)
    .where(gte(bookings.createdAt, sevenDaysAgo))
    .groupBy(bookings.restaurantId)
    .orderBy(desc(sql`count(*)`))
    .limit(limit);

  if (trending.length === 0) {
    // Fallback to highest rated restaurants
    return db.query.restaurants.findMany({
      orderBy: [desc(restaurants.rating), desc(restaurants.reviewCount)],
      limit,
    });
  }

  const restaurantIds = trending.map(t => t.restaurantId);
  return db.query.restaurants.findMany({
    where: inArray(restaurants.id, restaurantIds),
  });
}

/**
 * Get similar restaurants based on features
 */
export async function getSimilarRestaurants(
  restaurantId: string,
  limit: number = 5
): Promise<Restaurant[]> {
  const restaurant = await db.query.restaurants.findFirst({
    where: eq(restaurants.id, restaurantId),
  });

  if (!restaurant) {
    return [];
  }

  // Find restaurants with similar cuisine, price range, and features
  const allRestaurants = await db.query.restaurants.findMany({
    where: sql`${restaurants.id} != ${restaurantId}`,
  });

  const scored = allRestaurants.map(r => {
    let score = 0;

    // Same cuisine (high weight)
    if (r.cuisine === restaurant.cuisine) {
      score += 5.0;
    }

    // Similar price range
    if (Math.abs(r.priceRange - restaurant.priceRange) === 0) {
      score += 3.0;
    } else if (Math.abs(r.priceRange - restaurant.priceRange) === 1) {
      score += 1.5;
    }

    // Same neighborhood
    if (r.neighborhood === restaurant.neighborhood) {
      score += 2.0;
    }

    // Shared features
    if (r.features && restaurant.features) {
      const restaurantFeatures = restaurant.features;
      const sharedFeatures = r.features.filter((f: string) =>
        restaurantFeatures.includes(f)
      ).length;
      score += sharedFeatures * 0.5;
    }

    // Similar rating
    if (r.rating && restaurant.rating) {
      const ratingDiff = Math.abs(r.rating - restaurant.rating);
      score += (1 - ratingDiff / 5) * 1.0;
    }

    return { restaurant: r, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => s.restaurant);
}

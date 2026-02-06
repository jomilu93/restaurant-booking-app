import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { restaurants, availabilitySlots } from '@/lib/db/schema';
import { eq, and, gte, like, or, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const cuisine = searchParams.get('cuisine');
    const priceRange = searchParams.get('priceRange');
    const neighborhood = searchParams.get('neighborhood');
    const search = searchParams.get('search');
    const date = searchParams.get('date');
    const time = searchParams.get('time');
    const partySize = searchParams.get('partySize');

    let query = db.select().from(restaurants);

    // Apply filters
    const conditions = [];

    if (cuisine) {
      conditions.push(eq(restaurants.cuisine, cuisine));
    }

    if (priceRange) {
      const price = parseInt(priceRange);
      conditions.push(eq(restaurants.priceRange, price));
    }

    if (neighborhood) {
      conditions.push(eq(restaurants.neighborhood, neighborhood));
    }

    if (search) {
      conditions.push(
        or(
          like(restaurants.name, `%${search}%`),
          like(restaurants.description, `%${search}%`),
          like(restaurants.cuisine, `%${search}%`)
        )
      );
    }

    const allRestaurants = await db.select().from(restaurants).where(
      conditions.length > 0 ? and(...conditions) : undefined
    );

    // If date/time/partySize provided, filter by availability
    if (date && time && partySize) {
      const dateObj = new Date(date);
      const party = parseInt(partySize);

      const availableRestaurantIds = await db
        .selectDistinct({ restaurantId: availabilitySlots.restaurantId })
        .from(availabilitySlots)
        .where(
          and(
            gte(availabilitySlots.date, dateObj),
            eq(availabilitySlots.time, time),
            eq(availabilitySlots.partySize, party),
            eq(availabilitySlots.available, true)
          )
        );

      const availableIds = new Set(availableRestaurantIds.map(r => r.restaurantId));
      const filtered = allRestaurants.filter(r => availableIds.has(r.id));

      return NextResponse.json(filtered);
    }

    return NextResponse.json(allRestaurants);
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch restaurants' },
      { status: 500 }
    );
  }
}

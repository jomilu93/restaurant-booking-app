import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { db } from '@/lib/db';
import { bookings, availabilitySlots } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { createResyClient } from '@/lib/integrations/resy-mock';
import { createOpenTableClient } from '@/lib/integrations/opentable-mock';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userBookings = await db.query.bookings.findMany({
      where: eq(bookings.userId, session.user.id),
      with: {
        restaurant: true,
      },
      orderBy: (bookings, { desc }) => [desc(bookings.date)],
    });

    return NextResponse.json(userBookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { restaurantId, date, time, partySize, platform, specialRequests } = body;

    // Validate input
    if (!restaurantId || !date || !time || !partySize || !platform) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check availability
    const dateObj = new Date(date);
    const slot = await db.query.availabilitySlots.findFirst({
      where: and(
        eq(availabilitySlots.restaurantId, restaurantId),
        eq(availabilitySlots.date, dateObj),
        eq(availabilitySlots.time, time),
        eq(availabilitySlots.partySize, parseInt(partySize)),
        eq(availabilitySlots.available, true)
      ),
    });

    if (!slot) {
      return NextResponse.json(
        { error: 'Time slot not available' },
        { status: 400 }
      );
    }

    // Create booking with external platform
    let externalBookingId = null;

    try {
      if (platform === 'resy') {
        const resyClient = createResyClient();
        const resyBooking = await resyClient.createBooking(
          'mock-token',
          restaurantId,
          dateObj,
          time,
          parseInt(partySize),
          session.user.name || 'Guest',
          session.user.email || ''
        );
        externalBookingId = resyBooking.confirmationId;
      } else if (platform === 'opentable') {
        const otClient = createOpenTableClient();
        const otBooking = await otClient.createReservation(
          'mock-token',
          restaurantId,
          dateObj,
          time,
          parseInt(partySize),
          session.user.name?.split(' ')[0] || 'Guest',
          session.user.name?.split(' ')[1] || '',
          session.user.email || ''
        );
        externalBookingId = otBooking.reservationId;
      }
    } catch (error) {
      console.error('External booking error:', error);
      // Continue with direct booking if external fails
    }

    // Create booking in our database
    const [booking] = await db.insert(bookings).values({
      userId: session.user.id,
      restaurantId,
      date: dateObj,
      time,
      partySize: parseInt(partySize),
      status: 'confirmed',
      platform,
      externalBookingId,
      specialRequests,
    }).returning();

    // Mark slot as unavailable
    await db.update(availabilitySlots)
      .set({ available: false })
      .where(eq(availabilitySlots.id, slot.id));

    // Fetch full booking with restaurant details
    const fullBooking = await db.query.bookings.findFirst({
      where: eq(bookings.id, booking.id),
      with: {
        restaurant: true,
      },
    });

    return NextResponse.json(fullBooking, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}

import { db } from '@/lib/db';
import { restaurants, availabilitySlots } from '@/lib/db/schema';
import { eq, gte, and } from 'drizzle-orm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function RestaurantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const restaurant = await db.query.restaurants.findFirst({
    where: eq(restaurants.id, id),
  });

  if (!restaurant) {
    notFound();
  }

  // Get next 3 days of availability
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const availability = await db.query.availabilitySlots.findMany({
    where: and(
      eq(availabilitySlots.restaurantId, id),
      gte(availabilitySlots.date, today),
      eq(availabilitySlots.available, true)
    ),
    limit: 20,
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link href="/restaurants" className="text-primary hover:underline mb-4 inline-block">
          ← Back to Restaurants
        </Link>

        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">{restaurant.name}</h1>
              <p className="text-xl text-muted-foreground">
                {restaurant.cuisine} • {restaurant.neighborhood}
              </p>
            </div>
            <div className="flex items-center gap-2 text-2xl">
              <span className="text-yellow-500">★</span>
              <span className="font-bold">{restaurant.rating}</span>
            </div>
          </div>

          <div className="flex gap-4 text-sm mb-6">
            <span className="font-medium text-lg">
              {'$'.repeat(restaurant.priceRange)}
            </span>
            <span className="text-muted-foreground">
              {restaurant.reviewCount} reviews
            </span>
          </div>

          <p className="text-lg mb-6">{restaurant.description}</p>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Restaurant Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><span className="font-medium">Address:</span> {restaurant.address}</p>
              {restaurant.phone && (
                <p><span className="font-medium">Phone:</span> {restaurant.phone}</p>
              )}
              {restaurant.website && (
                <p>
                  <span className="font-medium">Website:</span>{' '}
                  <a href={restaurant.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Visit Website
                  </a>
                </p>
              )}
            </CardContent>
          </Card>

          {restaurant.features && restaurant.features.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {restaurant.features.map((feature, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Available Times</CardTitle>
            <CardDescription>
              {availability.length > 0
                ? 'Select a time to book your reservation'
                : 'No availability in the next few days. Check back later.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {availability.length > 0 ? (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {availability.slice(0, 12).map((slot) => (
                  <Link
                    key={slot.id}
                    href={`/restaurants/${restaurant.id}/book?date=${slot.date.toISOString()}&time=${slot.time}&partySize=${slot.partySize}`}
                  >
                    <Button variant="outline" className="w-full" size="sm">
                      {new Date(slot.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                      <br />
                      {slot.time} • {slot.partySize}p
                    </Button>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Currently no available slots. Please check other restaurants or try different dates.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

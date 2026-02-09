import { db } from '@/lib/db';
import { restaurants } from '@/lib/db/schema';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function RestaurantsPage() {
  const allRestaurants = await db.select().from(restaurants).limit(50);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Discover Restaurants</h1>
          <p className="text-muted-foreground text-lg">
            Browse and book the best restaurants in NYC
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allRestaurants.map((restaurant) => (
            <Card key={restaurant.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{restaurant.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {restaurant.cuisine} • {restaurant.neighborhood}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500">★</span>
                    <span className="font-semibold">{restaurant.rating}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {restaurant.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="font-medium">
                      {'$'.repeat(restaurant.priceRange)}
                    </span>
                    <span className="text-muted-foreground ml-2">
                      {restaurant.reviewCount} reviews
                    </span>
                  </div>
                  <Link href={`/restaurants/${restaurant.id}`}>
                    <Button size="sm">View Details</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

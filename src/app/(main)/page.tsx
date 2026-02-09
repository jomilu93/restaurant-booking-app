import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/lib/db';
import { getTrendingRestaurants } from '@/lib/recommendations/engine';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const trending = await getTrendingRestaurants(6);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Find Your Perfect NYC Restaurant
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover amazing restaurants with real availability and personalized recommendations.
            Book instantly through Resy or OpenTable.
          </p>
          <Link href="/restaurants">
            <Button size="lg" className="text-lg px-8">
              Browse Restaurants
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">🔍 Smart Discovery</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Find restaurants with real-time availability. No more calling ahead or disappointment.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">🎯 Personalized</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Get recommendations based on your taste preferences and dining history.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">⚡ Instant Booking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Book seamlessly through Resy or OpenTable. One platform, all options.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Trending Restaurants */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Trending Now</h2>
            <Link href="/restaurants">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trending.map((restaurant) => (
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
                    <span className="font-medium">
                      {'$'.repeat(restaurant.priceRange)}
                    </span>
                    <Link href={`/restaurants/${restaurant.id}`}>
                      <Button size="sm">Book Now</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Dining?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of food lovers discovering their next favorite restaurant.
          </p>
          <Link href="/restaurants">
            <Button size="lg">Explore Restaurants</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

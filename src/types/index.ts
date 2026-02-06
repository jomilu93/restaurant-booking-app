import { restaurants, users, bookings, reviews, userPreferences } from '@/lib/db/schema';

// Restaurant types
export type Restaurant = typeof restaurants.$inferSelect;
export type NewRestaurant = typeof restaurants.$inferInsert;

// User types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// Booking types
export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
export type BookingStatus = 'confirmed' | 'pending' | 'cancelled';

// Review types
export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;

// User preferences types
export type UserPreferences = typeof userPreferences.$inferSelect;
export type NewUserPreferences = typeof userPreferences.$inferInsert;

// Extended types with relations
export type RestaurantWithDetails = Restaurant & {
  reviews: Review[];
  averageRating: number;
  availableSlots?: number;
};

export type BookingWithDetails = Booking & {
  restaurant: Restaurant;
  user: User;
};

// Filter types
export interface RestaurantFilters {
  cuisine?: string;
  priceRange?: [number, number];
  neighborhood?: string;
  date?: Date;
  time?: string;
  partySize?: number;
  search?: string;
}

// Platform types
export type Platform = 'resy' | 'opentable' | 'direct';

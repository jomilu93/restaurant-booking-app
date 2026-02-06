import { pgTable, text, timestamp, integer, real, boolean, json, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

// Users table
export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  email: text('email').notNull().unique(),
  name: text('name'),
  password: text('password'),
  image: text('image'),
  emailVerified: timestamp('email_verified'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// User preferences
export const userPreferences = pgTable('user_preferences', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  cuisinePreferences: json('cuisine_preferences').$type<string[]>().default([]),
  priceRangeMin: integer('price_range_min').default(1),
  priceRangeMax: integer('price_range_max').default(4),
  dietaryRestrictions: json('dietary_restrictions').$type<string[]>().default([]),
  preferredNeighborhoods: json('preferred_neighborhoods').$type<string[]>().default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Restaurants
export const restaurants = pgTable('restaurants', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  description: text('description'),
  cuisine: text('cuisine').notNull(),
  priceRange: integer('price_range').notNull(),
  neighborhood: text('neighborhood').notNull(),
  address: text('address').notNull(),
  phone: text('phone'),
  website: text('website'),
  imageUrl: text('image_url'),
  rating: real('rating').default(0),
  reviewCount: integer('review_count').default(0),
  features: json('features').$type<string[]>().default([]),
  resyEnabled: boolean('resy_enabled').default(false),
  opentableEnabled: boolean('opentable_enabled').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Restaurant availability slots
export const availabilitySlots = pgTable('availability_slots', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  restaurantId: text('restaurant_id').notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  date: timestamp('date').notNull(),
  time: varchar('time', { length: 5 }).notNull(),
  partySize: integer('party_size').notNull(),
  available: boolean('available').default(true),
  platform: text('platform').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Bookings
export const bookings = pgTable('bookings', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  restaurantId: text('restaurant_id').notNull().references(() => restaurants.id),
  date: timestamp('date').notNull(),
  time: varchar('time', { length: 5 }).notNull(),
  partySize: integer('party_size').notNull(),
  status: text('status').notNull().default('confirmed'),
  platform: text('platform').notNull(),
  externalBookingId: text('external_booking_id'),
  specialRequests: text('special_requests'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// User ratings/reviews
export const reviews = pgTable('reviews', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  restaurantId: text('restaurant_id').notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  bookingId: text('booking_id').references(() => bookings.id, { onDelete: 'set null' }),
  rating: integer('rating').notNull(),
  review: text('review'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Connected accounts (Resy/OpenTable)
export const connectedAccounts = pgTable('connected_accounts', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  platform: text('platform').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  preferences: one(userPreferences, {
    fields: [users.id],
    references: [userPreferences.userId],
  }),
  bookings: many(bookings),
  reviews: many(reviews),
  connectedAccounts: many(connectedAccounts),
}));

export const restaurantsRelations = relations(restaurants, ({ many }) => ({
  availabilitySlots: many(availabilitySlots),
  bookings: many(bookings),
  reviews: many(reviews),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  user: one(users, { fields: [bookings.userId], references: [users.id] }),
  restaurant: one(restaurants, { fields: [bookings.restaurantId], references: [restaurants.id] }),
  review: one(reviews, { fields: [bookings.id], references: [reviews.bookingId] }),
}));

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, { fields: [userPreferences.userId], references: [users.id] }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, { fields: [reviews.userId], references: [users.id] }),
  restaurant: one(restaurants, { fields: [reviews.restaurantId], references: [restaurants.id] }),
  booking: one(bookings, { fields: [reviews.bookingId], references: [bookings.id] }),
}));

export const availabilitySlotsRelations = relations(availabilitySlots, ({ one }) => ({
  restaurant: one(restaurants, { fields: [availabilitySlots.restaurantId], references: [restaurants.id] }),
}));

export const connectedAccountsRelations = relations(connectedAccounts, ({ one }) => ({
  user: one(users, { fields: [connectedAccounts.userId], references: [users.id] }),
}));

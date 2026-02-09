import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql as vercelSql } from '@vercel/postgres';
import * as schema from './schema';

// @vercel/postgres looks for POSTGRES_URL by default
// If Supabase only provides DATABASE_URL, set POSTGRES_URL from it
if (!process.env.POSTGRES_URL && process.env.DATABASE_URL) {
  process.env.POSTGRES_URL = process.env.DATABASE_URL;
}

// Create the database instance
export const db = drizzle(vercelSql, { schema });

// Export types
export type Database = typeof db;

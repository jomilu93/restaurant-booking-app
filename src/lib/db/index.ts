import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql as vercelSql } from '@vercel/postgres';
import * as schema from './schema';

// Create the database instance
export const db = drizzle(vercelSql, { schema });

// Export types
export type Database = typeof db;

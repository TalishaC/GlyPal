import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";

// Use DATABASE_URL directly - it already contains the correct connection string
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const isDevelopment = process.env.NODE_ENV === "development";
if (isDevelopment) {
  console.log('[DB] Using development database');
} else {
  console.log('[DB] Using production database');
}

// Production-ready connection with timeout and retry handling
console.log('[DB] Connecting to database:', databaseUrl?.replace(/:[^:@]+@/, ':****@')); // Log URL with password hidden

const client = postgres(databaseUrl, {
  max: 10, // Connection pool size
  idle_timeout: 30, // Close idle connections after 30 seconds
  connect_timeout: 30, // Wait up to 30 seconds for connection (handles database wake-up)
  max_lifetime: 60 * 30, // Recycle connections after 30 minutes
  onnotice: () => {}, // Suppress notices
  debug: false,
});

export const db = drizzle(client, { schema });

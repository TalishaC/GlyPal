import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";

// Construct the correct database URL based on environment
let databaseUrl = process.env.DATABASE_URL;

// In production deployments, use REPLIT_CONNECTORS_HOSTNAME for database connection
if (process.env.REPLIT_DEPLOYMENT && process.env.REPLIT_CONNECTORS_HOSTNAME) {
  const { PGUSER = 'postgres', PGPASSWORD = 'password', PGPORT = '5432', PGDATABASE = 'heliumdb' } = process.env;
  databaseUrl = `postgresql://${PGUSER}:${PGPASSWORD}@${process.env.REPLIT_CONNECTORS_HOSTNAME}:${PGPORT}/${PGDATABASE}`;
  console.log('[DB] Using production database via REPLIT_CONNECTORS_HOSTNAME');
} else if (databaseUrl && databaseUrl.includes('helium')) {
  console.log('[DB] Using development database at helium');
} else if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is not set and REPLIT_CONNECTORS_HOSTNAME is not available");
}

// Production-ready connection with timeout and retry handling
const client = postgres(databaseUrl, {
  max: 10, // Connection pool size
  idle_timeout: 30, // Close idle connections after 30 seconds
  connect_timeout: 15, // Wait up to 15 seconds for connection (handles database wake-up)
  max_lifetime: 60 * 30, // Recycle connections after 30 minutes
});

export const db = drizzle(client, { schema });

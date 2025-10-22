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

const client = postgres(databaseUrl);
export const db = drizzle(client, { schema });

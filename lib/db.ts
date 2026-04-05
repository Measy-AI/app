import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import { drizzle as drizzleLibsql } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client/web";
import * as schema from "@/lib/schema";

export function getDb() {
  // Try to find the D1 binding in all possible locations
  const env = (process.env || {}) as any;
  const globalEnv = (globalThis as any);
  
  // Checking multiple common binding names and locations
  const d1 = env.measy_ai_db || 
             env.DB || 
             globalEnv.measy_ai_db || 
             globalEnv.DB ||
             (globalEnv.process?.env?.measy_ai_db);

  if (d1 && typeof d1.prepare === 'function') {
    return drizzleD1(d1, { schema });
  }

  // Fallback to Libsql (Local Dev / Build Time)
  const databaseUrl = env.DATABASE_TURSO_DATABASE_URL || env.TURSO_DATABASE_URL || "file:./dev.db";
  const authToken = env.DATABASE_TURSO_AUTH_TOKEN || env.TURSO_AUTH_TOKEN;

  const client = createClient({
    url: databaseUrl,
    authToken: authToken,
  });

  return drizzleLibsql(client, { schema });
}

// Ensure the db instance is resolved per-call to handle environment shifts
export const db = new Proxy({} as any, {
  get(_, prop) {
    const database = getDb();
    return (database as any)[prop];
  }
});

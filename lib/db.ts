import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import { drizzle as drizzleLibsql } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client/web";
import * as schema from "@/lib/schema";

export function getDbInstance() {
  const globalObj = globalThis as any;
  const env = (process.env || {}) as any;

  // 1. Try to find D1. We check every possible known pattern for OpenNext/Cloudflare
  const d1 = globalObj.measy_ai_db || 
             env.measy_ai_db || 
             globalObj.DB || 
             env.DB ||
             (globalObj.process?.env?.measy_ai_db);

  if (d1 && typeof d1.prepare === 'function') {
    return drizzleD1(d1, { schema });
  }

  // 2. FALLBACK MONITORING
  // If we are on Cloudflare (which we can detect via some variables)
  // but D1 is missing, we should know about it.
  if (env.NEXT_RUNTIME === 'edge' || globalObj.caches) {
     console.error("CRITICAL: D1 Binding 'measy_ai_db' not found in Worker runtime!");
  }

  // 3. Fallback to Libsql (Local Dev / Build Time)
  const databaseUrl = env.DATABASE_TURSO_DATABASE_URL || env.TURSO_DATABASE_URL || "file:./dev.db";
  const authToken = env.DATABASE_TURSO_AUTH_TOKEN || env.TURSO_AUTH_TOKEN;

  const client = createClient({
    url: databaseUrl,
    authToken: authToken,
  });

  return drizzleLibsql(client, { schema });
}

export const db = getDbInstance();

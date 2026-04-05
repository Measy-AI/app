import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import { drizzle as drizzleLibsql } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client/web";
import * as schema from "@/lib/schema";

// This function is still useful for local dev and internal checks
export function getDbInstance() {
  const globalObj = globalThis as any;
  const env = (process.env || {}) as any;
  const cfEnvSymbol = Symbol.for('cloudflare.env');
  const cfEnv = env[cfEnvSymbol] || globalObj[cfEnvSymbol] || globalObj;

  // 1. Try to find D1 in any of the Cloudflare environment objects
  const d1 = cfEnv.measy_ai_db || cfEnv.DB || env.measy_ai_db || env.DB;

  if (d1 && typeof d1.prepare === 'function') {
    return drizzleD1(d1, { schema });
  }

  // 2. Fallback to Libsql (Local Dev / Build Time)
  const databaseUrl = env.DATABASE_TURSO_DATABASE_URL || env.TURSO_DATABASE_URL || "file:./dev.db";
  const authToken = env.DATABASE_TURSO_AUTH_TOKEN || env.TURSO_AUTH_TOKEN;

  const client = createClient({
    url: databaseUrl,
    authToken: authToken,
  });

  return drizzleLibsql(client, { schema });
}

// We go back to a direct export to avoid Proxy issue 'a2 is not a function'
// In Next.js 15 Cloudflare, this is evaluated per request anyway in many cases
export const db = getDbInstance();

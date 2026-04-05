import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import { drizzle as drizzleLibsql } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client/web";
import * as schema from "@/lib/schema";

// Helper to find a D1-like object in the global scope
function findD1Binding() {
  const env = (process.env || {}) as any;
  const globalObj = globalThis as any;

  // 1. Check known names in process.env
  if (env.measy_ai_db?.prepare) return env.measy_ai_db;
  if (env.DB?.prepare) return env.DB;

  // 2. Check known names in globalThis
  if (globalObj.measy_ai_db?.prepare) return globalObj.measy_ai_db;
  if (globalObj.DB?.prepare) return globalObj.DB;

  // 3. AGGRESSIVE SCAN: Look for any global object that has a .prepare() function
  // Cloudflare bindings are often injected directly into the global scope
  try {
    for (const key in globalObj) {
      const val = globalObj[key];
      if (val && typeof val === 'object' && typeof val.prepare === 'function' && typeof val.batch === 'function') {
        return val;
      }
    }
  } catch (e) {
    // Ignore scan errors
  }

  return null;
}

export function getDb() {
  // Try to find the D1 binding
  const d1 = findD1Binding();
  if (d1) {
    return drizzleD1(d1, { schema });
  }

  // Fallback to Libsql (Local Dev / Build Time)
  // This helps when D1 is not found to at least not crash immediately
  const env = (process.env || {}) as any;
  const databaseUrl = env.DATABASE_TURSO_DATABASE_URL || env.TURSO_DATABASE_URL || "file:./dev.db";
  const authToken = env.DATABASE_TURSO_AUTH_TOKEN || env.TURSO_AUTH_TOKEN;

  const client = createClient({
    url: databaseUrl,
    authToken: authToken,
  });

  return drizzleLibsql(client, { schema });
}

export const db = new Proxy({} as any, {
  get(_, prop) {
    const database = getDb();
    return (database as any)[prop];
  }
});

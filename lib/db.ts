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

  // 3. SECRECY CHECK: OpenNext often hides the environment in a Symbol
  const cfEnvSymbol = Symbol.for('cloudflare.env');
  const cfEnv = (process.env as any)[cfEnvSymbol] || (globalThis as any)[cfEnvSymbol];
  
  if (cfEnv && cfEnv.measy_ai_db?.prepare) return cfEnv.measy_ai_db;
  if (cfEnv && cfEnv.DB?.prepare) return cfEnv.DB;

  // 4. AGGRESSIVE SCAN: Look for any global object that has a .prepare() function
  try {
    for (const key of Object.getOwnPropertyNames(globalObj)) {
      const val = globalObj[key];
      if (val && typeof val === 'object' && typeof val.prepare === 'function') {
        return val;
      }
    }
  } catch (e) {}

  return null;
}

export function getDb() {
  const d1 = findD1Binding();
  if (d1) {
    return drizzleD1(d1, { schema });
  }

  // Fallback to Libsql (Local Dev / Build Fallback)
  const env = (process.env || {}) as any;
  const databaseUrl = env.DATABASE_TURSO_DATABASE_URL || env.TURSO_DATABASE_URL || "file:./dev.db";
  const authToken = env.DATABASE_TURSO_AUTH_TOKEN || env.TURSO_AUTH_TOKEN;

  // Important: If we are on Cloudflare and NO D1 is found, 
  // falling back to Turso might fail if secrets aren't set correctly.
  const client = createClient({
    url: databaseUrl,
    authToken: authToken,
  });

  return drizzleLibsql(client, { schema });
}

export const db = new Proxy({} as any, {
  get(_, prop) {
    const database = getDb();
    const value = (database as any)[prop];
    if (typeof value === "function") {
      return value.bind(database);
    }
    return value;
  },
});

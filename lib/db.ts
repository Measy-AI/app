import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import { drizzle as drizzleLibsql } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client/web";
import * as schema from "@/lib/schema";

// Standard function to get DB, now with Cloudflare Request Context support
export function getDb() {
  const env = (process.env || {}) as any;
  
  // 1. Try official Cloudflare Request Context (Next.js 15 / OpenNext pattern)
  try {
    // @ts-ignore - getRequestContext might not be in types but is available at runtime in OpenNext
    const { getRequestContext } = require("@opennextjs/cloudflare");
    const ctx = getRequestContext();
    if (ctx?.env?.measy_ai_db) {
      return drizzleD1(ctx.env.measy_ai_db, { schema });
    }
  } catch (e) {
    // Ignore error if getRequestContext is not available (e.g. during build)
  }

  // 2. Fallback to process.env or global (for other runtimes)
  const d1 = env.measy_ai_db || (globalThis as any).measy_ai_db;
  if (d1 && typeof d1.prepare === 'function') {
    return drizzleD1(d1, { schema });
  }

  // 3. Fallback to Libsql (Local Dev)
  const databaseUrl = env.DATABASE_TURSO_DATABASE_URL || env.TURSO_DATABASE_URL || "file:./dev.db";
  const authToken = env.DATABASE_TURSO_AUTH_TOKEN || env.TURSO_AUTH_TOKEN;

  const client = createClient({
    url: databaseUrl,
    authToken: authToken,
  });

  return drizzleLibsql(client, { schema });
}

// Proxy object that always calls getDb() to ensure we get the latest environment bindings
export const db = new Proxy({} as any, {
  get(_, prop) {
    const database = getDb();
    return (database as any)[prop];
  }
});

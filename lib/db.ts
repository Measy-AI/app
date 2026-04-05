import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import { drizzle as drizzleLibsql } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client/web";
import * as schema from "@/lib/schema";

export function getDb() {
  // Cloudflare D1 Binding (Production)
  // We check for the binding name defined in wrangler.jsonc
  const env = process.env as any;
  const d1 = env.measy_ai_db || env.DB;
  
  if (d1 && typeof d1.prepare === 'function') {
    return drizzleD1(d1, { schema });
  }

  // Fallback to Libsql (Local Dev / Build Time)
  const databaseUrl = process.env.DATABASE_TURSO_DATABASE_URL || process.env.TURSO_DATABASE_URL || "file:./dev.db";
  const authToken = process.env.DATABASE_TURSO_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN;

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

import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import { drizzle as drizzleLibsql } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client/web";
import * as schema from "@/lib/schema";

export function getDb() {
  // Cloudflare D1 Binding (Production)
  const d1 = (process.env as any).measy_ai_db;
  if (d1) {
    return drizzleD1(d1, { schema });
  }

  // Fallback to Libsql (Local Dev)
  const databaseUrl = process.env.DATABASE_TURSO_DATABASE_URL || process.env.TURSO_DATABASE_URL || "file:./dev.db";
  const authToken = process.env.DATABASE_TURSO_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN;

  const client = createClient({
    url: databaseUrl,
    authToken: authToken,
  });

  return drizzleLibsql(client, { schema });
}

export const db = getDb();

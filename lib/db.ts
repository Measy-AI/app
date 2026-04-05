import { drizzle } from "drizzle-orm/d1";
import { drizzle as drizzleLibsql } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client/web";
import * as schema from "@/lib/schema";

/**
 * THE CLEAN DISCOVERY
 */
export function getRawD1Binding() {
  const globalObj = globalThis as any;
  const env = (process.env || {}) as any;
  
  const bindingName = 'measy_ai_db';
  return globalObj[bindingName] || 
         env[bindingName] || 
         globalObj.DB || 
         env.DB ||
         Reflect.get(globalObj, bindingName);
}

/**
 * Returns a fresh Drizzle instance.
 * Handles build-time by falling back to Libsql instead of throwing.
 */
export function getDb() {
  const d1 = getRawD1Binding();
  const env = (process.env || {}) as any;

  if (d1 && typeof d1.prepare === 'function') {
    return drizzle(d1, { schema });
  }

  // FALLBACK for Local Dev / Build Time / CI
  // Use a local DB file so the build can complete without errors
  const databaseUrl = env.DATABASE_TURSO_DATABASE_URL || env.TURSO_DATABASE_URL || "file:./dev.db";
  const authToken = env.DATABASE_TURSO_AUTH_TOKEN || env.TURSO_AUTH_TOKEN;

  const client = createClient({
    url: databaseUrl,
    authToken: authToken,
  });

  return drizzleLibsql(client, { schema });
}

// Delegating export for clean imports
export const db = {
  select: (...args: any[]) => (getDb() as any).select(...args),
  insert: (...args: any[]) => (getDb() as any).insert(...args),
  update: (...args: any[]) => (getDb() as any).update(...args),
  delete: (...args: any[]) => (getDb() as any).delete(...args),
  query: (getDb() as any).query,
  run: (sql: any) => getDb().run(sql),
  all: (sql: any) => getDb().all(sql),
  batch: (sqls: any[]) => getDb().batch(sqls as any),
  transaction: (...args: any[]) => (getDb() as any).transaction(...args),
} as any;

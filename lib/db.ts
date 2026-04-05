import { drizzle } from "drizzle-orm/d1";
import { drizzle as drizzleLibsql } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client/web";
import * as schema from "@/lib/schema";

/**
 * THE OPEN-NEXT CONTEXT RESOLVER
 */
export function getRawD1Binding() {
  const globalObj = globalThis as any;
  
  // 1. Try OpenNext official Request Context
  try {
    // We use a dynamic require/import-like check to avoid build-time crashes
    const { getRequestContext } = require("@opennextjs/cloudflare");
    const ctx = getRequestContext();
    if (ctx && ctx.env && ctx.env.measy_ai_db) {
      return ctx.env.measy_ai_db;
    }
  } catch (e) {
    // getRequestContext might not be available at build time
  }

  // 2. Fallbacks for other environments
  const env = (process.env || {}) as any;
  const bindingName = 'measy_ai_db';
  return globalObj[bindingName] || 
         env[bindingName] || 
         globalObj.DB || 
         env.DB ||
         Reflect.get(globalObj, bindingName);
}

export function getDb() {
  const d1 = getRawD1Binding();
  const env = (process.env || {}) as any;

  if (d1 && typeof d1.prepare === 'function') {
    return drizzle(d1, { schema });
  }

  // Fallback for Build/CI
  const databaseUrl = env.DATABASE_TURSO_DATABASE_URL || env.TURSO_DATABASE_URL || "file:./dev.db";
  const authToken = env.DATABASE_TURSO_AUTH_TOKEN || env.TURSO_AUTH_TOKEN;

  const client = createClient({
    url: databaseUrl,
    authToken: authToken,
  });

  return drizzleLibsql(client, { schema });
}

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

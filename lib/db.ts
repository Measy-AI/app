import { drizzle } from "drizzle-orm/d1";
import { drizzle as drizzleLibsql } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client/web";
import * as schema from "@/lib/schema";

/**
 * THE ULTIMATE D1 DISCOVERY
 */
function findD1Binding() {
  const globalObj = globalThis as any;
  const envKeys = ['measy_ai_db', 'DB'];

  // 1. Try getRequestContext
  try {
    const { getRequestContext } = require("@opennextjs/cloudflare");
    const ctx = getRequestContext();
    if (ctx?.env) {
      for (const key of envKeys) {
        if (ctx.env[key]?.prepare) return ctx.env[key];
      }
      for (const key of Object.keys(ctx.env)) {
        if (ctx.env[key]?.prepare && ctx.env[key]?.batch) return ctx.env[key];
      }
    }
  } catch (e) {}

  // 2. Try global/process env
  const containers = [globalObj, process.env, globalObj.env];
  for (const container of containers) {
    if (!container) continue;
    for (const key of envKeys) {
      if (container[key]?.prepare) return container[key];
    }
    try {
      for (const key of Object.getOwnPropertyNames(container)) {
        const val = container[key];
        if (val?.prepare && val?.batch) return val;
      }
    } catch (e) {}
  }
  return null;
}

// CACHED INSTANCE
let _cachedDb: any = null;

export function getDb() {
  if (_cachedDb) return _cachedDb;

  const d1 = findD1Binding();
  if (d1) {
    _cachedDb = drizzle(d1, { schema });
    return _cachedDb;
  }

  // Fallback for Build/Local
  const env = (process.env || {}) as any;
  const databaseUrl = env.DATABASE_TURSO_DATABASE_URL || env.TURSO_DATABASE_URL || "file:./dev.db";
  const authToken = env.DATABASE_TURSO_AUTH_TOKEN || env.TURSO_AUTH_TOKEN;

  const client = createClient({ url: databaseUrl, authToken });
  _cachedDb = drizzleLibsql(client, { schema });
  return _cachedDb;
}

/**
 * STABLE DELEGATOR OBJECT
 * We manually delegate critical Drizzle methods to the singleton instance.
 * This ensures Better Auth never loses 'this' context while enjoying D1 access.
 */
export const db = {
  get query() { return getDb().query; },
  select: (...args: any[]) => (getDb() as any).select(...args),
  insert: (...args: any[]) => (getDb() as any).insert(...args),
  update: (...args: any[]) => (getDb() as any).update(...args),
  delete: (...args: any[]) => (getDb() as any).delete(...args),
  run: (sql: any) => getDb().run(sql),
  all: (sql: any) => getDb().all(sql),
  batch: (sqls: any[]) => getDb().batch(sqls as any),
  transaction: (...args: any[]) => (getDb() as any).transaction(...args),
} as any;

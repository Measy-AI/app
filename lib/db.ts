import { drizzle } from "drizzle-orm/d1";
import { drizzle as drizzleLibsql } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client/web";
import * as schema from "@/lib/schema";

/**
 * THE SMART D1 SCANNER
 * Searches globalThis, process.env, and OpenNext contexts for ANY object that 
 * has '.prepare' and '.batch' methods. This is the absolute ultimate discovery.
 */
export function getRawD1Binding() {
  const globalObj = globalThis as any;
  const envKeys = ['measy_ai_db', 'DB', 'measy-ai-db'];

  // 1. Try getRequestContext (OpenNext official)
  try {
    const { getRequestContext } = require("@opennextjs/cloudflare");
    const ctx = getRequestContext();
    if (ctx && ctx.env) {
      for (const key of envKeys) {
        if (ctx.env[key]?.prepare) return ctx.env[key];
      }
      // Scan all keys in ctx.env
      for (const key of Object.keys(ctx.env)) {
        if (ctx.env[key]?.prepare && ctx.env[key]?.batch) return ctx.env[key];
      }
    }
  } catch (e) {}

  // 2. Scan globalThis and process.env
  const containers = [globalObj, process.env, (process as any).env, globalObj.env];
  for (const container of containers) {
    if (!container) continue;
    // Check known keys first
    for (const key of envKeys) {
      if (container[key]?.prepare) return container[key];
    }
    // Scan all properties
    try {
      for (const key of Object.getOwnPropertyNames(container)) {
        const val = container[key];
        if (val && typeof val.prepare === 'function' && typeof val.batch === 'function') {
          return val;
        }
      }
    } catch (e) {}
  }

  return null;
}

export function getDb() {
  const d1 = getRawD1Binding();
  if (d1) {
    return drizzle(d1, { schema });
  }

  // Fallback for Build/CI/Local
  const env = (process.env || {}) as any;
  const databaseUrl = env.DATABASE_TURSO_DATABASE_URL || env.TURSO_DATABASE_URL || "file:./dev.db";
  const authToken = env.DATABASE_TURSO_AUTH_TOKEN || env.TURSO_AUTH_TOKEN;

  const client = createClient({
    url: databaseUrl,
    authToken: authToken,
  });

  return drizzleLibsql(client, { schema });
}

// Delegating export
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

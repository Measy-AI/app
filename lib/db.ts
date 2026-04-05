import { drizzle } from "drizzle-orm/d1";
import * as schema from "@/lib/schema";

/**
 * THE CLEAN DISCOVERY
 * No proxies, just a direct search at the moment of the request.
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
 * Returns a fresh Drizzle instance using the current D1 binding.
 */
export function getDb() {
  const d1 = getRawD1Binding();
  if (!d1) {
    throw new Error("D1 Binding 'measy_ai_db' not found. Ensure Cloudflare environment is ready.");
  }
  return drizzle(d1, { schema });
}

// We still export 'db' for compatibility, but as a direct lookup object
export const db = {
  select: (...args: any[]) => (getDb() as any).select(...args),
  insert: (...args: any[]) => (getDb() as any).insert(...args),
  update: (...args: any[]) => (getDb() as any).update(...args),
  delete: (...args: any[]) => (getDb() as any).delete(...args),
  query: (getDb() as any).query,
  run: (sql: any) => getDb().run(sql),
  all: (sql: any) => getDb().all(sql),
  batch: (sqls: any[]) => getDb().batch(sqls as any),
} as any;

import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import { drizzle as drizzleLibsql } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client/web";
import * as schema from "@/lib/schema";

function getDbInstance() {
  const globalObj = globalThis as any;
  const env = (process.env || {}) as any;

  // 1. ABSOLUTE DISCOVERY for Cloudflare Bindings
  // We check directly by name using Reflect to handle hidden/non-enumerable properties
  const bindingName = 'measy_ai_db';
  const d1 = Reflect.get(globalObj, bindingName) || 
             Reflect.get(env, bindingName) ||
             globalObj.measy_ai_db ||
             env.measy_ai_db ||
             globalObj.DB ||
             env.DB ||
             (globalObj.process?.env?.[bindingName]);

  if (d1 && typeof d1.prepare === 'function') {
    return drizzleD1(d1, { schema });
  }

  // Monitor for missing bindings in production
  if (typeof globalObj.caches !== 'undefined') {
    console.warn(`[DB-DEBUG] Binding '${bindingName}' was NOT found in globalThis or process.env.`);
    console.warn(`[DB-DEBUG] Available global keys: ${Object.getOwnPropertyNames(globalObj).filter(k => k.includes('db') || k.includes('measy'))}`);
  }

  // 2. Fallback to Libsql (Local Dev / Build Time)
  const databaseUrl = env.DATABASE_TURSO_DATABASE_URL || env.TURSO_DATABASE_URL || "file:./dev.db";
  const authToken = env.DATABASE_TURSO_AUTH_TOKEN || env.TURSO_AUTH_TOKEN;

  const client = createClient({
    url: databaseUrl,
    authToken: authToken,
  });

  return drizzleLibsql(client, { schema });
}

// Robust lazy proxy helper
function createLazyProxy(resolver: () => any) {
  let instance: any = null;
  function getInstance() {
    if (!instance) instance = resolver();
    return instance;
  }
  return new Proxy({} as any, {
    get(_, prop) {
      const inst = getInstance();
      const val = inst[prop];
      if (typeof val === 'function') return val.bind(inst);
      return val;
    }
  });
}

export const db = createLazyProxy(getDbInstance);
export { getDbInstance };

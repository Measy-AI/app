import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import { drizzle as drizzleLibsql } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client/web";
import * as schema from "@/lib/schema";

// 1. The Actual Resolver (Must be called inside the proxy)
function getDbInstance() {
  const globalObj = globalThis as any;
  const env = (process.env || {}) as any;
  const cfEnvSymbol = Symbol.for('cloudflare.env');
  const cfEnv = env[cfEnvSymbol] || globalObj[cfEnvSymbol] || globalObj;

  const d1 = cfEnv.measy_ai_db || cfEnv.DB || env.measy_ai_db || env.DB;

  if (d1 && typeof d1.prepare === 'function') {
    return drizzleD1(d1, { schema });
  }

  // Fallback for Local Dev / Build
  const databaseUrl = env.DATABASE_TURSO_DATABASE_URL || env.TURSO_DATABASE_URL || "file:./dev.db";
  const authToken = env.DATABASE_TURSO_AUTH_TOKEN || env.TURSO_AUTH_TOKEN;

  const client = createClient({
    url: databaseUrl,
    authToken: authToken,
  });

  return drizzleLibsql(client, { schema });
}

// 2. A robust proxy helper that handles function binding correctly
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
      
      if (typeof val === 'function') {
        return val.bind(inst);
      }
      return val;
    },
    // Important for Drizzle/Better Auth: support property descriptors and other internal checks
    getOwnPropertyDescriptor(_, prop) {
      const inst = getInstance();
      return Object.getOwnPropertyDescriptor(inst, prop);
    },
    has(_, prop) {
      const inst = getInstance();
      return prop in inst;
    },
    ownKeys(_) {
      const inst = getInstance();
      return Reflect.ownKeys(inst);
    }
  });
}

export const db = createLazyProxy(getDbInstance);
export { getDbInstance };

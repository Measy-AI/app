import { drizzle } from "drizzle-orm/d1";
import * as schema from "@/lib/schema";

/**
 * THE UNIVERSAL D1 SCANNER
 * Searches globalThis and process.env for anything that looks like a D1 binding.
 */
function findD1Binding() {
  const globalObj = globalThis as any;
  const env = (process.env || {}) as any;
  
  const targets = [
    globalObj, 
    env, 
    globalObj.process?.env,
    globalObj.__cloudflare_env__,
    globalObj.env
  ];

  for (const target of targets) {
    if (!target) continue;
    
    // Look for any property that has 'prepare' and 'batch'
    for (const key of Object.getOwnPropertyNames(target)) {
      try {
        const val = target[key];
        if (val && typeof val.prepare === 'function' && typeof val.batch === 'function') {
          console.log(`[DB-SCANNER] Found D1 binding at key: ${key}`);
          return val;
        }
      } catch (e) {
        // Some properties might throw on access
      }
    }
  }

  // Last ditch effort: Try known names explicitly
  return globalObj.measy_ai_db || env.measy_ai_db || globalObj.DB || env.DB;
}

const d1Proxy = new Proxy({} as any, {
  get(_, prop) {
    const d1 = findD1Binding();

    if (!d1) {
      // Build-time dummy
      if (prop === 'prepare') return () => ({ bind: () => ({ all: async () => [] }) });
      return undefined;
    }

    const value = d1[prop];
    return typeof value === "function" ? value.bind(d1) : value;
  },
  getOwnPropertyDescriptor(_, prop) {
    return { enumerable: true, configurable: true };
  }
});

export const db = drizzle(d1Proxy, { schema });

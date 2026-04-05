import { drizzle } from "drizzle-orm/d1";
import * as schema from "@/lib/schema";

/**
 * THE ULTIMATE CLOUDFLARE D1 BINDING PROXY
 * This proxy wraps the raw Cloudflare D1 binding. Whenever Drizzle calls 
 * a method (like .prepare or .batch), this proxy dynamically finds the 
 * binding in the current request context (globalThis or process.env).
 */
const d1Proxy = new Proxy({} as any, {
  get(_, prop) {
    const globalObj = globalThis as any;
    const env = (process.env || {}) as any;
    
    // Find the real D1 binding
    const d1 = globalObj.measy_ai_db || 
               env.measy_ai_db || 
               globalObj.DB || 
               env.DB ||
               (globalObj.process?.env?.measy_ai_db);

    if (!d1) {
      // During build time or if missing, return a dummy to prevent crashes
      return () => { throw new Error("D1 Binding not found. Ensure you are running in a Cloudflare environment."); };
    }

    const value = d1[prop];
    return typeof value === "function" ? value.bind(d1) : value;
  },
  // Essential for Drizzle's internal checks
  getOwnPropertyDescriptor(_, prop) {
    return { enumerable: true, configurable: true };
  }
});

/**
 * Initialize Drizzle ONCE at module level.
 * It uses our smart Proxy as the database engine.
 */
export const db = drizzle(d1Proxy, { schema });

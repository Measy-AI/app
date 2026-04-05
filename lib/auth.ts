import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";
import { schema } from "@/lib/schema";
import { buildAllowedHosts, buildTrustedOrigins, resolveAuthBaseUrl } from "@/lib/auth-url";

// 1. A robust proxy helper to avoid context loss in Proxies
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
    }
  });
}

function getAuthInstance() {
  return betterAuth({
    appName: "MeasyAI",
    baseURL: {
      allowedHosts: buildAllowedHosts(),
      fallback: resolveAuthBaseUrl(),
    },
    secret: process.env.BETTER_AUTH_SECRET || "dummy_secret_for_build",
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema,
    }),
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
    },
    socialProviders: {
      discord: {
        clientId: process.env.DISCORD_CLIENT_ID || "dummy",
        clientSecret: process.env.DISCORD_CLIENT_SECRET || "dummy",
      },
    },
    plugins: [nextCookies()],
    trustedOrigins: async () => buildTrustedOrigins(),
  });
}

export const auth = createLazyProxy(() => getAuthInstance()) as ReturnType<typeof betterAuth>;

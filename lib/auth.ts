import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";
import { schema } from "@/lib/schema";

import { buildAllowedHosts, buildTrustedOrigins, resolveAuthBaseUrl } from "@/lib/auth-url";

/**
 * We wrap the auth instance in a proxy to ensure it always uses
 * the latest environment variables (secrets/database) at request time.
 * This is critical for Next.js 15 on Cloudflare Workers.
 */
let _authInstance: any = null;

function getAuthInstance() {
  if (_authInstance) return _authInstance;

  _authInstance = betterAuth({
    appName: "MeasyAI",
    baseURL: {
      allowedHosts: buildAllowedHosts(),
      fallback: resolveAuthBaseUrl(),
    },
    secret: process.env.BETTER_AUTH_SECRET,
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
        clientId: process.env.DISCORD_CLIENT_ID!,
        clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      },
    },
    plugins: [nextCookies()],
    trustedOrigins: async () => buildTrustedOrigins(),
  });

  return _authInstance;
}

export const auth = new Proxy({} as any, {
  get(_, prop) {
    const instance = getAuthInstance();
    return (instance as any)[prop];
  }
}) as ReturnType<typeof betterAuth>;

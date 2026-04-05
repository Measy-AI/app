import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";
import { schema } from "@/lib/schema";
import { buildAllowedHosts, buildTrustedOrigins, resolveAuthBaseUrl } from "@/lib/auth-url";

/**
 * Clean, standard initialization of Better Auth. 
 * Since 'db' is a regular Drizzle instance (backed by our smart Binding Proxy), 
 * this will work perfectly across all environments.
 */
export const auth = betterAuth({
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

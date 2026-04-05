import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";
import { schema } from "@/lib/schema";
import { buildAllowedHosts, buildTrustedOrigins, resolveAuthBaseUrl } from "@/lib/auth-url";

/**
 * We return to a direct export. This is safer for Better Auth internals
 * and prevents 'a2 is not a function' Proxy context errors.
 */
export const auth = betterAuth({
  appName: "MeasyAI",
  baseURL: {
    allowedHosts: buildAllowedHosts(),
    fallback: resolveAuthBaseUrl(),
  },
  // Ensure we have a valid secret even at build time
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

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";
import { schema } from "@/lib/schema";

import { buildAllowedHosts, buildTrustedOrigins, resolveAuthBaseUrl } from "@/lib/auth-url";


export const auth = betterAuth({
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

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";
import { schema } from "@/lib/schema";

function resolveAuthBaseUrl() {
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) {
    return `https://${vercelUrl}`;
  }
  return process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

function buildTrustedOrigins() {
  const vercelUrl = process.env.VERCEL_URL;
  const configuredOrigins = (process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  const origins = new Set([
     "http://localhost",
     "http://localhost:3000",
     "https://localhost",
     "https://localhost:3000",
     "http://127.0.0.1",
     "http://127.0.0.1:3000",
     "https://127.0.0.1",
     "https://127.0.0.1:3000",
     process.env.NEXT_PUBLIC_APP_URL,
     process.env.BETTER_AUTH_URL,
     vercelUrl ? `https://${vercelUrl}` : null,
     ...configuredOrigins
  ].filter((o): o is string => !!o));

  return Array.from(origins);
}

export const auth = betterAuth({
  appName: "MeasyAI",
  baseURL: resolveAuthBaseUrl(),
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
  trustedOrigins: buildTrustedOrigins(),
});

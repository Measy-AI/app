import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";
import { schema } from "@/lib/schema";

const FORCE_TRUSTED_ORIGIN = "https://app-one-pi-65.vercel.app";

function normalizeOrigin(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  try {
    return new URL(trimmed).origin;
  } catch {
    return trimmed.replace(/\/+$/, "");
  }
}

function buildTrustedOrigins() {
  const configuredOrigins = (process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? "")
    .split(",")
    .map((origin) => normalizeOrigin(origin))
    .filter(Boolean);

  const vercelUrl = process.env.VERCEL_URL?.trim();
  const vercelOrigin = vercelUrl ? normalizeOrigin(`https://${vercelUrl}`) : null;

  return Array.from(
    new Set(
      [
        normalizeOrigin(FORCE_TRUSTED_ORIGIN),
        normalizeOrigin(`${FORCE_TRUSTED_ORIGIN}/`),
        normalizeOrigin(process.env.NEXT_PUBLIC_APP_URL ?? ""),
        normalizeOrigin(process.env.BETTER_AUTH_URL ?? ""),
        vercelOrigin,
        ...configuredOrigins,
      ].filter((origin): origin is string => Boolean(origin)),
    ),
  );
}

function isLocalhostOrigin(origin: string) {
  return origin.startsWith("http://localhost") || origin.startsWith("http://127.0.0.1");
}

function resolveAuthBaseUrl() {
  const configuredBase = normalizeOrigin(process.env.BETTER_AUTH_URL ?? "");
  const vercelOrigin = normalizeOrigin(process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");

  if (configuredBase && !isLocalhostOrigin(configuredBase)) {
    return configuredBase;
  }

  if (vercelOrigin) {
    return vercelOrigin;
  }

  return FORCE_TRUSTED_ORIGIN;
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

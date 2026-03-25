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
  try {
    const parsed = new URL(origin);
    return parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
  } catch {
    return origin.includes("localhost") || origin.includes("127.0.0.1");
  }
}

function resolveAuthBaseUrl() {
  const appBase = normalizeOrigin(process.env.NEXT_PUBLIC_APP_URL ?? "");
  const configuredBase = normalizeOrigin(process.env.BETTER_AUTH_URL ?? "");
  const vercelUrl = process.env.VERCEL_URL?.trim();
  const vercelOrigin = vercelUrl ? normalizeOrigin(`https://${vercelUrl}`) : "";

  const candidates = [appBase, configuredBase, vercelOrigin, normalizeOrigin(FORCE_TRUSTED_ORIGIN)].filter(
    Boolean,
  ) as string[];

  const nonLocalCandidate = candidates.find((origin) => !isLocalhostOrigin(origin));
  if (nonLocalCandidate) {
    return nonLocalCandidate;
  }

  if (candidates.length > 0) {
    return candidates[0]!;
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

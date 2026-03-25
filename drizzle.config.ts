import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const tursoAccountId = process.env.TURSO_ACCOUNT_ID?.trim();
const tursoDatabaseId = process.env.TURSO_DATABASE_ID?.trim();
const tursoToken = process.env.DATABASE_TURSO_AUTH_TOKEN?.trim() || process.env.TURSO_AUTH_TOKEN?.trim();
const tursoDatabaseUrl = process.env.TURSO_DATABASE_URL?.trim();
const databaseTursoUrl = process.env.DATABASE_TURSO_DATABASE_URL?.trim();
const fallbackDatabaseUrl = process.env.DATABASE_URL?.trim();

const dbCredentials =
  tursoAccountId && tursoDatabaseId && tursoToken
    ? {
        accountId: tursoAccountId,
        databaseId: tursoDatabaseId,
        token: tursoToken,
      }
    : {
        url: databaseTursoUrl || tursoDatabaseUrl || fallbackDatabaseUrl || "file:./dev.db",
      };

export default defineConfig({
  out: "./drizzle",
  schema: "./lib/schema.ts",
  dialect: "sqlite",
  dbCredentials,
});

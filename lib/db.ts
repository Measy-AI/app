import { createClient } from "@libsql/client/web"; // Web version for Cloudflare compatibility
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "@/lib/schema";

const isDev = process.env.NODE_ENV === "development";

const tursoDatabaseUrl = process.env.TURSO_DATABASE_URL?.trim();
const databaseTursoUrl = process.env.DATABASE_TURSO_DATABASE_URL?.trim();
const fallbackDatabaseUrl = process.env.DATABASE_URL?.trim();
const databaseUrl = databaseTursoUrl || tursoDatabaseUrl || fallbackDatabaseUrl || "file:./dev.db";
const authToken = process.env.TURSO_AUTH_TOKEN?.trim();
const databaseTursoAuthToken = process.env.DATABASE_TURSO_AUTH_TOKEN?.trim();

// Note: Cloudflare Workers requires HTTP-based connection (turso/libsql URLs)
// Local file-based development may require @libsql/client (non-web)
const client = createClient({
  url: databaseUrl,
  ...(databaseTursoAuthToken || authToken ? { authToken: databaseTursoAuthToken || authToken } : {}),
});

export const db = drizzle(client, { schema });

export { client };

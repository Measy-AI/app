import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "@/lib/schema";

const tursoDatabaseUrl = process.env.TURSO_DATABASE_URL?.trim();
const databaseTursoUrl = process.env.DATABASE_TURSO_DATABASE_URL?.trim();
const fallbackDatabaseUrl = process.env.DATABASE_URL?.trim();
const databaseUrl = databaseTursoUrl || tursoDatabaseUrl || fallbackDatabaseUrl || "file:./dev.db";
const authToken = process.env.TURSO_AUTH_TOKEN?.trim();
const databaseTursoAuthToken = process.env.DATABASE_TURSO_AUTH_TOKEN?.trim();
const client = createClient({
  url: databaseUrl,
  ...(databaseTursoAuthToken || authToken ? { authToken: databaseTursoAuthToken || authToken } : {}),
});

export const db = drizzle(client, { schema });

export { client };

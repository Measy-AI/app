import "dotenv/config";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { createClient } from "@libsql/client";

function env(name: string) {
  return process.env[name]?.trim();
}

function shouldIgnoreError(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return (
    message.includes("already exists") ||
    message.includes("duplicate column name") ||
    message.includes("no such column")
  );
}

async function run() {
  const url = env("DATABASE_TURSO_DATABASE_URL") || env("TURSO_DATABASE_URL");
  const authToken = env("DATABASE_TURSO_AUTH_TOKEN") || env("TURSO_AUTH_TOKEN");

  if (!url) {
    throw new Error("Missing DATABASE_TURSO_DATABASE_URL (or TURSO_DATABASE_URL).");
  }

  if (!authToken) {
    throw new Error("Missing DATABASE_TURSO_AUTH_TOKEN (or TURSO_AUTH_TOKEN).");
  }

  const client = createClient({ url, authToken });
  const migrationsDir = join(process.cwd(), "drizzle");
  const files = (await readdir(migrationsDir))
    .filter((file) => /^\d+_.+\.sql$/.test(file))
    .sort((a, b) => a.localeCompare(b));

  for (const file of files) {
    const sql = await readFile(join(migrationsDir, file), "utf8");
    const statements = sql
      .split("--> statement-breakpoint")
      .map((statement) => statement.trim())
      .filter(Boolean);

    for (const statement of statements) {
      try {
        await client.execute(statement);
      } catch (error) {
        if (shouldIgnoreError(error)) {
          continue;
        }
        throw error;
      }
    }

    console.log(`Applied ${file}`);
  }

  console.log("Turso migrations completed.");
  client.close();
}

run().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});

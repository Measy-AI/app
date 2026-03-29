import { db } from "./lib/db";
import { conversation } from "./lib/schema";
import { sql } from "drizzle-orm";

async function check() {
  try {
    const res = await db.run(sql`PRAGMA table_info(conversation)`);
    console.log(JSON.stringify(res, null, 2));
  } catch (e) {
    console.error(e);
  }
}

check();

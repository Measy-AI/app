import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

// Default runtime

export async function GET() {
  try {
    // We try the EXACT same query that Better Auth is doing
    const result = await db.run(sql`SELECT "id", "name", "email", "plan" FROM "user" LIMIT 1`);
    
    return NextResponse.json({
      success: true,
      message: "Database is reachable and query succeeded!",
      result
    });
  } catch (error: any) {
    console.error("[DB-TEST-ERROR]", error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      hint: "Check if the table and columns exist in D1 remote."
    }, { status: 500 });
  }
}

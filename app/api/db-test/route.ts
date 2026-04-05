import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export const runtime = "edge";

export async function GET() {
  try {
    // Now we test with our delegating DRIZZLE instance
    const tables = await db.all(sql`SELECT name FROM sqlite_master WHERE type='table'`);
    
    return NextResponse.json({
      success: true,
      message: "DRIZZLE is working with D1!",
      tables: tables
    });
  } catch (error: any) {
    console.error("[DRIZZLE-D1-ERROR]", error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

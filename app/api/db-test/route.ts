import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    // We ask the database what tables it ACTUALLY has
    const tables = await db.run(sql`SELECT name FROM sqlite_master WHERE type='table'`);
    
    return NextResponse.json({
      success: true,
      message: "Database connected!",
      tables: tables,
      hint: "Compare this list with your local D1 tables."
    });
  } catch (error: any) {
    console.error("[DB-SCAN-ERROR]", error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

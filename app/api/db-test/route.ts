import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET() {
  try {
    const start = Date.now();
    const result = await db.execute("SELECT 1 as connection_test");
    const end = Date.now();
    
    return NextResponse.json({
      success: true,
      data: result,
      time: `${end - start}ms`,
      env: process.env.NODE_ENV
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      hint: "Check if TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are set in Cloudflare secrets."
    }, { status: 500 });
  }
}

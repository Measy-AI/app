import { NextResponse } from "next/server";
import { getRawD1Binding } from "@/lib/db";

export async function GET() {
  try {
    // 1. Get the RAW binding (no Drizzle)
    const d1 = getRawD1Binding();
    
    if (!d1) {
      return NextResponse.json({ success: false, error: "D1 Binding not found even with raw scanner." });
    }

    if (typeof d1.prepare !== 'function') {
      return NextResponse.json({ 
        success: false, 
        error: "Found something, but it's not a D1 binding.",
        foundType: typeof d1,
        keys: Object.keys(d1)
      });
    }

    // 2. Try raw query
    const res = await d1.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    
    return NextResponse.json({
      success: true,
      message: "RAW D1 connected successfully!",
      tables: res.results || []
    });
  } catch (error: any) {
    console.error("[RAW-D1-ERROR]", error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

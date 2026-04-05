import { NextResponse } from "next/server";
import { getRawD1Binding } from "@/lib/db";


export async function GET() {
  try {
    const d1 = getRawD1Binding();
    if (!d1) return NextResponse.json({ success: false, error: "D1 not found" });

    // Check COLUMNS of 'user' table
    const tableInfo = await d1.prepare("PRAGMA table_info('user')").all();
    const tables = await d1.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    
    return NextResponse.json({
      success: true,
      tables: tables.results,
      userColumns: tableInfo.results
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}

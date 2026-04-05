import { NextResponse } from "next/server";
import { getRawD1Binding } from "@/lib/db";


export async function GET() {
  try {
    let debugInfo: any = {};
    const d1 = getRawD1Binding();
    
    // Check getCloudflareContext directly
    try {
      const { getCloudflareContext } = require("@opennextjs/cloudflare");
      const ctx = getCloudflareContext();
      debugInfo.ctxKeys = ctx ? Object.keys(ctx) : null;
      debugInfo.ctxEnvKeys = ctx?.env ? Object.keys(ctx.env) : null;
    } catch (e: any) {
      debugInfo.requireError = e.message;
    }

    // Check globals
    debugInfo.globalKeys = Object.keys(globalThis).filter(k => k.includes('measy') || k === 'env' || k === 'process');
    debugInfo.processEnvKeys = Object.keys(process.env).filter(k => k.includes('measy') || k === 'DB' || k.includes('D1'));
    if ((globalThis as any).env) {
      debugInfo.globalEnvKeys = Object.keys((globalThis as any).env);
    }
    
    // Check @opennextjs global
    debugInfo.CloudflareCtx = !!(globalThis as any)[Symbol.for("opennextjs-cloudflare-ctx")];

    if (!d1) return NextResponse.json({ success: false, error: "D1 not found", debugInfo });

    // Check COLUMNS of 'user' table
    const tableInfo = await d1.prepare("PRAGMA table_info('user')").all();
    const tables = await d1.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    
    return NextResponse.json({
      success: true,
      tables: tables.results,
      userColumns: tableInfo.results,
      debugInfo
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}

import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET() {
  const env = process.env as any;
  const globalEnv = globalThis as any;
  
  const diagnostic = {
    hasProcessEnv: !!process.env,
    processEnvKeys: Object.keys(process.env || {}),
    globalKeys: Object.keys(globalThis).filter(k => k.toLowerCase().includes('db') || k.toLowerCase().includes('measy')),
    measy_ai_db_in_process: !!env.measy_ai_db,
    db_in_process: !!env.DB,
    measy_ai_db_in_global: !!globalEnv.measy_ai_db,
    db_in_global: !!globalEnv.DB,
    nodeVersion: process.version,
  };

  return NextResponse.json(diagnostic);
}

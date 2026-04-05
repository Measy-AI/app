import { NextResponse } from "next/server";

export async function GET() {
  const env = process.env as any;
  const globalEnv = globalThis as any;
  let ctx: any = null;

  try {
    const { getRequestContext } = require("@opennextjs/cloudflare");
    ctx = getRequestContext();
  } catch (e) {}

  const diagnostic = {
    hasProcessEnv: !!process.env,
    processEnvKeys: Object.keys(process.env || {}),
    hasRequestContext: !!ctx,
    requestContextKeys: ctx ? Object.keys(ctx.env || {}) : [],
    measy_ai_db_in_process: !!env.measy_ai_db,
    measy_ai_db_in_ctx: !!ctx?.env?.measy_ai_db,
    db_in_ctx: !!ctx?.env?.DB,
    globalKeys: Object.keys(globalThis).filter(k => k.toLowerCase().includes('db') || k.toLowerCase().includes('measy')),
    nodeVersion: process.version,
  };

  return NextResponse.json(diagnostic);
}

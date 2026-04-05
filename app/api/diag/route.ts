import { NextResponse } from "next/server";

export async function GET() {
  const env = process.env as any;
  const globalObj = globalThis as any;
  
  // Scannen nach Objekten, die D1 oder measy enthalten könnten
  const allGlobals = Object.keys(globalObj);
  const potentialD1Locations = allGlobals.filter(k => 
    k.toLowerCase().includes('env') || 
    k.toLowerCase().includes('ctx') || 
    k.toLowerCase().includes('cloudflare') ||
    k.toLowerCase().includes('measy')
  );

  const diagnostic = {
    nodeVersion: process.version,
    processEnvKeys: Object.keys(env).slice(0, 50), // begrenzen für Lesbarkeit
    globalKeys: potentialD1Locations,
    // Spezial-Feld für OpenNext/Cloudflare
    cloudflareEnvSymbol: !!(process.env as any)[Symbol.for('cloudflare.env')],
    possibleD1InGlobal: !!globalObj.measy_ai_db || !!globalObj.DB,
    // Dump von interessanten globalen Objekten (nur Keys)
    envKeys: globalObj.env ? Object.keys(globalObj.env) : [],
    cfKeys: globalObj.cf ? Object.keys(globalObj.cf) : [],
    contextKeys: globalObj.context ? Object.keys(globalObj.context) : [],
  };

  return NextResponse.json(diagnostic);
}

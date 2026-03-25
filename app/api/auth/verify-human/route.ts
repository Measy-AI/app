import { NextResponse } from "next/server";
import { verifyTurnstileToken } from "@/lib/turnstile";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as {
    turnstileToken?: string;
  };

  const turnstileToken = payload.turnstileToken?.trim();

  if (!turnstileToken) {
    return NextResponse.json({ error: "Turnstile token is required." }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip");
  const turnstileVerification = await verifyTurnstileToken(turnstileToken, ip);

  if (!turnstileVerification.ok) {
    return NextResponse.json({ error: turnstileVerification.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

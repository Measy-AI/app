import { NextResponse } from "next/server";
import { isBlockedEmail } from "@/lib/blocked-email";

type TurnstileResponse = {
  success: boolean;
  "error-codes"?: string[];
};

async function verifyTurnstileToken(token: string, ip?: string | null) {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    return {
      ok: false,
      error: "TURNSTILE_SECRET_KEY is missing on the server.",
    };
  }

  const body = new URLSearchParams({
    secret,
    response: token,
    ...(ip ? { remoteip: ip } : {}),
  });

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    return {
      ok: false,
      error: "Unable to verify Turnstile token.",
    };
  }

  const result = (await response.json()) as TurnstileResponse;

  if (!result.success) {
    return {
      ok: false,
      error: "Turnstile verification failed.",
    };
  }

  return { ok: true };
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as {
    email?: string;
    turnstileToken?: string;
  };

  const email = payload.email?.trim().toLowerCase();
  const turnstileToken = payload.turnstileToken?.trim();

  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  if (isBlockedEmail(email)) {
    return NextResponse.json({ error: "This email provider is not allowed." }, { status: 400 });
  }

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

type TurnstileResponse = {
  success: boolean;
  "error-codes"?: string[];
};

export async function verifyTurnstileToken(token: string, ip?: string | null) {
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

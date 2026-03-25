"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { authClient } from "@/lib/auth-client";

type TurnstileWindow = Window & {
  onTurnstileSuccess?: (token: string) => void;
  onTurnstileExpired?: () => void;
  onTurnstileError?: () => void;
  turnstile?: {
    reset: () => void;
  };
};

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
  const turnstileConfigured = useMemo(() => turnstileSiteKey.length > 0, [turnstileSiteKey]);

  useEffect(() => {
    const typedWindow = window as TurnstileWindow;
    typedWindow.onTurnstileSuccess = (token: string) => setTurnstileToken(token);
    typedWindow.onTurnstileExpired = () => setTurnstileToken("");
    typedWindow.onTurnstileError = () => setTurnstileToken("");

    return () => {
      delete typedWindow.onTurnstileSuccess;
      delete typedWindow.onTurnstileExpired;
      delete typedWindow.onTurnstileError;
    };
  }, []);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    if (!turnstileConfigured) {
      setError("Turnstile is not configured.");
      setIsLoading(false);
      return;
    }

    if (!turnstileToken) {
      setError("Please complete the Turnstile challenge.");
      setIsLoading(false);
      return;
    }

    const validationResponse = await fetch("/api/register/validate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        turnstileToken,
      }),
    });

    if (!validationResponse.ok) {
      const validationPayload = (await validationResponse.json().catch(() => ({}))) as { error?: string };
      setError(validationPayload.error ?? "Registration validation failed.");
      setIsLoading(false);
      setTurnstileToken("");
      (window as TurnstileWindow).turnstile?.reset();
      return;
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

    const { error: signUpError } = await authClient.signUp.email({
      name: fullName,
      email,
      password,
      callbackURL: "/dashboard",
    });

    if (signUpError) {
      setError(signUpError.message ?? "Unable to register.");
      setIsLoading(false);
      setTurnstileToken("");
      (window as TurnstileWindow).turnstile?.reset();
      return;
    }

    window.location.href = "/dashboard";
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      {turnstileConfigured ? (
        <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" />
      ) : null}
      <div className="glass w-full max-w-md rounded-2xl p-8">
        <h1 className="mb-2 font-display text-3xl font-bold">Create account</h1>
        <p className="mb-6 text-sm text-zinc-400">Start free and upgrade whenever you are ready.</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none ring-accent transition focus:ring-2"
              required
            />
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none ring-accent transition focus:ring-2"
              required
            />
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none ring-accent transition focus:ring-2"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            minLength={8}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none ring-accent transition focus:ring-2"
            required
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
            minLength={8}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none ring-accent transition focus:ring-2"
            required
          />

          {turnstileConfigured ? (
            <div
              className="cf-turnstile"
              data-sitekey={turnstileSiteKey}
              data-theme="dark"
              data-callback="onTurnstileSuccess"
              data-expired-callback="onTurnstileExpired"
              data-error-callback="onTurnstileError"
            />
          ) : (
            <p className="text-sm text-amber-300">Turnstile is not configured. Add `NEXT_PUBLIC_TURNSTILE_SITE_KEY`.</p>
          )}

          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          <button disabled={isLoading} className="w-full rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">
            {isLoading ? "Creating account..." : "Create account"}
          </button>
        </form>
        <p className="mt-4 text-sm text-zinc-400">
          Already registered? <Link href="/login" className="text-accent2">Log in</Link>
        </p>
      </div>
    </main>
  );
}

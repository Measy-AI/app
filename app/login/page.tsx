"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

type TurnstileWindow = Window & {
  onTurnstileSuccess?: (token: string) => void;
  onTurnstileExpired?: () => void;
  onTurnstileError?: () => void;
  turnstile?: {
    reset: () => void;
  };
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDiscordLoading, setIsDiscordLoading] = useState(false);
  const loggedIn = useMemo(async () => {
    const { data, error } = await authClient.getSession()
    return Boolean(data?.user?.id);
  }, []);

  loggedIn.then((loggedIn) => {
    if (loggedIn) {
      redirect("/dashboard");
    }
  });

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

    const verificationResponse = await fetch("/api/auth/verify-human", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        turnstileToken,
      }),
    });

    if (!verificationResponse.ok) {
      const verificationPayload = (await verificationResponse.json().catch(() => ({}))) as { error?: string };
      setError(verificationPayload.error ?? "Human verification failed.");
      setIsLoading(false);
      setTurnstileToken("");
      (window as TurnstileWindow).turnstile?.reset();
      return;
    }

    const { error: signInError } = await authClient.signIn.email({
      email,
      password,
      callbackURL: "/dashboard",
    });

    if (signInError) {
      setError(signInError.message ?? "Unable to log in.");
      setIsLoading(false);
      setTurnstileToken("");
      (window as TurnstileWindow).turnstile?.reset();
      return;
    }

    window.location.href = "/dashboard";
  };

  const onDiscordSignIn = async () => {
    setError(null);
    setIsDiscordLoading(true);

    const { error: discordError } = await authClient.signIn.social({
      provider: "discord",
      callbackURL: "/dashboard",
    });

    if (discordError) {
      setError(discordError.message ?? "Unable to sign in with Discord.");
      setIsDiscordLoading(false);
      return;
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      {turnstileConfigured ? (
        <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" />
      ) : null}
      <div className="glass w-full max-w-md rounded-2xl p-8">
        <h1 className="mb-2 font-display text-3xl font-bold">Welcome back</h1>
        <p className="mb-6 text-sm text-zinc-400">Sign in to access your MeasyAI workspace.</p>
        {/*

                  <button
          type="button"
          onClick={onDiscordSignIn}
          disabled={isDiscordLoading || isLoading}
          className="mb-4 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-zinc-100 transition hover:bg-white/10 disabled:opacity-60"
        >
          {isDiscordLoading ? "Redirecting to Discord..." : "Continue with Discord"}
        </button>
        <div className="mb-4 flex items-center gap-3 text-xs uppercase tracking-[0.16em] text-zinc-500">
          <span className="h-px flex-1 bg-white/10" />
          <span>or</span>
          <span className="h-px flex-1 bg-white/10" />
        </div>
        
        */}
        <form onSubmit={onSubmit} className="space-y-4">
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
            {isLoading ? "Signing in..." : "Log in"}
          </button>
        </form>
        <p className="mt-4 text-sm text-zinc-400">
          No account? <Link href="/register" className="text-accent2">Create one</Link>
        </p>
      </div>
    </main>
  );
}

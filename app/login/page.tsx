"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error: signInError } = await authClient.signIn.email({
      email,
      password,
      callbackURL: "/dashboard",
    });

    if (signInError) {
      setError(signInError.message ?? "Unable to log in.");
      setIsLoading(false);
      return;
    }

    window.location.href = "/dashboard";
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="glass w-full max-w-md rounded-2xl p-8">
        <h1 className="mb-2 font-display text-3xl font-bold">Welcome back</h1>
        <p className="mb-6 text-sm text-zinc-400">Sign in to access your MeasyAI workspace.</p>
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


"use client";

import { useState } from "react";

export default function BuyPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onCheckout = async () => {
    setIsLoading(true);
    setError(null);

    const response = await fetch("/api/checkout", { method: "POST" });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      setError(payload.error ?? "Unable to start checkout.");
      setIsLoading(false);
      return;
    }

    const payload = await response.json();
    window.location.href = payload.url;
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-6 py-20">
      <section className="glass grid w-full gap-8 rounded-3xl p-8 sm:grid-cols-2 sm:p-10">
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-accent2">MeasyAI Pro</p>
          <h1 className="mb-3 font-display text-4xl font-bold tracking-tight">Scale your AI product</h1>
          <p className="text-zinc-400">Get high quotas, advanced analytics, webhooks, and priority support with one simple plan.</p>
        </div>
        <div className="rounded-2xl border border-accent/30 bg-accent/10 p-6">
          <p className="text-sm text-zinc-300">Pro plan</p>
          <p className="my-2 font-display text-5xl font-bold">EUR12</p>
          <p className="mb-6 text-sm text-zinc-400">per month</p>
          <button
            onClick={onCheckout}
            disabled={isLoading}
            className="w-full rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isLoading ? "Redirecting..." : "Buy with Stripe"}
          </button>
          {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
        </div>
      </section>
    </main>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";

type PricingDesign = "modern" | "legacy";

const freeFeatures = [
  "60 Pro messages per day",
  "Unlimited Core chats",
  "Standard response speed",
  "Shared proxy access",
  "Community support",
];

const proFeatures = [
  "Unlimited Pro chats",
  "Priority response routing",
  "Private proxy access",
  "Priority support",
  "Early feature access",
];

export default function BuyPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [design, setDesign] = useState<PricingDesign>("modern");

  async function onCheckout() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout", { method: "POST" });
      const payload = (await response.json().catch(() => ({}))) as { error?: string; url?: string };

      if (!response.ok || !payload.url) {
        setError(payload.error ?? "Unable to start checkout.");
        setIsLoading(false);
        return;
      }

      window.location.href = payload.url;
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <main className="relative z-10 min-h-screen">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0fcc] backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-6">
          <Link href="/" className="font-display text-xl font-bold tracking-tight">
            MeasyAI
          </Link>
          <nav className="flex items-center gap-2 text-sm text-zinc-400">
            <Link href="/dashboard" className="rounded-md px-3 py-2 hover:bg-white/5 hover:text-white">
              Dashboard
            </Link>
            <Link href="/settings" className="rounded-md px-3 py-2 hover:bg-white/5 hover:text-white">
              Settings
            </Link>
          </nav>
        </div>
      </header>

      <section className="hero-grid px-6 pb-20 pt-20">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <div className="mb-5 inline-flex items-center rounded-full border border-accent/40 bg-accent/10 px-4 py-1 text-xs uppercase tracking-[0.2em] text-accent2">
              Pricing
            </div>
            <h1 className="mb-5 font-display text-4xl font-extrabold tracking-tight sm:text-6xl">
              Upgrade when you need <span className="bg-gradient-to-r from-accent to-accent2 bg-clip-text text-transparent">more firepower.</span>
            </h1>
            <p className="mx-auto max-w-xl text-zinc-400">
              Keep the same MeasyAI workflow and unlock unlimited premium model access, faster routing, and priority support.
            </p>
          </div>

          <div className="mb-8 flex items-center justify-center gap-2">
            {(["modern", "legacy"] as const).map((mode) => {
              const isSelected = design === mode;

              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setDesign(mode)}
                  className={`rounded-lg border px-3 py-2 text-xs font-medium uppercase tracking-[0.14em] transition ${
                    isSelected
                      ? "border-accent/50 bg-accent/15 text-accent2"
                      : "border-white/10 bg-white/[0.03] text-zinc-300 hover:bg-white/[0.06]"
                  }`}
                >
                  {mode}
                </button>
              );
            })}
          </div>

          {design === "modern" ? (
            <div className="space-y-10">
              <div className="grid gap-4 lg:grid-cols-2">
                <article className="glass rounded-3xl p-8">
                  <p className="mb-3 text-xs uppercase tracking-[0.18em] text-zinc-500">Free</p>
                  <div className="mb-4 flex items-end gap-2">
                    <span className="font-display text-5xl font-bold tracking-tight">EUR 0</span>
                    <span className="pb-1 text-sm text-zinc-500">forever</span>
                  </div>
                  <p className="mb-8 text-sm text-zinc-400">
                    Enough to explore the workspace, test the core model, and use a limited amount of Pro every day.
                  </p>

                  <div className="space-y-3">
                    {freeFeatures.map((feature) => (
                      <div key={feature} className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3">
                        <span className="inline-block h-2 w-2 rounded-full bg-zinc-500" />
                        <span className="text-sm text-zinc-300">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-center text-sm text-zinc-400">
                    Your default plan
                  </div>
                </article>

                <article className="glass relative overflow-hidden rounded-3xl border-accent/30 bg-accent/[0.06] p-8">
                  <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-accent/15 to-transparent" />
                  <div className="relative">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-accent2">Pro</p>
                      <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-accent2">
                        Recommended
                      </span>
                    </div>
                    <div className="mb-4 flex items-end gap-2">
                      <span className="font-display text-5xl font-bold tracking-tight">EUR 12</span>
                      <span className="pb-1 text-sm text-zinc-500">per month</span>
                    </div>
                    <p className="mb-8 text-sm text-zinc-300">
                      Built for people who want the premium model all day without hitting the daily cap.
                    </p>

                    <div className="space-y-3">
                      {proFeatures.map((feature) => (
                        <div key={feature} className="flex items-center gap-3 rounded-2xl border border-accent/20 bg-black/20 px-4 py-3">
                          <span className="inline-block h-2 w-2 rounded-full bg-accent2" />
                          <span className="text-sm text-zinc-100">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={onCheckout}
                      disabled={isLoading}
                      className="mt-8 w-full rounded-xl bg-accent px-6 py-3 text-sm font-medium text-white shadow-glow transition hover:bg-[#6aa0f8] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isLoading ? "Preparing checkout..." : "Upgrade to Pro"}
                    </button>
                    {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
                  </div>
                </article>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/20 px-6 py-5 text-center text-sm text-zinc-400">
                Stripe handles checkout securely. Cancel anytime. No hidden setup fees.
              </div>
            </div>
          ) : (
            <div className="space-y-10">
              <div className="grid gap-8 lg:grid-cols-2">
                <article className="relative rounded-[32px] border border-white/5 bg-white/[0.02] p-8 backdrop-blur-xl transition-all hover:bg-white/[0.04]">
                  <div className="mb-8">
                    <p className="mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Basic Access</p>
                    <div className="flex items-baseline gap-2">
                      <span className="font-display text-5xl font-extrabold tracking-tight text-white">FREE</span>
                    </div>
                    <p className="mt-4 text-sm text-zinc-400">
                      Start exploring the workspace with the same capped premium access and unlimited core chat.
                    </p>
                  </div>

                  <div className="mb-10 space-y-4">
                    {freeFeatures.map((feature) => (
                      <div key={feature} className="flex items-center gap-3">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-800">
                          <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                        </div>
                        <span className="text-sm text-zinc-300">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 py-4 text-center text-xs font-black uppercase tracking-widest text-zinc-300">
                    Current plan
                  </div>
                </article>

                <article className="relative overflow-hidden rounded-[32px] border border-primary/20 bg-primary/5 p-8 shadow-2xl shadow-primary/10">
                  <div className="absolute right-0 top-0 rounded-bl-2xl bg-primary px-6 py-2 text-[10px] font-black uppercase tracking-widest text-white">
                    Most Popular
                  </div>
                  <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-primary/20 blur-[60px]" />

                  <div className="relative">
                    <div className="mb-8">
                      <p className="mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-primary">Premium Power</p>
                      <div className="flex items-end gap-2">
                        <span className="font-display text-5xl font-extrabold tracking-tight text-white">EUR 12</span>
                        <span className="pb-1 text-sm font-bold uppercase tracking-[0.14em] text-zinc-500">/ month</span>
                      </div>
                      <p className="mt-4 text-sm text-zinc-300">
                        Switch to the brighter legacy pricing style while keeping the same Stripe checkout and plan details.
                      </p>
                    </div>

                    <div className="mb-10 space-y-4">
                      {proFeatures.map((feature) => (
                        <div key={feature} className="flex items-center gap-3">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full border border-primary/30 bg-primary/20">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                          </div>
                          <span className="text-sm font-medium text-zinc-100">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={onCheckout}
                      disabled={isLoading}
                      className="w-full rounded-2xl bg-primary py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isLoading ? "Preparing checkout..." : "Upgrade to Pro"}
                    </button>
                    {error ? <p className="mt-4 text-center text-xs font-bold text-rose-400">{error}</p> : null}
                  </div>
                </article>
              </div>

              <div className="border-t border-white/5 pt-12 text-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Secure payments via Stripe</p>
                <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-zinc-600">Cancel anytime. No hidden fees.</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

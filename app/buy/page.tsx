"use client";

import { useState } from "react";
import { Check, Zap, Sparkles, ShieldCheck, ArrowRight, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function BuyPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onCheckout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout", { method: "POST" });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        setError(payload.error ?? "Unable to start checkout.");
        setIsLoading(false);
        return;
      }
      const payload = await response.json();
      window.location.href = payload.url;
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#080a0c] selection:bg-primary/30 selection:text-white">
      {/* Background Orbs */}
      <div className="absolute top-[-20%] left-[-10%] size-[600px] rounded-full bg-primary/20 blur-[150px] pointer-events-none opacity-40"></div>
      <div className="absolute bottom-[-10%] right-[-5%] size-[500px] rounded-full bg-accent2/20 blur-[150px] pointer-events-none opacity-30"></div>

      <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-32">
        <header className="mb-16 text-center animate-in fade-in slide-in-from-top-4 duration-700">
           <Link href="/dashboard" className="inline-flex items-center gap-2 mb-8 text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-white transition-colors border border-white/5 py-1.5 px-4 rounded-full bg-white/5">
            <ArrowRight className="size-3 rotate-180" /> Back to Dashboard
          </Link>
          <div className="size-16 rounded-3xl bg-primary/10 flex items-center justify-center border border-primary/20 mx-auto mb-6 shadow-[0_0_30px_rgba(var(--primary-rgb),0.2)]">
            <Sparkles className="size-8 text-primary" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl font-display">
            Elevate your <span className="text-primary italic">AI Experience</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400">
            Choose the perfect plan for your needs. From curious beginners to power users, we've got you covered.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-2 max-w-4xl mx-auto">
          {/* Free Tier */}
          <section className="group glass-effect relative rounded-[32px] border border-white/5 bg-white/[0.02] p-8 transition-all hover:bg-white/[0.04] animate-in fade-in slide-in-from-left-4 duration-1000 fill-mode-both flex flex-col h-full">
            <div className="mb-8">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-2">Basic Access</h2>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-extrabold text-white font-display uppercase tracking-tight">FREE</span>
              </div>
              <p className="mt-4 text-sm text-zinc-400">Start exploring the power of MeasyAI with no strings attached.</p>
            </div>

            <div className="space-y-4 mb-10 flex-1">
              {[
                "60 Pro Daily messages",
                "Unlimited Core access",
                "Standard speed",
                "Public proxy access",
                "Community support"
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <div className="size-5 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                    <Check className="size-3 text-zinc-400" />
                  </div>
                  <span className="text-sm text-zinc-300">{feature}</span>
                </div>
              ))}
            </div>

            <button className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 text-xs font-black uppercase tracking-widest text-zinc-300 hover:bg-white/10 hover:text-white transition-all cursor-default">
              Current Plan
            </button>
          </section>

          {/* Pro Tier */}
          <section className="group relative rounded-[32px] border border-primary/20 bg-primary/5 p-8 transition-all shadow-2xl hover:shadow-primary/10 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-1000 fill-mode-both flex flex-col h-full">
            <div className="absolute top-0 right-0 py-2 px-6 bg-primary text-[10px] font-black uppercase tracking-widest rounded-bl-2xl text-white shadow-lg">
              Most Popular
            </div>

            {/* Glowing Orb */}
            <div className="absolute top-0 right-0 size-32 bg-primary/20 blur-[60px] pointer-events-none rounded-full"></div>

            <div className="mb-8 relative z-10">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-2 flex items-center gap-2">
                <Zap className="size-3 fill-primary" /> Premium Power
              </h2>
              <div className="flex items-baseline gap-2">
                <span className="text-[10px] font-black text-zinc-400 -translate-y-4 uppercase tracking-[0.2em] font-display">EUR</span>
                <span className="text-5xl font-extrabold text-white font-display tracking-tight">12</span>
                <span className="text-sm text-zinc-500 font-bold uppercase tracking-widest">/ Month</span>
              </div>
              <p className="mt-4 text-sm text-zinc-400">Unleash the full potential of MeasyAI for professionals.</p>
            </div>

            <div className="space-y-4 mb-10 relative z-10 flex-1">
              {[
                "Unlimited Pro Access",
                "Priority Neural Processing",
                "Premium Support 24/7",
                "Private Secure Proxy",
                "Early Access to Features",
                "Advanced AI Search"
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <div className="size-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30">
                    <Check className="size-3 text-primary" />
                  </div>
                  <span className="text-sm text-zinc-200 font-medium">{feature}</span>
                </div>
              ))}
            </div>

            <button
              onClick={onCheckout}
              disabled={isLoading}
              className="group/btn relative w-full overflow-hidden rounded-2xl bg-primary py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 z-10"
            >
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
              <span className="relative flex items-center justify-center gap-2">
                {isLoading ? "Preparing Checkout..." : (
                  <>Upgrade to Pro <ArrowRight className="size-3.5" /></>
                )}
              </span>
            </button>
            
            {error ? <p className="mt-4 text-center text-xs font-bold text-rose-400 relative z-10">{error}</p> : null}
          </section>
        </div>

        <footer className="mt-24 text-center border-t border-white/5 pt-12">
          <div className="flex items-center justify-center gap-3 mb-4 grayscale opacity-40">
            <ShieldCheck className="size-6 text-zinc-400" />
            <div className="h-4 w-px bg-white/10 mx-2"></div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Secure Payments via Stripe</p>
          </div>
          <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold">
            CANCEL ANYTIME. NO HIDDEN FEES.
          </p>
        </footer>
      </div>

      <style jsx>{`
        .glass-effect {
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
      `}</style>
    </main>
  );
}

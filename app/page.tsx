import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

const integrations = [
  "CraftingStudioPro",
  "Rest Services",
  "TitanNode",
  "RestHub",
  "RX Community",
  "CaptchaV2",
];

export default async function HomePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const isLoggedIn = Boolean(session?.user?.id);

  return (
    <main className="relative z-10">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0fcc] backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-6">
          <Link href="/" className="font-display text-xl font-bold tracking-tight">MeasyAI</Link>
          <nav className="flex items-center gap-2 text-sm text-zinc-400">
            <Link href="/dashboard" className="rounded-md px-3 py-2 hover:bg-white/5 hover:text-white">Dashboard</Link>
            {isLoggedIn ? (
              <Link href="/settings" className="rounded-md px-3 py-2 hover:bg-white/5 hover:text-white">Profile settings</Link>
            ) : null}
            {!isLoggedIn ? (
              <>
                <Link href="/login" className="rounded-md px-3 py-2 hover:bg-white/5 hover:text-white">Log in</Link>
                <Link href="/register" className="rounded-lg bg-accent px-4 py-2 font-medium text-white shadow-glow">Sign Up</Link>
              </>
            ) : null}
          </nav>
        </div>
      </header>

      <section className="hero-grid px-6 pb-20 pt-28 text-center">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 inline-flex animate-fadeUp items-center rounded-full border border-accent/40 bg-accent/10 px-4 py-1 text-xs uppercase tracking-[0.2em] text-accent2">Now in public beta</div>
          <h1 className="mb-6 animate-fadeUp font-display text-5xl font-extrabold tracking-tight sm:text-7xl">
            AI that just <span className="bg-gradient-to-r from-accent to-accent2 bg-clip-text text-transparent">gets it done.</span>
          </h1>
          <p className="mx-auto mb-10 max-w-xl animate-fadeUp text-zinc-400">
            MeasyAI makes powerful AI genuinely easy: real-time answers, smart automation, and a full API built for developers and creators.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/register" className="rounded-xl bg-accent px-6 py-3 text-sm font-medium text-white shadow-glow">Get started free</Link>
            <Link href="/dashboard" className="glass rounded-xl px-6 py-3 text-sm font-medium text-zinc-200">Open dashboard</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto flex max-w-5xl flex-wrap justify-center gap-12 px-6 py-10">
        {[
          ["99.9%", "Uptime"],
          ["2M+", "Requests served"],
          ["12k+", "Active users"],
          ["<200ms", "Avg response"],
        ].map(([num, label]) => (
          <div key={label} className="text-center">
            <p className="font-display text-3xl font-bold tracking-tight">{num}</p>
            <p className="text-xs text-zinc-500">{label}</p>
          </div>
        ))}
      </section>

      <section className="overflow-hidden px-6 pb-16 pt-6">
        <div className="mx-auto max-w-6xl">
          <p className="mb-6 text-center text-xs uppercase tracking-[0.18em] text-accent/70">Integrations</p>
          <div className="relative overflow-hidden">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-bg to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-bg to-transparent" />
            <div className="flex gap-8">
              {[0, 1].map((row) => (
                <div key={row} className="flex min-w-full animate-marquee gap-8">
                  {integrations.map((item) => (
                    <div key={`${row}-${item}`} className="glass flex items-center gap-2 rounded-md px-4 py-2 text-sm text-zinc-300/70">
                      <span className="text-xs">{item}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-3 px-6 py-16 sm:grid-cols-2 lg:grid-cols-3">
        {[
          ["Intelligent Responses", "Understands context deeply with strong multi-step reasoning."],
          ["Real-Time Streaming", "Token streaming with low first-token latency."],
          ["Privacy-First", "No training on your data with isolated workspaces."],
          ["Live Analytics", "Usage, latency, errors, and cost insights in real-time."],
          ["REST API & SDKs", "Typed SDKs, webhooks, batch mode, and function calling."],
          ["5-Minute Setup", "Create a project and ship with one API key."],
        ].map(([title, desc]) => (
          <article key={title} className="glass rounded-2xl p-6 transition hover:border-accent/40 hover:bg-accent/5">
            <h3 className="mb-2 text-base font-semibold text-white">{title}</h3>
            <p className="text-sm text-zinc-400">{desc}</p>
          </article>
        ))}
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-20">
        <div className="glass rounded-3xl p-8 text-center sm:p-12">
          <h2 className="mb-3 font-display text-3xl font-bold tracking-tight">Start building today</h2>
          <p className="mb-8 text-zinc-400">Free to use. No credit card. Up and running in under five minutes.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/register" className="rounded-xl bg-accent px-6 py-3 text-sm font-medium text-white shadow-glow">Get started free</Link>
            <Link href="/buy" className="glass rounded-xl px-6 py-3 text-sm font-medium text-zinc-100">Buy Pro</Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-black/20 px-6 py-6 text-center text-xs text-zinc-500">
        (c) 2026 MeasyAI. All rights reserved.
      </footer>
    </main>
  );
}

import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { 
  Zap, 
  Shield, 
  Code2, 
  Rocket, 
  BrainCircuit,
  PieChart,
  CheckCircle2,
  Globe
} from "lucide-react";

const integrations = [
  "CraftingStudioPro",
  "Rest Services",
  "TitanNode",
  "RestHub",
  "RX Community",
  "CaptchaV2",
  "Vercel",
  "Stripe",
  "Discord",
  "Postgres",
  "Supabase",
  "OpenRouter",
  "GitHub",
  "GitLab",
  "Slack",
  "Better-Auth",
  "Turso",
  "Resend",
  "Cloudflare",
  "Prisma"
];

export default async function HomePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const isLoggedIn = Boolean(session?.user?.id);
  const half = Math.ceil(integrations.length / 2);
  const row1 = integrations.slice(0, half);
  const row2 = integrations.slice(half);

  return (
    <main className="relative z-10 bg-[#060609] text-zinc-100">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0fcc] backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-accent" />
            <Link href="/" className="font-display text-xl font-bold tracking-tight">MeasyAI</Link>
          </div>
          <nav className="flex items-center gap-4 text-sm font-medium text-zinc-400">
            {isLoggedIn ? (
              <>
                <Link href="/dashboard" className="px-3 py-2 hover:text-white transition-colors">Dashboard</Link>
                <Link href="/settings" className="px-3 py-2 hover:text-white transition-colors">Settings</Link>
              </>
            ) : null}
            {!isLoggedIn ? (
              <>
                <Link href="/login" className="px-3 py-2 hover:text-white transition-colors">Log in</Link>
                <Link href="/register" className="rounded-xl bg-accent px-5 py-2.5 text-white shadow-glow transition-all hover:scale-[1.02]">Sign Up</Link>
              </>
            ) : null}
          </nav>
        </div>
      </header>

      <section className="relative px-6 pb-24 pt-32 text-center overflow-hidden">
        {/* Subtle Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-accent/5 blur-[120px] -z-10" />
        
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 inline-flex animate-fadeUp items-center rounded-full border border-accent/30 bg-accent/5 px-4 py-1.5 text-[10px] uppercase font-bold tracking-[0.2em] text-accent2">Now in public beta</div>
          <h1 className="mb-6 animate-fadeUp font-display text-5xl font-extrabold tracking-tight sm:text-8xl lg:text-9xl leading-[1.1]">
            AI that <span className="bg-gradient-to-r from-accent to-accent2 bg-clip-text text-transparent">ships.</span>
          </h1>
          <p className="mx-auto mb-12 max-w-xl animate-fadeUp text-base text-zinc-400 sm:text-lg">
            MeasyAI delivers high-performance reasoning and real-time streaming to your workflow. 
            Built for developers who value speed over noise.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 animate-fadeUp">
            <Link href="/register" className="h-14 rounded-2xl bg-accent px-8 flex items-center justify-center text-base font-bold text-white shadow-glow hover:scale-[1.02] transition-transform">
              Start Building Now
            </Link>
            {isLoggedIn ? (
              <Link href="/dashboard" className="h-14 glass rounded-2xl px-8 flex items-center justify-center text-base font-bold text-zinc-200 hover:bg-white/10 transition-all">
                Launch Dashboard
              </Link>
            ) : (
              <Link href="/login" className="h-14 glass rounded-2xl px-8 flex items-center justify-center text-base font-bold text-zinc-200 hover:bg-white/10 transition-all">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto flex max-w-5xl flex-wrap justify-center gap-16 px-6 py-12">
        {[
          ["99.9%", "Uptime", <Shield key="1" className="h-4 w-4 text-emerald-500" />],
          ["5M+", "Requests", <Zap key="2" className="h-4 w-4 text-yellow-500" />],
          ["15k+", "Developers", <Globe key="3" className="h-4 w-4 text-accent" />],
          ["<200ms", "Latency", <Rocket key="4" className="h-4 w-4 text-accent2" />],
        ].map(([num, label, icon]) => (
          <div key={label as string} className="text-center group">
            <div className="flex flex-col items-center gap-1">
               <div className="flex items-center gap-2 mb-1">
                  {icon}
                  <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">{label as string}</p>
               </div>
               <p className="font-display text-4xl font-bold tracking-tight text-white group-hover:text-accent transition-colors">{num as string}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="py-24 overflow-hidden relative border-y border-white/5 bg-white/[0.01]">
        <div className="mx-auto max-w-6xl px-6 mb-16 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-3 py-1 mb-4">
            <Globe className="h-3 w-3 text-accent" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-accent2">Global Infrastructure</span>
          </div>
          <h2 className="font-display text-3xl font-bold tracking-tight text-white mb-2">Trusted Ecosystem</h2>
          <p className="text-sm text-zinc-500 max-w-md">Seamlessly integrated with the world's most powerful platforms and developer tools.</p>
        </div>
        
        <div className="relative flex flex-col gap-4">
          {/* Top Row - Standard Direction (Faster) */}
          <div className="group relative flex overflow-hidden p-2">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-40 bg-gradient-to-r from-[#060609] to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-40 bg-gradient-to-l from-[#060609] to-transparent" />
            
            <div className="flex animate-marquee gap-4 pr-4">
              {[...row1, ...row1].map((item, idx) => (
                <div key={idx} className="glass flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.01] px-6 py-4 transition-all hover:border-accent/40 hover:bg-accent/5 min-w-max">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5">
                    <Rocket className="h-3.5 w-3.5 text-accent" />
                  </div>
                  <span className="text-sm font-bold tracking-tight text-zinc-400">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Row - Reverse Direction (Slower) */}
          <div className="group relative flex overflow-hidden p-2">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-40 bg-gradient-to-r from-[#060609] to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-40 bg-gradient-to-l from-[#060609] to-transparent" />
            
            <div className="flex animate-marquee-reverse gap-4 pr-4 [animation-duration:35s]">
              {[...row2, ...row2].map((item, idx) => (
                <div key={idx} className="glass flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.01] px-6 py-4 transition-all hover:border-accent2/40 hover:bg-accent2/5 min-w-max">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5">
                    <Zap className="h-3.5 w-3.5 text-accent2" />
                  </div>
                  <span className="text-sm font-bold tracking-tight text-zinc-400">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto grid max-w-6xl gap-4 px-6 py-24 sm:grid-cols-2 lg:grid-cols-3">
        {[
          ["Neural Responses", "Advanced multi-step reasoning with Nova Core 2.0.", <BrainCircuit key="1" className="h-6 w-6 text-accent" />],
          ["Instant Streaming", "High-frequency token streaming with ultra-low TTL.", <Zap key="2" className="h-6 w-6 text-yellow-500" />],
          ["Isolated Data", "We never train models on your proprietary work history.", <Shield key="3" className="h-6 w-6 text-emerald-500" />],
          ["Deep Analytics", "Track latency, costs, and token usage in real-time.", <PieChart key="4" className="h-6 w-6 text-accent2" />],
          ["Universal API", "Standardized REST endpoints for any language or stack.", <Code2 key="5" className="h-6 w-6 text-blue-500" />],
          ["Auto-Scale", "Serverless architecture that grows with your requests.", <Rocket key="6" className="h-6 w-6 text-orange-500" />],
        ].map(([title, desc, icon]) => (
          <article key={title as string} className="glass group rounded-3xl border border-white/5 p-8 transition-all hover:bg-white/[0.03] hover:border-white/20">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 transition-colors group-hover:bg-white/10">
              {icon}
            </div>
            <h3 className="mb-2 text-lg font-bold text-white tracking-tight">{title as string}</h3>
            <p className="text-sm leading-relaxed text-zinc-400 group-hover:text-zinc-300 transition-colors">{desc as string}</p>
            <div className="mt-8 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
               <CheckCircle2 className="h-4 w-4 text-emerald-500" />
               <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Feature Ready</span>
            </div>
          </article>
        ))}
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-32">
        <div className="glass rounded-[2.5rem] p-10 text-center sm:p-20 border border-accent/20 bg-accent/[0.02]">
          <h2 className="mb-4 font-display text-4xl font-bold tracking-tight text-white leading-[1.1]">Start building today</h2>
          <p className="mx-auto mb-10 max-w-md text-zinc-400">Join over 15,000 developers building the next wave of AI applications.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register" className="h-14 rounded-2xl bg-accent px-10 flex items-center justify-center text-base font-bold text-white shadow-glow hover:scale-[1.02] transition-transform">Get started free</Link>
            <Link href="/buy" className="h-14 glass rounded-2xl px-10 flex items-center justify-center text-base font-bold text-zinc-100 hover:bg-white/10 transition-all">Buy Pro</Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 bg-black/5 px-6 py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 sm:flex-row">
          <div className="flex flex-col items-center sm:items-start gap-3">
             <div className="flex items-center gap-2">
                <BrainCircuit className="h-6 w-6 text-accent" />
                <span className="font-display font-bold text-white text-lg tracking-tight">MeasyAI</span>
             </div>
             <p className="text-xs text-zinc-600">
               &copy; 2026 MeasyAI. All rights reserved. Registered trademark of CraftingStudioPro.
             </p>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-8 text-xs font-bold uppercase tracking-widest text-zinc-400">
            <Link href="/imprint" className="hover:text-white transition-colors">Imprint</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}

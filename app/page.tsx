import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { 
  Zap, 
  Shield, 
  PieChart, 
  Code2, 
  Rocket, 
  BrainCircuit,
  ArrowRight,
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
  "Discord",
  "Stripe",
  "Turso"
];

export default async function HomePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const isLoggedIn = Boolean(session?.user?.id);

  return (
    <main className="relative flex flex-col min-h-screen bg-[#060609] selection:bg-accent/30 selection:text-accent2">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-accent/5 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-accent2/5 blur-[100px]" />
      </div>

      <header className="fixed top-0 left-0 right-0 z-[100] border-b border-white/5 bg-[#0a0a0fbb] backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-accent to-accent2 flex items-center justify-center shadow-glow">
              <BrainCircuit className="h-5 w-5 text-white" />
            </div>
            <Link href="/" className="font-display text-xl font-black tracking-tighter text-white">MeasyAI</Link>
          </div>
          
          <nav className="flex items-center gap-1 sm:gap-6 text-sm font-medium">
            <Link href="#features" className="hidden sm:block text-zinc-400 hover:text-white transition-colors">Features</Link>
            <Link href="#stats" className="hidden sm:block text-zinc-400 hover:text-white transition-colors">Stats</Link>
            <div className="h-4 w-px bg-white/10 mx-2 hidden sm:block" />
            
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <Link href="/dashboard" className="text-zinc-400 hover:text-white transition-colors">Dashboard</Link>
                <Link href="/dashboard" className="group rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-white hover:bg-white/10 transition-all">
                  Launch App
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-4">
                <Link href="/login" className="text-zinc-400 hover:text-white transition-colors px-2 lg:px-0">Log in</Link>
                <Link href="/register" className="group relative rounded-xl bg-accent px-5 py-2.5 font-bold text-white shadow-glow transition-all hover:scale-[1.02] active:scale-[0.98]">
                  <span className="relative z-10 flex items-center gap-2">
                    Sign Up <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 pb-24 pt-44 text-center overflow-hidden">
        <div className="mx-auto max-w-4xl relative z-10">
          <div className="mb-8 inline-flex animate-fadeUp items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-accent animate-pulse" />
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-zinc-300">
              Nova Core 2.0 is live
            </span>
          </div>
          
          <h1 className="mb-8 animate-fadeUp font-display text-5xl font-black tracking-tight sm:text-8xl lg:text-9xl leading-[0.9] text-white">
            AI that speaks <br/>
            <span className="bg-gradient-to-r from-accent via-accent2 to-accent bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">productivity.</span>
          </h1>
          
          <p className="mx-auto mb-12 max-w-2xl animate-fadeUp text-base sm:text-lg leading-relaxed text-zinc-400 lg:text-xl">
            Experience the next generation of intelligent assistance. MeasyAI blurs the line between 
            human reasoning and machine speed, built for those who demand absolute efficiency.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4 animate-fadeUp">
            <Link href="/register" className="h-14 rounded-2xl bg-accent px-8 flex items-center justify-center text-base font-bold text-white shadow-glow transition-all hover:scale-[1.05] hover:rotate-1">
              Start Building Free
            </Link>
            <Link href="#features" className="h-14 glass rounded-2xl px-8 flex items-center justify-center text-base font-bold text-zinc-200 transition-all hover:bg-white/10">
              Explore Features
            </Link>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="mt-20 mx-auto max-w-6xl animate-fadeUp opacity-50">
           <div className="glass rounded-[2rem] aspect-video border border-white/10 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center backdrop-blur-xl border border-white/20 group-hover:scale-110 transition-transform">
                    <Rocket className="h-8 w-8 text-accent" />
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="relative py-24 border-y border-white/5 bg-white/[0.01]">
        <div className="mx-auto max-w-6xl px-6 grid grid-cols-2 md:grid-cols-4 gap-12 sm:gap-6">
          {[
            ["99.99%", "System Uptime", <Shield key="1" className="h-4 w-4 text-accent2" />],
            ["5M+", "Tokens Processed", <Zap key="2" className="h-4 w-4 text-yellow-400" />],
            ["15k+", "Developers", <Globe key="3" className="h-4 w-4 text-emerald-400" />],
            ["<180ms", "TTFB Latency", <Rocket key="4" className="h-4 w-4 text-accent" />],
          ].map(([num, label, icon]) => (
            <div key={label as string} className="group text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                 {icon}
                 <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">{label as string}</p>
              </div>
              <p className="font-display text-4xl font-black tracking-tighter text-white group-hover:text-accent transition-colors">{num as string}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Integrations Marquee */}
      <section className="py-24 overflow-hidden relative">
        <div className="mx-auto max-w-7xl px-6 mb-12 flex flex-col items-center text-center">
          <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-accent/80 mb-4">Trusted Ecosystem</h2>
          <p className="text-zinc-400 max-w-md">MeasyAI integrates seamlessly with the stacks you already love.</p>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-40 bg-gradient-to-r from-[#060609] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-40 bg-gradient-to-l from-[#060609] to-transparent" />
          
          <div className="flex gap-6">
            {[0, 1].map((row) => (
              <div key={row} className="flex min-w-full animate-marquee gap-6">
                {integrations.map((item) => (
                  <div key={`${row}-${item}`} className="glass group flex items-center gap-3 rounded-2xl border border-white/10 px-6 py-4 transition-all hover:bg-white/5 hover:border-white/20">
                    <div className="h-5 w-5 rounded bg-accent/20 flex items-center justify-center">
                       <div className="h-2 w-2 rounded-full bg-accent" />
                    </div>
                    <span className="text-sm font-bold text-zinc-300 group-hover:text-white transition-colors">{item}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-24 lg:py-32">
        <div className="mb-20 space-y-4 text-center lg:text-left">
           <h2 className="font-display text-4xl font-black tracking-tight text-white lg:text-6xl">Full Control. <br/> <span className="text-zinc-600">No Compromise.</span></h2>
           <p className="text-zinc-400 max-w-xl lg:mx-0">Every feature is designed to scale with your ambition, from solo projects to workspace-wide automation.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Neural Reasoning",
              desc: "Deep context comprehension with Nova Core 2.0 reasoning engine.",
              icon: <BrainCircuit className="h-6 w-6 text-accent" />,
            },
            {
              title: "Quantum Streaming",
              desc: "Aggressive token streaming minimizing first-byte response time.",
              icon: <Zap className="h-6 w-6 text-yellow-400" />,
            },
            {
              title: "Vault-Grade Privacy",
              desc: "Isolated workspaces. We never train models on your proprietary data.",
              icon: <Shield className="h-6 w-6 text-emerald-400" />,
            },
            {
              title: "Insights Engine",
              desc: "Granular cost, latency, and usage metrics per project key.",
              icon: <PieChart className="h-6 w-6 text-accent2" />,
            },
            {
              title: "Universal SDK",
              desc: "Native Typescript and REST support for rapid deployment.",
              icon: <Code2 className="h-6 w-6 text-blue-400" />,
            },
            {
              title: "Auto-Scale Infra",
              desc: "Serverless execution means your AI costs $0 when not in use.",
              icon: <Rocket className="h-6 w-6 text-orange-400" />,
            },
          ].map((feature) => (
            <article key={feature.title} className="glass group rounded-[2rem] border border-white/5 p-8 transition-all hover:bg-white/[0.02] hover:border-white/20 hover:-translate-y-1">
              <div className="mb-6 h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                {feature.icon}
              </div>
              <h3 className="mb-3 text-xl font-bold text-white flex items-center gap-2">
                 {feature.title}
                 <CheckCircle2 className="h-4 w-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-sm leading-relaxed text-zinc-400 group-hover:text-zinc-300 transition-colors">{feature.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto w-full max-w-5xl px-6 pb-32">
        <div className="glass relative overflow-hidden rounded-[3rem] border border-accent/20 bg-gradient-to-br from-accent/10 to-transparent p-12 text-center sm:p-20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 blur-[100px] -mr-32 -mt-32" />
          <div className="relative z-10">
            <h2 className="mb-6 font-display text-4xl font-black tracking-tight text-white sm:text-6xl">Ready to ship?</h2>
            <p className="mx-auto mb-10 max-w-lg text-zinc-400">
              The public beta is open. Sign up today and get 5,000 free tokens to test your first integration.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/register" className="h-14 rounded-2xl bg-accent px-10 flex items-center justify-center text-base font-bold text-white shadow-glow hover:scale-[1.05] transition-transform">
                Get Started Now
              </Link>
              <Link href="/buy" className="h-14 glass border-white/20 rounded-2xl px-10 flex items-center justify-center text-base font-bold text-zinc-100 hover:bg-white/10 transition-colors">
                See Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="mt-auto border-t border-white/5 bg-[#060609] px-6 py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 sm:flex-row">
          <div className="flex flex-col items-center sm:items-start gap-4">
             <div className="flex items-center gap-2">
                <BrainCircuit className="h-6 w-6 text-accent" />
                <span className="font-display font-black text-white">MeasyAI</span>
             </div>
             <p className="text-xs text-zinc-600 max-w-xs text-center sm:text-left leading-relaxed">
               Part of the CraftingStudioPro ecosystem. Empowering the next million developers with hyper-efficient AI.
             </p>
          </div>

          <nav className="flex flex-wrap justify-center gap-8 text-xs font-bold uppercase tracking-widest text-zinc-500">
            <Link href="/imprint" className="hover:text-accent transition-colors">Imprint</Link>
            <Link href="/privacy" className="hover:text-accent transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-accent transition-colors">Terms</Link>
            <Link href="https://discord.gg/measyai" className="hover:text-accent transition-colors">Community</Link>
          </nav>
        </div>
        <div className="mt-12 text-center text-[10px] text-zinc-800 uppercase tracking-[0.4em]">
           &copy; 2026 MeasyAI. All rights reserved.
        </div>
      </footer>
    </main>
  );
}

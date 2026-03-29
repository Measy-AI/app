import Link from "next/link";
import { ChevronLeft, Info, HelpCircle } from "lucide-react";

export default function TermsPage() {
  const points = [
    {
      title: "1. Service Access",
      text: "MeasyAI provides access to AI models for personal and professional use. We do not guarantee 100% uptime but strive for a 99.9% target.",
    },
    {
      title: "2. Output Liability",
      text: "Users are responsible for the AI's output. We are not liable for any damages caused by the content or recommendations provided by the models.",
    },
    {
      title: "3. Responsible Use",
      text: "You agree not to use MeasyAI for illegal purposes, including but not limited to, the creation of malicious software or hate speech.",
    },
    {
      title: "4. Subscription & Billing",
      text: "Payments are processed through Stripe and are non-refundable except in cases of technical error or as required by German law.",
    },
  ];

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-zinc-100 uppercase tracking-tight">
      <div className="mx-auto max-w-4xl px-6 py-20 lg:py-32 tracking-normal lowercase-none">
        <Link 
          href="/" 
          className="group mb-12 inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-white"
        >
          <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span className="capitalize">Back to home</span>
        </Link>

        <header className="mb-16">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10">
            <Info className="h-8 w-8 text-accent" />
          </div>
          <h1 className="mb-4 font-display text-4xl font-extrabold tracking-tight sm:text-5xl uppercase">Terms of Service</h1>
          <p className="text-zinc-500 max-w-xl">Guidelines for using the MeasyAI platform.</p>
        </header>

        <section className="glass rounded-3xl p-8 sm:p-12 mb-10">
          <div className="grid gap-10">
            {points.map((point) => (
              <div key={point.title} className="space-y-4">
                <h3 className="text-xl font-bold text-white tracking-tight">{point.title}</h3>
                <p className="text-zinc-400 leading-relaxed max-w-2xl">{point.text}</p>
                <div className="h-px w-20 bg-white/5" />
              </div>
            ))}
          </div>
        </section>

        <div className="glass flex items-center justify-between gap-6 rounded-2xl p-6 border border-accent/20">
          <div className="flex items-center gap-4">
            <HelpCircle className="h-6 w-6 text-accent animate-pulse" />
            <p className="text-sm font-medium text-white tracking-tight">Questions about these terms?</p>
          </div>
          <Link href="/contact" className="text-sm text-accent font-bold hover:underline">
            Contact Support
          </Link>
        </div>

        <p className="mt-12 text-center text-xs text-zinc-600">
           Last updated: March 29, 2026. These terms are subject to change without prior notice.
        </p>
      </div>
    </main>
  );
}

import Link from "next/link";
import { ChevronLeft, ShieldCheck, Database, EyeOff, Lock } from "lucide-react";

export default function PrivacyPage() {
  const sections = [
    {
      title: "Your Data Scope",
      icon: <Database className="h-5 w-5 text-accent" />,
      text: "We only collect essential account details to manage your AI sessions and billing. This includes your email, name (from SSO), and payment history if applicable.",
    },
    {
      title: "Model Isolation",
      icon: <EyeOff className="h-5 w-5 text-accent" />,
      text: "We do not use your chat history for model training. Your data remains isolated within your personal or professional workspace.",
    },
    {
      title: "Security Measures",
      icon: <Lock className="h-5 w-5 text-accent" />,
      text: "We use enterprise-grade encryption for all communications and store data using high-security infrastructure provided by Turso and Vercel Blob.",
    },
  ];

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-zinc-100">
      <div className="mx-auto max-w-4xl px-6 py-20 lg:py-32">
        <Link 
          href="/" 
          className="group mb-12 inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-white"
        >
          <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to home
        </Link>

        <header className="mb-16">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10">
            <ShieldCheck className="h-8 w-8 text-accent" />
          </div>
          <h1 className="mb-4 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">Privacy Policy</h1>
          <p className="text-zinc-500 max-w-xl">Privacy isn't a feature; it's a right. Here is how we protect yours.</p>
        </header>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-16">
          {sections.map((item) => (
            <div key={item.title} className="glass rounded-3xl p-6">
              <div className="mb-4">{item.icon}</div>
              <h3 className="mb-2 font-bold text-white">{item.title}</h3>
              <p className="text-sm leading-relaxed text-zinc-400">{item.text}</p>
            </div>
          ))}
        </div>

        <section className="glass rounded-3xl p-8 sm:p-12 prose prose-invert max-w-none">
          <article className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white tracking-tight">1. Data Collection</h2>
              <p className="text-zinc-400 leading-relaxed">
                When you register for an account using Discord or Email, we collect your unique identifier, email address, 
                and display name. This data is required to provide you with secure access to your AI workspace.
              </p>
            </div>

            <div className="space-y-4 border-t border-white/5 pt-10">
              <h2 className="text-2xl font-bold text-white tracking-tight">2. Use of Third-Party APIs</h2>
              <p className="text-zinc-400 leading-relaxed">
                To process your requests, we send your chat inputs to AI providers across the globe (e.g., OpenRouter). 
                We use an anonymized layer to ensure that your specific account details are not shared with the model provider.
              </p>
            </div>

            <div className="space-y-4 border-t border-white/5 pt-10">
              <h2 className="text-2xl font-bold text-white tracking-tight">3. Cookie Policy</h2>
              <p className="text-zinc-400 leading-relaxed">
                We only use essential cookies to maintain your login session. We do not use advertising or tracking 
                cookies to build user profiles for third parties.
              </p>
            </div>

            <div className="pt-10 border-t border-white/5 text-center">
              <p className="text-xs text-zinc-600">
                Last updated: March 29, 2026. For questions, contact privacy@measyai.com.
              </p>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}

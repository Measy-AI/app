import Link from "next/link";

export default function BuySuccessPage() {
  return (
    <main className="hero-grid flex min-h-screen items-center justify-center px-6">
      <div className="glass w-full max-w-lg rounded-3xl p-10 text-center">
        <div className="mx-auto mb-5 inline-flex items-center rounded-full border border-accent/40 bg-accent/10 px-4 py-1 text-xs uppercase tracking-[0.2em] text-accent2">
          Payment complete
        </div>
        <h1 className="mb-4 font-display text-4xl font-bold tracking-tight">Pro is being activated.</h1>
        <p className="mb-8 text-zinc-400">
          Your checkout went through successfully. If Stripe has already redirected you back, your workspace should update within a few moments.
        </p>
        <div className="flex flex-col gap-3">
          <Link href="/dashboard" className="rounded-xl bg-accent px-6 py-3 text-sm font-medium text-white shadow-glow">
            Open dashboard
          </Link>
          <Link href="/" className="glass rounded-xl px-6 py-3 text-sm font-medium text-zinc-200">
            Back home
          </Link>
        </div>
      </div>
    </main>
  );
}

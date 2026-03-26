import Link from "next/link";

export default function BuyCancelPage() {
  return (
    <main className="hero-grid flex min-h-screen items-center justify-center px-6">
      <div className="glass w-full max-w-lg rounded-3xl p-10 text-center">
        <div className="mx-auto mb-5 inline-flex items-center rounded-full border border-rose-400/30 bg-rose-500/10 px-4 py-1 text-xs uppercase tracking-[0.2em] text-rose-300">
          Checkout canceled
        </div>
        <h1 className="mb-4 font-display text-4xl font-bold tracking-tight">No charge was made.</h1>
        <p className="mb-8 text-zinc-400">
          The purchase flow was interrupted before completion. You can return to pricing anytime and try again when you are ready.
        </p>
        <div className="flex flex-col gap-3">
          <Link href="/buy" className="rounded-xl bg-accent px-6 py-3 text-sm font-medium text-white shadow-glow">
            Retry purchase
          </Link>
          <Link href="/dashboard" className="glass rounded-xl px-6 py-3 text-sm font-medium text-zinc-200">
            Return to dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}

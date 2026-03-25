import Link from "next/link";

export default function BuyCancelPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="glass w-full max-w-lg rounded-2xl p-8 text-center">
        <h1 className="mb-3 font-display text-3xl font-bold">Checkout canceled</h1>
        <p className="mb-6 text-zinc-400">No worries. You can retry whenever you are ready.</p>
        <div className="flex justify-center gap-3">
          <Link className="rounded-xl bg-accent px-5 py-3 text-sm font-medium text-white" href="/buy">Retry purchase</Link>
          <Link className="glass rounded-xl px-5 py-3 text-sm" href="/dashboard">Go dashboard</Link>
        </div>
      </div>
    </main>
  );
}

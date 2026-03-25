import Link from "next/link";

export default function BuySuccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="glass w-full max-w-lg rounded-2xl p-8 text-center">
        <h1 className="mb-3 font-display text-3xl font-bold">Payment successful</h1>
        <p className="mb-6 text-zinc-400">Your Pro plan is being activated. This can take a few seconds after webhook confirmation.</p>
        <div className="flex justify-center gap-3">
          <Link className="rounded-xl bg-accent px-5 py-3 text-sm font-medium text-white" href="/dashboard">Open dashboard</Link>
          <Link className="glass rounded-xl px-5 py-3 text-sm" href="/">Back home</Link>
        </div>
      </div>
    </main>
  );
}

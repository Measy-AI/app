import Link from "next/link";
import { XCircle, RefreshCcw, ArrowRight } from "lucide-react";

export default function BuyCancelPage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center px-6 bg-[#080a0c]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[400px] bg-rose-500/10 blur-[120px] pointer-events-none"></div>

      <div className="relative glass w-full max-w-lg rounded-[32px] border border-white/10 bg-white/5 p-12 text-center animate-in zoom-in-95 fade-in duration-500 shadow-2xl">
        <div className="size-20 rounded-3xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center mx-auto mb-8">
          <XCircle className="size-10 text-rose-500" />
        </div>

        <h1 className="mb-4 font-display text-4xl font-extrabold tracking-tight text-white">Checkout Canceled</h1>
        <p className="mb-10 text-zinc-400 leading-relaxed">
          The transaction was interrupted. No charges were made. You can return to the pricing page to try again.
        </p>

        <div className="flex flex-col gap-3">
          <Link href="/buy" className="w-full flex items-center justify-center gap-2 rounded-2xl bg-white/10 py-4 text-xs font-black uppercase tracking-widest text-white hover:bg-white/15 transition-all hover:scale-[1.02] active:scale-95">
            <RefreshCcw className="size-3.5" /> Retry Purchase
           </Link>
          <Link href="/dashboard" className="w-full rounded-2xl border border-white/5 bg-transparent py-4 text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-300 transition-all">
            Return to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}

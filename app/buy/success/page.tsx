import Link from "next/link";
import { CheckCircle2, ArrowRight, PartyPopper } from "lucide-react";

export default function BuySuccessPage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center px-6 bg-[#080a0c]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[400px] bg-primary/20 blur-[120px] pointer-events-none"></div>
      
      <div className="relative glass w-full max-w-lg rounded-[32px] border border-white/10 bg-white/5 p-12 text-center animate-in zoom-in-95 fade-in duration-500 shadow-2xl">
        <div className="size-20 rounded-3xl bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)]">
          <PartyPopper className="size-10 text-primary animate-bounce" />
        </div>
        
        <h1 className="mb-4 font-display text-4xl font-extrabold tracking-tight text-white">Payment Successful</h1>
        <p className="mb-10 text-zinc-400 leading-relaxed">
          Your Pro plan is being activated. Our neural network is updating your permissions. This may take a few seconds.
        </p>
        
        <div className="flex flex-col gap-3">
          <Link href="/dashboard" className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95">
            Open Dashboard <ArrowRight className="size-3.5" />
          </Link>
          <Link href="/" className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 text-xs font-black uppercase tracking-widest text-zinc-300 hover:bg-white/10 transition-all">
            Back Home
          </Link>
        </div>
      </div>
    </main>
  );
}

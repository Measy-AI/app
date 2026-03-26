"use client";

import { useState } from "react";
import { CreditCard, Receipt, ArrowRight, Zap, ExternalLink, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface BillingSectionProps {
  plan: string;
  hasCustomerId: boolean;
}

export function BillingSection({ plan, hasCustomerId }: BillingSectionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onOpenPortal = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to open billing portal.");
      }

      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Current Plan Card */}
      <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.03] p-8 shadow-xl">
        <div className="absolute top-0 right-0 size-32 bg-primary/10 blur-[60px] pointer-events-none"></div>
        
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
               <span className={cn(
                  "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border",
                  plan === "pro" ? "bg-primary/10 border-primary/20 text-primary" : "bg-white/5 border-white/10 text-zinc-500"
               )}>
                 {plan} Plan
               </span>
            </div>
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              {plan === "pro" ? <Zap className="size-5 text-primary fill-primary" /> : null}
              {plan === "pro" ? "MeasyAI Pro Membership" : "MeasyAI Explorer"}
            </h3>
            <p className="mt-2 text-sm text-zinc-400 max-w-sm">
              {plan === "pro" 
                ? "You have full access to all premium models and high-priority processing."
                : "You are currently on the free tier. Upgrade to unlock all features."}
            </p>
          </div>

          {plan !== "pro" ? (
             <a href="/buy" className="group flex items-center gap-2 rounded-2xl bg-primary px-6 py-4 text-xs font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                Upgrade Now <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
             </a>
          ) : (
            <div className="h-10 w-px bg-white/5 hidden sm:block"></div>
          )}
        </div>
      </div>

      {/* Invoices & Management Section */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-[2rem] border border-white/5 bg-white/[0.01] p-8 transition-colors hover:bg-white/[0.03]">
          <div className="size-12 rounded-2xl bg-zinc-800/50 flex items-center justify-center mb-6">
            <Receipt className="size-6 text-zinc-400" />
          </div>
          <h4 className="text-lg font-bold text-white mb-2">Billing Portal</h4>
          <p className="text-sm text-zinc-500 mb-8 leading-relaxed">
            Manage your payment methods, download invoices, and update your subscription details securely via Stripe.
          </p>
          
          {hasCustomerId ? (
            <button 
              onClick={onOpenPortal}
              disabled={isLoading}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:text-white transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  Open Stripe Portal <ExternalLink className="size-3.5" />
                </>
              )}
            </button>
          ) : (
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-600">
              No Billing History Yet
            </p>
          )}
        </div>

        <div className="rounded-[2rem] border border-white/5 bg-white/[0.01] p-8 transition-colors hover:bg-white/[0.03]">
          <div className="size-12 rounded-2xl bg-zinc-800/50 flex items-center justify-center mb-6">
            <CreditCard className="size-6 text-zinc-400" />
          </div>
          <h4 className="text-lg font-bold text-white mb-2">Payment Methods</h4>
          <p className="text-sm text-zinc-500 mb-8 leading-relaxed">
            Your payment data is processed and stored securely by Stripe. We do not store credit card details on our servers.
          </p>
          <div className="flex items-center gap-4 grayscale opacity-30">
             <div className="h-6 w-10 bg-zinc-700 rounded-md"></div>
             <div className="h-6 w-10 bg-zinc-700 rounded-md"></div>
             <div className="h-6 w-10 bg-zinc-700 rounded-md"></div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 text-center">
          <p className="text-xs font-bold text-rose-400 uppercase tracking-widest">{error}</p>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, Cookie, ShieldCheck } from "lucide-react";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("measy-cookie-consent");
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1500); // Appear after a delay
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem("measy-cookie-consent", "accepted");
    setIsVisible(false);
  };

  const closeBanner = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-[100] w-[calc(100%-3rem)] max-w-2xl -translate-x-1/2 animate-in fade-in slide-in-from-bottom-5 duration-500">
      <div className="glass relative overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0fcc] p-6 shadow-2xl backdrop-blur-2xl sm:p-8">
        {/* Animated Glow Background Overlay */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/20 blur-[100px]" />
        
        <div className="relative flex flex-col items-start gap-6 lg:flex-row lg:items-center">
          <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent/10 sm:flex lg:h-16 lg:w-16">
            <Cookie className="h-7 w-7 text-accent" />
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-accent animate-pulse" />
              <h3 className="font-display text-lg font-bold tracking-tight text-white">
                We respect your digital space
              </h3>
            </div>
            <p className="text-sm leading-relaxed text-zinc-400">
              MeasyAI uses essential cookies to improve performance, provide seamless 
              authentication, and ensure a secure experience. By continuing, you agree 
              to our privacy standards. Read our{" "}
              <Link href="/privacy" className="text-accent hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:w-auto">
            <button
              onClick={acceptAll}
              className="group relative inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-8 py-3 text-sm font-semibold text-white shadow-glow transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Accept All</span>
              <ShieldCheck className="h-4 w-4 transition-transform group-hover:rotate-12" />
            </button>
            <button
              onClick={closeBanner}
              className="inline-flex items-center justify-center rounded-xl bg-white/5 px-6 py-3 text-sm font-medium text-zinc-300 transition hover:bg-white/10"
            >
              Reject
            </button>
          </div>
        </div>

        <button
          onClick={closeBanner}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-white/5 hover:text-white sm:right-6 sm:top-6"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

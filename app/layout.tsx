import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DM_Sans, Syne } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MeasyAI - Smart AI, Made Easy",
  description: "MeasyAI - the most intuitive AI assistant for developers, creators, and teams.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${syne.variable} ${dmSans.variable}`}>
        <div className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute left-1/2 top-[-12%] h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(79,142,247,0.08)_0%,transparent_70%)]" />
          <div className="absolute right-[-12%] top-[45%] h-[480px] w-[480px] rounded-full bg-[radial-gradient(ellipse,rgba(125,211,252,0.05)_0%,transparent_70%)]" />
        </div>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

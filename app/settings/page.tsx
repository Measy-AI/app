import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, LayoutGrid, ShieldCheck, User } from "lucide-react";
import { auth } from "@/lib/auth";
import { ProfileForm } from "./profile-form";

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = session.user;

  return (
    <main className="min-h-screen bg-[#080a0c] text-white selection:bg-primary/20 selection:text-white">
      {/* Background Orbs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[10%] top-[-15%] h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[5%] h-[400px] w-[400px] rounded-full bg-accent/5 blur-[100px]" />
      </div>

      <div className="mx-auto max-w-5xl px-6 py-12 lg:py-16">
        {/* Navigation / Header */}
        <div className="mb-12 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 transition-colors hover:text-white"
          >
            <div className="flex size-7 items-center justify-center rounded-lg border border-white/5 bg-white/[0.03] transition-colors group-hover:border-white/10 group-hover:bg-white/[0.05]">
              <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
            </div>
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-[8px] font-black uppercase tracking-[0.3em] text-primary">
            <ShieldCheck className="size-3" /> Secure Account
          </div>
        </div>

        <div className="flex flex-col gap-10 lg:flex-row">
          {/* Sidebar Navigation */}
          <aside className="w-full shrink-0 lg:w-48">
            <nav className="flex flex-row gap-2 lg:flex-col lg:gap-1">
              {[
                { label: "Profile", icon: User, active: true },
                { label: "Account", icon: LayoutGrid, active: false },
              ].map((item) => (
                <button
                  key={item.label}
                  disabled={!item.active}
                  className={cn(
                    "flex flex-1 items-center gap-3 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all lg:flex-none",
                    item.active 
                      ? "bg-white/5 text-white ring-1 ring-white/10" 
                      : "text-zinc-500 opacity-40 hover:text-zinc-400"
                  )}
                >
                  <item.icon className="size-3.5" />
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-white/[0.02] p-8 shadow-2xl backdrop-blur-3xl sm:p-12 lg:p-16">
              <div className="mb-12">
                <p className="mb-3 text-[10px] font-black uppercase tracking-[0.4em] text-accent2">Account Space</p>
                <h1 className="mb-5 font-display text-5xl font-bold tracking-tight text-white lg:text-6xl">
                  Personal <span className="text-primary italic">Profile</span>
                </h1>
                <p className="max-w-xl text-lg text-zinc-400">
                  Update your personal identity across the MeasyAI workspace. Changes are reflected in real-time.
                </p>
              </div>

              <ProfileForm user={user} />
            </div>

            {/* Sub-footer */}
            <div className="mt-8 flex items-center justify-between rounded-3xl border border-white/5 bg-black/40 px-8 py-6 backdrop-blur-sm">
              <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">
                Member since {new Date(user.createdAt).toLocaleDateString()}
              </p>
              <div className="h-1 w-12 rounded-full bg-zinc-800" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-6 py-20">
      <section className="glass w-full rounded-3xl p-8 sm:p-10">
        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-accent2">Profile settings</p>
        <h1 className="mb-3 font-display text-4xl font-bold tracking-tight">Your account</h1>
        <p className="text-zinc-400">Manage your profile details and workspace access.</p>
        <div className="mt-8 grid gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Name</p>
            <p className="mt-2 text-zinc-100">{session.user.name}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Email</p>
            <p className="mt-2 text-zinc-100">{session.user.email}</p>
          </div>
        </div>
      </section>
    </main>
  );
}

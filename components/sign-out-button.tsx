"use client";

import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  return (
    <button
      onClick={async () => {
        await authClient.signOut();
        window.location.href = "/";
      }}
      className="rounded-lg border border-white/15 px-4 py-2 text-sm text-zinc-200 hover:bg-white/5"
    >
      Sign out
    </button>
  );
}

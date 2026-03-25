"use client";

import { type ComponentPropsWithoutRef } from "react";
import { authClient } from "@/lib/auth-client";

type SignOutButtonProps = ComponentPropsWithoutRef<"button">;

export function SignOutButton({ className = "", ...props }: SignOutButtonProps) {
  return (
    <button
      onClick={async () => {
        await authClient.signOut();
        window.location.href = "/";
      }}
      className={`rounded-lg border border-white/15 px-4 py-2 text-sm text-zinc-200 hover:bg-white/5 ${className}`}
      {...props}
    >
      Sign out
    </button>
  );
}

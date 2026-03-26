"use client";

import { createAuthClient } from "better-auth/react";
import { resolveClientAuthBaseUrl } from "@/lib/auth-url";


export const authClient = createAuthClient({
  baseURL: resolveClientAuthBaseUrl(),
});

"use client";

import { createAuthClient } from "better-auth/react";
import { resolveClientAuthBaseUrl } from "@/lib/auth-url";

<<<<<<< HEAD
export const authClient = createAuthClient({
  baseURL: resolveClientAuthBaseUrl(),
});
=======
export const authClient = createAuthClient();
>>>>>>> 9f74f92d38e49bea61d98f074f70fa045aa80b9d

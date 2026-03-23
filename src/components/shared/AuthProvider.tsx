"use client";

import { SessionProvider } from "next-auth/react";

/**
 * Thin wrapper around NextAuth's SessionProvider.
 * Placed in a "use client" boundary so it can be safely imported
 * from the root layout which is a Server Component.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}

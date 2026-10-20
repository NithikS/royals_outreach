"use client";

// Client-side app providers. Add the session provider here once auth is
// wired up (royal_rumble_app wraps children in next-auth's SessionProvider).
export default function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

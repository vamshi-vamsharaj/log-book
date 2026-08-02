import type { Metadata } from "next";

import { SignOutButton } from "@/features/auth/components/sign-out-button";
import { currentUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const user = await currentUser();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
        Phase 2 — Authentication Foundation
      </span>
      <h1 className="text-3xl font-semibold tracking-tight">Welcome, {user?.name}</h1>
      <p className="text-muted-foreground">{user?.email}</p>
      <SignOutButton />
    </main>
  );
}
import { AppShell } from "@/components/layout/app-shell";
import { requireAuth } from "@/lib/session";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAuth();

  return <AppShell>{children}</AppShell>;
}
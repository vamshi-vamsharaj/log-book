import type { Metadata } from "next";

import { PageContainer } from "@/components/layout/page-container";
import { currentUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const user = await currentUser();

  return (
    <PageContainer
      title={`Welcome, ${user?.name ?? "there"}`}
      description="Here's your productivity snapshot."
    >
      <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
        Dashboard widgets will appear here in a future phase.
      </div>
    </PageContainer>
  );
}
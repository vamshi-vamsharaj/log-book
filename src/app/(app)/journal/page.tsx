import type { Metadata } from "next";

import { PageContainer } from "@/components/layout/page-container";

export const metadata: Metadata = {
  title: "Journal",
};

export default function JournalPage() {
  return (
    <PageContainer title="Journal" description="Reflect on your day.">
      <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
        Journaling will be implemented in a future phase.
      </div>
    </PageContainer>
  );
}
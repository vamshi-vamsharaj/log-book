import type { Metadata } from "next";

import { PageContainer } from "@/components/layout/page-container";

export const metadata: Metadata = {
  title: "Goals",
};

export default function GoalsPage() {
  return (
    <PageContainer title="Goals" description="Track progress across every timeframe.">
      <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
        Goal tracking will be implemented in a future phase.
      </div>
    </PageContainer>
  );
}
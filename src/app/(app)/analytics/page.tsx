import type { Metadata } from "next";

import { PageContainer } from "@/components/layout/page-container";

export const metadata: Metadata = {
  title: "Analytics",
};

export default function AnalyticsPage() {
  return (
    <PageContainer title="Analytics" description="Understand your productivity over time.">
      <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
        Analytics will be implemented in a future phase.
      </div>
    </PageContainer>
  );
}
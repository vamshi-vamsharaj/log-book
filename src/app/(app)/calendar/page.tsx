import type { Metadata } from "next";

import { PageContainer } from "@/components/layout/page-container";

export const metadata: Metadata = {
  title: "Calendar",
};

export default function CalendarPage() {
  return (
    <PageContainer title="Calendar" description="See your schedule at a glance.">
      <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
        Calendar views will be implemented in a future phase.
      </div>
    </PageContainer>
  );
}
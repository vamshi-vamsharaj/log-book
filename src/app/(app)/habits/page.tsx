import type { Metadata } from "next";

import { PageContainer } from "@/components/layout/page-container";

export const metadata: Metadata = {
  title: "Habits",
};

export default function HabitsPage() {
  return (
    <PageContainer title="Habits" description="Build and maintain consistent habits.">
      <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
        Habit tracking will be implemented in a future phase.
      </div>
    </PageContainer>
  );
}
import type { Metadata } from "next";

import { PageContainer } from "@/components/layout/page-container";

export const metadata: Metadata = {
  title: "Tasks",
};

export default function TasksPage() {
  return (
    <PageContainer title="Tasks" description="Manage everything you need to get done.">
      <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
        Task management will be implemented in a future phase.
      </div>
    </PageContainer>
  );
}
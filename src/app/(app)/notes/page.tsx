import type { Metadata } from "next";

import { PageContainer } from "@/components/layout/page-container";

export const metadata: Metadata = {
  title: "Notes",
};

export default function NotesPage() {
  return (
    <PageContainer title="Notes" description="Capture and organize your knowledge.">
      <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
        Notes will be implemented in a future phase.
      </div>
    </PageContainer>
  );
}